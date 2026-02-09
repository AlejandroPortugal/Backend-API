import bcrypt from "bcrypt";
import * as repository from "./administrator.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const trimText = (value) => (typeof value === "string" ? value.trim() : value);

export const getAdministrador = async () => {
  const { rows } = await repository.fetchAdministradores();
  return ok(rows);
};

export const getAdministradorById = async (idAdministrador) => {
  const { rows } = await repository.fetchAdministradorById(idAdministrador);
  if (!rows.length) {
    return fail(404, "Administrador no encontrado");
  }
  const administrador = rows[0];
  if (!administrador.estado) {
    return fail(400, "Administrador esta deshabilitado");
  }
  return ok(administrador);
};

export const createAdministrador = async (payload) => {
  const idDireccion = payload.idDireccion;
  const nombres = trimText(payload.nombres);
  const apellidoPaterno = trimText(payload.apellidoPaterno);
  const apellidoMaterno = trimText(payload.apellidoMaterno);
  const email = trimText(payload.email);
  const numCelular = trimText(payload.numCelular);
  const fechaDeNacimiento = trimText(payload.fechaDeNacimiento);
  const contrasenia = trimText(payload.contrasenia);
  const rol = trimText(payload.rol);

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
    if (!v || (typeof v === "string" && v === "")) {
      return fail(400, `El campo ${k} es obligatorio y no puede estar vacio`);
    }
  }

  const namePattern = /^[a-zA-Z\s]+$/;
  if (!namePattern.test(nombres)) {
    return fail(400, "Nombres: solo letras y espacios");
  }
  if (!namePattern.test(apellidoPaterno)) {
    return fail(400, "Apellido paterno: solo letras y espacios");
  }
  if (!namePattern.test(apellidoMaterno)) {
    return fail(400, "Apellido materno: solo letras y espacios");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return fail(400, "Email no valido");
  }

  if (!/^\d{8}$/.test(numCelular)) {
    return fail(400, "El celular debe tener exactamente 8 digitos");
  }

  if (rol !== "Administrador") {
    return fail(400, "El rol debe ser 'Administrador'");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    return fail(400, "Fecha de nacimiento invalida. Use YYYY-MM-DD");
  }
  if (new Date(fechaDeNacimiento) >= new Date("2006-01-01")) {
    return fail(400, "La fecha de nacimiento debe ser anterior a 2006-01-01");
  }

  const emailExists = await repository.findAdminEmail(email);
  if (emailExists.rowCount > 0) {
    return fail(400, "El correo electronico ya esta registrado por otro usuario");
  }

  const phoneExists = await repository.findAdminPhone(numCelular);
  if (phoneExists.rowCount > 0) {
    return fail(400, "El celular ya esta registrado por otro usuario");
  }

  const hashedPassword = await bcrypt.hash(contrasenia, 10);

  const adminResult = await repository.insertAdministrador({
    idDireccion,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    email,
    numCelular,
    fechaDeNacimiento,
    contrasenia: hashedPassword,
    rol,
  });

  return ok(adminResult.rows[0]);
};

export const updateAdministrador = async (idAdministrador, payload) => {
  const current = await repository.fetchAdministradorById(idAdministrador);
  if (!current.rows.length) {
    return fail(404, "Administrador no encontrado");
  }

  const currentData = current.rows[0];
  let hashedPassword = currentData.contrasenia;
  if (payload.contrasenia && payload.contrasenia !== currentData.contrasenia) {
    hashedPassword = await bcrypt.hash(payload.contrasenia.trim(), 10);
  }

  await repository.updateAdministrador({
    iddireccion: payload.iddireccion,
    nombres: trimText(payload.nombres),
    apellidopaterno: trimText(payload.apellidopaterno),
    apellidomaterno: trimText(payload.apellidomaterno),
    email: trimText(payload.email),
    numcelular: trimText(payload.numcelular),
    fechadenacimiento: payload.fechadenacimiento,
    contrasenia: hashedPassword,
    estado: payload.estado,
    rol: payload.rol,
    idAdministrador,
  });

  return ok(null);
};

export const deleteAdministrador = async (idAdministrador) => {
  const adminResult = await repository.fetchAdministradorActivo(idAdministrador);
  if (!adminResult.rows.length) {
    return fail(404, "Administrador no encontrado o ya desactivado");
  }

  await repository.softDeleteAdministrador(idAdministrador);
  return ok(null);
};
