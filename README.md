# Web Engineering 2 - Themenverwaltung

Dieses Repository enthält das finale Projekt für das Modul "Web Engineering 2". Es handelt sich um eine Full-Stack-Webanwendung (Single Page Application) zur Verwaltung von Themen und Gebieten, inklusive Authentifizierung und rollenbasierter Autorisierung.

Das Projekt ist in zwei Hauptbereiche unterteilt:
* **Backend:** Eine Node.js/Express REST-API mit MongoDB.
* **Frontend:** Eine React-Anwendung, gebaut mit Vite und TypeScript.

---

## Tech-Stack

### Backend
* **Laufzeitumgebung:** Node.js
* **Framework:** Express.js
* **Datenbank:** MongoDB (via `mongodb-memory-server` für einfache Entwicklung)
* **ODM:** Mongoose
* **Sprache:** TypeScript
* **Sicherheit:** JWT im Cookie, HTTPS

### Frontend
* **Framework:** React 19
* **Build-Tool:** Vite
* **Sprache:** TypeScript
* **Styling:** React Bootstrap & Bootstrap Icons
* **Routing:** React Router v7
* **Testing:** Vitest & Testing Library

---

## Lokale Entwicklung & Start

### Voraussetzungen
* Node.js installiert (Empfohlen: v18 oder neuer)
* npm (Node Package Manager)

### 1. Backend starten
Das Backend nutzt eine In-Memory-Datenbank. Bei jedem Neustart wird die Datenbank automatisch mit Beispieldaten (Gebiete, Themen, Profs) befüllt.
Zum starten `npm install` und dann `npm start`

### 2. Frontend starten
Auch hier `npm install` und dann `npm run dev`
Das Frontend ist nun unter https://localhost:3000 erreichbar.

### Test-Benutzer (Login)

Die In-Memory-Datenbank wird beim Starten mit folgenden Admin-Accounts befüllt. Man kann folgende Daten für den Login im Frontend nutzen:

| Benutzer (CampusID) | Passwort | Rolle |
| :--- | :--- | :--- |
| `459810` | `123_abc_ABC` | Admin |
| `test` | `test` | Admin |
