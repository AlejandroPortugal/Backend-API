import bcrypt from "bcrypt";
import * as repository from "./profesor.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getProfesores = async () => {
  const { rows } = await repository.fetchProfesores();
  return ok(rows);
};

export const getProfesorById = async (idProfesor) => {
  const { rows } = await repository.fetchProfesorById(idProfesor);
  if (!rows.length) {
    return fail(404, "Profesor no encontrado");
  }
  const profesor = rows[0];
  if (!profesor.estado) {
    return fail(400, "Profesor esta deshabilitado");
  }
  return ok(profesor);
};

export const createProfesor = async (payload) => {
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
    payload.fechaDeNacimiento ?? payload.fechaNacimiento ?? payload.fechadenacimiento ?? ""
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

  const nameRe = /^[a-zA-Z\s]+$/;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passRe = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

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
      return fail(400, `El campo ${k} es obligatorio y no puede estar vacio`);
    }
  }

  for (const v of [nombres, apellidoPaterno, apellidoMaterno]) {
    if (typeof v === "string" && !nameRe.test(v)) {
      return fail(400, "Los nombres y apellidos solo deben contener letras y espacios");
    }
  }

  if (!emailRe.test(email)) {
    return fail(400, "Correo electronico no valido");
  }

  if (!/^\d{8}$/.test(String(numCelular))) {
    return fail(400, "El celular debe tener exactamente 8 digitos numericos");
  }

  if (!passRe.test(contrasenia)) {
    return fail(
      400,
      "La contrasenia debe tener minimo 6 caracteres, 1 mayuscula, 1 numero y 1 caracter especial"
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
    return fail(400, "Formato de fecha invalido. Use YYYY-MM-DD");
  }
  if (new Date(fechaDeNacimiento) >= new Date("2006-01-01")) {
    return fail(400, "La fecha de nacimiento debe ser anterior a 2006-01-01");
  }

  if (rol !== "Profesor") {
    return fail(400, "El rol debe ser Profesor");
  }

  const dupEmail = await repository.findProfesorEmail(email.trim());
  if (dupEmail.rowCount > 0) {
    return fail(400, "El correo electronico ya esta registrado por otro usuario");
  }

  const dupCel = await repository.findProfesorCelular(String(numCelular).trim());
  if (dupCel.rowCount > 0) {
    return fail(400, "El numero de celular ya esta registrado por otro usuario");
  }

  const vinc = await repository.fetchHorarioMateriaLink(idhorario, idmateria);
  if (vinc.rowCount === 0) {
    return fail(400, "El horario no pertenece a la materia seleccionada");
  }

  const hashed = await bcrypt.hash(contrasenia.trim(), 10);
  const profesorResult = await repository.insertProfesor({
    idDireccion,
    nombres: nombres.trim(),
    apellidoPaterno: apellidoPaterno.trim(),
    apellidoMaterno: apellidoMaterno.trim(),
    email: email.trim(),
    numCelular: String(numCelular).trim(),
    fechaDeNacimiento,
    contrasenia: hashed,
    idhorario,
  });

  return ok(profesorResult.rows[0]);
};

export const updateProfesor = async (idProfesor, payload) => {
  const { rows } = await repository.fetchProfesorById(idProfesor);
  if (!rows.length) {
    return fail(404, "Profesor no encontrado");
  }
  const currentData = rows[0];

  let hashedPassword = currentData.contrasenia;
  if (payload.contrasenia && payload.contrasenia !== currentData.contrasenia) {
    hashedPassword = await bcrypt.hash(payload.contrasenia.trim(), 10);
  }

  await repository.updateProfesor({
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
    idhorario: payload.idhorario,
    idProfesor,
  });

  return ok(null);
};

export const deleteProfesor = async (idProfesor) => {
  const result = await repository.fetchProfesorActivo(idProfesor);
  if (result.rows.length === 0) {
    return fail(404, "Profesor no encontrado o ya desactivado");
  }
  await repository.softDeleteProfesor(idProfesor);
  return ok(null);
};

export const getProfesorCount = async () => {
  const result = await repository.fetchProfesorCount();
  const totalProfesores = parseInt(result.rows[0].total_profesores, 10);
  return ok({ total: totalProfesores });
};

export const getProfesoresConHorarios = async () => {
  const { rows: profesores } = await repository.fetchProfesoresConHorarios();
  const { rows: psicologos } = await repository.fetchPsicologosConHorarios();
  return ok([...profesores, ...psicologos]);
};

export const getHorarioMateriaByProfesor = async (idProfesor) => {
  const { rows } = await repository.fetchHorarioMateriaByProfesor(idProfesor);
  if (!rows.length) {
    return fail(404, "Horario no encontrado para el profesor");
  }
  return ok(rows[0]);
};

export const validarEstadoEntrevistaProfesor = async ({
  idreservarentrevista,
  idestado,
  estado,
  idProfesor,
}) => {
  if (!idreservarentrevista) {
    return fail(400, "El idreservarentrevista es obligatorio");
  }

  let nuevoIdEstado = Number.isInteger(idestado) ? idestado : null;
  if (nuevoIdEstado === null && typeof idestado === "string" && idestado.trim() !== "") {
    nuevoIdEstado = Number(idestado);
  }
  if (nuevoIdEstado === null && typeof estado === "boolean") {
    nuevoIdEstado = estado ? 2 : 3;
  }

  if (![1, 2, 3].includes(nuevoIdEstado)) {
    return fail(
      400,
      "idestado debe ser 1 (Pendiente), 2 (Completado) o 3 (Cancelado)"
    );
  }

  const { rows } = await repository.fetchEntrevistaById(idreservarentrevista);
  if (!rows.length) {
    return fail(404, "Entrevista no encontrada");
  }

  const entrevista = rows[0];
  if (idProfesor && entrevista.idprofesor && Number(idProfesor) !== Number(entrevista.idprofesor)) {
    return fail(403, "La entrevista no pertenece a este profesor");
  }

  return ok({
    idreservarentrevista,
    nuevoIdEstado,
  });
};

export const getPadreConHijos = async (idPadre) => {
  const idP = parseInt(idPadre, 10);
  if (!Number.isInteger(idP) || idP <= 0) {
    return fail(400, "idPadre debe ser un entero positivo");
  }

  const padreResult = await repository.fetchPadreById(idP);
  if (padreResult.rowCount === 0) {
    return fail(404, "Padre de familia no encontrado");
  }

  const padre = padreResult.rows[0];
  if (padre.estado !== true) {
    return fail(400, "Padre de familia esta deshabilitado");
  }

  const hijosResult = await repository.fetchHijosByPadre(idP);
  return ok({
    padre,
    hijos: hijosResult.rows,
    totalHijos: hijosResult.rowCount,
  });
};
