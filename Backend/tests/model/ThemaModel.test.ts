import { Thema } from "../../src/model/ThemaModel";
import { Prof } from "../../src/model/ProfModel";
import { Gebiet } from "../../src/model/GebietModel";
import { Types } from "mongoose";

let profId: Types.ObjectId;
let gebietId: Types.ObjectId;

beforeAll(async () => {
    const prof = new Prof({
        name: "Peter",
        campusID: "99348",
        password: "pw42993"
    });
    const savedProf = await prof.save();
    profId = savedProf.id;

    const gebiet = new Gebiet({
        name: "Test Gebiet",
        beschreibung: "Test",
        verwalter: profId
    });
    const gebiet1 = await gebiet.save();
    gebietId = gebiet1.id;
});

test("new Thema", async () => {
    const thema = new Thema({
        titel: "SoftwareDesign", beschreibung: "Irgendwas mit Software", abschluss: "msc",
        status: "reserviert", betreuer: profId, gebiet: gebietId
    })
    const res = await thema.save();
    expect(res).toBeDefined();
    expect(res.titel).toBe("SoftwareDesign");
    expect(res.beschreibung).toBe("Irgendwas mit Software");
    expect(res.abschluss).toBe("msc");
    expect(res.status).toBe("reserviert");
    expect(res.betreuer.toString()).toBe(profId.toString());
    expect(res.gebiet.toString()).toBe(gebietId.toString());
});


test("Thema default values", async () => {
    const thema = new Thema({
        titel: "WebDesign", beschreibung: "Irgendwas mit Design", betreuer: profId, gebiet: gebietId
    })
    const res = await thema.save();
    expect(res.abschluss).toBe("any");
    expect(res.status).toBe("offen");
});

test("Thema fail required", async () => {
    const thema = new Thema({
        abschluss: "msc",
        status: "offen",
        betreuer: profId,
        gebiet: gebietId
    });
    await expect(thema.save()).rejects.toThrow();
});

test("gebietid fails", async () => {
    const thema = new Thema({
        titel: "Missing Gebiet",
        beschreibung: "Fail",
        betreuer: profId
    });
    await expect(thema.save()).rejects.toThrow();
});