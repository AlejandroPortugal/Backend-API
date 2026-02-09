import * as repository from "./horario.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getHorarios = async () => {
  const { rows } = await repository.fetchHorarios();
  return ok(rows);
};

export const getHorarioById = async (idhorario) => {
  const { rows } = await repository.fetchHorarioById(idhorario);
  if (!rows.length) {
    return fail(404, "Horario no encontrado");
  }
  return ok(rows[0]);
};

export const createHorario = async (payload) => {
  const { rows } = await repository.insertHorario(payload);
  return ok(rows[0]);
};

export const updateHorario = async (idhorario, payload) => {
  const current = await repository.fetchHorarioRawById(idhorario);
  if (!current.rows.length) {
    return fail(404, "Horario no encontrado");
  }

  const currentData = current.rows[0];
  const updatedData = {
    idmateria: payload.idmateria || currentData.idmateria,
    horainicio: payload.horainicio || currentData.horainicio,
    horafin: payload.horafin || currentData.horafin,
    fecha: payload.fecha || currentData.fecha,
    estado: payload.estado !== undefined ? payload.estado : currentData.estado,
  };

  await repository.updateHorario({
    ...updatedData,
    idhorario,
  });

  return ok(null);
};

export const deleteHorario = async (idhorario) => {
  const result = await repository.fetchHorarioActiveById(idhorario);
  if (!result.rows.length) {
    return fail(404, "Horario no encontrado o ya desactivado");
  }
  await repository.softDeleteHorario(idhorario);
  return ok(null);
};
