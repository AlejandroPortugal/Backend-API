import * as repository from "./document.repository.js";

const ok = (data) => ({ data });

export const getEntrevistas = async () => {
  const { rows } = await repository.fetchReservarEntrevistas();
  return ok(rows);
};
