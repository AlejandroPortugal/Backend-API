import { pool } from "../../db.js";

export const fetchProfesores = () =>
  pool.query(`
    SELECT *
    FROM Profesor
    WHERE estado = 'true'
    ORDER BY idProfesor ASC
  `);

export const fetchProfesorById = (idProfesor) =>
  pool.query("SELECT * FROM Profesor WHERE idProfesor = $1", [idProfesor]);

export const findProfesorEmail = (email) =>
  pool.query("SELECT 1 FROM profesor WHERE email = $1", [email]);

export const findProfesorCelular = (numCelular) =>
  pool.query("SELECT 1 FROM profesor WHERE numcelular = $1", [numCelular]);

export const fetchHorarioMateriaLink = (idhorario, idmateria) =>
  pool.query("SELECT 1 FROM horario WHERE idhorario = $1 AND idmateria = $2", [
    idhorario,
    idmateria,
  ]);

export const insertProfesor = ({
  idDireccion,
  nombres,
  apellidoPaterno,
  apellidoMaterno,
  email,
  numCelular,
  fechaDeNacimiento,
  contrasenia,
  idhorario,
}) =>
  pool.query(
    `
    INSERT INTO profesor (
      iddireccion, nombres, apellidopaterno, apellidomaterno,
      email, numcelular, fechadenacimiento, contrasenia,
      rol, estado, idhorario
    ) VALUES (
      $1,$2,$3,$4,
      $5,$6,$7,$8,
      $9,true,$10
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
      "Profesor",
      idhorario,
    ]
  );

export const updateProfesor = ({
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
  idhorario,
  idProfesor,
}) =>
  pool.query(
    `
    UPDATE profesor
    SET iddireccion = COALESCE($1, iddireccion),
        nombres = COALESCE($2, nombres),
        apellidopaterno = COALESCE($3, apellidopaterno),
        apellidomaterno = COALESCE($4, apellidomaterno),
        email = COALESCE($5, email),
        numcelular = COALESCE($6, numcelular),
        fechadenacimiento = COALESCE($7, fechadenacimiento),
        contrasenia = COALESCE($8, contrasenia),
        estado = COALESCE($9, estado),
        rol = COALESCE($10, rol),
        idhorario = COALESCE($11, idhorario)
    WHERE idprofesor = $12
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
      idhorario,
      idProfesor,
    ]
  );

export const fetchProfesorActivo = (idProfesor) =>
  pool.query("SELECT idProfesor FROM Profesor WHERE idProfesor = $1 AND Estado = true", [
    idProfesor,
  ]);

export const softDeleteProfesor = (idProfesor) =>
  pool.query("UPDATE Profesor SET Estado = false WHERE idProfesor = $1", [idProfesor]);

export const fetchProfesorCount = () =>
  pool.query(`
    SELECT COUNT(*) AS total_profesores
    FROM Profesor
    WHERE estado = true;
  `);

export const fetchProfesoresConHorarios = () =>
  pool.query(`
    SELECT
      'Profesor' AS tipo,
      p.idprofesor AS id,
      h.idhorario,
      CONCAT(p.nombres, ' ', p.apellidopaterno, ' ', p.apellidomaterno) AS nombre,
      m.nombre AS materia,
      h.dia,
      h.horainicio,
      h.horafin,
      p.email
    FROM profesor p
    INNER JOIN horario h ON p.idhorario = h.idhorario
    INNER JOIN materia m ON h.idmateria = m.idmateria
    WHERE p.estado = true
    ORDER BY p.idprofesor ASC
  `);

export const fetchPsicologosConHorarios = () =>
  pool.query(`
    SELECT
      'Psicologo' AS tipo,
      ps.idpsicologo AS id,
      h.idhorario,
      CONCAT(ps.nombres, ' ', ps.apellidopaterno, ' ', ps.apellidomaterno) AS nombre,
      'Psicologo' AS materia,
      h.dia,
      h.horainicio,
      h.horafin,
      ps.email
    FROM psicologo ps
    INNER JOIN horario h ON ps.idhorario = h.idhorario
    WHERE ps.estado = true
    ORDER BY ps.idpsicologo ASC
  `);

export const fetchHorarioMateriaByProfesor = (idProfesor) =>
  pool.query(
    `
    SELECT
      p.idprofesor,
      h.idhorario,
      h.idmateria,
      m.nombre AS nombremateria,
      h.dia,
      h.horainicio,
      h.horafin,
      h.estado
    FROM profesor p
    JOIN horario h ON h.idhorario = p.idhorario
    LEFT JOIN materia m ON m.idmateria = h.idmateria
    WHERE p.idprofesor = $1 AND p.estado = true AND h.estado = true
  `,
    [idProfesor]
  );

export const fetchEntrevistaById = (idreservarentrevista) =>
  pool.query(
    `
    SELECT idreservarentrevista, idprofesor
    FROM reservarentrevista
    WHERE idreservarentrevista = $1
  `,
    [idreservarentrevista]
  );

export const fetchPadreById = (idPadre) =>
  pool.query(
    `
    SELECT
      p.idpadre,
      p.iddireccion,
      p.nombres,
      p.apellidopaterno,
      p.apellidomaterno,
      p.email,
      p.numcelular,
      p.fechadenacimiento,
      p.estado,
      p.rol
    FROM public.padredefamilia p
    WHERE p.idpadre = $1
  `,
    [idPadre]
  );

export const fetchHijosByPadre = (idPadre) =>
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
    FROM public.padre_estudiante pe
    JOIN public.estudiante e ON e.idestudiante = pe.idestudiante
    WHERE pe.idpadre = $1
    ORDER BY e.idestudiante ASC
  `,
    [idPadre]
  );
