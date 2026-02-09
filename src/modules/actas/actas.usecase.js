import * as repository from "./actas.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const normalizeNullableInt = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "undefined" || trimmed === "null" || trimmed === "nan") return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeNullableText = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || text.toLowerCase() === "undefined" || text.toLowerCase() === "null") {
    return null;
  }
  return text;
};

export const obtenerActasReunion = async () => {
  const { rows } = await repository.fetchAllActas();
  return ok(rows);
};

export const obtenerActaReunionPorId = async (idActa) => {
  const { rows } = await repository.fetchActaById(idActa);
  if (rows.length === 0) {
    return fail(404, "El acta de reunion no existe");
  }
  return ok(rows[0]);
};

export const crearActaReunion = async (payload) => {
  const {
    idreservarentrevista,
    idmotivo,
    descripcion,
    fechadecreacion,
    estado,
    idestudiante,
    idmateria,
  } = payload;

  if (
    !idreservarentrevista ||
    !idmotivo ||
    !descripcion?.trim() ||
    !fechadecreacion ||
    !idestudiante ||
    !idmateria
  ) {
    return fail(400, "Todos los campos son obligatorios");
  }

  const result = await repository.insertActa({
    idreservarentrevista,
    idmotivo,
    descripcion: descripcion.trim(),
    fechadecreacion,
    estado: estado ?? true,
    idestudiante,
    idmateria,
  });

  return ok(result.rows[0]);
};

export const actualizarActaReunion = async (idActa, payload) => {
  const actaId = normalizeNullableInt(idActa);
  if (!actaId) {
    return fail(400, "El idActa es invalido");
  }

  const current = await repository.fetchActaById(actaId);
  if (current.rows.length === 0) {
    return fail(404, "El acta de reunion no existe");
  }

  const descripcionActual = (current.rows[0].descripcion ?? "").toString().trim();
  const nuevaDescripcion =
    payload.descripcion !== undefined && payload.descripcion !== null
      ? String(payload.descripcion).trim()
      : null;
  const descripcionCambio =
    nuevaDescripcion !== null && nuevaDescripcion !== descripcionActual;
  const descripcionAnterior = descripcionCambio ? descripcionActual : null;
  const descripcionActualizada = descripcionCambio ? nuevaDescripcion : null;

  const result = await repository.updateActa({
    idreservarentrevista: normalizeNullableInt(payload.idreservarentrevista),
    idmotivo: normalizeNullableInt(payload.idmotivo),
    descripcion: nuevaDescripcion,
    fechadecreacion: payload.fechadecreacion ?? null,
    estado: payload.estado ?? null,
    idestudiante: normalizeNullableInt(payload.idestudiante),
    idmateria: normalizeNullableInt(payload.idmateria),
    usuariomodificacion: normalizeNullableText(payload.usuariomodificacion),
    descripcioncampo: descripcionAnterior,
    descripcioncampoactualizado: descripcionActualizada,
    idacta: actaId,
  });

  return ok(result.rows[0]);
};

export const eliminarActaReunion = async (idActa) => {
  const { rows } = await repository.softDeleteActa(idActa);
  if (rows.length === 0) {
    return fail(404, "El acta de reunion no existe");
  }
  return ok(rows[0]);
};

export const activarActaReunion = async (idActa) => {
  const { rows } = await repository.activateActa(idActa);
  if (rows.length === 0) {
    return fail(404, "El acta de reunion no existe");
  }
  return ok(rows[0]);
};

export const getActasByEstudiante = async (idestudiante) => {
  const { rows } = await repository.fetchActasByEstudiante(idestudiante);
  return ok(rows);
};

export const obtenerActasInactivas = async () => {
  const { rows } = await repository.fetchActasInactivas();
  return ok(rows);
};
