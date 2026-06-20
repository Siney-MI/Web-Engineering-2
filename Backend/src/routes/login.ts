import express from "express";
import { body, param, matchedData } from "express-validator";
import { handleValidationErrors } from "../validation";
import { MyError } from "../errors/MyError";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";
import { JwtPayload, verify } from "jsonwebtoken";



export const loginRouter = express.Router();

const loginValidation = [
    body("campusID").isString().notEmpty().withMessage("CampusID ist erforderlich"),
    body("password").isString().notEmpty().withMessage("Passwort ist erforderlich"),
];



loginRouter.post("/",
    ...loginValidation,
    handleValidationErrors,
    async (req, res) => {
        const { campusID, password } = matchedData(req) 
        
        const jwtString = await verifyPasswordAndCreateJWT(campusID, password)

        if (!jwtString) {
            res.sendStatus(401);
            return;
        }


        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new MyError(`JWT_SECRET wird benötigt`, {
                code: "validationError",
                path: "system",
                value: secret
            });
        }

        const verfiedJWT = verify(jwtString, secret) as JwtPayload; 

        const loginRes = { id: verfiedJWT.sub, role: verfiedJWT.role, exp: verfiedJWT.exp }
        if (!loginRes.exp) {
            throw new MyError("Token exp missing", { code: "system", path: "jwt", value: "missing" });

        }

        res.cookie("access_token", jwtString, {
            httpOnly: true,
            expires: new Date(loginRes.exp * 1000),
            secure: true,
            sameSite: 'none'
        })

        res.send(loginRes);
    }
)

loginRouter.get("/",
    async (req, res, _next) => {
        const jwtString = req.cookies.access_token; 

        if (!jwtString) { 
            res.send(false);
            return;
        }

       try{

        const verfiedJWT = verifyJWT(jwtString);

        const loginRes = { id: verfiedJWT.id, role: verfiedJWT.role, exp: verfiedJWT.exp }
       
        res.send(loginRes);
       }catch (err){ 
        res.clearCookie("access_token");
        res.send(false);
       }

    });


    loginRouter.delete("/",
    handleValidationErrors,
    async (req, res) => {
        res.clearCookie("access_token");
        res.sendStatus(204);
        }
    )