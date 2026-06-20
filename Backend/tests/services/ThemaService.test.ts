import { Prof } from "../../src/model/ProfModel";
import { Gebiet } from "../../src/model/GebietModel";
import { Thema } from "../../src/model/ThemaModel";
import { getAlleThemen, getThema, createThema, updateThema, deleteThema } from "../../src/services/ThemaService";
import { Types } from "mongoose";

async function createProfUndGebiet() {
    const prof = await new Prof({ name: "Peter", campusID: "10001", password: "pw" }).save();
    const gebiet = await new Gebiet({ name: "TestGebiet", public: true, verwalter: prof._id }).save();
    return { prof, gebiet };
}


test("createThema erfolgreich", async () => {
    const { prof, gebiet } = await createProfUndGebiet();

    const thema = await createThema({
        titel: "Test",
        beschreibung: "Bla",
        literatur: "ble",
        abschluss: "bsc",
        status: "offen",
        gebiet: gebiet.id,
        betreuer: prof.id
    });

    expect(thema.id).toBeDefined();
    expect(thema.titel).toBe("Test");
    expect(thema.literatur).toBe("ble");
    expect(thema.gebiet).toBe(gebiet.id);
    expect(thema.betreuer).toBe(prof.id);
    expect(thema.updatedAt).toBeDefined();
})

test("createThema Fail, Gebiet geschlossen", async () => {
    const { prof } = await createProfUndGebiet();
    const closedGebiet = await new Gebiet({ name: "Geschlossen", public: true, verwalter: prof._id, closed: true }).save();

    await expect(createThema({
        titel: "FehlerThema",
        beschreibung: "skabub",
        literatur: "ble",
        abschluss: "bsc",
        status: "offen",
        gebiet: closedGebiet.id,
        betreuer: prof.id
    })).rejects.toThrow("Gebiet ist geschlossen");
})


test("getAlleThemen test", async () => {
    const { prof, gebiet } = await createProfUndGebiet();
    await createThema({ titel: "T1", beschreibung: "B1", abschluss: "bsc", status: "offen", gebiet: gebiet.id, betreuer: prof.id });
    await createThema({ titel: "T2", beschreibung: "B2", abschluss: "msc", status: "offen", gebiet: gebiet.id, betreuer: prof.id });

    const themen = await getAlleThemen(gebiet.id);
    expect(themen.length).toBe(2);
    const titels = themen.map(t => t.titel);
    expect(titels).toContain("T1");
    expect(titels).toContain("T2");
})

test("getThema", async () => {
    const { prof, gebiet } = await createProfUndGebiet();
    const thema = await createThema({ titel: "Einzel", beschreibung: "B", abschluss: "any", status: "offen", gebiet: gebiet.id, betreuer: prof.id });

    const thema2 = await getThema(thema.id!);
    expect(thema2.id).toBe(thema.id);
    expect(thema2.titel).toBe("Einzel");
})

test("updateThema erfolgreich", async () => {
    const { prof, gebiet } = await createProfUndGebiet();
    const thema = await createThema({ titel: "Old", beschreibung: "B", abschluss: "any", status: "offen", gebiet: gebiet.id, betreuer: prof.id });

    const updated = await updateThema({ ...thema, titel: "New", status: "reserviert" });
    expect(updated.titel).toBe("New");
    expect(updated.status).toBe("reserviert");
})

test("updateThema Fehler, nicht vorhandenes Thema", async () => {
    const fakeId = new Types.ObjectId().toString();
    await expect(updateThema({ id: fakeId, titel: "X", beschreibung: "X", abschluss: "bsc", status: "offen", gebiet: "507", betreuer: "507" }))
        .rejects.toThrow(`Thema mit id ${fakeId} nicht gefunden`);
});

test("deleteThema erfolgreich", async () => {
    const { prof, gebiet } = await createProfUndGebiet();
    const thema = await createThema({ titel: "DeleteMe", beschreibung: "B", abschluss: "bsc", status: "offen", gebiet: gebiet.id, betreuer: prof.id });

    await deleteThema(thema.id!);
    const found = await Thema.findById(thema.id).exec();
    expect(found).toBeNull();
})

test("deleteThema Fehler", async () => {
    const fakeId = new Types.ObjectId().toString();
    await expect(deleteThema(fakeId)).rejects.toThrow(`Thema mit id ${fakeId} nicht gefunden`);
})

test("createThema Fail, Titel und Betreuer Kombination nicht eindeutig", async () => {
    const { prof, gebiet } = await createProfUndGebiet();

    const themaResource = {
        titel: "Unique Constraint Test Thema",
        beschreibung: "Beschreibung",
        abschluss: "bsc",
        status: "offen",
        gebiet: gebiet.id,
        betreuer: prof.id
    };
    await createThema(themaResource);

    await expect(createThema(themaResource)).rejects.toThrow(`Thema mit Titel 'Unique Constraint Test Thema' wird bereits von Betreuer betreut.`
    );
})

test("getAlleThemen Fail, Gebiet nicht gefunden", async () => {
    const fakeId = new Types.ObjectId().toString();
    await expect(getAlleThemen(fakeId)).rejects.toThrow(`Gebiet mit id ${fakeId} nicht gefunden`)
})

test("updateThema constraint test", async () => {
    const { prof, gebiet } = await createProfUndGebiet();
    const themaZuUpdaten = await createThema({
        titel: "OG",
        beschreibung: "Beschreibung",
        abschluss: "bsc",
        status: "offen",
        gebiet: gebiet.id,
        betreuer: prof.id
    });
    await createThema({
        titel: "Test",
        beschreibung: "Beschreibung",
        abschluss: "bsc",
        status: "offen",
        gebiet: gebiet.id,
        betreuer: prof.id
    });

    await expect(updateThema({
        ...themaZuUpdaten,
        titel: "Test"
    })).rejects.toThrow("Thema mit Titel 'Test' existiert bereits.");
});