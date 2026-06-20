import { Types } from "mongoose";
import app from "../../src/app";
import { createProf, getAlleProfs } from "../../src/services/ProfService";
import supertest from "supertest";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";
import { supertestWithReqMiddleware } from "restmatcher";

const adminPassword = "password";
const adminCampusID = "admin";
let adminId: string;

beforeEach(async () =>{
    const admin = await createProf({
        name: "Admin",
        campusID: adminCampusID,
        password: adminPassword,
        admin: true
    });
    adminId = admin.id!;
    await performAuthentication(adminCampusID, adminPassword);
})

test("POST, einfacher Positivtest", async () => {
    // arrange:
    // nichts zu tun
    
    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            campusID: "MP",
            password: "abcABC123!§",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Mein Prof");
    //expect(response.body.campusID).toBe("MP");
    //expect(response.body.admin).toBe(false);
    //expect(response.body.password).toBeUndefined();
    expect(response.body.id).toBeDefined();
    // Prüfe Datenbank
    //const profs = await getAlleProfs();
    // Sie können folgende Zeile für eigene Tests übernehmen, jedoch
    // müssen Sie dann zwingend erklären können, was some bedeutet, wo es definiert wird
    // und was die Argumente sind.
    //expect(profs.some(p => p.id === response.body.id)).toBe(true);    
})

test("PUT, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: profRes.id,
            name: "Anderer Prof",
            campusID: "AP",
            admin: false
        });

    // assert:
    // Prüfe Response
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Anderer Prof");
    // expect(response.body.campusID).toBe("AP");
    // expect(response.body.admin).toBe(false);
    // expect(response.body.password).toBeUndefined();
    // expect(response.body.id).toBe(profRes.id);
    // Prüfe Datenbank
    // const profs = await getAlleProfs();
    // // Prüfe Datenbank
    // // Sie können folgende Zeile für eigene Tests übernehmen, jedoch
    // // müssen Sie dann zwingend erklären können, was some bedeutet, wo es definiert wird
    // // und was die Argumente sind.
    // expect(profs.some(p => p.id === response.body.id && p.name === "Anderer Prof")).toBe(true);
})

test("DELETE, einfacher Positivtest", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/${profRes.id}`).send();

    // assert:
    // Prüfe Response
    expect(response.status).toBe(204);
    // Prüfe Datenbank
    // expect((await getAlleProfs())
    //     .every(p => p.id !== profRes.id)
    // ).toBe(true);
})

// Test für GET /api/prof/alle können selbst geschrieben werden.


test("POST Fehler, normaler User darf keinen Prof anlegen", async () => {
    const user = await createProf({ name: "User", campusID: "user", password: "pw", admin: false });
    await performAuthentication("user", "pw");

    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof").send({ name: "Neu", campusID: "neu", password: "SIAJsjj6611!", admin: false });

    expect(response.status).toBe(403);
});

test("GET 405", async () => {
    // act
    const res = await supertestWithAuth(app).get("/api/prof/");

    // assert
    expect(res.status).toBe(405);
});

test("GET 405", async () => {
    // act
    const res = await supertestWithAuth(app).get("/api/prof/blaId");

    // assert
    expect(res.status).toBe(405);
});

test("PUT 400", async () => {
    // arrange
    const prof = await createProf({ name: "Test", campusID: "123", password: "345", admin: false });

    // act
    const res = await supertestWithAuth(app).put(`/api/prof/${prof.id}`).send({ id: "andereId", name: "bla", campusID: "321", admin: false });

    // assert
    expect(res.status).toBe(400);
});

test("DELETE 400", async () => {
    const res = await supertestWithAuth(app).delete("/api/prof/ungültigeId").send();
    expect(res.status).toBe(400);
});



test("POST Fehler, ungültiger Prof", async () => {
    // arrange
    const failProf = {};

    // act
    const res = await supertestWithAuth(app).post("/api/prof").send(failProf);

    //assert
    expect(res.status).toBe(400);
});

test("PUT Fehler, update mit ungültigen Daten", async () => {
    // arrange
    const prof = await createProf({ 
        name: "Update", 
        campusID: "234", 
        password: "pw", 
        admin: false 
    });

    const fail = { 
        id: prof.id, 
        name: "",
        campusID: "234",
        admin: false 
    };

    // act
    const res = await supertestWithAuth(app).put(`/api/prof/${prof.id}`).send(fail);

    // assert
    expect(res.status).toBe(400);
});