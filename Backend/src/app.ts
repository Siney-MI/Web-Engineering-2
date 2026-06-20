import express from 'express';
import { gebietRouter } from './routes/gebiet';
import { themaRouter } from './routes/thema';
import { profRouter } from './routes/prof';
import cookieParser from 'cookie-parser';
import { loginRouter } from './routes/login';
import { configureCORS } from './configCORS';

const app = express();
configureCORS(app);


// Middleware:

// Wozu wird diese Middleware benötigt?
// Ist der Body-Parser. Er liest den Body der Requests,parst JSON-Daten und stellt sie als JavaScript-Objekt unter req.body zur Verfügug
app.use(express.json());
app.use(cookieParser());

// Routes
// Registrieren Sie hier die Router!
app.use("/api/gebiet", gebietRouter);
app.use("/api/thema", themaRouter);
app.use("/api/prof", profRouter)
app.use('/api/login', loginRouter);

export default app;