import express from "express";
import { GebietResource, ThemaResource } from "../Resources";
import { createGebiet, deleteGebiet, getAlleGebiete, updateGebiet, getGebiet } from "../services/GebietService";
import { getAlleThemen } from "../services/ThemaService";
import { body, matchedData, param } from "express-validator";
import { handleValidationErrors } from "../validation";
import { MyError } from "../errors/MyError";
import { optionalAuthentication, requiresAuthentication } from "./authentication";


export const gebietRouter = express.Router();

const gebietValidation = [
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('beschreibung').optional().isString().isLength({ max: 1000 }),
    body('public').optional().isBoolean(),
    body('closed').optional().isBoolean(),
    body('verwalter').isMongoId().withMessage('Verwalter muss eine gültige ID haben'),
];

gebietRouter.get("/alle",
    optionalAuthentication,
    async (req, res) => {
        try {
             const publicGebiete: any[] = [];
            if (req.profId) {
                const gebiete = await getAlleGebiete(req.profId);
                gebiete.forEach((gebiet) => {
                    if (gebiet.public === true || (req.profId && (gebiet.verwalter.toString() === req.profId.toString()))) {
                        publicGebiete.push(gebiet);
                    }

                })
            } else {
                const gebiete = await getAlleGebiete();
                gebiete.forEach((gebiet) => {
                    if (gebiet.public === true || (req.profId && (gebiet.verwalter.toString() === req.profId.toString()))) {
                        publicGebiete.push(gebiet);
                    }

                });
            }

            res.send(publicGebiete);
        } catch (error) {
            res.sendStatus(500);
        }
    });

gebietRouter.get("/:id/themen",
    optionalAuthentication,
    param("id").isMongoId(),
    handleValidationErrors,
    async (req, res) => {
        const id = req.params!.id;
        try {
            const gebiet = await getGebiet(id);

            const thema = matchedData(req) as ThemaResource;
            const betreuer = thema.betreuer!;

            if (gebiet.public === true || (req.profId && gebiet.verwalter.toString() === req.profId)) {
                const themen = await getAlleThemen(id);
                res.send(themen);
                return;
            }
              res.sendStatus(403);

        } catch (err) {
            if (err instanceof MyError && err.details.code === "resourceNotFound") {  //TODO
                res.sendStatus(404);
            } else {
                res.sendStatus(400);
            }
        }
    });

gebietRouter.get("/:id",
    optionalAuthentication,
    param("id").isMongoId(),
    handleValidationErrors,
    async (req, res) => {
        const id = req.params!.id;
        try {
            const gebiet = await getGebiet(id);
            if (gebiet.public === true) {
                res.send(gebiet);
                return;
            }

            if (req.profId && gebiet.verwalter.toString() === req.profId) {
                res.send(gebiet);
                return;
            }

            res.sendStatus(403);

        } catch (err) {
            res.sendStatus(404);
        }
    });

gebietRouter.post("/",
    requiresAuthentication,
    ...gebietValidation,
    handleValidationErrors,
    async (req, res) => {
        const gebietResource = matchedData(req) as GebietResource;
        if (gebietResource.verwalter !== req.profId) {
            res.sendStatus(403);
            return;
        }
        try {
            const createdGebietResource = await createGebiet(gebietResource);
            res.status(201).send(createdGebietResource);
        } catch (err) {
            if (err instanceof MyError) {
                return res.status(400).json({
                    errors: [{
                        msg: err.message,
                        path: err.details.path,
                        value: err.details.value,
                        type: err.details.code
                    }]
                });
            }
            res.sendStatus(500);
        }
    });


gebietRouter.put("/:id",
    requiresAuthentication,
    param('id').isMongoId(),
    ...gebietValidation,
    handleValidationErrors,
    async (req, res, next) => {
        const id = req.params!.id;
        const gebietResId = req.body.id;

        if (gebietResId && id !== gebietResId) {
            return res.status(400).json({
                errors: [
                    { location: "body", param: "id", msg: "ID Mismatch", value: gebietResId },
                    { location: "params", param: "id", msg: "ID Mismatch", value: id }
                ]
            });
        }


        try {
            const existingGebiet = await getGebiet(id);
            if (existingGebiet.verwalter.toString() !== req.profId) {
                res.sendStatus(403);
                return;
            }

            const gebietResource = matchedData(req) as GebietResource;
            gebietResource.id = id;

            const updatedGebietResource = await updateGebiet(gebietResource)
            res.send(updatedGebietResource);

        } catch (err) {
            if (err instanceof MyError) {
                if (err.details.code === "resourceNotFound") {
                    return res.sendStatus(404);
                }
                return res.status(400).json({
                    errors: [{
                        msg: err.message,
                        path: err.details.path,
                        value: err.details.value,
                        type: err.details.code
                    }]
                });
            }
            res.sendStatus(500);
        }
    });


gebietRouter.delete("/:id",
    requiresAuthentication,
    param('id').isMongoId(),
    handleValidationErrors,
    async (req, res) => {
        const id = req.params!.id;
        try {
            const existingGebiet = await getGebiet(id);

            if (existingGebiet.verwalter.toString() !== req.profId) {
                res.sendStatus(403);
                return;
            }
            await deleteGebiet(id);
            res.sendStatus(204);
        } catch (err) {
            if (err instanceof MyError && err.details.code === "resourceNotFound") {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(404);
        }
    });