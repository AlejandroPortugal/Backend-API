import { pool } from "../../db.js";

export const fetchMotivos = () =>
  pool.query(`
    SELECT *
    FROM motivo
    WHERE estado = 'true'
    ORDER BY idMotivo ASC
  `);

export const fetchMotivoById = (idMotivo) =>
  pool.query(
    `
    SELECT *
    FROM motivo
    WHERE idMotivo = $1
  `,
    [idMotivo]
  );
