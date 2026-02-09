import bcrypt from "bcrypt";
import * as repository from "./padres.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getPadresFamilia = async () => {
  const { rows } = await repository.fetchPadresFamilia();
  return ok(rows);
};

export const getPadreFamiliaById = async (idPadre) => {
  const { rows } = await repository.fetchPadreFamiliaById(idPadre);
  if (!rows.length) {
    return fail(404, "Padre de familia no encontrado");
  }
  const padre = rows[0];
  if (!padre.estado) {
    return fail(400, "Padre de familia esta deshabilitado");
  }
  return ok(padre);
};

export const getPadreFamiliaConEstudiantes = async (idPadre) => {
  const padreResult = await repository.fetchPadreFamiliaById(idPadre);
  if (padreResult.rowCount === 0) {
    return fail(404, "Padre de familia no encontrado");
  }

  const padre = padreResult.rows[0];
  if (padre.estado !== true) {
    return fail(400, "Padre de familia deshabilitado");
  }

  const hijosResult = await repository.fetchPadreConHijos(idPadre);
  return ok({
    padre,
    estudiantes: hijosResult.rows,
    totalEstudiantes: hijosResult.rowCount,
  });
};

export const createPadreFamilia = async (payload) => {
  const {
    idDireccion,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    email,
    numCelular,
    contrasenia,
    rol,
  } = payload;

  const fechaRaw =
    payload.fechaDeNacimiento ?? payload.fechaNacimiento ?? payload.fechadenacimiento ?? "";
  const fechaDeNacimiento = typeof fechaRaw === "string" ? fechaRaw.trim() : "";

  const namePattern = /^[\p{L}\s']+$/u;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

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
      return fail(400, `El campo ${k} es obligatorio y no puede estar vacio`);
    }
  }

  if (
    ![nombres, apellidoPaterno, apellidoMaterno].every((x) =>
      namePattern.test(String(x).trim())
    )
  ) {
    return fail(400, "Los nombres y apellidos solo permiten letras y espacios");
  }

  if (String(rol).trim() !== "Padre de Familia") {
    return fail(400, "El rol debe ser 'Padre de Familia'");
  }

  if (!emailPattern.test(String(email).trim())) {
    return fail(400, "Correo electronico no valido");
  }

  const celular8 = String(numCelular).replace(/\D/g, "");
  if (!/^\d{8}$/.test(celular8)) {
    return fail(400, "El celular debe tener exactamente 8 digitos");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    return fail(400, "Formato de fecha invalido. Use YYYY-MM-DD");
  }
  const max = new Date();
  max.setFullYear(max.getFullYear() - 18);
  if (new Date(fechaDeNacimiento) > max) {
    return fail(400, "Debe ser mayor de 18 anos");
  }

  if (!passPattern.test(String(contrasenia))) {
    return fail(
      400,
      "La contrasena debe tener minimo 6 caracteres, 1 mayuscula, 1 numero y 1 caracter especial"
    );
  }

  const emailCheck = await repository.findPadreByEmail(String(email).trim());
  if (emailCheck.rowCount > 0) {
    return fail(400, "El correo electronico ya esta registrado por otro usuario");
  }

  const celCheck = await repository.findPadreByCelular(celular8);
  if (celCheck.rowCount > 0) {
    return fail(400, "El celular ya esta registrado por otro usuario");
  }

  const hashedPassword = await bcrypt.hash(String(contrasenia).trim(), 10);

  const padreResult = await repository.insertPadreFamilia({
    idDireccion,
    nombres: String(nombres).trim(),
    apellidoPaterno: String(apellidoPaterno).trim(),
    apellidoMaterno: String(apellidoMaterno).trim(),
    email: String(email).trim(),
    numCelular: celular8,
    fechaDeNacimiento,
    contrasenia: hashedPassword,
  });

  return ok(padreResult.rows[0]);
};

export const updatePadreFamilia = async (idPadre, payload) => {
  const existing = await repository.fetchPadreFamiliaById(idPadre);
  if (!existing.rows.length) {
    return fail(404, "Padre de familia no encontrado");
  }

  const currentData = existing.rows[0];
  let hashedPassword = currentData.contrasenia;
  if (payload.contrasenia && payload.contrasenia !== currentData.contrasenia) {
    hashedPassword = await bcrypt.hash(payload.contrasenia.trim(), 10);
  }

  await repository.updatePadreFamilia({
    iddireccion: payload.iddireccion,
    nombres: payload.nombres?.trim(),
    apellidopaterno: payload.apellidopaterno?.trim(),
    apellidomaterno: payload.apellidomaterno?.trim(),
    email: payload.email?.trim(),
    numcelular: payload.numcelular?.trim(),
    fechadenacimiento: payload.fechadenacimiento,
    contrasenia: hashedPassword,
    estado: payload.estado,
    rol: payload.rol,
    idPadre,
  });

  return ok(null);
};

export const deletePadreFamilia = async (idPadre) => {
  const padreResult = await repository.fetchPadreActivo(idPadre);
  if (padreResult.rows.length === 0) {
    return fail(404, "Padre de familia no encontrado o ya desactivado");
  }

  await repository.softDeletePadre(idPadre);
  return ok(null);
};

export const getDatesPadresFamilia = async () => {
  const { rows } = await repository.fetchPadresFechas();
  return ok(rows);
};
