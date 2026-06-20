import { JsonWebTokenError, sign, TokenExpiredError } from "jsonwebtoken";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import mongoose from "mongoose";
import { Prof } from "../../src/model/ProfModel";
import { createProf } from "../../src/services/ProfService";
import { MyError } from "../../src/errors/MyError";

//credits https://stackoverflow.com/questions/48033841/test-process-env-with-jest

const OLD_ENV = process.env;

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.DB_CONNECTION_STRING || "mongodb://localhost:27017/test-db");
    }
});


afterAll(async () => {
    await mongoose.disconnect();
    process.env = OLD_ENV;
});

beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.JWT_SECRET = "test-secret-key-123";
    process.env.JWT_TTL = "300";
    await Prof.deleteMany({});
});


test("LoginResource zurückgeben, wenn Token gültig ist", () => {
    const validToken = sign(
        { sub: "mongo-id-123", role: "a" },
        process.env.JWT_SECRET!
    );

    const result = verifyJWT(validToken);

    expect(result).toBeDefined();
    expect(result?.id).toBe("mongo-id-123");
    expect(result?.role).toBe("a");
});

test("verifyJWT LoginResource zurückgeben, wenn Token gültig ist", () => {
    const validToken = sign(
        { sub: "mongo-id-123", role: "a" },
        process.env.JWT_SECRET!
    );

    const result = verifyJWT(validToken);

    expect(result).toBeDefined();
    expect(result.id).toBe("mongo-id-123");
    expect(result.role).toBe("a");
});

test("verifyJWT Fehler inout undefined", () => {
   expect(() => verifyJWT(undefined)).toThrow(MyError);
});

test("verifyJWT JsonWebTokenError Signatur ungültig", () => {
    const forgedToken = sign(
        { sub: "hacker-id", role: "a" },
        "falsches-secret"
    );

    expect(() => verifyJWT(forgedToken)).toThrow(JsonWebTokenError);
});

test("verifyJWT: Soll TokenExpiredError werfen, wenn Token abgelaufen ist", () => {
    const expiredToken = sign(
        { sub: "mongo-id-123", role: "u" },
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
    );
    
    expect(() => verifyJWT(expiredToken)).toThrow(TokenExpiredError);
});

test("verifyJWT Fehler JWT_SECRET fehlt", () => {
    delete process.env.JWT_SECRET;
    expect(() => verifyJWT("irgendein-token")).toThrow(MyError);
});


test("verifyPasswordAndCreateJWT Erfolgreicher Login erstellt Token", async () => {
    const prof = await createProf({
        name: "Test User",
        campusID: "user1",
        password: "Password123!",
        admin: false
    });

    const token = await verifyPasswordAndCreateJWT("user1", "Password123!");

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
});


test("verifyPasswordAndCreateJWT Falsches Passwort --> undefined", async () => {

    await createProf({
        name: "Test User",
        campusID: "user2",
        password: "Password123!",
        admin: false
    });
    const token = await verifyPasswordAndCreateJWT("user2", "Falsch!");
    expect(token).toBeUndefined();
});

test("verifyPasswordAndCreateJWT Fehler JWT_SECRET fehlt", async () => {
    await createProf({ name: "User", campusID: "u", password: "p", admin: false });
    delete process.env.JWT_SECRET;
    await expect(verifyPasswordAndCreateJWT("u", "p"))
        .rejects
        .toThrow(MyError);
});