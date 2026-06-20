import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/JWTService";

declare global { // Erweitere das existierende, globale Express-Interface um diese zwei Felder
    namespace Express {
        export interface Request {
            /**
             * Mongo-ID of currently logged in prof; or undefined, if prof is a guest.
             */
            profId?: string;
            role?: "u" | "a";
        }
    }
}

/**
 * Prüft Authentifizierung und schreibt `profId` und `role' des Profs in den Request.
 * Falls Authentifizierung fehlschlägt, wird ein Fehler (401) gesendet.
 */
export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    const jwtString = req.cookies.access_token; 

    if (!jwtString) {
        res.sendStatus(401);
        return;
    }

    try {
        const verfiedJWT = verifyJWT(jwtString);
        req.profId = verfiedJWT.id;
        req.role = verfiedJWT.role;

        next();

    } catch (err) {
        res.sendStatus(401);
        return;

    }
}

    /**
     * Prüft Authentifizierung und schreibt `profId` und `role' des Profs in den Request.
     * Falls ein JWT vorhanden ist, wird bei fehlgeschlagener Prüfung ein Fehler gesendet.
     * Ansonsten wird kein Fehler erzeugt.
     */
    export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
        const jwtString = req.cookies.access_token;

        if (!jwtString) {
            next();
            return;
        }

        try {
            const verfiedJWT = verifyJWT(jwtString);
            req.profId = verfiedJWT.id;
            req.role = verfiedJWT.role;

            next();
        } catch (err) {
            res.sendStatus(401);
            return;
        }

    }

