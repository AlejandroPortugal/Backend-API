import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener todos los administradores
export const getAdministrador = async (req, res) => {
  try {
    const { rows } = await pool.query(`
            SELECT *
            FROM Administrador
            ORDER BY idAdministrador ASC
        `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los administradores" });
  }
};

// Obtener un administrador por ID
export const getAdministradorById = async (req, res) => {
  const { idAdministrador } = req.params;

  try {
    const { rows } = await pool.query(
      `
            SELECT *
            FROM Administrador
            WHERE idAdministrador = $1
        `,
      [idAdministrador]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Administrador no encontrado" });
    }

    const administrador = rows[0];

    if (!administrador.estado) {
      return res.status(400).json({ error: "Administrador está deshabilitado" });
    }

    res.json(administrador);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el administrador" });
  }
};

export const createAdministrador = async (req, res) => {
  // Normaliza strings (quita espacios alrededor)
  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  const idDireccion       = req.body.idDireccion;
  const nombres           = trim(req.body.nombres);
  const apellidoPaterno   = trim(req.body.apellidoPaterno);
  const apellidoMaterno   = trim(req.body.apellidoMaterno);
  const email             = trim(req.body.email);
  const numCelular        = trim(req.body.numCelular);
  const fechaDeNacimiento = trim(req.body.fechaDeNacimiento);
  const contrasenia       = trim(req.body.contrasenia);
  const rol               = trim(req.body.rol);

  try {
    // ---- Requeridos y espacios en blanco
    const required = { idDireccion, nombres, apellidoPaterno, apellidoMaterno, email, numCelular, fechaDeNacimiento, contrasenia, rol };
    for (const [k, v] of Object.entries(required)) {
      if (!v || (typeof v === "string" && v === "")) {
        return res.status(400).json({ error: `El campo ${k} es obligatorio y no puede estar vacío` });
      }
    }

    // ---- Nombres solo letras y espacios
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!namePattern.test(nombres))         return res.status(400).json({ error: "Nombres: solo letras y espacios" });
    if (!namePattern.test(apellidoPaterno)) return res.status(400).json({ error: "Apellido paterno: solo letras y espacios" });
    if (!namePattern.test(apellidoMaterno)) return res.status(400).json({ error: "Apellido materno: solo letras y espacios" });

    // ---- Email formato
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Email no válido" });
    }

    // ---- Celular: exactamente 8 dígitos
    if (!/^\d{8}$/.test(numCelular)) {
      return res.status(400).json({ error: "El celular debe tener exactamente 8 dígitos" });
    }

    // ---- Rol exacto
    if (rol !== "Administrador") {
      return res.status(400).json({ error: "El rol debe ser 'Administrador'" });
    }

    // ---- Fecha: formato y < 2006-01-01 (por CHECK de tabla)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
      return res.status(400).json({ error: "Fecha de nacimiento inválida. Use YYYY-MM-DD" });
    }
    if (new Date(fechaDeNacimiento) >= new Date("2006-01-01")) {
      return res.status(400).json({ error: "La fecha de nacimiento debe ser anterior a 2006-01-01" });
    }

    // ---- Duplicados: email y celular
    const emailExists = await pool.query(
      "SELECT 1 FROM Administrador WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    if (emailExists.rowCount > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado por otro usuario" });
    }

    const phoneExists = await pool.query(
      "SELECT 1 FROM Administrador WHERE numCelular = $1 LIMIT 1",
      [numCelular]
    );
    if (phoneExists.rowCount > 0) {
      return res.status(400).json({ error: "El celular ya está registrado por otro usuario" });
    }

    // ---- Hash de contraseña
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    // ---- Insertar
    const adminResult = await pool.query(
      `INSERT INTO Administrador (
         idDireccion, Nombres, ApellidoPaterno, ApellidoMaterno,
         email, NumCelular, FechaDeNacimiento, Contrasenia,
         Rol, Estado
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,
         $9,true
       ) RETURNING *`,
      [
        idDireccion,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        email,
        numCelular,
        fechaDeNacimiento,
        hashedPassword,
        rol
      ]
    );

    return res.status(201).json(adminResult.rows[0]);
  } catch (err) {
    console.error(err);
    // Si hay constraint UNIQUE en email/numCelular en la DB, capturará también
    return res.status(500).json({ error: err.message });
  }
};

// Actualizar un administrador
export const updateAdministrador = async (req, res) => {
  const { idAdministrador } = req.params;
  const {
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
  } = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM administrador WHERE idadministrador = $1", [idAdministrador]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Administrador no encontrado" });
    }
    const currentData = rows[0];

    let hashedPassword = currentData.contrasenia;
    if (contrasenia && contrasenia !== currentData.contrasenia) {
      hashedPassword = await bcrypt.hash(contrasenia.trim(), 10);
    }

    await pool.query(
      `UPDATE administrador 
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
       WHERE idadministrador = $11`,
      [
        iddireccion,
        nombres?.trim(),
        apellidopaterno?.trim(),
        apellidomaterno?.trim(),
        email?.trim(),
        numcelular?.trim(),
        fechadenacimiento,
        hashedPassword,
        estado,
        rol,
        idAdministrador
      ]
    );

    res.json({ message: "Administrador actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};




// Eliminar un administrador (desactivar)
export const deleteAdministrador = async (req, res) => {
  const { idAdministrador } = req.params;

  try {
    await pool.query("BEGIN");

    const adminResult = await pool.query(
      "SELECT idAdministrador FROM Administrador WHERE idAdministrador = $1 AND Estado = true",
      [idAdministrador]
    );

    if (adminResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Administrador no encontrado o ya desactivado" });
    }

    await pool.query(
      "UPDATE Administrador SET Estado = false WHERE idAdministrador = $1",
      [idAdministrador]
    );

    await pool.query("COMMIT");

    res.json({ message: "Administrador desactivado correctamente" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};