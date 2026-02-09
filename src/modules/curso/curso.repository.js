import { pool } from "../../db.js";

export const fetchCursos = () =>
  pool.query(`
    SELECT *
    FROM Curso
    WHERE estado = 'true'
    ORDER BY idCurso ASC
  `);

export const fetchCursoById = (idCurso) =>
  pool.query("SELECT * FROM Curso WHERE idCurso = $1", [idCurso]);

export const findCursoDuplicate = ({ nombreCurso, paralelo, nivel }) =>
  pool.query(
    `
    SELECT idCurso
    FROM Curso
    WHERE nombreCurso = $1 AND paralelo = $2 AND nivel = $3
  `,
    [nombreCurso, paralelo, nivel]
  );

export const findCursoDuplicateExcludingId = ({
  nombreCurso,
  paralelo,
  nivel,
  idCurso,
}) =>
  pool.query(
    `
    SELECT idCurso
    FROM Curso
    WHERE nombreCurso = $1 AND paralelo = $2 AND nivel = $3 AND idCurso != $4
  `,
    [nombreCurso, paralelo, nivel, idCurso]
  );

export const insertCurso = ({
  paralelo,
  nivel,
  nombreCurso,
  horaInicio,
  horaFin,
}) =>
  pool.query(
    `
    INSERT INTO Curso (paralelo, nivel, nombreCurso, horaInicio, horaFin, estado)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING *
  `,
    [paralelo, nivel, nombreCurso, horaInicio, horaFin]
  );

export const updateCurso = ({
  paralelo,
  nivel,
  nombreCurso,
  horaInicio,
  horaFin,
  estado,
  idCurso,
}) =>
  pool.query(
    `
    UPDATE Curso
    SET paralelo = $1, nivel = $2, nombreCurso = $3, horaInicio = $4, horaFin = $5, estado = $6
    WHERE idCurso = $7
  `,
    [paralelo, nivel, nombreCurso, horaInicio, horaFin, estado, idCurso]
  );

export const fetchCursoActiveById = (idCurso) =>
  pool.query(
    "SELECT idCurso FROM Curso WHERE idCurso = $1 AND estado = true",
    [idCurso]
  );

export const softDeleteCurso = (idCurso) =>
  pool.query("UPDATE Curso SET estado = false WHERE idCurso = $1", [idCurso]);
