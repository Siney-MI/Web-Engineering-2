import { Gebiet } from "../../src/model/GebietModel";
import { Prof } from "../../src/model/ProfModel";
import { Types } from "mongoose";

let profId: Types.ObjectId;

beforeAll(async () => {
    const prof = new Prof({
        name: "Test Prof",
        campusID: "23352",
        password: "492941",
    });
    const prof2 = await prof.save();
    profId = prof2.id;
});

test("new Gebiet", async () => {
    const gebiet = new Gebiet({
        name: "Web", beschreibung: "Frontend", public: false, closed: false, verwalter: profId
    })
    const res = await gebiet.save();
    expect(res).toBeDefined();
    expect(res.name).toBe("Web");
    expect(res.id).toBeDefined();
    expect(res.createdAt).toBeInstanceOf(Date);
    expect(res.verwalter.toString()).toBe(profId.toString());
});

test("Gebiet no name fail", async () => {
    const gebiet = new Gebiet({
        name: "",
        beschreibung: "test,",
        verwalter: profId
    });
    await expect(gebiet.save()).rejects.toThrow();
});

test("default Gebiet test", async () => {
    const gebiet = new Gebiet({
        name: "Web2", beschreibung: "Backend", verwalter: profId
    })
    const res = await gebiet.save();
    expect(res.public).toBe(false);
    expect(res.closed).toBe(false);
})