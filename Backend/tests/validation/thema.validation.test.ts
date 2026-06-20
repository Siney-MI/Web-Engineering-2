import app from "../../src/app";
import supertest from "supertest";
import "restmatcher";
import { createProf } from "../../src/services/ProfService";
import { createGebiet } from "../../src/services/GebietService";
import { createThema } from "../../src/services/ThemaService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

async function createProfAndGebiet() {
    const password = "AbcABC123!?";
    const campusID = "343993"
    const prof = await createProf({
        name: "Prof Test",
        campusID: campusID,
        password: password,
        admin: false
    });

    await performAuthentication(campusID, password);

    const gebiet = await createGebiet({
        name: "Testgebiet ",
        verwalter: prof.id!,
        public: true,
        closed: false
    });

    return { profId: prof.id!, gebietId: gebiet.id! };
}

test("POST, fehlender titel", async () => {
    const { profId, gebietId } = await createProfAndGebiet();

    const response = await supertestWithAuth(app)
        .post("/api/thema")
        .send({
            gebiet: gebietId,
            betreuer: profId,
            beschreibung: "Beschreibung",
            status: "offen",
            abschluss: "bsc"
        });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "titel",
    });
});

test("POST, titel zu lang", async () => {
    const { profId, gebietId } = await createProfAndGebiet();

    const response = await supertestWithAuth(app)
        .post("/api/thema")
        .send({
            gebiet: gebietId,
            betreuer: profId,
            beschreibung: "Beschreibung",
            titel: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            status: "offen",
            abschluss: "bsc"
        });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "titel"
    });
});

test("POST, erfolgreiche Erstellung", async () => {
    const { profId, gebietId } = await createProfAndGebiet();

    const response = await supertestWithAuth(app)
        .post("/api/thema")
        .send({
            gebiet: gebietId,
            betreuer: profId,
            titel: "Mein Thema",
            beschreibung: "Eine gute Beschreibung",
            literatur: "Ein Buch",
            abschluss: "bsc",
            status: "offen"
        });

    expect(response.status).toBe(201);

    const body = response.body;
    expect(body.titel).toBe("Mein Thema");
    expect(body.gebiet).toBe(gebietId);
});

test("PUT, ID Mismatch", async () => {
    const { profId, gebietId } = await createProfAndGebiet();

    const thema1 = await createThema({
        gebiet: gebietId,
        betreuer: profId,
        titel: "Thema 1",
        beschreibung: "Beschreibung 1",
        status: "offen",
        abschluss: "bsc"
    });

    const thema2 = await createThema({
        gebiet: gebietId,
        betreuer: profId,
        titel: "Thema 2",
        beschreibung: "Beschreibung 2",
        status: "offen",
        abschluss: "bsc"
    });

    const response = await supertestWithAuth(app)
        .put(`/api/thema/${thema1.id}`)
        .send({
            id: thema2.id,
            gebiet: gebietId,
            betreuer: profId,
            titel: "Thema geändert",
            beschreibung: "Beschreibung geändert",
            status: "offen",
            abschluss: "bsc"
        });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id",
        params: "id"
    });
});

test("DELETE, keine MongoID", async () => {
    await createProfAndGebiet();
    const response = await supertestWithAuth(app)
        .delete("/api/thema/keineMongoID")
        .send();

    expect(response).toHaveValidationErrorsExactly({
        status: 400,
        params: "id"
    });
});

test("GET, Thema nach Gebiet ID", async () => {
    const { profId, gebietId } = await createProfAndGebiet();

    await createThema({
        gebiet: gebietId,
        betreuer: profId,
        titel: "Thema für GET Test",
        beschreibung: "Beschreibung",
        status: "offen",
        abschluss: "bsc"
    });

    const response = await supertest(app)
        .get(`/api/gebiet/${gebietId}/themen`)
        .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].titel).toBe("Thema für GET Test");
});
