import { pool } from "../../db.js";

export const fetchAllAdministradores = () =>
  pool.query(`
    SELECT a.idadministrador AS id, 'Administrador' AS rol, a.nombres, a.apellidopaterno, a.apellidomaterno, a.email, a.numcelular, a.fechadenacimiento
    FROM administrador a
    WHERE a.estado = true
  `);

export const fetchAllProfesores = () =>
  pool.query(`
    SELECT p.idprofesor AS id, 'Profesor' AS rol, p.nombres, p.apellidopaterno, p.apellidomaterno, p.email, p.numcelular, p.fechadenacimiento
    FROM profesor p
    WHERE p.estado = true
  `);

export const fetchAllPsicologos = () =>
  pool.query(`
    SELECT ps.idpsicologo AS id, 'Psicologo' AS rol, ps.nombres, ps.apellidopaterno, ps.apellidomaterno, ps.email, ps.numcelular, ps.fechadenacimiento
    FROM psicologo ps
    WHERE ps.estado = true
  `);

export const fetchAllPadres = () =>
  pool.query(`
    SELECT pf.idpadre AS id, 'Padre de Familia' AS rol, pf.nombres, pf.apellidopaterno, pf.apellidomaterno, pf.email, pf.numcelular, pf.fechadenacimiento
    FROM padredefamilia pf
    WHERE pf.estado = true
  `);

export const fetchAllEstudiantes = () =>
  pool.query(`
    SELECT e.idestudiante AS id, 'Estudiante' AS rol, e.nombres, e.apellidopaterno, e.apellidomaterno, e.fechanacimiento
    FROM estudiante e
    WHERE e.estado = true
  `);

export const filterUsuarios = (searchTerm) =>
  pool.query(
    `
    SELECT 'Administrador' AS rol, idadministrador AS id, nombres, apellidopaterno, apellidomaterno, email, numcelular, fechadenacimiento, estado
    FROM administrador
    WHERE LOWER(nombres) LIKE LOWER($1)
    OR LOWER(apellidopaterno) LIKE LOWER($1)
    OR LOWER(apellidomaterno) LIKE LOWER($1)
    OR LOWER(email) LIKE LOWER($1)
    OR LOWER(rol) LIKE LOWER($1)

    UNION ALL

    SELECT 'Profesor' AS rol, idprofesor AS id, nombres, apellidopaterno, apellidomaterno, email, numcelular, fechadenacimiento, estado
    FROM profesor
    WHERE LOWER(nombres) LIKE LOWER($1)
    OR LOWER(apellidopaterno) LIKE LOWER($1)
    OR LOWER(apellidomaterno) LIKE LOWER($1)
    OR LOWER(email) LIKE LOWER($1)

    UNION ALL

    SELECT 'Padre de Familia' AS rol, idpadre AS id, nombres, apellidopaterno, apellidomaterno, email, numcelular, fechadenacimiento, estado
    FROM padredefamilia
    WHERE LOWER(nombres) LIKE LOWER($1)
    OR LOWER(apellidopaterno) LIKE LOWER($1)
    OR LOWER(apellidomaterno) LIKE LOWER($1)
    OR LOWER(email) LIKE LOWER($1)
  `,
    [`%${searchTerm}%`]
  );

export const fetchAllUsersEntry = () =>
  pool.query(`
    SELECT
      a.idadministrador AS id,
      'Administrador' AS rol,
      CONCAT(a.nombres, ' ', a.apellidopaterno, ' ', a.apellidomaterno) AS nombreCompleto,
      a.email,
      a.numcelular,
      a.fechadenacimiento
    FROM administrador a
    WHERE a.estado = true

    UNION ALL

    SELECT
      p.idprofesor AS id,
      'Profesor' AS rol,
      CONCAT(p.nombres, ' ', p.apellidopaterno, ' ', p.apellidomaterno) AS nombreCompleto,
      p.email,
      p.numcelular,
      p.fechadenacimiento
    FROM profesor p
    WHERE p.estado = true

    UNION ALL

    SELECT
      ps.idpsicologo AS id,
      'Psicologo' AS rol,
      CONCAT(ps.nombres, ' ', ps.apellidopaterno, ' ', ps.apellidomaterno) AS nombreCompleto,
      ps.email,
      ps.numcelular,
      ps.fechadenacimiento
    FROM psicologo ps
    WHERE ps.estado = true;
  `);

export const filterUsers = (searchTerm) =>
  pool.query(
    `
    SELECT
      'Administrador' AS rol,
      a.idadministrador AS id,
      CONCAT(a.nombres, ' ', a.apellidopaterno, ' ', a.apellidomaterno) AS nombreCompleto,
      a.email,
      a.numcelular,
      a.fechadenacimiento
    FROM administrador a
    WHERE a.estado = true AND (
      LOWER(a.nombres) LIKE LOWER($1) OR
      LOWER(a.apellidopaterno) LIKE LOWER($1) OR
      LOWER(a.apellidomaterno) LIKE LOWER($1) OR
      LOWER(a.email) LIKE LOWER($1)
    )

    UNION ALL

    SELECT
      'Profesor' AS rol,
      p.idprofesor AS id,
      CONCAT(p.nombres, ' ', p.apellidopaterno, ' ', p.apellidomaterno) AS nombreCompleto,
      p.email,
      p.numcelular,
      p.fechadenacimiento
    FROM profesor p
    WHERE p.estado = true AND (
      LOWER(p.nombres) LIKE LOWER($1) OR
      LOWER(p.apellidopaterno) LIKE LOWER($1) OR
      LOWER(p.apellidomaterno) LIKE LOWER($1) OR
      LOWER(p.email) LIKE LOWER($1)
    )

    UNION ALL

    SELECT
      'Psicologo' AS rol,
      ps.idpsicologo AS id,
      CONCAT(ps.nombres, ' ', ps.apellidopaterno, ' ', ps.apellidomaterno) AS nombreCompleto,
      ps.email,
      ps.numcelular,
      ps.fechadenacimiento
    FROM psicologo ps
    WHERE ps.estado = true AND (
      LOWER(ps.nombres) LIKE LOWER($1) OR
      LOWER(ps.apellidopaterno) LIKE LOWER($1) OR
      LOWER(ps.apellidomaterno) LIKE LOWER($1) OR
      LOWER(ps.email) LIKE LOWER($1)
    );
  `,
    [`%${searchTerm}%`]
  );

export const insertIngreso = ({
  idUsuario,
  nombreCompleto,
  rol,
  idprofesor,
  idadministrador,
  idpsicologo,
}) =>
  pool.query(
    `
    INSERT INTO ingresos (
      idusuario,
      nombrecompleto,
      rol,
      fechaingreso,
      horaingreso,
      idprofesor,
      idadministrador,
      idpsicologo
    )
    VALUES (
      $1,
      $2,
      $3,
      (TIMEZONE('America/La_Paz', NOW()))::date,
      (TIMEZONE('America/La_Paz', NOW()))::time(0),
      $4,
      $5,
      $6
    )
  `,
    [idUsuario, nombreCompleto, rol, idprofesor, idadministrador, idpsicologo]
  );

export const fetchIngresos = () =>
  pool.query(`
    SELECT
      id,
      idusuario,
      nombrecompleto,
      rol,
      TO_CHAR(fechaingreso, 'YYYY-MM-DD') AS fechaingreso,
      TO_CHAR(horaingreso, 'HH24:MI:SS') AS horaingreso,
      COALESCE(idprofesor, 0) AS idprofesor,
      COALESCE(idadministrador, 0) AS idadministrador,
      COALESCE(idpsicologo, 0) AS idpsicologo
    FROM ingresos
    ORDER BY id DESC
  `);

export const fetchIngresosConUsuarios = () =>
  pool.query(`
    SELECT
      i.id,
      i.idusuario,
      i.nombrecompleto,
      i.rol,
      TO_CHAR(i.fechaingreso, 'YYYY-MM-DD') AS fechaingreso,
      TO_CHAR(i.horaingreso, 'HH24:MI:SS') AS horaingreso,
      COALESCE(i.idprofesor, 0) AS idprofesor,
      COALESCE(i.idadministrador, 0) AS idadministrador,
      COALESCE(i.idpsicologo, 0) AS idpsicologo
    FROM ingresos i
    ORDER BY i.id DESC;
  `);

export const fetchIngresosPorRango = (startDate, endDate) =>
  pool.query(
    `
    SELECT
      nombrecompleto,
      rol,
      fechaingreso,
      horaingreso
    FROM ingresos
    WHERE fechaingreso BETWEEN $1 AND $2
    ORDER BY fechaingreso ASC, horaingreso ASC
  `,
    [startDate, endDate]
  );

export const fetchCantidadUsuariosConIngresos = () =>
  pool.query(`
    SELECT COUNT(DISTINCT CONCAT(
      i.rol,
      ':',
      COALESCE(
        i.idprofesor::text,
        i.idadministrador::text,
        i.idpsicologo::text,
        i.idusuario::text
      )
    )) AS cantidad
    FROM ingresos i;
  `);

export const fetchUsuariosInactivos = () =>
  pool.query(`
    SELECT
      'Administrador' AS rol,
      idadministrador AS id,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular
    FROM administrador
    WHERE estado = false

    UNION ALL

    SELECT
      'Profesor' AS rol,
      idprofesor AS id,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular
    FROM profesor
    WHERE estado = false

    UNION ALL

    SELECT
      'Psicologo' AS rol,
      idpsicologo AS id,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular
    FROM psicologo
    WHERE estado = false

    UNION ALL

    SELECT
      'Padre de Familia' AS rol,
      idpadre AS id,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular
    FROM padredefamilia
    WHERE estado = false
  `);

export const activateUsuario = ({ table, idColumn, id }) =>
  pool.query(
    `
    UPDATE ${table}
    SET estado = true
    WHERE ${idColumn} = $1
  `,
    [id]
  );
