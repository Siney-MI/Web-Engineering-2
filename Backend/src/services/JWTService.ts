import { JwtPayload, sign, verify } from "jsonwebtoken";
import { MyError } from "../errors/MyError";
import { login } from "./AuthenticationService";
import { LoginResource } from "../Resources";


export async function verifyPasswordAndCreateJWT(campusID: string, password: string): Promise<string | undefined> {
    const user = await login(campusID, password)
    if (!user) {
        return undefined;
    }


    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;

    if (!secret) {
        throw new MyError(`Secret JWT wird benötigt`, {
            code: "system",
            path: "system",
            value: "JWT_SECRET missing"
        });
    }

    if (!ttl) {
        throw new MyError(`TTL JWT wird benötigt`, {
           code: "system",
            path: "system",
            value: "JWT_TTL missing"
        });
    }

    const payload: JwtPayload = {
        sub: user.id,
        role: user.role
    };

    const jwtString = sign(
        payload,
        secret,
        {
            expiresIn: parseInt(ttl, 10),
            algorithm: "HS256" 
        });

    return jwtString;


}

export function verifyJWT(jwtString: string | undefined): LoginResource{

    if (!jwtString) {
       throw new MyError("Kein JWT Token übergeben", { 
        code: "validationError", 
        path: "jwt", 
        value: "undefined" 
    });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
         throw new MyError("JWT_SECRET ist nicht konfiguriert",{
            code: "system",
            path: "system",
            value: "JWT_SECRET missing"
        });
    }
        const payload = verify(jwtString, secret) as JwtPayload;

        return {
            id: payload.sub!,
            role: payload.role,
            exp: payload.exp
        } as LoginResource;

}
