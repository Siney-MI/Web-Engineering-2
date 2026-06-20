import express from "express";
import { ProfResource } from "../Resources";
import { createProf, deleteProf, getAlleProfs, updateProf } from "../services/ProfService";
import { body, param, matchedData } from "express-validator";
import { handleValidationErrors } from "../validation";
import { MyError } from "../errors/MyError";
import { requiresAuthentication } from "./authentication";



export const profRouter = express.Router();

const profvalidation = [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name muss String sein'),
    body('titel').optional().isString().isLength({ max: 100 }),
    body('campusID').isString().notEmpty().withMessage('CampusID fehlt').isLength({ min: 1, max: 100 }),
    body('admin').isBoolean().withMessage('Admin muss boolean sein'),
];

profRouter.get("/alle",
    requiresAuthentication,
    async (req, res) => {

        if (req.role !== 'a') {
            res.sendStatus(403);
            return;
        }

        const profs = await getAlleProfs();
        res.send(profs); // Default Status 200
    })

    profRouter.all("/alle", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.sendStatus(405);
});

profRouter.get("/",
    requiresAuthentication,
    async (_req, res, _next) => {
        res.set("Allow", "POST")
        res.sendStatus(405);
    });

profRouter.get("/:id",
    requiresAuthentication,
    async (_req, res, _next) => {
        res.set("Allow", "PUT, DELETE")
        res.sendStatus(405);
    });

profRouter.post("/",
    requiresAuthentication,
    ...profvalidation,
    body('password').isStrongPassword().withMessage('Passwort zu schwach'),
    handleValidationErrors,
    async (req, res) => {

        if (req.role !== 'a') {
            res.sendStatus(403);
            return;
        }

        const profResource = matchedData(req) as ProfResource;
        try {
            const createdProfResource = await createProf(profResource);
            res.status(201).json(createdProfResource);
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
            res.sendStatus(500);
        }
    });

/** 
 * Alternative zur Erzeugung der Fehler im Handler:
 * mit custom error handler bei Validation: 
 * ```
 * custom(req) => {
 *     if (req.body.id !== req.params.id) {
 *       ...
 *      }
 * }
 *  ```
 * und diese Custom-Validation bei param("id") und body("id") einfügen.
 */
profRouter.put("/:id",
    requiresAuthentication,
    param('id').isMongoId().withMessage('Ungültige ID'),
    ...profvalidation,
    body('password').optional().isStrongPassword(),
    handleValidationErrors,
    async (req, res) => {

        if (req.role !== 'a') {
            res.sendStatus(403);
            return;
        }
        const id = req.params!.id; // no error in VSCode, but TSC/TS-Jest complains w/o '!'
        const profResId = req.body.id;
        
        if (profResId && id !== profResId) {
            return res.status(400).json({ // etwas schlampig hier, wird später genauer umgesetzt
                errors: [
                    {
                        location: "body",
                        param: "id",
                        msg: "ID in URL stimmt nicht mit Body überein",
                        value: profResId
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

        const profResource = matchedData(req) as ProfResource;
        profResource.id = id;
        try {
            const updatedProfResource = await updateProf(profResource)
            return res.json(updatedProfResource);
        } catch (err) {
            if (err instanceof MyError) {
                const status = err.details.code === "resourceNotFound" ? 404 : 400;
                return res.status(404).json({
                    errors: [{
                        msg: err.message,
                        path: err.details.path,
                        value: err.details.value,
                        type: err.details.code,
                        location: "params"
                    }]
                });
            }
            res.sendStatus(500);
        }
    }
);

profRouter.delete("/:id",
    requiresAuthentication,
    param('id').isMongoId(),
    handleValidationErrors,
    async (req, res, next) => {

        if (req.role !== 'a') {
            res.sendStatus(403);
            return;
        }
        const id = req.params!.id; // no error in VSCode, but TSC/TS-Jest complains w/o '!'
        if (id === req.profId){
            res.sendStatus(403);
            return;
        }
        try {
            await deleteProf(id);
            res.sendStatus(204)
        } catch (err) {
            res.sendStatus(404);
        }
    })
