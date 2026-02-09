import * as repository from "./curso.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const trimText = (value) => (typeof value === "string" ? value.trim() : value);

export const getCursos = async () => {
  const { rows } = await repository.fetchCursos();
  return ok(rows);
};

export const getCursoById = async (idCurso) => {
  const { rows } = await repository.fetchCursoById(idCurso);
  if (!rows.length) {
    return fail(404, "Curso no encontrado");
  }
  return ok(rows[0]);
};

export const createCurso = async (payload) => {
  const paralelo = trimText(payload.paralelo);
  const nivel = trimText(payload.nivel);
  const nombreCurso = trimText(payload.nombreCurso);
  const horaInicio = trimText(payload.horaInicio);
  const horaFin = trimText(payload.horaFin);

  if (!paralelo || !nivel || !nombreCurso || !horaInicio || !horaFin) {
    return fail(
      400,
      "Todos los campos son obligatorios y no pueden contener solo espacios en blanco"
    );
  }

  const duplicateCheck = await repository.findCursoDuplicate({
    nombreCurso,
    paralelo,
    nivel,
  });

  if (duplicateCheck.rows.length > 0) {
    return fail(400, "Ya existe un curso con el mismo nombre, paralelo y nivel.");
  }

  const result = await repository.insertCurso({
    paralelo,
    nivel,
    nombreCurso,
    horaInicio,
    horaFin,
  });

  return ok(result.rows[0]);
};

export const updateCurso = async (idCurso, payload) => {
  const current = await repository.fetchCursoById(idCurso);
  if (!current.rows.length) {
    return fail(404, "Curso no encontrado");
  }

  const paralelo = trimText(payload.paralelo) || current.rows[0].paralelo;
  const nivel = trimText(payload.nivel) || current.rows[0].nivel;
  const nombreCurso =
    trimText(payload.nombreCurso) || current.rows[0].nombrecurso;
  const horaInicio =
    trimText(payload.horaInicio) || current.rows[0].horainicio;
  const horaFin = trimText(payload.horaFin) || current.rows[0].horafin;
  const estado =
    payload.estado !== undefined ? payload.estado : current.rows[0].estado;

  const duplicateCheck = await repository.findCursoDuplicateExcludingId({
    nombreCurso,
    paralelo,
    nivel,
    idCurso,
  });

  if (duplicateCheck.rows.length > 0) {
    return fail(400, "Ya existe otro curso con el mismo nombre, paralelo y nivel.");
  }

  await repository.updateCurso({
    paralelo,
    nivel,
    nombreCurso,
    horaInicio,
    horaFin,
    estado,
    idCurso,
  });

  return ok(null);
};

export const deleteCurso = async (idCurso) => {
  const result = await repository.fetchCursoActiveById(idCurso);
  if (!result.rows.length) {
    return fail(404, "Curso no encontrado o ya desactivado");
  }
  await repository.softDeleteCurso(idCurso);
  return ok(null);
};
