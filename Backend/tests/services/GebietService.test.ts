
import { Types } from "mongoose";
import { Gebiet } from "../../src/model/GebietModel";
import { Prof } from "../../src/model/ProfModel";
import { Thema } from "../../src/model/ThemaModel";
import { createGebiet, getAlleGebiete, getGebiet, updateGebiet, deleteGebiet } from "../../src/services/GebietService";
import { createThema } from "../../src/services/ThemaService";

test("createGebiet test", async () => {
    const prof = await new Prof({ name: "Peter", campusID: "10001", password: "pw", admin: false }).save();

    const gebiet = await createGebiet({
        name: "Test Gebiet",
        verwalter: prof.id,
        public: true,
        closed: false
    })
    expect(gebiet).toBeDefined();
    expect(gebiet.name).toBe("Test Gebiet");
    expect(gebiet.verwalter).toBe(prof.id);
    expect(gebiet.verwalterName).toBe("Peter");
    expect(gebiet.anzahlThemen).toBe(0);
})

test("getGebiet test", async () => {
    const prof = await new Prof({ name: "Peter", campusID: "10002", password: "pw", admin: false }).save();
    const gebiet = await createGebiet({
        name: "Web",
        beschreibung: "blabla",
        verwalter: prof.id,
        id: "",
        createdAt: undefined,
        anzahlThemen: 0,
        verwalterName: undefined
    })

    const gebiet2 = await getGebiet(gebiet.id!);
    expect(gebiet2.id).toBe(gebiet.id);
    expect(gebiet2.verwalterName).toBe("Peter");
})


test("updateGebiet test", async () => {
    const prof = await new Prof({ name: "Peter", campusID: "10003", password: "pw", admin: false }).save();
    const gebiet = await createGebiet({
        name: "Software Design",
        beschreibung: "Alt",
        verwalter: prof.id,
        id: "",
        createdAt: undefined,
        anzahlThemen: 0,
        verwalterName: undefined
    })

    const updated = await updateGebiet({ ...gebiet, name: "Software Design Updated", public: false, beschreibung: "Neu" })
    expect(updated.name).toBe("Software Design Updated");
    expect(updated.public).toBe(false);
    expect(updated.beschreibung).toBe("Neu");
})


test("deleteGebiet test", async () => {
    const prof = await new Prof({ name: "Peter", campusID: "10004", password: "pw", admin: false }).save();
    const gebiet = await createGebiet({
        name: "Medien",
        beschreibung: "Blub",
        verwalter: prof.id,
        id: "",
        createdAt: undefined,
        anzahlThemen: 0,
        verwalterName: undefined
    });

    await deleteGebiet(gebiet.id!);

    await expect(getGebiet(gebiet.id!)).rejects.toThrow("Gebiet mit id");
});

test("getAlleGebiete ohne profId", async () => {
    const prof = await new Prof({ name: "Anna", campusID: "1", password: "pw" }).save();
    const gebiet = await new Gebiet({ name: "Mathe", public: true, verwalter: prof._id }).save();
    const gebiet2 = await new Gebiet({ name: "Web", public: false, verwalter: prof._id }).save();

    const res = await getAlleGebiete();
    expect(res.length).toBe(1);
    expect(res[0].name).toBe("Mathe");
    expect(res[0].verwalterName).toBe("Anna");
});

test("getAlleGebiete mit profId", async () => {
    const prof = await new Prof({ name: "Anna", campusID: "2", password: "pw" }).save();
    const gebiet = await new Gebiet({ name: "Mathe", public: true, verwalter: prof._id }).save();
    const gebiet2 = await new Gebiet({ name: "Web", public: false, verwalter: prof._id }).save();

    const res = await getAlleGebiete(prof.id);
    expect(res.length).toBe(2);
    const names: string[] = [];
    for (const r of res) {
        names.push(r.name);
    }
    expect(names).toContain("Mathe");
    expect(names).toContain("Web");
});

test("deleteGebiet löscht alle ausgewählten Themen", async () => {
    const prof = await new Prof({ name: "Max", campusID: "999", password: "pw", admin: false }).save();

    const gebiet = await new Gebiet({ name: "Test Gebiet", public: true, verwalter: prof._id }).save();
    const thema1 = await createThema({
        titel: "Thema 1",
        beschreibung: "B1",
        abschluss: "bsc",
        status: "reserviert",
        gebiet: gebiet.id,
        betreuer: prof.id
    })
    const thema2 = await createThema({
        titel: "Thema 2",
        beschreibung: "B2",
        abschluss: "msc",
        status: "reserviert",
        gebiet: gebiet.id,
        betreuer: prof.id
    })
    let themen = await Thema.find({ gebiet: gebiet.id }).exec();
    expect(themen.length).toBe(2);
    await deleteGebiet(gebiet.id);

    const nochDa = await Thema.find({ gebiet: gebiet.id }).exec();
    expect(nochDa.length).toBe(0);
})

test("createGebiet Fail, Verwalter existiert nicht", async () => {
    const fakeProfId = new Types.ObjectId().toString();

    await expect(createGebiet({
        name: "Gebiet ohne Verwalter",
        verwalter: fakeProfId,
        public: true,
        closed: false
    })).rejects.toThrow(`Verwalter mit id ${fakeProfId} nicht gefunden`);
})

test("updateGebiet Fail, ID fehlt (undefined)", async () => {
    const resourceOhneId = {
        name: "Test",
        beschreibung: "B",
        verwalter: "fake",
        public: true,
        closed: false
    };

    await expect(updateGebiet(resourceOhneId)).rejects.toThrow(
        "Keine ID angegeben"
    );
})


test("updateGebiet Fail, Gebiet nicht gefunden", async () => {
    const fakeId = new Types.ObjectId().toString();

    await expect(updateGebiet({
        id: fakeId,
        name: "Test",
        verwalter: "fake",
        beschreibung: "B"
    })).rejects.toThrow(`Gebiet mit id ${fakeId} nicht gefunden`);
})

test("deleteGebiet Fail, Gebiet nicht gefunden", async () => {
    const fakeId = new Types.ObjectId().toString();

    await expect(deleteGebiet(fakeId)).rejects.toThrow(`Gebiet mit id ${fakeId} nicht gefunden`);
})


test("deleteGebiet Fail, offene Themen verhindern Löschung", async () => {
    const prof = await new Prof({ name: "Blocker", campusID: "D2", password: "pw" }).save();
    const gebiet = await new Gebiet({ name: "Blockiertes Gebiet", public: true, verwalter: prof._id }).save();

    await createThema({
        titel: "Offenes Thema",
        beschreibung: "B",
        status: "offen",
        gebiet: gebiet.id,
        betreuer: prof.id
    })

    await createThema({
        titel: "Reserviertes Thema",
        beschreibung: "B",
        status: "reserviert",
        gebiet: gebiet.id,
        betreuer: prof.id
    });

    await expect(deleteGebiet(gebiet.id)).rejects.toThrow(
        "Gebiet kann nicht gelöscht werden: Es gibt noch 1 offene Themen."
    );
})

