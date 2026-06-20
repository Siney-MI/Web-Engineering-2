import app from "../../src/app";
import supertest from "supertest";
import { createProf } from "../../src/services/ProfService";
import { createGebiet } from "../../src/services/GebietService";
import { createThema } from "../../src/services/ThemaService";
import { Types } from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let profId: string;
let gebietId: string;
const password = "pw123";
const campusID = "567";

beforeEach(async () => {
    const prof = await createProf({
        name: "Max",
        campusID: campusID,
        password: password,
        admin: false
    });
    profId = prof.id!;

    await performAuthentication(campusID, password);

    const gebiet = await createGebiet({
        name: "TestGebiet", 
        beschreibung: "Desc", 
        public: true, 
        closed: false,
        verwalter: profId 
    });
    gebietId = gebiet.id!;
});

test("POST, einfacher Positivtest", async () => {
    // arrange
    const gebiet = {
        name: "teeeeeeeeest",
        beschreibung: "Beschreibung",
        public: true,
        closed: false,
        verwalter: profId
    };

    // act
    const testee = supertestWithAuth(app);
    const response = await testee
        .post("/api/gebiet")
        .send(gebiet);

    // assert
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(gebiet.name);
    expect(response.body.verwalter).toBe(profId);
    expect(response.body.id).toBeDefined();
});

test("GET, Positivtest", async () => {
    // arrange
   const gebiet = await createGebiet({
        name: "Gebiet1",
        beschreibung: "Beschreibung",
        public: true,
        closed: false,
        verwalter: profId
    });

    // act
    const testee = supertest(app);
    const response = await testee.get("/api/gebiet/alle");

    // assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].id).toBeDefined();
});

test("PUT, einfacher Positivtest", async () => {
    // arrange
    const gebiet = await createGebiet({
        name: "alt",
        beschreibung: "Beschreibung alt",
        public: false,
        closed: false,
        verwalter: profId
    });

    const updateData = {
        id: gebiet.id,
        name: "Neu",
        beschreibung: "Beschreibung neu",
        public: true,
        closed: false,
        verwalter: profId
    };

    // act
    const testee = supertestWithAuth(app);
    const response = await testee
        .put(`/api/gebiet/${gebiet.id}`)
        .send(updateData);

    // assert
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(gebiet.id);
    expect(response.body.name).toBe("Neu");
});

test("DELETE, einfacher Positivtest", async () => {
    // arrange
    const gebiet = await createGebiet({
        name: "delete",
        beschreibung: "Beschreibung",
        public: true,
        verwalter: profId
    });

    // act
    const testee = supertestWithAuth(app);
    const response = await testee
        .delete(`/api/gebiet/${gebiet.id}`)
        .send();

    // assert
    expect(response.status).toBe(204);
});

test("GET, Positivtest", async () => {
    // arrange
    const gebiet = await createGebiet({ 
        name: "Gebiet", 
        public: true, 
        verwalter: profId 
    });
    
    await createThema({
        titel: "TestTitel",
        beschreibung: "Beschreibung",
        betreuer: profId,
        gebiet: gebiet.id!,
        status: "offen"
    });

    // act
    const res = await supertest(app).get(`/api/gebiet/${gebiet.id}/themen`);

    // assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].titel).toBe("TestTitel");
});


test("GET Fehler 400", async () => {
    // arrange
    const response = await supertest(app).get(`/api/gebiet/falscheId/themen`);

    // assert
    expect(response.status).toBe(400);
});

test("GET Fehler 404", async () => {
    // arrange
    const fakeId = new Types.ObjectId().toString();
    const response = await supertest(app).get(`/api/gebiet/${fakeId}`);

     // assert
    expect(response.status).toBe(404);
});

test("PUT Fehler 400", async () => {
    // act
    const update = { id: "andereId", name: "Neu", beschreibung: "Neu", public: true, verwalter: profId };

    // arrange
    const response = await supertestWithAuth(app).put(`/api/gebiet/${gebietId}`).send(update);

     // assert
    expect(response.status).toBe(400);
});

test("DELETE Fehler 400 (Ungültige ID)", async () => {
    const response = await supertestWithAuth(app).delete(`/api/gebiet/noId`).send();
    expect(response.status).toBe(400);
});

test("DELETE Fehler 404", async () => {
    // arrange
    const fakeId = new Types.ObjectId().toString();
    const response = await supertestWithAuth(app).delete(`/api/gebiet/${fakeId}`).send();

     // assert
    expect(response.status).toBe(404);
});