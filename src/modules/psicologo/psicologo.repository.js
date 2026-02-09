import { pool } from "../../db.js";

export const fetchPsicologos = () =>
  pool.query(`
    SELECT *
    FROM psicologo
    WHERE estado = 'true'
    ORDER BY idPsicologo ASC
  `);

export const fetchPsicologoById = (idPsicologo) =>
  pool.query("SELECT * FROM psicologo WHERE idPsicologo = $1", [idPsicologo]);

export const findEmailInPsicologoOrProfesor = (email) =>
  pool.query(
    `
    SELECT 1 FROM (
      SELECT LOWER(email) AS email FROM Psicologo
      UNION
      SELECT LOWER(email) FROM Profesor
    ) t WHERE t.email = LOWER($1) LIMIT 1
  `,
    [email]
  );

export const findCelInPsicologoOrProfesor = (numCelular) =>
  pool.query(
    `
    SELECT 1 FROM (
      SELECT NumCelular FROM Psicologo
      UNION
      SELECT NumCelular FROM Profesor
    ) t WHERE t.NumCelular = $1 LIMIT 1
  `,
    [numCelular]
  );

export const fetchMateriaActiva = (idmateria) =>
  pool.query("SELECT 1 FROM materia WHERE idmateria = $1 AND estado = true", [idmateria]);

export const fetchMateriaTaken = (idmateria) =>
  pool.query(
    `
    SELECT 1 FROM (
      SELECT h.idmateria
      FROM profesor p
      JOIN horario h ON h.idhorario = p.idhorario
      WHERE p.estado = true
      UNION
      SELECT ps.idmateria
      FROM psicologo ps
      WHERE ps.estado = true
    ) x WHERE x.idmateria = $1 LIMIT 1
  `,
    [idmateria]
  );

export const fetchHorarioMateriaLink = (idhorario, idmateria) =>
  pool.query(
    "SELECT 1 FROM horario WHERE idhorario = $1 AND idmateria = $2",
    [idhorario, idmateria]
  );

export const insertPsicologo = ({
  idDireccion,
  nombres,
  apellidoPaterno,
  apellidoMaterno,
  email,
  numCelular,
  fechaDeNacimiento,
  contrasenia,
  idhorario,
  idmateria,
}) =>
  pool.query(
    `
    INSERT INTO Psicologo
      (idDireccion, Nombres, ApellidoPaterno, ApellidoMaterno,
       email, NumCelular, FechaDeNacimiento, Contrasenia,
       Rol, Estado, idhorario, idmateria)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11)
    RETURNING *
  `,
    [
      idDireccion,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      email,
      numCelular,
      fechaDeNacimiento,
      contrasenia,
      "Psicologo",
      idhorario,
      idmateria,
    ]
  );

export const updatePsicologo = ({
  iddireccion,
  nombres,
  apellidopaterno,
  apellidomaterno,
  email,
  numcelular,
  fechadenacimiento,
  estado,
  contrasenia,
  idhorario,
  idPsicologo,
}) =>
  pool.query(
    `
    UPDATE psicologo
    SET iddireccion = COALESCE($1, iddireccion),
        nombres = COALESCE($2, nombres),
        apellidopaterno = COALESCE($3, apellidopaterno),
        apellidomaterno = COALESCE($4, apellidomaterno),
        email = COALESCE($5, email),
        numcelular = COALESCE($6, numcelular),
        fechadenacimiento = COALESCE($7, fechadenacimiento),
        estado = COALESCE($8, estado),
        contrasenia = COALESCE($9, contrasenia),
        idhorario = COALESCE($10, idhorario)
    WHERE idpsicologo = $11
  `,
    [
      iddireccion,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular,
      fechadenacimiento,
      estado,
      contrasenia,
      idhorario,
      idPsicologo,
    ]
  );

export const fetchPsicologoActivo = (idPsicologo) =>
  pool.query("SELECT idPsicologo FROM psicologo WHERE idPsicologo = $1 AND estado = true", [
    idPsicologo,
  ]);

export const softDeletePsicologo = (idPsicologo) =>
  pool.query("UPDATE psicologo SET estado = false WHERE idPsicologo = $1", [idPsicologo]);
