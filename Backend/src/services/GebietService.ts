import { Gebiet, IGebiet } from "../model/GebietModel";
import { GebietResource } from "../Resources";
import { IProf, Prof } from "../model/ProfModel";
import { Thema } from "../model/ThemaModel";
import { dateToString } from "./ServiceHelper";
import { Types, Document, HydratedDocument } from "mongoose";
import { MyError } from "../errors/MyError";

type PopulatedProf = IProf & Document & { _id: Types.ObjectId, id: string };
type GebietsDokument = HydratedDocument<IGebiet>;

/**
 * 
 * Gibt alle Gebiete zurück, die für einen Prof sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Gebiete
 * - alle eigenen Gebiete, dies ist natürlich nur möglich, wenn die profId angegeben ist.
 */
export async function getAlleGebiete(profId?: string): Promise<GebietResource[]> {

      let query = Gebiet.find().populate<{ verwalter: PopulatedProf }>("verwalter");

      if (!profId) {
            query.where("public").equals(true);
      }
      else {
            query.or([
                  { public: true },
                  { verwalter: new Types.ObjectId(profId) }
            ]);
      }

      const gebiete = await query.exec();
      const resources = await Promise.all(gebiete.map(async gebiet => {
            const verwalterDoc = gebiet.verwalter as PopulatedProf;
            const anzahlThemen = await Thema.countDocuments({ gebiet: gebiet._id }).exec();

            return {
                  id: gebiet.id,
                  name: gebiet.name,
                  beschreibung: gebiet.beschreibung,
                  public: gebiet.public,
                  closed: gebiet.closed,
                  verwalter: verwalterDoc._id.toString(),
                  verwalterName: verwalterDoc.name,
                  createdAt: gebiet.createdAt ? dateToString(gebiet.createdAt) : undefined,
                  anzahlThemen
            };
      }));

      return resources;
}


/**
 * Liefert das Gebiet mit angegebener ID.
 * Falls kein Gebiet gefunden wurde, wird ein Fehler geworfen.
 */
export async function getGebiet(id: string): Promise<GebietResource> {
      const gebiet = await Gebiet.findById(id).populate<{ verwalter: IProf & { _id: Types.ObjectId } }>("verwalter").exec();
      if (!gebiet) {
            throw new MyError(`Gebiet mit id ${id} nicht gefunden`, { 
            code: "resourceNotFound", 
            path: "id", 
            value: id 
        });
    }

      const verwalterDoc = gebiet.verwalter as PopulatedProf;

      const anzahlThemen = await Thema.countDocuments({ gebiet: gebiet._id }).exec();

      return {
            id: gebiet.id,
            name: gebiet.name,
            beschreibung: gebiet.beschreibung,
            public: gebiet.public,
            closed: gebiet.closed,
            verwalter: verwalterDoc._id.toString(),
            verwalterName: verwalterDoc.name,
            createdAt: gebiet.createdAt ? dateToString(gebiet.createdAt) : undefined,
            anzahlThemen
      };
}

/**
 * Erzeugt das Gebiet.
 */
export async function createGebiet(gebietResource: GebietResource): Promise<GebietResource> {
      const betreuer = await Prof.findById(gebietResource.verwalter).exec();
      if (!betreuer) {
            throw new MyError(`Verwalter mit id ${gebietResource.verwalter} nicht gefunden`, { 
            code: "resourceNotFound", 
            path: "verwalter", 
            value: gebietResource.verwalter 
        });
    }

      const neuGebiet = new Gebiet({
            name: gebietResource.name,
            beschreibung: gebietResource.beschreibung,
            public: gebietResource.public ?? false,
            closed: gebietResource.closed ?? false,
            verwalter: new Types.ObjectId(gebietResource.verwalter)
      });
      let saved: GebietsDokument = await neuGebiet.save();
      saved = await saved.populate<{ verwalter: PopulatedProf }>("verwalter") as unknown as GebietsDokument;
      const verwalterDoc = saved.verwalter as unknown as PopulatedProf;

      return {
            id: saved.id,
            name: saved.name,
            beschreibung: saved.beschreibung,
            public: saved.public,
            closed: saved.closed,
            verwalter: verwalterDoc._id.toString(),
            verwalterName: verwalterDoc.name,
            createdAt: saved.createdAt ? dateToString(saved.createdAt) : undefined,
            anzahlThemen: 0
      };
}

/**
 * Ändert die Daten eines Gebiets.
 * Aktuell können nur folgende Daten geändert werden:
 *       name, beschreibung, public, closed.
 * Falls andere Daten geändert werden, wird dies ignoriert.
 */
export async function updateGebiet(gebietResource: GebietResource): Promise<GebietResource> {
      if (!gebietResource.id) {
           throw new MyError("Keine ID angegeben", { code: "validationError", path: "id" });
    }

      const gebiet = await Gebiet.findById(gebietResource.id).exec();
      if (!gebiet) {
        throw new MyError(`Gebiet mit id ${gebietResource.id} nicht gefunden`, { 
            code: "resourceNotFound", 
            path: "id", 
            value: gebietResource.id 
        });
    }

      gebiet.name = gebietResource.name;
      gebiet.beschreibung = gebietResource.beschreibung;
      if (typeof gebietResource.public == "boolean") gebiet.public = gebietResource.public;
      if (typeof gebietResource.closed == "boolean") gebiet.closed = gebietResource.closed;

      let saved: GebietsDokument = await gebiet.save() as GebietsDokument;
      saved = await saved.populate<{ verwalter: PopulatedProf }>("verwalter") as unknown as GebietsDokument;
      const verwalterDoc = saved.verwalter as unknown as PopulatedProf;

      const anzahlThemen = await Thema.countDocuments({ gebiet: saved._id }).exec();

      return {
            id: saved.id,
            name: saved.name,
            beschreibung: saved.beschreibung,
            public: saved.public,
            closed: saved.closed,
            verwalter: verwalterDoc._id.toString(),
            verwalterName: verwalterDoc.name,
            createdAt: saved.createdAt ? dateToString(saved.createdAt) : undefined,
            anzahlThemen
      };
}

/**
 * Beim Löschen wird das Gebiet über die ID identifiziert.
 * Falls ein Gebiet nicht gefunden wurde, oder ein dazugehöriges Thema noch offen ist
 * (oder aus anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteGebiet(id: string): Promise<void> {
      const gebiet = await Gebiet.findById(id).exec();
      if (!gebiet) {
            throw new MyError(`Gebiet mit id ${id} nicht gefunden`, { 
            code: "resourceNotFound", 
            path: "id", 
            value: id 
        });
    }

      const offeneThemenCount = await Thema.countDocuments({ gebiet: gebiet._id, status: "offen" }).exec();
      if (offeneThemenCount > 0) {
            throw new MyError(`Gebiet kann nicht gelöscht werden: Es gibt noch ${offeneThemenCount} offene Themen.`, {
                  code: "validationError",
                  path: "id", 
            value: id 
        });
    }

      await Thema.deleteMany({ gebiet: gebiet._id }).exec();

      const res = await Gebiet.deleteOne({ _id: gebiet._id }).exec();
      if (res.deletedCount !== 1) {
          throw new MyError(`Gebiet mit id ${id} konnte nicht gelöscht werden`, { 
            code: "unknown", 
            path: "id", 
            value: id 
        });
    }
}