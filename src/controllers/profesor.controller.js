import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener todos los profesores
export const getProfesores = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
            SELECT *
            FROM Profesor WHERE estado = 'true'
            ORDER BY idProfesor ASC
        `
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los profesores" });
  }
};

// Obtener un profesor por ID
export const getProfesorById = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    const { rows } = await pool.query(
      `
            SELECT *
            FROM Profesor
            WHERE idProfesor = $1
        `,
      [idProfesor]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    const profesor = rows[0];

    if (!profesor.estado) {
      return res.status(400).json({ error: "Profesor está deshabilitado" });
    }

    res.json(profesor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el profesor" });
  }
};
export const createProfesor = async (req, res) => {
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

  // Normaliza fecha (acepta fechaDeNacimiento | fechaNacimiento | fechadenacimiento)
  const rawAny =
    (req.body.fechaDeNacimiento ??
     req.body.fechaNacimiento ??
     req.body.fechadenacimiento ??
     "").toString().trim();

  let fechaDeNacimiento = rawAny;

  // Acepta DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawAny)) {
    const [dd, mm, yyyy] = rawAny.split("/");
    fechaDeNacimiento = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
  }

  if (fechaDeNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    const d = new Date(fechaDeNacimiento);
    if (!Number.isNaN(d.getTime())) fechaDeNacimiento = d.toISOString().slice(0, 10);
  }

  const nameRe  = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passRe  = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

  try {
    // Campos obligatorios y sin espacios
    const required = {
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
      fechaDeNacimiento,
    };
    for (const [k, v] of Object.entries(required)) {
      if (!v || (typeof v === "string" && v.trim() === "")) {
        return res.status(400).json({ error: `El campo ${k} es obligatorio y no puede estar vacío` });
      }
    }

    // Nombres solo letras
    for (const v of [nombres, apellidoPaterno, apellidoMaterno]) {
      if (typeof v === "string" && !nameRe.test(v)) {
        return res.status(400).json({ error: "Los nombres y apellidos solo deben contener letras y espacios" });
      }
    }

    // Email válido
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: "Correo electrónico no válido" });
    }

    // Celular 8 dígitos
    if (!/^\d{8}$/.test(String(numCelular))) {
      return res.status(400).json({ error: "El celular debe tener exactamente 8 dígitos numéricos" });
    }

    // Contraseña fuerte
    if (!passRe.test(contrasenia)) {
      return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres, 1 mayúscula, 1 número y 1 carácter especial" });
    }

    // Fecha válida y < 2006-01-01 (restricción de BD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
      return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }
    if (new Date(fechaDeNacimiento) >= new Date("2006-01-01")) {
      return res.status(400).json({ error: "La fecha de nacimiento debe ser anterior a 2006-01-01" });
    }

    // Rol correcto
    if (rol !== "Profesor") {
      return res.status(400).json({ error: "El rol debe ser Profesor" });
    }

    // Duplicados: email y celular
    const dupEmail = await pool.query(`SELECT 1 FROM profesor WHERE email = $1`, [email.trim()]);
    if (dupEmail.rowCount > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado por otro usuario" });
    }

    const dupCel = await pool.query(`SELECT 1 FROM profesor WHERE numcelular = $1`, [String(numCelular).trim()]);
    if (dupCel.rowCount > 0) {
      return res.status(400).json({ error: "El número de celular ya está registrado por otro usuario" });
    }

    // Horario pertenece a la materia
    const vinc = await pool.query(
      `SELECT 1 FROM horario WHERE idhorario = $1 AND idmateria = $2`,
      [idhorario, idmateria]
    );
    if (vinc.rowCount === 0) {
      return res.status(400).json({ error: "El horario no pertenece a la materia seleccionada" });
    }

    // Hash y guardado
    const hashed = await bcrypt.hash(contrasenia.trim(), 10);

    const profesorResult = await pool.query(
      `INSERT INTO profesor (
         iddireccion, nombres, apellidopaterno, apellidomaterno,
         email, numcelular, fechadenacimiento, contrasenia,
         rol, estado, idhorario, idmateria
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,
         $9,true,$10,$11
       ) RETURNING *`,
      [
        idDireccion,
        nombres.trim(),
        apellidoPaterno.trim(),
        apellidoMaterno.trim(),
        email.trim(),
        String(numCelular).trim(),
        fechaDeNacimiento,           // YYYY-MM-DD
        hashed,
        "Profesor",
        idhorario,
        idmateria,
      ]
    );

    return res.status(201).json(profesorResult.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};



// Actualizar un profesor
export const updateProfesor = async (req, res) => {
  const { idProfesor } = req.params;
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
    idhorario,
  } = req.body;

  try {
    // Verificar si el profesor existe
    const { rows } = await pool.query(
      "SELECT * FROM profesor WHERE idprofesor = $1",
      [idProfesor]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    const currentData = rows[0];

    // Cifrar la contraseña solo si se ha proporcionado una nueva
    let hashedPassword = currentData.contrasenia;
    if (contrasenia && contrasenia !== currentData.contrasenia) {
      hashedPassword = await bcrypt.hash(contrasenia.trim(), 10);
    }

    await pool.query(
      `UPDATE profesor 
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
       WHERE idprofesor = $12`,
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
        idhorario,
        idProfesor,
      ]
    );

    res.json({ message: "Profesor actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un profesor (desactivar)
export const deleteProfesor = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    await pool.query("BEGIN");

    const profesorResult = await pool.query(
      "SELECT idProfesor FROM Profesor WHERE idProfesor = $1 AND Estado = true",
      [idProfesor]
    );

    if (profesorResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Profesor no encontrado o ya desactivado" });
    }

    await pool.query(
      "UPDATE Profesor SET Estado = false WHERE idProfesor = $1",
      [idProfesor]
    );

    await pool.query("COMMIT");

    res.json({ message: "Profesor desactivado correctamente" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener la cantidad de profesores
export const getProfesorCount = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT COUNT(*) AS total_profesores
        FROM Profesor
        WHERE estado = true;
      `
    );

    const totalProfesores = parseInt(result.rows[0].total_profesores, 10);

    res.status(200).json({
      total: totalProfesores,
    });
  } catch (error) {
    console.error("Error al obtener la cantidad de profesores:", error);
  }
};
export const getProfesoresConHorarios = async (req, res) => {
  try {
    const { rows: profesores } = await pool.query(
      `
      SELECT 
        'Profesor' AS tipo,
        p.idprofesor AS id, 
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
      `
    );

    const { rows: psicologos } = await pool.query(
      `
      SELECT 
        'Psicólogo' AS tipo,
        ps.idpsicologo AS id, 
        CONCAT(ps.nombres, ' ', ps.apellidopaterno, ' ', ps.apellidomaterno) AS nombre, 
        'Psicólogo' AS materia, -- Asignar "Psicólogo" como valor por defecto
        h.dia, 
        h.horainicio, 
        h.horafin,
        ps.email
      FROM psicologo ps
      INNER JOIN horario h ON ps.idhorario = h.idhorario
      WHERE ps.estado = true
      ORDER BY ps.idpsicologo ASC
      `
    );

    // Combinar ambos resultados
    const resultado = [...profesores, ...psicologos];

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener profesores y psicólogos con horarios:", error);
    res.status(500).json({ error: "Error al obtener profesores y psicólogos con horarios" });
  }
};


