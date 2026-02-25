import express from "express";
import cors from "cors";
import { PORT } from "./config.js";

import profesorRoutes from './routes/profesor.routes.js';
import administratorRoutes from './routes/administrator.routes.js';
import padresDeFamiliaRoutes from './routes/padres.routes.js';
import Direccion from './routes/direccion.routes.js';
import AllUsers from './routes/users.routes.js';
import estudiantesRoutes from './routes/estudiante.rotes.js';
import PsicologoRoutes from './routes/psicologo.routes.js';
import entrevistasRoutes from './routes/entrevistas.routes.js';
import cursosRoutes from './routes/curso.routes.js';
import loginRoutes from './routes/login.routes.js';
import motivosRoutes from './routes/motivo.routes.js';
import horarioRoutes from './routes/horario.routes.js';
import materiaRoutes from './routes/materia.routes.js';
import correoRoutes from './routes/correo.routes.js'
import documentRoutes from './routes/document.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import actasRoutes from './routes/actas.routes.js'
import inicioDocenteRoutes from './routes/inicioDocente.routes.js'
import { startEntrevistaEmailJob } from './jobs/entrevistaEmail.job.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req,res)=>res.status(200).json({ok:true}));
app.use(profesorRoutes);
app.use(administratorRoutes);
app.use(padresDeFamiliaRoutes);
app.use(Direccion);
app.use(AllUsers);
app.use(estudiantesRoutes);
app.use(PsicologoRoutes);
app.use(entrevistasRoutes);
app.use(cursosRoutes);
app.use(loginRoutes);
app.use(motivosRoutes);
app.use(horarioRoutes);
app.use(materiaRoutes);
app.use(correoRoutes);
app.use(documentRoutes);
app.use(dashboardRoutes);
app.use(actasRoutes);
app.use(inicioDocenteRoutes);

startEntrevistaEmailJob();
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


