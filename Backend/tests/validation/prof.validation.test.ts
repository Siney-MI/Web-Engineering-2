import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import "restmatcher"; // Stelle neue Jest-Matcher zur Verfügung
import supertest from "supertest";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


const adminPassword = "LAnnnngesPW1!";
const adminCampusID = "adminID";

beforeEach(async () => {
    await createProf({
        name: "Admin",
        campusID: adminCampusID,
        password: adminPassword,
        admin: true
        });

    await performAuthentication(adminCampusID, adminPassword);
});

test("POST, fehlende CampusID", async () => {
    // arrange:
    // nichts zu tun

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            password: "abcABC123!§",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "campusID"
    })

})

test("PUT, Konsistenz ID in Parameter und Body", async () => {
    // arrange:
    const profRes = await createProf({
        name: "Mein Prof",
        campusID: "MP",
        password: "abcABC123!§",
        admin: false
    });
    const andererProfRes = await createProf({
        name: "Anderer Prof",
        campusID: "AP",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.put(`/api/prof/${profRes.id}`)
        .send({
            id: andererProfRes.id,
            name: "Mein Prof Änderung",
            campusID: "MP",
            admin: false
        });

    // assert:
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id", params: "id"
    })

})

test("DELETE, keine MongoID", async () => {
    // arrange:
    // nichts zu tun

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.delete(`/api/prof/keineMongoID`).send();

    // assert:
    // Prüfe Response
    expect(response).statusCode(
        "4xx" // target url existiert nicht, also eigentlich 404, hier trotzdem auch 400 ok, weil viel einfacher zu validieren
    )
})

// Weitere Tests können selbst geschrieben werden.

test("POST, fehlende CampusID und schwaches pw", async () => {
    // arrange:
    // nichts zu tun

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Mein Prof",
            password: "123",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: ["campusID", "password"]
    })

})

test("POST, doppelte CampusID", async () => {
    // arrange:
    await createProf({
        name: "Erster Prof",
        campusID: "123",
        password: "abcABC123!§",
        admin: false
    });

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Zweiter Prof",
            campusID: "123",
            password: "abcABC123!§",
            admin: false
        });

    // assert:
    // Prüfe Response    
    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "campusID"
    })

})


test("POST, unerwartetes feld", async () => {
    // arrange:

    // act:
    const testee = supertestWithAuth(app);
    const response = await testee.post("/api/prof")
        .send({
            name: "Prof",
            campusID: "123",
            password: "abcABC123!§",
            admin: false,
            zusatz: "Fehler"
        });

    // assert:
    // Prüfe Response
    expect(response.status).toBe(201);
    const body = response.body;
    expect(body.zusatz).toBeUndefined();
    expect(body.campusID).toBe("123");

})


