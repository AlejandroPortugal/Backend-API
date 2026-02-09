import bcrypt from "bcrypt";
import * as repository from "./psicologo.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const ALLOWED_IDS = new Set([6, 7]);

export const getPsicologos = async () => {
  const { rows } = await repository.fetchPsicologos();
  return ok(rows);
};

export const getPsicologoById = async (idPsicologo) => {
  const { rows } = await repository.fetchPsicologoById(idPsicologo);
  if (!rows.length) {
    return fail(404, "Psicologo no encontrado");
  }
  const psicologo = rows[0];
  if (!psicologo.estado) {
    return fail(400, "Psicologo esta deshabilitado");
  }
  return ok(psicologo);
};

export const createPsicologo = async (payload) => {
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
  } = payload;

  const rawAny = (
    payload.fechaDeNacimiento ??
    payload.fechaNacimiento ??
    payload.fechadenacimiento ??
    ""
  )
    .toString()
    .trim();

  let fechaDeNacimiento = rawAny;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawAny)) {
    const [dd, mm, yyyy] = rawAny.split("/");
    fechaDeNacimiento = `${yyyy}-${mm}-${dd}`;
  }
  if (fechaDeNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    const d = new Date(fechaDeNacimiento);
    if (!Number.isNaN(d.getTime())) {
      fechaDeNacimiento = d.toISOString().slice(0, 10);
    }
  }

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
      return fail(400, `El campo ${k} es obligatorio y no puede estar vacio`);
    }
  }

  const namePattern = /^[\p{L}\s']+$/u;
  for (const k of ["nombres", "apellidoPaterno", "apellidoMaterno"]) {
    if (!namePattern.test((payload[k] ?? "").toString())) {
      return fail(400, "Los nombres y apellidos no deben contener caracteres especiales");
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    return fail(400, "Formato de fecha invalido. Use YYYY-MM-DD");
  }
  if (new Date(fechaDeNacimiento) >= new Date("2006-01-01")) {
    return fail(400, "La fecha de nacimiento debe ser anterior a 2006-01-01");
  }

  if (!/^\d{8}$/.test(String(numCelular).trim())) {
    return fail(400, "El celular debe tener exactamente 8 digitos");
  }

  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/.test(String(contrasenia))) {
    return fail(
      400,
      "Contrasena debil (min. 6, 1 mayuscula, 1 numero y 1 especial)"
    );
  }

  const normRol = (rol || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (normRol !== "psicologo") {
    return fail(400, "El rol debe ser 'Psicologo'");
  }

  const emailCheck = await repository.findEmailInPsicologoOrProfesor(email.trim());
  if (emailCheck.rowCount > 0) {
    return fail(400, "El correo electronico ya esta registrado por otro usuario");
  }

  const celCheck = await repository.findCelInPsicologoOrProfesor(String(numCelular).trim());
  if (celCheck.rowCount > 0) {
    return fail(400, "El celular ya esta registrado por otro usuario");
  }

  const mid = Number(idmateria);
  if (!ALLOWED_IDS.has(mid)) {
    return fail(400, "La materia seleccionada no esta permitida para Psicologo");
  }
  const matCheck = await repository.fetchMateriaActiva(mid);
  if (matCheck.rowCount === 0) {
    return fail(400, "La materia seleccionada no existe o esta deshabilitada");
  }

  const matTaken = await repository.fetchMateriaTaken(idmateria);
  if (matTaken.rowCount > 0) {
    return fail(409, "La materia ya fue asignada");
  }

  const vinc = await repository.fetchHorarioMateriaLink(idhorario, idmateria);
  if (vinc.rowCount === 0) {
    return fail(400, "El horario no pertenece a la materia seleccionada");
  }

  const hashedPassword = await bcrypt.hash(String(contrasenia).trim(), 10);
  const result = await repository.insertPsicologo({
    idDireccion,
    nombres: nombres.trim(),
    apellidoPaterno: apellidoPaterno.trim(),
    apellidoMaterno: apellidoMaterno.trim(),
    email: email.trim(),
    numCelular: String(numCelular).trim(),
    fechaDeNacimiento,
    contrasenia: hashedPassword,
    idhorario,
    idmateria,
  });

  return ok(result.rows[0]);
};

export const updatePsicologo = async (idPsicologo, payload) => {
  const { rows } = await repository.fetchPsicologoById(idPsicologo);
  if (!rows.length) {
    return fail(404, "Psicologo no encontrado");
  }

  const currentData = rows[0];
  let hashedPassword = currentData.contrasenia;
  if (payload.contrasenia && payload.contrasenia !== currentData.contrasenia) {
    hashedPassword = await bcrypt.hash(payload.contrasenia.trim(), 10);
  }

  await repository.updatePsicologo({
    iddireccion: payload.iddireccion,
    nombres: payload.nombres?.trim(),
    apellidopaterno: payload.apellidopaterno?.trim(),
    apellidomaterno: payload.apellidomaterno?.trim(),
    email: payload.email?.trim(),
    numcelular: payload.numcelular?.trim(),
    fechadenacimiento: payload.fechadenacimiento,
    estado: payload.estado,
    contrasenia: hashedPassword,
    idhorario: payload.idhorario,
    idPsicologo,
  });

  return ok(null);
};

export const deletePsicologo = async (idPsicologo) => {
  const result = await repository.fetchPsicologoActivo(idPsicologo);
  if (result.rows.length === 0) {
    return fail(404, "Psicologo no encontrado o ya desactivado");
  }

  await repository.softDeletePsicologo(idPsicologo);
  return ok(null);
};
