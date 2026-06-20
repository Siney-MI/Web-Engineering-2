import app from "../../src/app";
import { createProf } from "../../src/services/ProfService";
import { createGebiet } from "../../src/services/GebietService";
import "restmatcher";
import supertest from "supertest";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


const password = "abcABC123!§";
const campusID = "1234";

beforeEach(async () => {
    await createProf({
        name: "Test Prof",
        campusID: campusID,
        password: password,
        admin: false
    });

    await performAuthentication(campusID, password);
});


test("POST, fehlender Verwalter", async () => {
    const response = await supertestWithAuth(app)
        .post("/api/gebiet")
        .send({
            name: "Neues Gebiet",
            public: true,
            closed: false
        });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "verwalter"
    });
});


test("POST, ungültiger Verwalter", async () => {
    const response = await supertestWithAuth(app)
        .post("/api/gebiet")
        .send({
            name: "Neues Gebiet",
            public: true,
            closed: false,
            verwalter: "invalidId"
        });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "verwalter"
    });
});


test("POST, erfolgreich", async () => {
    const testID = "postID";
    const prof = await createProf({
        name: "My prof",
        campusID: testID,
        password: password,
        admin: false
    });

    await performAuthentication(testID, password);  
    const response = await supertestWithAuth(app)
        .post("/api/gebiet")
        .send({
            name: "Gebiet 1",
            public: true,
            closed: false,
            verwalter: prof.id!
        });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Gebiet 1");
    expect(response.body.verwalter).toBe(prof.id);
});

test("PUT, Mismatch Error", async () => {
    const testID = "putID"
    const prof = await createProf({
        name: "Admin Prof",
        campusID: testID,
        password: password,
        admin: false
    });

    await performAuthentication(testID, password);

    const gebiet = await createGebiet({
        name: "Gebiet 2",
        public: true,
        closed: false,
        verwalter: prof.id!
    });

    const andererGebiet = await createGebiet({
        name: "Gebiet 3",
        public: true,
        closed: false,
        verwalter: prof.id!
    });

    const response = await supertestWithAuth(app)
        .put(`/api/gebiet/${gebiet.id}`)
        .send({
            id: andererGebiet.id,
            name: "Gebiet 2 Updated",
            public: true,
            closed: false,
            verwalter: prof.id!
        });

    expect(response).toHaveValidationErrorsExactly({
        status: "400",
        body: "id",
        params: "id"
    });
});

test("DELETE, keine MongoID", async () => {
    const response = await supertestWithAuth(app)
        .delete("/api/gebiet/keineMongoID")
        .send();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
});

test("DELETE, erfolgreich", async () => {
    const testID = "deleteID"
    const prof = await createProf({
        name: "Admin Prof",
        campusID: testID,
        password: password,
        admin: true
    });

    await performAuthentication(testID, password);

    const gebiet = await createGebiet({
        name: "Gebiet 4",
        public: true,
        closed: false,
        verwalter: prof.id!
    });

    const response = await supertestWithAuth(app)
        .delete(`/api/gebiet/${gebiet.id}`)
        .send();

    expect(response.status).toBe(204);
});