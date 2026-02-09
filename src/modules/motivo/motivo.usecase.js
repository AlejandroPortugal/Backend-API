import * as repository from "./motivo.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getMotivos = async () => {
  const { rows } = await repository.fetchMotivos();
  return ok(rows);
};

export const getMotivosById = async (idMotivo) => {
  const { rows } = await repository.fetchMotivoById(idMotivo);
  if (!rows.length) {
    return fail(404, "Motivo no encontrado");
  }
  const motivo = rows[0];
  if (!motivo.estado) {
    return fail(400, "El motivo esta deshabilitado");
  }
  return ok(motivo);
};
