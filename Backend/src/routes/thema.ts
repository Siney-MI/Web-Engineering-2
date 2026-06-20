import express from "express";
import { GebietResource, ThemaResource } from "../Resources";
import { createThema, deleteThema, getAlleThemen, updateThema, getThema } from "../services/ThemaService";
import { body, matchedData, param } from "express-validator";
import { handleValidationErrors } from "../validation";
import { MyError } from "../errors/MyError";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getGebiet } from "../services/GebietService";

export const themaRouter = express.Router();

const themaValidation = [
    body('titel').isString().isLength({ min: 1, max: 100 }),
    body('beschreibung').isString().isLength({ min: 1, max: 1000 }),
    body('literatur').optional().isString(),
    body('abschluss').isIn(['bsc', 'msc', 'any']),
    body('status').isIn(['offen', 'reserviert', 'abgegeben']),
    body('gebiet').isMongoId(),
    body('betreuer').isMongoId(),
];



themaRouter.get("/:id",
    optionalAuthentication,
    param("id").isMongoId(),
    handleValidationErrors,
    async (req, res) => {
        const id = req.params!.id;
        try{
            const thema = await getThema(id);
            const gebiet = await getGebiet(thema.gebiet);


         if (gebiet.public === true) {
                res.send(thema);
                return;
            }
           
            if (req.profId){
                const isVerwalter = gebiet.verwalter.toString() === req.profId;
                const isBetreuer = thema.betreuer.toString() === req.profId;

                if (isVerwalter || isBetreuer){
                    res.send(thema);
                    return;
                }
            }
            res.sendStatus(403);
            
        } catch (err) {
         if (err instanceof MyError && err.details.code === "resourceNotFound") {
                 res.sendStatus(404);
             } else {
                 res.sendStatus(500);
             }
        }
    });

themaRouter.post("/",
    requiresAuthentication,
    ...themaValidation,
    handleValidationErrors,
    async (req, res) => {
        const themaResource = matchedData(req) as ThemaResource;
        try {
            const gebiet = await getGebiet(themaResource.gebiet);
          
            if ((gebiet.public === true) || gebiet.verwalter.toString() === req.profId) {
            const createdThemaResource = await createThema(themaResource);
            res.status(201).send(createdThemaResource);
            } else {
                res.sendStatus(403)
            }
          
            } catch (err) {
            if (err instanceof MyError) {
                return res.status(400).json({
                    errors: [{
                        msg: err.message,
                        path: err.details.path,
                        value: err.details.value,
                        type: err.details.code,
                        location: "body"
                    }]
                });
            }
           return res.sendStatus(500);
        }
    });


themaRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    ...themaValidation,
    handleValidationErrors,
    async (req, res) => {
        const id = req.params!.id;
        const themaResId = req.body.id;

        if (themaResId && id !== themaResId) {
          return res.status(400).json({
                errors: [
                    { 
                        location: "body", 
                        param: "id",
                        msg: "ID in URL stimmt nicht mit Body überein", 
                        value: themaResId 
                    },
                    { 
                        location: "params", 
                        param: "id", 
                        msg: "ID in URL stimmt nicht mit Body überein", 
                        value: id 
                    }
                ]
            });
        }


        try {
            const existingThema = await getThema(id);
            const gebiet = await getGebiet(existingThema.gebiet);

            const isVerwalter = gebiet.verwalter.toString() === req.profId;
            const isBetreuer = existingThema.betreuer.toString() === req.profId;

            if (!isVerwalter && !isBetreuer){
                res.sendStatus(403);
                return;
            }

            const themaResource = matchedData(req) as ThemaResource;
            themaResource.id = id;

            const updatedThemaResource = await updateThema(themaResource);
            res.json(updatedThemaResource);
          
        } catch (err) {
            if (err instanceof MyError) {
                if (err.details.code === "resourceNotFound") {
                    res.sendStatus(404);
                    return;
                }
                return res.status(400).json({
                    errors: [{
                        msg: err.message,
                        path: err.details.path,
                        value: err.details.value,
                        type: err.details.code,
                        location: "body"
                    }]
                });
            }
           return res.sendStatus(500);
        }
    }
);


themaRouter.delete("/:id",
    requiresAuthentication,
    param('id').isMongoId(),
    handleValidationErrors,
    async (req, res) => {
        const id = req.params!.id;
        try {
            const existingThema = await getThema(id);
            const gebiet = await getGebiet(existingThema.gebiet);

             const isVerwalter = gebiet.verwalter.toString() === req.profId;
            const isBetreuer = existingThema.betreuer.toString() === req.profId;

            if (isVerwalter || isBetreuer){
            await deleteThema(id);
            res.sendStatus(204);
            }else {
                res.sendStatus(403);
            }
        } catch (err) {
             res.sendStatus(404);
        }
    });



