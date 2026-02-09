import { pool } from "../../db.js";

export const withTransaction = async (handler) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const query = (db, text, params) => (db ?? pool).query(text, params);

export const fetchEstudiantes = () =>
  pool.query(`
    SELECT
      e.idEstudiante,
      e.nombres,
      e.apellidoPaterno,
      e.apellidoMaterno,
      e.idCurso,
      c.nombreCurso,
      c.nivel,
      c.paralelo,
      e.estado
    FROM estudiante e
    JOIN curso c ON e.idCurso = c.idCurso
    WHERE e.estado = true
    ORDER BY e.idEstudiante ASC
  `);

export const fetchEstudianteById = (idEstudiante) =>
  pool.query("SELECT * FROM estudiante WHERE idEstudiante = $1", [idEstudiante]);

export const fetchPadreActivo = (idPadre, db) =>
  query(db, "SELECT 1 FROM padredefamilia WHERE idpadre = $1 AND estado = true", [
    idPadre,
  ]);

export const insertEstudiante = (
  { idCurso, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento },
  db
) =>
  query(
    db,
    `
    INSERT INTO estudiante (idCurso, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento, estado, rol)
    VALUES ($1, $2, $3, $4, $5, true, 'Estudiante')
    RETURNING *
  `,
    [idCurso, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento]
  );

export const linkPadreEstudiante = (idPadre, idEstudiante, db) =>
  query(
    db,
    `
    INSERT INTO padre_estudiante (idpadre, idestudiante, estado)
    VALUES ($1, $2, true)
    ON CONFLICT (idpadre, idestudiante) DO UPDATE SET estado = EXCLUDED.estado
  `,
    [idPadre, idEstudiante]
  );

export const updateEstudiante = (
  { idcurso, nombres, apellidopaterno, apellidomaterno, fechadenacimiento, estado, idEstudiante },
  db
) =>
  query(
    db,
    `
    UPDATE estudiante
    SET idcurso = COALESCE($1, idcurso),
        nombres = COALESCE($2, nombres),
        apellidopaterno = COALESCE($3, apellidopaterno),
        apellidomaterno = COALESCE($4, apellidomaterno),
        fechanacimiento = COALESCE($5, fechanacimiento),
        estado = COALESCE($6, estado)
    WHERE idestudiante = $7
  `,
    [idcurso, nombres, apellidopaterno, apellidomaterno, fechadenacimiento, estado, idEstudiante]
  );

export const fetchEstudianteActivo = (idEstudiante) =>
  pool.query(
    "SELECT idEstudiante FROM estudiante WHERE idEstudiante = $1 AND estado = true",
    [idEstudiante]
  );

export const softDeleteEstudiante = (idEstudiante) =>
  pool.query("UPDATE estudiante SET estado = false WHERE idEstudiante = $1", [idEstudiante]);
