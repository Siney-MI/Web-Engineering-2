import {Prof} from "../model/ProfModel";
 /**
 *  Prüft Campus-ID und Passwort, bei Erfolg wird ein Objekt mit
        `id` und `role` ("u" für normaler User oder "a" für Admin)
        des Profs zurückgegeben
 * 
 * Falls kein Prof mit gegebener Campus-ID existiert oder das Passwort falsch ist, wird nur 
 * `success` mit falsch zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(campusID: string, password: string): Promise<{ id: string, role: "a" | "u" } | false> {

    const prof = await Prof.findOne({campusID}).exec();
    if (!prof){
        return false;
    }

    const profPw = await prof.isCorrectPassword(password);
    if(!profPw){
        return false;
    }
    return { id: prof.id, role: prof.admin ? "a" : "u" };

}
