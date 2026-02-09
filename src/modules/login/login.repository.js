import { pool } from "../../db.js";

export const fetchAdministradorByEmail = (email) =>
  pool.query("SELECT * FROM administrador WHERE email = $1 AND estado = true", [email]);

export const fetchProfesorByEmail = (email) =>
  pool.query("SELECT * FROM profesor WHERE email = $1 AND estado = true", [email]);

export const fetchPsicologoByEmail = (email) =>
  pool.query("SELECT * FROM psicologo WHERE email = $1 AND estado = true", [email]);

export const fetchPadreByEmail = (email) =>
  pool.query("SELECT * FROM padredefamilia WHERE email = $1 AND estado = true", [email]);
