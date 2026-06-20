import { Types } from "mongoose";
import { Thema } from "../model/ThemaModel";
import { ThemaResource } from "../Resources";
import { dateToString } from "./ServiceHelper";
import { Gebiet } from "../model/GebietModel";
import { IProf, Prof } from "../model/ProfModel";
import { MyError } from "../errors/MyError";



/**
 * Gibt alle Themen in einem Gebiet zurück.
 * Wenn das Gebiet nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
        const gebiet = await Gebiet.findById(gebietId).exec();
        if (!gebiet) {
                throw new MyError(`Gebiet mit id ${gebietId} nicht gefunden`, {
                        code: "resourceNotFound",
                        path: "gebiet",
                        value: gebietId
                });
        }

        const themen = await Thema.find({ gebiet: gebietId }).populate("betreuer").exec();

        return themen.map(thema => {
                const betreuerDoc = thema.betreuer as unknown as IProf & { _id: Types.ObjectId };
                return {
                        id: thema.id,
                        titel: thema.titel,
                        beschreibung: thema.beschreibung,
                        literatur: thema.literatur,
                        gebiet: thema.gebiet.toString(),
                        betreuer: betreuerDoc._id.toString(),
                        betreuerName: betreuerDoc.name,
                        abschluss: thema.abschluss,
                        status: thema.status,
                        updatedAt: thema.updatedAt ? dateToString(thema.updatedAt) : undefined
                };
        });
}



/**
 * Liefert die ThemaResource mit angegebener ID.
 * Falls kein Thema gefunden wurde, wird ein Fehler geworfen.
 */
export async function getThema(id: string): Promise<ThemaResource> {
        const thema = await Thema.findById(id).populate<{ betreuer: IProf & { _id: Types.ObjectId } }>("betreuer").exec();
        if (!thema) {
                throw new MyError(`Thema mit id ${id} nicht gefunden`, {
                        code: "resourceNotFound",
                        path: "id",
                        value: id
                });
        }

        return {
                id: thema.id,
                titel: thema.titel,
                beschreibung: thema.beschreibung,
                literatur: thema.literatur,
                gebiet: thema.gebiet.toString(),
                betreuer: thema.betreuer._id.toString(),
                betreuerName: thema.betreuer.name,
                abschluss: thema.abschluss,
                status: thema.status,
                updatedAt: thema.updatedAt ? dateToString(thema.updatedAt) : undefined
        };
}

/**
 * Erzeugt ein Thema.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (closed) ist, wird ein Fehler wird geworfen.
 */
export async function createThema(themaResource: ThemaResource): Promise<ThemaResource> {
        const gebiet = await Gebiet.findById(themaResource.gebiet).exec();
        if (!gebiet) {
                throw new MyError(`Gebiet mit id ${themaResource.gebiet} nicht gefunden`, {
                        code: "resourceNotFound",
                        path: "gebiet",
                        value: themaResource.gebiet
                });
        }

        if (gebiet.closed) {
                throw new MyError(`Gebiet ist geschlossen, kein neues Thema möglich`, {
                        code: "validationError",
                        path: "gebiet",
                        value: "closed"
                });
        }

        const betreuer = await Prof.findById(themaResource.betreuer).exec();
        if (!betreuer) {
                throw new MyError(`Betreuer mit id ${themaResource.betreuer} nicht gefunden`, {
                        code: "resourceNotFound",
                        path: "betreuer",
                        value: themaResource.betreuer
                });
        }
        const existingThema = await Thema.findOne({
                titel: themaResource.titel,
                betreuer: new Types.ObjectId(themaResource.betreuer)
        }).exec();

        if (existingThema) {

                throw new MyError(`Thema mit Titel '${themaResource.titel}' wird bereits von Betreuer betreut.`, {
                        code: "duplicateTitle",
                        path: "titel",
                        value: themaResource.titel
                });
        }

        const newThema = new Thema({
                titel: themaResource.titel,
                beschreibung: themaResource.beschreibung,
                literatur: themaResource.literatur,
                abschluss: themaResource.abschluss ?? "any",
                status: themaResource.status ?? "offen",
                gebiet: new Types.ObjectId(themaResource.gebiet),
                betreuer: new Types.ObjectId(themaResource.betreuer)
        })

        const saved = await newThema.save();

        await saved.populate("betreuer");

        const betreuerDoc = saved.betreuer as unknown as IProf & { _id: Types.ObjectId };
        return {
                id: saved.id,
                titel: saved.titel,
                beschreibung: saved.beschreibung,
                literatur: saved.literatur,
                gebiet: saved.gebiet.toString(),
                betreuer: betreuerDoc._id.toString(),
                betreuerName: betreuerDoc.name,
                abschluss: saved.abschluss,
                status: saved.status,
                updatedAt: saved.updatedAt ? dateToString(saved.updatedAt) : undefined
        };
}

/**
 * Updated ein Thema. Es können nur Titel, Beschreibung, Abschluss und Status geändert werden.
 * Aktuell können Themen nicht von einem Gebiet in ein anderes verschoben werden.
 * Auch kann der Betreuer nicht geändert werden.
 * Falls das Gebiet oder Betreuer geändert wurde, wird dies ignoriert.
 */
export async function updateThema(themaResource: ThemaResource): Promise<ThemaResource> {
        if (!themaResource.id) {
                throw new MyError("Keine ID angegeben", { code: "validationError", path: "id" });
        }
        const thema = await Thema.findById(themaResource.id).exec();
        if (!thema) {
                throw new MyError(`Thema mit id ${themaResource.id} nicht gefunden`, {
                        code: "resourceNotFound",
                        path: "id",
                        value: themaResource.id
                });
        }

        if (themaResource.titel && themaResource.titel !== thema.titel) {
                const existingThema = await Thema.findOne({
                        titel: themaResource.titel,
                        betreuer: thema.betreuer
                }).exec();

                if (existingThema && existingThema.id !== thema.id) {
                        throw new MyError(`Thema mit Titel '${themaResource.titel}' existiert bereits.`, {
                                code: "duplicateTitle",
                                path: "titel",
                                value: themaResource.titel
                        });
                }
        }


        thema.titel = themaResource.titel;
        thema.beschreibung = themaResource.beschreibung;
        thema.literatur = themaResource.literatur;

        if (themaResource.abschluss) thema.abschluss = themaResource.abschluss as "bsc" | "msc" | "any";
        if (themaResource.status) thema.status = themaResource.status as "offen" | "reserviert";

        const saved = await thema.save();
        await saved.populate("betreuer");
        const betreuerDoc = saved.betreuer as unknown as IProf & { _id: Types.ObjectId };

        return {
                id: saved.id,
                titel: saved.titel,
                beschreibung: saved.beschreibung,
                literatur: saved.literatur,
                gebiet: saved.gebiet.toString(),
                betreuer: betreuerDoc._id.toString(),
                betreuerName: betreuerDoc.name,
                abschluss: saved.abschluss,
                status: saved.status,
                updatedAt: saved.updatedAt ? dateToString(saved.updatedAt) : undefined
        };
}

/**
 * Beim Löschen wird das Thema über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteThema(id: string): Promise<void> {
        const res = await Thema.deleteOne({ _id: new Types.ObjectId(id) }).exec();
        if (res.deletedCount !== 1) {
                throw new MyError(`Thema mit id ${id} nicht gefunden`, {
                        code: "resourceNotFound",
                        path: "id",
                        value: id
                });
        }
}
