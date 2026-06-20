import { Prof } from "../../src/model/ProfModel";
import { login } from "../../src/services/AuthenticationService";

test("login fail, campusID", async () =>{
    await expect(login("blabla", "pw")).resolves.toBe(false);
})

test("falsches pw", async () =>{
    const prof = new Prof({
        name: "Jaspo",
        campusID: "0105",
        password:"pwTest",
        admin: false
    })
    await prof.save();
    await expect(login("0105","falschesPw")).resolves.toBe(false);
})

test("login richtiges pw", async () => {
    const prof = new Prof({ name: "Admin", campusID: "admin1", password: "hashedpw", admin: true });
    await prof.save();

    const result = await login("admin1", "hashedpw");
    expect(result).toEqual({ id: prof.id, role: "a" });
})