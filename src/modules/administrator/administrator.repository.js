import { pool } from "../../db.js";

export const fetchAdministradores = () =>
  pool.query(`
    SELECT *
    FROM Administrador
    ORDER BY idAdministrador ASC
  `);

export const fetchAdministradorById = (idAdministrador) =>
  pool.query("SELECT * FROM Administrador WHERE idAdministrador = $1", [
    idAdministrador,
  ]);

export const findAdminEmail = (email) =>
  pool.query(
    "SELECT 1 FROM Administrador WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );

export const findAdminPhone = (numCelular) =>
  pool.query("SELECT 1 FROM Administrador WHERE numCelular = $1 LIMIT 1", [
    numCelular,
  ]);

export const insertAdministrador = ({
  idDireccion,
  nombres,
  apellidoPaterno,
  apellidoMaterno,
  email,
  numCelular,
  fechaDeNacimiento,
  contrasenia,
  rol,
}) =>
  pool.query(
    `
    INSERT INTO Administrador (
      idDireccion, Nombres, ApellidoPaterno, ApellidoMaterno,
      email, NumCelular, FechaDeNacimiento, Contrasenia,
      Rol, Estado
    ) VALUES (
      $1,$2,$3,$4,
      $5,$6,$7,$8,
      $9,true
    ) RETURNING *
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
      rol,
    ]
  );

export const updateAdministrador = ({
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
  idAdministrador,
}) =>
  pool.query(
    `
    UPDATE administrador
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
    WHERE idadministrador = $11
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
      idAdministrador,
    ]
  );

export const fetchAdministradorActivo = (idAdministrador) =>
  pool.query(
    "SELECT idAdministrador FROM Administrador WHERE idAdministrador = $1 AND Estado = true",
    [idAdministrador]
  );

export const softDeleteAdministrador = (idAdministrador) =>
  pool.query(
    "UPDATE Administrador SET Estado = false WHERE idAdministrador = $1",
    [idAdministrador]
  );
