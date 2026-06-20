import { createContext, useContext } from "react";
import { LoginResource } from "./Resources";

// export interface LoginInfo {
//     userId: string;
//     role: "a" | "u";
// }

interface LoginContextType {
    login: LoginResource | false | undefined;
    setLogin: (login: LoginResource | false) => void
}

// export only for provider
export const LoginContext = createContext<LoginContextType>({} as LoginContextType);

// export for consumers
export const useLoginContext = () => useContext(LoginContext);

