import { pool } from "../../db.js";

export const fetchAllActas = () =>
  pool.query(`
    SELECT *
    FROM actadereunion
    ORDER BY idacta ASC
  `);

export const fetchActaById = (idActa) =>
  pool.query(
    `
    SELECT *
    FROM actadereunion
    WHERE idacta = $1
  `,
    [idActa]
  );

export const insertActa = ({
  idreservarentrevista,
  idmotivo,
  descripcion,
  fechadecreacion,
  estado,
  idestudiante,
  idmateria,
}) =>
  pool.query(
    `
    INSERT INTO actadereunion (
      idreservarentrevista,
      idmotivo,
      descripcion,
      fechadecreacion,
      estado,
      idestudiante,
      idmateria
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
    [
      idreservarentrevista,
      idmotivo,
      descripcion,
      fechadecreacion,
      estado,
      idestudiante,
      idmateria,
    ]
  );

export const updateActa = ({
  idreservarentrevista,
  idmotivo,
  descripcion,
  fechadecreacion,
  estado,
  idestudiante,
  idmateria,
  usuariomodificacion,
  descripcioncampo,
  descripcioncampoactualizado,
  idacta,
}) =>
  pool.query(
    `
    UPDATE actadereunion
    SET
      idreservarentrevista = COALESCE($1, idreservarentrevista),
      idmotivo = COALESCE($2, idmotivo),
      descripcion = COALESCE($3, descripcion),
      fechadecreacion = COALESCE($4, fechadecreacion),
      estado = COALESCE($5, estado),
      idestudiante = COALESCE($6, idestudiante),
      idmateria = COALESCE($7, idmateria),
      usuariomodificacion = COALESCE($8, usuariomodificacion),
      descripcioncampo = COALESCE($9, descripcioncampo),
      descripcioncampoactualizado = COALESCE($10, descripcioncampoactualizado),
      fechamodificacion = NOW()
    WHERE idacta = $11
    RETURNING *
  `,
    [
      idreservarentrevista,
      idmotivo,
      descripcion,
      fechadecreacion,
      estado,
      idestudiante,
      idmateria,
      usuariomodificacion,
      descripcioncampo,
      descripcioncampoactualizado,
      idacta,
    ]
  );

export const softDeleteActa = (idActa) =>
  pool.query(
    `
    UPDATE actadereunion
    SET estado = false
    WHERE idacta = $1
    RETURNING *
  `,
    [idActa]
  );

export const activateActa = (idActa) =>
  pool.query(
    `
    UPDATE actadereunion
    SET estado = true
    WHERE idacta = $1
    RETURNING *
  `,
    [idActa]
  );

export const fetchActasByEstudiante = (idestudiante) =>
  pool.query(
    `
    SELECT
      actadereunion.idacta,
      actadereunion.idreservarentrevista,
      actadereunion.idmotivo,
      actadereunion.idmateria,
      actadereunion.idestudiante,
      actadereunion.descripcion,
      actadereunion.fechadecreacion,
      actadereunion.estado,
      materia.nombre AS materia,
      motivo.nombremotivo AS motivo,
      CONCAT(pf.nombres, ' ', pf.apellidopaterno, ' ', pf.apellidomaterno) AS padre_nombre,
      COALESCE(
        CONCAT(prof.nombres, ' ', prof.apellidopaterno, ' ', prof.apellidomaterno),
        CONCAT(ps.nombres, ' ', ps.apellidopaterno, ' ', ps.apellidomaterno)
      ) AS docente_nombre
    FROM actadereunion
    INNER JOIN materia ON actadereunion.idmateria = materia.idmateria
    INNER JOIN motivo ON actadereunion.idmotivo = motivo.idmotivo
    LEFT JOIN reservarentrevista re ON re.idreservarentrevista = actadereunion.idreservarentrevista
    LEFT JOIN padredefamilia pf ON pf.idpadre = re.idpadre
    LEFT JOIN profesor prof ON prof.idprofesor = re.idprofesor
    LEFT JOIN psicologo ps ON ps.idpsicologo = re.idpsicologo
    WHERE actadereunion.idestudiante = $1 AND actadereunion.estado = true
    ORDER BY actadereunion.fechadecreacion DESC
  `,
    [idestudiante]
  );

export const fetchActasInactivas = () =>
  pool.query(`
    SELECT
      actadereunion.idacta,
      actadereunion.fechadecreacion,
      actadereunion.descripcion,
      materia.nombre AS materia,
      motivo.nombremotivo AS motivo
    FROM actadereunion
    JOIN materia ON actadereunion.idmateria = materia.idmateria
    JOIN motivo ON actadereunion.idmotivo = motivo.idmotivo
    WHERE actadereunion.estado = false
    ORDER BY actadereunion.fechadecreacion DESC
  `);
