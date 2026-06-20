import { ProfResource } from "../Resources";
import { Types } from "mongoose";
import { Prof } from "../model/ProfModel";
import { Gebiet } from "../model/GebietModel";
import { deleteGebiet } from "./GebietService";
import { Thema } from "../model/ThemaModel";
import { MyError } from "../errors/MyError";



/**
 * Erzeugt einen Prof. Das Passwort darf nicht zurückgegeben werden.
 */
export async function createProf(profResource: ProfResource): Promise<ProfResource> {
    if (!profResource.campusID) {
        throw new MyError("CampusID fehlt", {
            code: "missingCampusID",
            path: "campusID"
        });
    }

    const existingProf = await Prof.findOne({ campusID: profResource.campusID }).exec();
    if (existingProf) {
        throw new MyError("CampusID existiert bereits", {
            code: "duplicateCampusID",
            path: "campusID",
            value: profResource.campusID
        });
    }

    const newProf = new Prof({
        name: profResource.name,
        titel: profResource.titel,
        campusID: profResource.campusID,
        password: profResource.password,
        admin: profResource.admin
    });

    const savedProf = await newProf.save();
    return {
        id: savedProf.id,
        name: savedProf.name,
        titel: savedProf.titel,
        campusID: savedProf.campusID,
        admin: savedProf.admin,
    };
}

/**
 * Updated einen Prof. Beim Update wird der Prof über die id identifiziert.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function updateProf(profResource: ProfResource): Promise<ProfResource> {
    const prof = await Prof.findById(profResource.id).exec();
    if (!prof) {
        throw new MyError(`Prof mit id ${profResource.id} nicht gefunden`, {
            code: "resourceNotFound",
            path: "id",
            value: profResource.id
        });
    }

    prof.name = profResource.name;
    // may be deleted, so no check
    prof.titel = profResource.titel;
    prof.campusID = profResource.campusID;
    prof.admin = profResource.admin;
    if (profResource.password) prof.password = profResource.password;

    const savedProf = await prof.save();
    return {
        id: savedProf.id,
        name: savedProf.name,
        titel: savedProf.titel,
        campusID: savedProf.campusID,
        admin: savedProf.admin,
    };
}

/**
 * Beim Löschen wird der Prof über die ID identifiziert.
 * Falls Prof nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Prof gelöscht wird, müssen auch alle zugehörigen Gebiete und Themen gelöscht werden.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function deleteProf(id: string): Promise<void> {
    const profId = new Types.ObjectId(id);
    const res = await Prof.deleteOne({ _id: profId }).exec();
    if (res.deletedCount !== 1) {
        throw new MyError(`Prof mit id ${id} nicht gefunden`, {
            code: "resourceNotFound",
            path: "id",
            value: id
        });
    }

    const gebiete = await Gebiet.find({ verwalter: profId }).exec();
    for (const gebiet of gebiete) {
        try {
            await deleteGebiet(gebiet.id);
        } catch (err) {
            // we ignore that here
        }
    }
    try {
        await Thema.deleteMany({ betreuer: profId }).exec();
    } catch (err) {
    }
}

/**
 * Gibt alle Profs zurück, Passwörter werden nicht zurückgegeben.
 * 
 * Diese Funktion ist bereits vorgegeben.
 */
export async function getAlleProfs(): Promise<ProfResource[]> {
    const arrProfs = await Prof.find({}).exec();
    const arrProfRes = arrProfs.map((prof) => ({
        id: prof.id,
        name: prof.name,
        titel: prof.titel,
        campusID: prof.campusID,
        admin: prof.admin,
    }));
    return arrProfRes;
}

