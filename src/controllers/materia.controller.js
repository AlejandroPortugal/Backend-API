// controllers/materia.controller.js
import { pool } from "../db.js";

// Materias activas + flag "ocupada" (profesor O psicólogo)
export const getMateria = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        m.idmateria,
        m.nombre,
        m.estado,
        (
          EXISTS(SELECT 1 FROM profesor  p  WHERE p.idmateria = m.idmateria AND p.estado  = true) OR
          EXISTS(SELECT 1 FROM psicologo ps WHERE ps.idmateria = m.idmateria AND ps.estado = true)
        ) AS ocupada
      FROM materia m
      WHERE m.estado = true
      ORDER BY m.nombre ASC
    `);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener la materia" });
  }
};

// Una materia por id (incluye "ocupada")
export const getMateriaById = async (req, res) => {
  const { idMateria } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT
        m.idmateria,
        m.nombre,
        m.estado,
        (
          EXISTS(SELECT 1 FROM profesor  p  WHERE p.idmateria = m.idmateria AND p.estado  = true) OR
          EXISTS(SELECT 1 FROM psicologo ps WHERE ps.idmateria = m.idmateria AND ps.estado = true)
        ) AS ocupada
      FROM materia m
      WHERE m.idmateria = $1
    `, [idMateria]);

    if (rows.length === 0) return res.status(404).json({ error: "Materia no encontrada" });

    const materia = rows[0];
    if (materia.estado !== true) {
      return res.status(400).json({ error: "La materia está deshabilitada" });
    }
    return res.json(materia);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener la materia" });
  }
};

// Materias activas PERMITIDAS para psicólogo (18,24,25) + flag "ocupada" (profesor O psicólogo)
export const getMateriaForPsicologo = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        m.idmateria,
        m.nombre,
        m.estado,
        (
          EXISTS(SELECT 1 FROM profesor  p  WHERE p.idmateria = m.idmateria AND p.estado  = true) OR
          EXISTS(SELECT 1 FROM psicologo ps WHERE ps.idmateria = m.idmateria AND ps.estado = true)
        ) AS ocupada
      FROM materia m
      WHERE m.estado = true
        AND m.idmateria IN (18,24,25)
      ORDER BY m.nombre ASC
    `);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener la materia" });
  }
};
