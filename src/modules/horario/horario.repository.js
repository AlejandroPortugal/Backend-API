import { pool } from "../../db.js";

export const fetchHorarios = () =>
  pool.query(`
    SELECT *
    FROM horario
    WHERE estado = 'true'
    ORDER BY idhorario ASC
  `);

export const fetchHorarioById = (idhorario) =>
  pool.query(
    `
    SELECT
      h.idhorario,
      h.idmateria,
      m.nombre AS nombremateria,
      h.horainicio,
      h.horafin,
      h.dia,
      h.estado
    FROM horario h
    LEFT JOIN materia m ON m.idmateria = h.idmateria
    WHERE h.idhorario = $1 AND h.estado = true
  `,
    [idhorario]
  );

export const fetchHorarioRawById = (idhorario) =>
  pool.query("SELECT * FROM horario WHERE idhorario = $1", [idhorario]);

export const insertHorario = ({
  idmateria,
  horainicio,
  horafin,
  fecha,
  estado,
}) =>
  pool.query(
    `
    INSERT INTO horario (idmateria, horainicio, horafin, fecha, estado)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    [idmateria, horainicio, horafin, fecha, estado]
  );

export const updateHorario = ({
  idmateria,
  horainicio,
  horafin,
  fecha,
  estado,
  idhorario,
}) =>
  pool.query(
    `
    UPDATE horario
    SET idmateria = $1, horainicio = $2, horafin = $3, fecha = $4, estado = $5
    WHERE idhorario = $6
  `,
    [idmateria, horainicio, horafin, fecha, estado, idhorario]
  );

export const fetchHorarioActiveById = (idhorario) =>
  pool.query(
    "SELECT idhorario FROM horario WHERE idhorario = $1 AND estado = true",
    [idhorario]
  );

export const softDeleteHorario = (idhorario) =>
  pool.query("UPDATE horario SET estado = false WHERE idhorario = $1", [idhorario]);
