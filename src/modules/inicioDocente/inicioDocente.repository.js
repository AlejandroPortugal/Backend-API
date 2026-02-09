import { pool } from "../../db.js";

export const fetchProfesorPanel = (idProfesor) =>
  pool.query(
    `
    SELECT
      p.idprofesor,
      p.nombres,
      p.apellidopaterno,
      p.apellidomaterno,
      p.idhorario,
      COALESCE(h.idmateria, 0) AS idmateria
    FROM profesor p
    LEFT JOIN horario h ON p.idhorario = h.idhorario
    WHERE p.idprofesor = $1
      AND COALESCE(p.estado::text, '') = 'true'
  `,
    [idProfesor]
  );

export const fetchPsicologoPanel = (idPsicologo) =>
  pool.query(
    `
    SELECT
      ps.idpsicologo,
      ps.nombres,
      ps.apellidopaterno,
      ps.apellidomaterno,
      ps.idhorario,
      COALESCE(h.idmateria, ps.idmateria, 0) AS idmateria
    FROM psicologo ps
    LEFT JOIN horario h ON ps.idhorario = h.idhorario
    WHERE ps.idpsicologo = $1
      AND COALESCE(ps.estado::text, '') = 'true'
  `,
    [idPsicologo]
  );

export const fetchDocenteStats = (idMateria, docenteId, entrevistaColumna) =>
  pool.query(
    `
    SELECT
      COALESCE((
        SELECT COUNT(*)::int
        FROM horario
        WHERE ($1::int IS NULL OR idmateria = $1)
          AND COALESCE(estado::text, '') IN ('true', 't', '1')
      ), 0) AS cursos,
      COALESCE((
        SELECT COUNT(*)::int
        FROM actadereunion
        WHERE ($1::int IS NULL OR idmateria = $1)
          AND COALESCE(estado::text, '') IN ('true', 't', '1')
      ), 0) AS actas,
      COALESCE((
        SELECT COUNT(*)::int
        FROM reservarentrevista
        WHERE ${entrevistaColumna} = $2
          AND fecha >= CURRENT_DATE
      ), 0) AS avisos
  `,
    [idMateria, docenteId]
  );

export const fetchDocenteTodayStats = (idMateria, docenteId, entrevistaColumna) =>
  pool.query(
    `
    SELECT
      COALESCE((
        SELECT COUNT(*)::int
        FROM actadereunion
        WHERE ($1::int IS NULL OR idmateria = $1)
          AND COALESCE(estado::text, '') IN ('true', 't', '1')
          AND DATE(fechadecreacion) = CURRENT_DATE
      ), 0) AS actas_hoy,
      COALESCE((
        SELECT COUNT(*)::int
        FROM reservarentrevista
        WHERE ${entrevistaColumna} = $2
          AND fecha = CURRENT_DATE
      ), 0) AS entrevistas_programadas,
      COALESCE((
        SELECT COUNT(*)::int
        FROM reservarentrevista
        WHERE ${entrevistaColumna} = $2
          AND fecha = CURRENT_DATE
          AND idestado = 2
      ), 0) AS citas_enviadas
  `,
    [idMateria, docenteId]
  );
