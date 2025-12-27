import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener todos los padres de familia
export const getPadresFamilia = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM PadreDeFamilia WHERE estado = 'true'
      ORDER BY idPadre ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los padres de familia" });
  }
};

// Obtener un padre de familia por ID
export const getPadreFamiliaById = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM PadreDeFamilia
      WHERE idPadre = $1
      `,
      [idPadre]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Padre de familia no encontrado" });
    }

    const padre = rows[0];

    if (!padre.estado) {
      return res.status(400).json({ error: "Padre de familia está deshabilitado" });
    }

    res.json(padre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el padre de familia" });
  }
};

export const createPadreFamilia = async (req, res) => {
  const {
    idDireccion,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    email,
    numCelular,
    contrasenia,
    rol,
  } = req.body;

  // normaliza fecha con múltiples posibles claves
  const fechaRaw =
    req.body.fechaDeNacimiento ??
    req.body.fechaNacimiento ??
    req.body.fechadenacimiento ??
    "";
  const fechaDeNacimiento = typeof fechaRaw === "string" ? fechaRaw.trim() : "";

  try {
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

    // campos requeridos
    const required = {
      idDireccion,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      email,
      numCelular,
      fechaDeNacimiento,
      contrasenia,
      rol,
    };
    for (const [k, v] of Object.entries(required)) {
      if (!v || (typeof v === "string" && v.trim() === "")) {
        return res.status(400).json({ error: `El campo ${k} es obligatorio y no puede estar vacío` });
      }
    }

    // validación de nombres/apellidos
    if (![nombres, apellidoPaterno, apellidoMaterno].every((x) => namePattern.test(String(x).trim()))) {
      return res.status(400).json({ error: "Los nombres y apellidos solo permiten letras y espacios" });
    }

    // rol
    if (String(rol).trim() !== "Padre de Familia") {
      return res.status(400).json({ error: "El rol debe ser 'Padre de Familia'" });
    }

    // email válido
    if (!emailPattern.test(String(email).trim())) {
      return res.status(400).json({ error: "Correo electrónico no válido" });
    }

    // celular: exactamente 8 dígitos
    const celular8 = String(numCelular).replace(/\D/g, "");
    if (!/^\d{8}$/.test(celular8)) {
      return res.status(400).json({ error: "El celular debe tener exactamente 8 dígitos" });
    }

    // fecha: formato y 18+
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
      return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }
    const max = new Date();
    max.setFullYear(max.getFullYear() - 18);
    if (new Date(fechaDeNacimiento) > max) {
      return res.status(400).json({ error: "Debe ser mayor de 18 años" });
    }

    // contraseña fuerte
    if (!passPattern.test(String(contrasenia))) {
      return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres, 1 mayúscula, 1 número y 1 carácter especial" });
    }

    // unicidad email
    const emailCheck = await pool.query(
      "SELECT idPadre FROM PadreDeFamilia WHERE email = $1",
      [String(email).trim()]
    );
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado por otro usuario" });
    }

    // unicidad celular
    const celCheck = await pool.query(
      "SELECT idPadre FROM PadreDeFamilia WHERE NumCelular = $1",
      [celular8]
    );
    if (celCheck.rowCount > 0) {
      return res.status(400).json({ error: "El celular ya está registrado por otro usuario" });
    }

    const hashedPassword = await bcrypt.hash(String(contrasenia).trim(), 10);

    const padreResult = await pool.query(
      `INSERT INTO PadreDeFamilia
       (idDireccion, Nombres, ApellidoPaterno, ApellidoMaterno,
        email, NumCelular, FechaDeNacimiento, Contrasenia, Rol, Estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
       RETURNING *`,
      [
        idDireccion,
        String(nombres).trim(),
        String(apellidoPaterno).trim(),
        String(apellidoMaterno).trim(),
        String(email).trim(),
        celular8,
        fechaDeNacimiento,      // YYYY-MM-DD
        hashedPassword,
        "Padre de Familia",
      ]
    );

    return res.status(201).json(padreResult.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};


// Actualizar un padre de familia (con validación y preservando valores actuales)
// Actualizar un padre de familia
export const updatePadreFamilia = async (req, res) => {
  const { idPadre } = req.params;
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
    rol
  } = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM padredefamilia WHERE idpadre = $1", [idPadre]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Padre de familia no encontrado" });
    }
    const currentData = rows[0];

    let hashedPassword = currentData.contrasenia;
    if (contrasenia && contrasenia !== currentData.contrasenia) {
      hashedPassword = await bcrypt.hash(contrasenia.trim(), 10);
    }

    await pool.query(
      `UPDATE padredefamilia 
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
       WHERE idpadre = $11`,
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
        idPadre
      ]
    );

    res.json({ message: "Padre de familia actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


  

// Eliminar un padre de familia (desactivar)
export const deletePadreFamilia = async (req, res) => {
  const { idPadre } = req.params;

  try {
    await pool.query("BEGIN");

    const padreResult = await pool.query(
      "SELECT idPadre FROM PadreDeFamilia WHERE idPadre = $1 AND Estado = true",
      [idPadre]
    );

    if (padreResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Padre de familia no encontrado o ya desactivado" });
    }

    await pool.query(
      "UPDATE PadreDeFamilia SET Estado = false WHERE idPadre = $1",
      [idPadre]
    );

    await pool.query("COMMIT");

    res.json({ message: "Padre de familia desactivado correctamente" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



// Obtener todos los padres de familia
export const getDatesPadresFamilia = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT idPadre, nombres, apellidoPaterno, apellidoMaterno FROM PadreDeFamilia ORDER BY idPadre ASC`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los padres de familia" });
  }
};
