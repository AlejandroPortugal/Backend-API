import { pool } from "../../db.js";

export const fetchDirecciones = () =>
  pool.query(`
    SELECT *
    FROM direccion
    WHERE estado = true
    ORDER BY iddireccion ASC
  `);

export const fetchDireccionById = (iddireccion) =>
  pool.query("SELECT * FROM direccion WHERE iddireccion = $1", [iddireccion]);

export const fetchDireccionActivaById = (iddireccion) =>
  pool.query(
    "SELECT * FROM direccion WHERE iddireccion = $1 AND estado = true",
    [iddireccion]
  );

export const findDuplicateDireccion = ({ zona, calle, num_puerta }) =>
  pool.query(
    `
    SELECT iddireccion, zona, calle, num_puerta
    FROM direccion
    WHERE lower(btrim(zona)) = $1
      AND lower(btrim(calle)) = $2
      AND btrim(num_puerta) = $3
      AND estado = true
    LIMIT 1
  `,
    [zona, calle, num_puerta]
  );

export const findDuplicateDireccionExcludingId = ({
  zona,
  calle,
  num_puerta,
  iddireccion,
}) =>
  pool.query(
    `
    SELECT 1
    FROM direccion
    WHERE lower(btrim(zona)) = $1
      AND lower(btrim(calle)) = $2
      AND btrim(num_puerta) = $3
      AND estado = true
      AND iddireccion <> $4
    LIMIT 1
  `,
    [zona, calle, num_puerta, iddireccion]
  );

export const insertDireccion = ({ zona, calle, num_puerta }) =>
  pool.query(
    `
    INSERT INTO direccion (zona, calle, num_puerta, estado)
    VALUES ($1, $2, $3, true)
    RETURNING *
  `,
    [zona, calle, num_puerta]
  );

export const updateDireccion = ({ zona, calle, num_puerta, estado, iddireccion }) =>
  pool.query(
    `
    UPDATE direccion
    SET zona = $1, calle = $2, num_puerta = $3, estado = $4
    WHERE iddireccion = $5
  `,
    [zona, calle, num_puerta, estado, iddireccion]
  );

export const fetchDireccionActivaId = (iddireccion) =>
  pool.query(
    "SELECT iddireccion FROM direccion WHERE iddireccion = $1 AND estado = true",
    [iddireccion]
  );

export const softDeleteDireccion = (iddireccion) =>
  pool.query("UPDATE direccion SET estado = false WHERE iddireccion = $1", [iddireccion]);
