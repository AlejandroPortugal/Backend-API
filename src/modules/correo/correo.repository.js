import { pool } from "../../db.js";

export const fetchPadreById = (idPadre) =>
  pool.query(
    "SELECT nombres, apellidopaterno, apellidomaterno, email FROM padredefamilia WHERE idPadre = $1",
    [idPadre]
  );
