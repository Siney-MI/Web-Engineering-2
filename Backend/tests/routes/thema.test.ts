import app from "../../src/app";
import supertest from "supertest";
import { createProf } from "../../src/services/ProfService";
import { createGebiet } from "../../src/services/GebietService";
import { createThema } from "../../src/services/ThemaService";
import mongoose from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let profId: string;
let gebietId: string;
const campusID = "test";
const password = "123";

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
    name: "Data Science",
    beschreibung: "Beschreibung",
    public: true,
    closed: false,
    verwalter: profId
  });
  gebietId = gebiet.id!;
});

test("POST, einfacher Positivtest", async () => {
// arrange
  const thema = {
    titel: "Test",
    beschreibung: "Beschreibung",
    abschluss: "bsc",
    betreuer: profId,
    gebiet: gebietId,
    status: "offen"
  };

  // act
  const testee = supertestWithAuth(app);
  const response = await testee.post("/api/thema").send(thema);

  // assert
  expect(response.status).toBe(201);
  expect(response.body.titel).toBe(thema.titel);
  // expect(response.body.betreuer).toBe(profId);
  // expect(response.body.gebiet).toBe(gebietId);
  // expect(response.body.id).toBeDefined();
});


test("GET, Positivtest", async () => {
// arrange
  const thema = await createThema({
    titel: "Teeeest",
    beschreibung: "CSB",
    abschluss: "bsc",
    betreuer: profId,
    gebiet: gebietId,
    status: "offen"
  });

// act
  const testee = supertest(app);
  const response = await testee.get(`/api/thema/${thema.id}`);

// assert
  expect(response.status).toBe(200);
  //expect(response.body.id).toBe(thema.id)
  expect(response.body.titel).toBe(thema.titel);
});



test("PUT, einfacher Positivtest", async () => {
// arrange
  const thema = await createThema({
    titel: "Alt",
    beschreibung: "Alt",
    abschluss: "bsc",
    betreuer: profId,
    gebiet: gebietId,
    status: "offen"
  });

  const update = {
    id: thema.id,
    titel: "Neu",
    beschreibung: "Neu",
    abschluss: "bsc",
    betreuer: profId,
    gebiet: gebietId,
    status: "offen"
  };

  // act
  const testee = supertestWithAuth(app);
  const response = await testee.put(`/api/thema/${thema.id}`).send(update);

  // assert
  expect(response.status).toBe(200);
  //expect(response.body.id).toBe(thema.id);
  expect(response.body.titel).toBe("Neu");
});

test("DELETE, einfacher Positivtest", async () => {
// arrange
  const thema = await createThema({
    titel: "Delete",
    beschreibung: "Beschreibung",
    abschluss: "bsc",
    betreuer: profId,
    gebiet: gebietId,
    status: "offen"
  });

  // act
  const testee = supertestWithAuth(app);
  const response = await testee.delete(`/api/thema/${thema.id}`).send();

  // assert
  expect(response.status).toBe(204)
});

test("GET Fehler 404", async () => {
    // arange
    const testId = new mongoose.Types.ObjectId().toString();
  
    // act
    const response = await supertestWithAuth(app).get(`/api/thema/${testId}`);

    //assert 
     expect(response.status).toBe(404);
});

test("GET Fehler 400", async () => {
    // act
    const res = await supertestWithAuth(app).get("/api/thema/blaId");

    //assert
    expect(res.status).toBe(400);
});

test("PUT Fehler 400", async () => {
    // arange
    const thema = await createThema({ titel: "Alt", beschreibung: "Alt", abschluss: "bsc", betreuer: profId, gebiet: gebietId });
    const fakeId = new mongoose.Types.ObjectId().toString();

    // act
    const res = await supertestWithAuth(app).put(`/api/thema/${thema.id}`).send({ ...thema, id: "andereId" });

    //assert
    expect(res.status).toBe(400);
});

test("DELETE Fehler 404", async () => {
    // act
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await supertestWithAuth(app).delete(`/api/thema/${fakeId}`);

    //assert
    expect(res.status).toBe(404);
});

test("POST Fehler 400", async () => {
    // act
    const res = await supertestWithAuth(app).post("/api/thema").send({ titel: "test" });

    //assert
    expect(res.status).toBe(400);
});
