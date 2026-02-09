import * as repository from "./materia.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getMaterias = async () => {
  const { rows } = await repository.fetchMateriasActivas();
  return ok(rows);
};

export const getMateriaById = async (idMateria) => {
  const { rows } = await repository.fetchMateriaById(idMateria);
  if (!rows.length) {
    return fail(404, "Materia no encontrada");
  }
  const materia = rows[0];
  if (materia.estado !== true) {
    return fail(400, "La materia esta deshabilitada");
  }
  return ok(materia);
};

export const getMateriasForPsicologo = async () => {
  const { rows } = await repository.fetchMateriasForPsicologo();
  return ok(rows);
};
