import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener todos los psicólogos
export const getPsicologos = async (req, res) => {
  try {
    const { rows } = await pool.query(`
            SELECT *
            FROM psicologo WHERE estado = 'true'
            ORDER BY idPsicologo ASC
        `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los psicólogos" });
  }
};

// Obtener un psicólogo por ID
export const getPsicologoById = async (req, res) => {
  const { idPsicologo } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM psicologo WHERE idPsicologo = $1`,
      [idPsicologo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Psicólogo no encontrado" });
    }

    const psicologo = rows[0];

    if (!psicologo.estado) {
      return res.status(400).json({ error: "Psicólogo está deshabilitado" });
    }

    res.json(psicologo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el psicólogo" });
  }
};

// Validación de campos vacíos y caracteres especiales en nombres y apellidos
const validatePsicologoFields = (req, res) => {
  const {
    idDireccion,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    email,
    numCelular,
    fechaDeNacimiento,
    rol,
  } = req.body;

  // Validar que ningún campo esté vacío o contenga solo espacios en blanco
  if (
    !idDireccion ||
    !nombres?.trim() ||
    !apellidoPaterno?.trim() ||
    !apellidoMaterno?.trim() ||
    !email?.trim() ||
    !numCelular?.trim() ||
    !fechaDeNacimiento ||
    !rol?.trim()
  ) {
    return res.status(400).json({
      error:
        "Todos los campos son obligatorios y no pueden contener solo espacios en blanco",
    });
  }

  // Validar que los nombres y apellidos no contengan caracteres especiales o números
  const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (
    !namePattern.test(nombres) ||
    !namePattern.test(apellidoPaterno) ||
    !namePattern.test(apellidoMaterno)
  ) {
    return res.status(400).json({
      error:
        "Los nombres y apellidos no deben contener caracteres especiales o números",
    });
  }

  // Validar que el rol sea "psicologo"
  if (rol.toLowerCase() !== "psicologo") {
    return res.status(400).json({ error: "El rol debe ser 'psicologo'" });
  }

  return null; // Si todo está correcto, retornamos null
};

const ALLOWED_IDS = new Set([18, 24, 25]);
export const createPsicologo = async (req, res) => {
  const {
    idDireccion,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    email,
    numCelular,
    contrasenia,
    rol,
    idhorario,
    idmateria,
  } = req.body;

  // Normaliza fecha desde varias claves
  const rawAny = (
    req.body.fechaDeNacimiento ??
    req.body.fechaNacimiento ??
    req.body.fechadenacimiento ??
    ""
  ).toString().trim();

  let fechaDeNacimiento = rawAny;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawAny)) {
    const [dd, mm, yyyy] = rawAny.split("/");
    fechaDeNacimiento = `${yyyy}-${mm}-${dd}`;
  }
  if (fechaDeNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    const d = new Date(fechaDeNacimiento);
    if (!Number.isNaN(d.getTime())) fechaDeNacimiento = d.toISOString().slice(0, 10);
  }

  try {
    // Requeridos
    const required = {
      idDireccion,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      email,
      numCelular,
      contrasenia,
      rol,
      idmateria,
      idhorario,
      fechaDeNacimiento,
    };
    for (const [k, v] of Object.entries(required)) {
      if (!v || (typeof v === "string" && v.trim() === "")) {
        return res.status(400).json({ error: `El campo ${k} es obligatorio y no puede estar vacío` });
      }
    }

    // Nombres solo letras
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    for (const k of ["nombres","apellidoPaterno","apellidoMaterno"]) {
      if (!namePattern.test((req.body[k] ?? "").toString())) {
        return res.status(400).json({ error: `Los nombres y apellidos no deben contener caracteres especiales` });
      }
    }

    // Fecha válida y < 2006-01-01
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
      return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }
    if (new Date(fechaDeNacimiento) >= new Date("2006-01-01")) {
      return res.status(400).json({ error: "La fecha de nacimiento debe ser anterior a 2006-01-01" });
    }

    // Celular exactamente 8 dígitos
    if (!/^\d{8}$/.test(String(numCelular).trim())) {
      return res.status(400).json({ error: "El celular debe tener exactamente 8 dígitos" });
    }

    // Contraseña fuerte
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/.test(String(contrasenia))) {
      return res.status(400).json({ error: "Contraseña débil (mín. 6, 1 mayúscula, 1 número y 1 especial)" });
    }

    // Rol "Psicologo" (sin tildes)
    const normRol = (rol || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (normRol !== "psicologo") {
      return res.status(400).json({ error: "El rol debe ser 'Psicologo'" });
    }

    // Email único (en psicólogo o profesor)
    const emailCheck = await pool.query(
      `
      SELECT 1 FROM (
        SELECT LOWER(email) AS email FROM Psicologo
        UNION
        SELECT LOWER(email) FROM Profesor
      ) t WHERE t.email = LOWER($1) LIMIT 1
      `,
      [email.trim()]
    );
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado por otro usuario" });
    }

    // Celular único (en psicólogo o profesor)
    const celCheck = await pool.query(
      `
      SELECT 1 FROM (
        SELECT NumCelular FROM Psicologo
        UNION
        SELECT NumCelular FROM Profesor
      ) t WHERE t.NumCelular = $1 LIMIT 1
      `,
      [String(numCelular).trim()]
    );
    if (celCheck.rowCount > 0) {
      return res.status(400).json({ error: "El celular ya está registrado por otro usuario" });
    }

    // Materia permitida y activa
    const mid = Number(idmateria);
    if (!ALLOWED_IDS.has(mid)) {
      return res.status(400).json({ error: "La materia seleccionada no está permitida para Psicólogo" });
    }
    const matCheck = await pool.query("SELECT 1 FROM materia WHERE idmateria = $1 AND estado = true", [mid]);
    if (matCheck.rowCount === 0) {
      return res.status(400).json({ error: "La materia seleccionada no existe o está deshabilitada" });
    }

    // La materia no debe estar ocupada por profesor o psicólogo activo
    const matTaken = await pool.query(
      `
      SELECT 1 FROM (
        SELECT idmateria FROM profesor  WHERE estado = true
        UNION
        SELECT idmateria FROM psicologo WHERE estado = true
      ) x WHERE x.idmateria = $1 LIMIT 1
      `,
      [idmateria]
    );
    if (matTaken.rowCount > 0) {
      return res.status(409).json({ error: "La materia ya fue asignada" });
    }

    // El horario debe pertenecer a esa materia
    const vinc = await pool.query("SELECT 1 FROM horario WHERE idhorario = $1 AND idmateria = $2", [idhorario, idmateria]);
    if (vinc.rowCount === 0) {
      return res.status(400).json({ error: "El horario no pertenece a la materia seleccionada" });
    }

    // Hash + insert
    const hashedPassword = await bcrypt.hash(String(contrasenia).trim(), 10);
    const result = await pool.query(
      `INSERT INTO Psicologo
        (idDireccion, Nombres, ApellidoPaterno, ApellidoMaterno,
         email, NumCelular, FechaDeNacimiento, Contrasenia,
         Rol, Estado, idhorario, idmateria)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11)
       RETURNING *`,
      [
        idDireccion,
        nombres.trim(),
        apellidoPaterno.trim(),
        apellidoMaterno.trim(),
        email.trim(),
        String(numCelular).trim(),
        fechaDeNacimiento,
        hashedPassword,
        "Psicologo",
        idhorario,
        idmateria,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};




  
  // Actualizar un psicólogo
  export const updatePsicologo = async (req, res) => {
    const { idPsicologo } = req.params;
    const {
      iddireccion,
      nombres,
      apellidopaterno,
      apellidomaterno,
      email,
      numcelular,
      fechadenacimiento,
      estado,
      contrasenia,
      idhorario
    } = req.body;
  
    try {
      // Verificar si el psicólogo existe
      const { rows } = await pool.query("SELECT * FROM psicologo WHERE idpsicologo = $1", [idPsicologo]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Psicólogo no encontrado" });
      }
      const currentData = rows[0];
  
      // Cifrar la contraseña solo si se ha proporcionado una nueva
      let hashedPassword = currentData.contrasenia;
      if (contrasenia && contrasenia !== currentData.contrasenia) {
        hashedPassword = await bcrypt.hash(contrasenia.trim(), 10);
      }
  
      await pool.query(
        `UPDATE psicologo 
         SET iddireccion = COALESCE($1, iddireccion), 
             nombres = COALESCE($2, nombres), 
             apellidopaterno = COALESCE($3, apellidopaterno), 
             apellidomaterno = COALESCE($4, apellidomaterno), 
             email = COALESCE($5, email), 
             numcelular = COALESCE($6, numcelular), 
             fechadenacimiento = COALESCE($7, fechadenacimiento), 
             estado = COALESCE($8, estado), 
             contrasenia = COALESCE($9, contrasenia), 
             idhorario = COALESCE($10, idhorario)
         WHERE idpsicologo = $11`,
        [
          iddireccion,
          nombres?.trim(),
          apellidopaterno?.trim(),
          apellidomaterno?.trim(),
          email?.trim(),
          numcelular?.trim(),
          fechadenacimiento,
          estado,
          hashedPassword,
          idhorario,
          idPsicologo
        ]
      );
  
      res.json({ message: "Psicólogo actualizado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
  
  
// Eliminar (desactivar) un psicólogo
export const deletePsicologo = async (req, res) => {
  const { idPsicologo } = req.params;

  try {
    const result = await pool.query(
      "SELECT idPsicologo FROM psicologo WHERE idPsicologo = $1 AND estado = true",
      [idPsicologo]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Psicólogo no encontrado o ya desactivado" });
    }

    await pool.query(
      "UPDATE psicologo SET estado = false WHERE idPsicologo = $1",
      [idPsicologo]
    );

    res.json({ message: "Psicólogo desactivado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
