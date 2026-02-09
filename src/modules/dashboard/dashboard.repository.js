import { pool } from "../../db.js";

export const fetchActiveProfessorsCount = () =>
  pool.query(`
    SELECT COUNT(*) AS total
    FROM profesor
    WHERE estado = true
  `);

export const fetchActiveUsersCounts = () =>
  pool.query(`
    SELECT
      (SELECT COUNT(*) FROM profesor WHERE estado = true) AS profesores,
      (SELECT COUNT(*) FROM administrador WHERE estado = true) AS administradores,
      (SELECT COUNT(*) FROM psicologo WHERE estado = true) AS psicologos,
      (SELECT COUNT(*) FROM estudiante WHERE estado = true) AS estudiantes,
      (SELECT COUNT(*) FROM padredefamilia WHERE estado = true) AS padres
  `);

export const fetchWeeklyInterviews = () =>
  pool.query(`
    SELECT
      EXTRACT(DOW FROM fecha) AS dia_semana,
      COUNT(*) AS total
    FROM reservarentrevista
    WHERE fecha >= NOW() - INTERVAL '7 days'
      AND EXTRACT(DOW FROM fecha) BETWEEN 1 AND 5
    GROUP BY dia_semana
    ORDER BY dia_semana
  `);

export const fetchInterviewStatusCounts = () =>
  pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE idestado = 2) AS completadas,
      COUNT(*) FILTER (WHERE idestado <> 2) AS no_realizadas
    FROM reservarentrevista
  `);

export const fetchMostRequestedSubject = () =>
  pool.query(`
    SELECT m.nombre, COUNT(*)::integer AS cantidad
    FROM reservarentrevista r
    LEFT JOIN profesor p ON r.idprofesor = p.idprofesor
    LEFT JOIN psicologo ps ON r.idpsicologo = ps.idpsicologo
    LEFT JOIN horario h ON h.idhorario = COALESCE(p.idhorario, ps.idhorario)
    LEFT JOIN materia m ON m.idmateria = COALESCE(h.idmateria, ps.idmateria)
    WHERE m.estado = true
    GROUP BY m.nombre
    ORDER BY cantidad DESC
    LIMIT 5
  `);

export const fetchMostRequestedProfessor = () =>
  pool.query(`
    SELECT p.nombres || ' ' || p.apellidopaterno AS profesor, COUNT(*) AS cantidad
    FROM profesor p
    JOIN reservarentrevista r ON p.idprofesor = r.idprofesor
    WHERE p.estado = true AND r.idprofesor IS NOT NULL
    GROUP BY profesor
    ORDER BY cantidad DESC
    LIMIT 1
  `);
