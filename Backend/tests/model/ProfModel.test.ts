import { Prof } from "../../src/model/ProfModel";
import bcrypt from "bcryptjs";


test("new Prof", async () => {
    const prof = new Prof({
        name: "Peter", titel: "", campusID: "24235", password: "pw123", admin: true
    })
    const res = await prof.save();
    expect(res).toBeDefined();
    expect(res.campusID).toBe("24235");
    expect(res.id).toBeDefined();
    expect(res.password).not.toBe("pw123");
});

test("new Prof no Name Fail", async () => {
    const prof = new Prof({
        titel: "", campusID: "24235", password: "pw123"
    })
    await expect(prof.save()).rejects.toThrow();
})

test("Prof default admin value", async () => {
    const prof = new Prof({
        name: "Moritz", campusID: "34356", password: "pw456"
    })
    const res = await prof.save();
    expect(res.admin).toBe(false);
    expect(res.id).toBeDefined();
});

test("Prof unique test campusID", async () => {
    const prof1 = new Prof({
        name: "Moritz", campusID: "34356", password: "pw456"
    })

    await prof1.save();
    const prof2 = new Prof({
        name: "Max", campusID: "34356", password: "pw830"
    })
    await expect(prof2.save()).rejects.toThrow();
});

test("update password", async () => {
    const prof1 = new Prof({
        name: "Mario", campusID: "11111", password: "alt"
    })
    const savedProf = await prof1.save();
    expect(savedProf.password).not.toBe("alt");
    const oldPw = savedProf.password;
    const newPw = "neu";

    const toUpdate = await Prof.findById(savedProf._id).exec();
    if (!toUpdate) throw new Error("Prof nicht gefunden");
    toUpdate.password = newPw;
    await toUpdate.save();

    const updatedProf1 = await Prof.findById(savedProf._id);
    expect(updatedProf1!.password).not.toBe(oldPw);
    expect(updatedProf1!.password).not.toBe(newPw);
});

test("isCorrectPassword true", async () => {
    const prof = new Prof({
        name: "Peter",
        campusID: "128903",
        password: "blabla"
    })
    await prof.save();
    const result = await prof.isCorrectPassword("blabla");
    expect(result).toBe(true);

})

test("isCorrectPassword false", async () => {
    const prof = new Prof({
        name: "Peter",
        campusID: "128903",
        password: "blabla"
    })
    await prof.save();
    const result = await prof.isCorrectPassword("fallllschh");
    expect(result).toBe(false);
})

test("isCorrectPassword Error", async () => {
    const prof = new Prof({
        name: "Peter",
        campusID: "128903",
        password: "blatest"
    })
    await expect(prof.isCorrectPassword("blatest")).rejects.toThrow("Password muss gehashed sein");
})

