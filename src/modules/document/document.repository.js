import { pool } from "../../db.js";

export const fetchReservarEntrevistas = () =>
  pool.query("SELECT * FROM reservarentrevista");
