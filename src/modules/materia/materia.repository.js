import { pool } from "../../db.js";

export const fetchMateriasActivas = () =>
  pool.query(`
    SELECT
      m.idmateria,
      m.nombre,
      m.estado,
      (
        EXISTS(
          SELECT 1
          FROM profesor p
          JOIN horario h ON h.idhorario = p.idhorario
          WHERE h.idmateria = m.idmateria AND p.estado = true
        )
        OR
        EXISTS(
          SELECT 1
          FROM psicologo ps
          JOIN horario h ON h.idhorario = ps.idhorario
          WHERE h.idmateria = m.idmateria AND ps.estado = true
        )
      ) AS ocupada
    FROM materia m
    WHERE m.estado = true
    ORDER BY m.nombre ASC
  `);

export const fetchMateriaById = (idMateria) =>
  pool.query(
    `
    SELECT
      m.idmateria,
      m.nombre,
      m.estado,
      (
        EXISTS(
          SELECT 1
          FROM profesor p
          JOIN horario h ON h.idhorario = p.idhorario
          WHERE h.idmateria = m.idmateria AND p.estado = true
        )
        OR
        EXISTS(
          SELECT 1
          FROM psicologo ps
          JOIN horario h ON h.idhorario = ps.idhorario
          WHERE h.idmateria = m.idmateria AND ps.estado = true
        )
      ) AS ocupada
    FROM materia m
    WHERE m.idmateria = $1
  `,
    [idMateria]
  );

export const fetchMateriasForPsicologo = () =>
  pool.query(`
    SELECT
      m.idmateria,
      m.nombre,
      m.estado,
      (
        EXISTS(
          SELECT 1
          FROM profesor p
          JOIN horario h ON h.idhorario = p.idhorario
          WHERE h.idmateria = m.idmateria AND p.estado = true
        )
        OR
        EXISTS(
          SELECT 1
          FROM psicologo ps
          JOIN horario h ON h.idhorario = ps.idhorario
          WHERE h.idmateria = m.idmateria AND ps.estado = true
        )
      ) AS ocupada
    FROM materia m
    WHERE m.estado = true
      AND m.idmateria IN (6,7)
    ORDER BY m.nombre ASC
  `);
