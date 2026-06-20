import mongoose, { Types } from "mongoose";
import { Prof } from "../../src/model/ProfModel";
import { createProf, updateProf, deleteProf, getAlleProfs } from "../../src/services/ProfService";
import { Gebiet } from "../../src/model/GebietModel";
import { createGebiet } from "../../src/services/GebietService";



test("createProf", async () => {
  const profData = {
    name: "Max Mustermann",
    titel: "Dr.",
    campusID: "123",
    password: "456",
    admin: false
  };
  const prof = await createProf(profData);
  expect(prof.id).toBeDefined();
  expect(prof.name).toBe("Max Mustermann");
  expect(prof.password).toBeUndefined();
  expect(prof.admin).toBe(false);

    const prof2 = await createProf({
    name: "Test2",
    titel: "",
    campusID: "900",
    password: "pw",
    admin: false
  });
  expect(prof2.admin).toBe(false);
})


test("doppelte campusID Fehler", async () => {
  const prof1 = {
    name: "Max Mustermann",
    titel: "Dr.",
    campusID: "666",
    password: "456",
    admin: false
  };

   const prof2 = {
    name: "Max Mustermann",
    titel: "Dr.",
    campusID: "666",
    password: "456",
    admin: false
  };

  const profSave = await createProf(prof1);
  expect(profSave.id).toBeDefined();

  await expect(createProf(prof2)).rejects.toThrow("existiert bereits");
});

test("updateProf", async () => {
  const profData = { name: "Anna", titel: "", campusID: "777", password: "pw", admin: false };
  const prof = await createProf(profData);

   const alt = await Prof.findById(prof.id).exec();
  const oldPw = alt!.password;

  const updated = await updateProf({ ...prof, name: "Anna Updated", admin: true });
  expect(updated.name).toBe("Anna Updated");
  expect(updated.admin).toBe(true);

  const neu = await Prof.findById(prof.id).exec();
  expect(neu!.password).toBe(oldPw);
})

test("updateProf Fehler", async () => {
  const fakeId = new Types.ObjectId().toString();
  await expect(updateProf({ id: fakeId, name: "test", campusID: "1", admin: false }))
    .rejects.toThrow(`Prof mit id ${fakeId} nicht gefunden`);
})

test("deleteProf", async () => {
  const prof = await createProf({ name: "Lena", titel: "", campusID: "888", password: "pw", admin: false });
  if (!prof.id) throw new Error("Prof ID ist undefined");
  const gebiet = await createGebiet({ name: "TestGebiet", verwalter: prof.id, public: true, closed: false });

  await deleteProf(prof.id!);
   const found = await Prof.findById(prof.id).exec();
  expect(found).toBeNull();
   const foundGebiet = await Gebiet.findById(gebiet.id).exec();
  expect(foundGebiet).toBeNull();
})

test("deleteProf Fehler", async () => {
  const fakeId = new Types.ObjectId().toString();
  await expect(deleteProf(fakeId))
    .rejects.toThrow(`Prof mit id ${fakeId} nicht gefunden`);
})

test("deleteProf ohne Gebiete", async () => {
  const prof = await createProf({ 
    name: "Karl", titel: "", campusID: "1010", password: "pw", admin: false 
  });

  await expect(deleteProf(prof.id!)).resolves.not.toThrow();
})

test("getAlleProfs", async () => {
  const prof1 = { 
        name: "Max", 
        titel: "M", 
        campusID: "1234", 
        password: "pwa", 
        admin: false 
    };
    const prof2 = { 
        name: "Peter", 
        titel: "P", 
        campusID: "3245", 
        password: "pwb", 
        admin: true 
    };

    await createProf(prof1);
    await createProf(prof2);
    const alleProfs = await getAlleProfs();
    expect(alleProfs.length).toBeGreaterThanOrEqual(2);
})



