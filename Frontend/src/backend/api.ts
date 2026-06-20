import { GebietResource, LoginResource, ThemaResource } from "../Resources";
import { fetchWithErrorHandling } from "./fetchWithErrorHandling";

const HOST = import.meta.env.VITE_API_SERVER_URL;

export async function getGebiet(gebietId: string): Promise<GebietResource> {
    const url = `${HOST}/api/gebiet/${gebietId}`;
    const response = await fetchWithErrorHandling(url, { method: "GET", credentials: "include" });
    return await response.json();

}

export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
    const url = `${HOST}/api/gebiet/${gebietId}/themen`;
    const response = await fetchWithErrorHandling(url, { method: "GET", credentials: "include" });
    return await response.json();


}


export async function getThema(themaId: string): Promise<ThemaResource> {
    const url = `${HOST}/api/thema/${themaId}`;
    const response = await fetchWithErrorHandling(url, { method: "GET", credentials: "include" });
    return await response.json();
}

export async function postLogin(campusID: string, password: string) {
    const url = `${HOST}/api/login`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify({ campusID, password })
    });
    if (response.ok) {
        const login: LoginResource = await response.json();
        return login;
    }
    if (response.status === 401) {
        throw new Error("Invalid credentials");
    }
    throw new Error(`Error connecting to ${import.meta.env.VITE_API_SERVER_URL}: ${response.statusText}`);
}

export async function deleteLogin(): Promise<void> {
    const url = `${HOST}/api/login`;
    const response = await fetch(url, { method: "DELETE", credentials: "include" });
    if (response.ok) {
        return;
    }
    throw new Error(`Error logging out, status: ${response.status}`);
}



export async function deleteGebiet(gebietId: string): Promise<void> {
    const url = `${HOST}/api/gebiet/${gebietId}`;
    const response = await fetch(url, { method: "DELETE", credentials: "include" });
    if (response.ok) {
        return;
    }
    throw new Error(`Error logging out, status: ${response.status}`);
}

export async function getLogin() {
    const url = `${HOST}/api/login`;
    const response = await fetch(url, { method: "GET", credentials: "include" });
    if (response.ok) {
        const login: LoginResource = await response.json();
        return login;
    }
    return false;
}

export async function createGebiet(gebiet: GebietResource): Promise<GebietResource> {
    const url = `${HOST}/api/gebiet/`;
    const name = gebiet.name;
    const beschreibung = gebiet.beschreibung;
    const isPublic = gebiet.public;
    const closed = gebiet.closed;
    const verwalter = gebiet.verwalter;
    const response = await fetchWithErrorHandling(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            beschreibung,
            public: isPublic,
            closed,
            verwalter
        }), credentials: "include"
    });
    return await response.json();
}

export async function updateGebiet(gebiet: GebietResource): Promise<GebietResource> {
    const url = `${HOST}/api/gebiet/${gebiet.id}`;
    const response = await fetchWithErrorHandling(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(gebiet),
        credentials: "include"
    });
    return await response.json();
}

export async function createThema(thema: ThemaResource): Promise<ThemaResource> {
    const url = `${HOST}/api/thema`;
    const response = await fetchWithErrorHandling(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thema),
        credentials: "include"
    });
    return await response.json();
}

export async function updateThema(thema: ThemaResource): Promise<ThemaResource> {
    const url = `${HOST}/api/thema/${thema.id}`;
    const response = await fetchWithErrorHandling(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thema),
        credentials: "include"
    });
    return await response.json();
}

export async function deleteThema(themaId: string): Promise<void> {
    const url = `${HOST}/api/thema/${themaId}`;
    const response = await fetch(url, { method: "DELETE", credentials: "include" });
    if (response.ok) {
        return;
    }
    throw new Error(`Error deleting thema, status: ${response.status}`);
}