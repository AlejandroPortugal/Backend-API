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

export const insertIngreso = ({ idUsuario, nombreCompleto, rol, fechaIngreso, horaIngreso, actorColumn }) =>
  pool.query(
    `
    INSERT INTO ingresos (idusuario, ${actorColumn}, nombrecompleto, rol, fechaingreso, horaingreso)
    VALUES ($1, $1, $2, $3, $4, $5)
  `,
    [idUsuario, nombreCompleto, rol, fechaIngreso, horaIngreso]
  );

export const fetchIngresos = () =>
  pool.query(`
    SELECT idusuario, nombrecompleto, rol, fechaingreso, horaingreso
    FROM ingresos
  `);

export const fetchIngresosConUsuarios = () =>
  pool.query(`
    SELECT
      i.idusuario,
      CONCAT(u.nombres, ' ', u.apellidopaterno, ' ', u.apellidomaterno) AS nombreCompleto,
      u.rol,
      i.fechaingreso,
      i.horaingreso
    FROM ingresos i
    JOIN (
      SELECT
        idadministrador AS idusuario, nombres, apellidopaterno, apellidomaterno, rol
      FROM administrador
      WHERE estado = true
      UNION ALL
      SELECT
        idprofesor AS idusuario, nombres, apellidopaterno, apellidomaterno, rol
      FROM profesor
      WHERE estado = true
      UNION ALL
      SELECT
        idpsicologo AS idusuario, nombres, apellidopaterno, apellidomaterno, rol
      FROM psicologo
      WHERE estado = true
    ) u
    ON i.idusuario = u.idusuario;
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
    SELECT COUNT(*) AS cantidad
    FROM ingresos i
    JOIN (
      SELECT
        idadministrador AS idusuario, nombres, apellidopaterno, apellidomaterno, rol
      FROM administrador
      WHERE estado = true
      UNION ALL
      SELECT
        idprofesor AS idusuario, nombres, apellidopaterno, apellidomaterno, rol
      FROM profesor
      WHERE estado = true
      UNION ALL
      SELECT
        idpsicologo AS idusuario, nombres, apellidopaterno, apellidomaterno, rol
      FROM psicologo
      WHERE estado = true
    ) u
    ON i.idusuario = u.idusuario;
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
