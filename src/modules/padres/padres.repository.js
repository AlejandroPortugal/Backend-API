import { pool } from "../../db.js";

export const fetchPadresFamilia = () =>
  pool.query(`
    SELECT *
    FROM PadreDeFamilia
    WHERE estado = 'true'
    ORDER BY idPadre ASC
  `);

export const fetchPadreFamiliaById = (idPadre) =>
  pool.query("SELECT * FROM PadreDeFamilia WHERE idPadre = $1", [idPadre]);

export const fetchPadreFamiliaByIdActivo = (idPadre) =>
  pool.query("SELECT * FROM padredefamilia WHERE idpadre = $1 AND estado = true", [idPadre]);

export const fetchPadreConHijos = (idPadre) =>
  pool.query(
    `
    SELECT
      e.idestudiante,
      e.idcurso,
      e.nombres,
      e.apellidopaterno,
      e.apellidomaterno,
      e.fechanacimiento,
      e.estado,
      e.rol,
      pe.estado AS estado_relacion,
      pe.creado_en AS relacion_creada_en
    FROM padre_estudiante pe
    JOIN estudiante e ON e.idestudiante = pe.idestudiante
    WHERE pe.idpadre = $1 AND pe.estado = true
    ORDER BY e.idestudiante ASC
  `,
    [idPadre]
  );

export const findPadreByEmail = (email) =>
  pool.query("SELECT idPadre FROM PadreDeFamilia WHERE email = $1", [email]);

export const findPadreByCelular = (numCelular) =>
  pool.query("SELECT idPadre FROM PadreDeFamilia WHERE NumCelular = $1", [numCelular]);

export const insertPadreFamilia = ({
  idDireccion,
  nombres,
  apellidoPaterno,
  apellidoMaterno,
  email,
  numCelular,
  fechaDeNacimiento,
  contrasenia,
}) =>
  pool.query(
    `
    INSERT INTO PadreDeFamilia
      (idDireccion, Nombres, ApellidoPaterno, ApellidoMaterno,
       email, NumCelular, FechaDeNacimiento, Contrasenia, Rol, Estado)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
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
      "Padre de Familia",
    ]
  );

export const updatePadreFamilia = ({
  iddireccion,
  nombres,
  apellidopaterno,
  apellidomaterno,
  email,
  numcelular,
  fechadenacimiento,
  contrasenia,
  estado,
  rol,
  idPadre,
}) =>
  pool.query(
    `
    UPDATE padredefamilia
    SET iddireccion = COALESCE($1, iddireccion),
        nombres = COALESCE($2, nombres),
        apellidopaterno = COALESCE($3, apellidopaterno),
        apellidomaterno = COALESCE($4, apellidomaterno),
        email = COALESCE($5, email),
        numcelular = COALESCE($6, numcelular),
        fechadenacimiento = COALESCE($7, fechadenacimiento),
        contrasenia = COALESCE($8, contrasenia),
        estado = COALESCE($9, estado),
        rol = COALESCE($10, rol)
    WHERE idpadre = $11
  `,
    [
      iddireccion,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular,
      fechadenacimiento,
      contrasenia,
      estado,
      rol,
      idPadre,
    ]
  );

export const fetchPadreActivo = (idPadre) =>
  pool.query(
    "SELECT idPadre FROM PadreDeFamilia WHERE idPadre = $1 AND Estado = true",
    [idPadre]
  );

export const softDeletePadre = (idPadre) =>
  pool.query("UPDATE PadreDeFamilia SET Estado = false WHERE idPadre = $1", [idPadre]);

export const fetchPadresFechas = () =>
  pool.query(
    "SELECT idPadre, nombres, apellidoPaterno, apellidoMaterno FROM PadreDeFamilia ORDER BY idPadre ASC"
  );
