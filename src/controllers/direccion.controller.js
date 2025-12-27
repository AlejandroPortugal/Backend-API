import { pool } from "../db.js";

/* Helper: normaliza componentes */
const normalize = (s) => String(s ?? "").trim();
const normalizeLower = (s) => normalize(s).toLowerCase();

/* --------- GETS --------- */

// Obtener todas las direcciones
export const getDirecciones = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM direccion
      WHERE estado = true
      ORDER BY iddireccion ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las direcciones" });
  }
};

// Obtener una dirección por ID
export const getDireccionById = async (req, res) => {
  const { iddireccion } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM direccion WHERE iddireccion = $1 AND estado = true`,
      [iddireccion]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la dirección" });
  }
};

/* --------- CREATE --------- */

// Crear una nueva dirección (evita duplicados + estado por defecto true)
export const createDireccion = async (req, res) => {
  let { zona, calle, num_puerta } = req.body;

  zona = normalize(zona);
  calle = normalize(calle);
  num_puerta = normalize(num_puerta);

  if (!zona || !calle || !num_puerta) {
    return res.status(400).json({ error: "Todos los campos de la dirección son obligatorios" });
  }

  try {
    // Chequeo de duplicado (case-insensitive + trim)
    const dup = await pool.query(
      `SELECT iddireccion, zona, calle, num_puerta
       FROM direccion
       WHERE lower(btrim(zona)) = $1
         AND lower(btrim(calle)) = $2
         AND btrim(num_puerta)   = $3
         AND estado = true
       LIMIT 1`,
      [normalizeLower(zona), normalizeLower(calle), normalize(num_puerta)]
    );

    if (dup.rows.length) {
      const row = dup.rows[0];
      return res.status(409).json({
        error: "La dirección ya existe",
        idDireccion: row.iddireccion,
        direccion: row,
      });
    }

    // Insert; si existe índice único, capturamos posible 23505
    const result = await pool.query(
      `INSERT INTO direccion (zona, calle, num_puerta, estado)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [zona, calle, num_puerta]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // Violación de índice único
    if (error?.code === "23505") {
      return res.status(409).json({ error: "La dirección ya existe" });
    }
    console.error("Error al crear la dirección:", error);
    return res.status(500).json({ error: "Error al crear la dirección" });
  }
};

/* --------- UPDATE --------- */

// Actualizar una dirección (evita duplicar otra existente)
export const updateDireccion = async (req, res) => {
  const { iddireccion } = req.params;
  let { zona, calle, num_puerta, estado } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM direccion WHERE iddireccion = $1",
      [iddireccion]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    const current = rows[0];

    // Normaliza y aplica valores por defecto
    zona = zona !== undefined ? normalize(zona) : current.zona;
    calle = calle !== undefined ? normalize(calle) : current.calle;
    num_puerta = num_puerta !== undefined ? normalize(num_puerta) : current.num_puerta;
    estado = typeof estado === "boolean" ? estado : current.estado;

    if (!zona || !calle || !num_puerta) {
      return res.status(400).json({ error: "Todos los campos de la dirección son obligatorios" });
    }

    // Si la dirección queda activa, valida duplicado contra OTROS registros activos
    if (estado === true) {
      const dup = await pool.query(
        `SELECT 1
         FROM direccion
         WHERE lower(btrim(zona)) = $1
           AND lower(btrim(calle)) = $2
           AND btrim(num_puerta)   = $3
           AND estado = true
           AND iddireccion <> $4
         LIMIT 1`,
        [normalizeLower(zona), normalizeLower(calle), normalize(num_puerta), iddireccion]
      );
      if (dup.rows.length) {
        return res.status(409).json({ error: "Ya existe otra dirección idéntica activa" });
      }
    }

    // Realiza el update (capturamos 23505 si hay índice único)
    await pool.query(
      `UPDATE direccion
       SET zona = $1, calle = $2, num_puerta = $3, estado = $4
       WHERE iddireccion = $5`,
      [zona, calle, num_puerta, estado, iddireccion]
    );

    res.json({ message: "Dirección actualizada correctamente" });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "La dirección ya existe" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la dirección" });
  }
};

/* --------- DELETE (soft) --------- */

// Desactivar una dirección
export const deleteDireccion = async (req, res) => {
  const { iddireccion } = req.params;

  try {
    const result = await pool.query(
      "SELECT iddireccion FROM direccion WHERE iddireccion = $1 AND estado = true",
      [iddireccion]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada o ya desactivada" });
    }

    await pool.query(
      "UPDATE direccion SET estado = false WHERE iddireccion = $1",
      [iddireccion]
    );

    res.json({ message: "Dirección desactivada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar la dirección" });
  }
};
