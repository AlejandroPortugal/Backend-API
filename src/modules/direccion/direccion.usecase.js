import * as repository from "./direccion.repository.js";

const ok = (data) => ({ data });
const fail = (status, message, payload = null) => ({
  error: { status, message, payload },
});

const normalize = (value) => String(value ?? "").trim();
const normalizeLower = (value) => normalize(value).toLowerCase();

export const getDirecciones = async () => {
  const { rows } = await repository.fetchDirecciones();
  return ok(rows);
};

export const getDireccionById = async (iddireccion) => {
  const { rows } = await repository.fetchDireccionActivaById(iddireccion);
  if (!rows.length) {
    return fail(404, "Direcciİn no encontrada");
  }
  return ok(rows[0]);
};

export const createDireccion = async (payload) => {
  let { zona, calle, num_puerta } = payload;

  zona = normalize(zona);
  calle = normalize(calle);
  num_puerta = normalize(num_puerta);

  if (!zona || !calle || !num_puerta) {
    return fail(400, "Todos los campos de la direcciİn son obligatorios");
  }

  const dup = await repository.findDuplicateDireccion({
    zona: normalizeLower(zona),
    calle: normalizeLower(calle),
    num_puerta: normalize(num_puerta),
  });

  if (dup.rows.length) {
    const row = dup.rows[0];
    return fail(409, "La direcciİn ya existe", {
      idDireccion: row.iddireccion,
      direccion: row,
    });
  }

  const result = await repository.insertDireccion({ zona, calle, num_puerta });
  return ok(result.rows[0]);
};

export const updateDireccion = async (iddireccion, payload) => {
  const current = await repository.fetchDireccionById(iddireccion);
  if (!current.rows.length) {
    return fail(404, "Direcciİn no encontrada");
  }

  const currentRow = current.rows[0];
  let { zona, calle, num_puerta, estado } = payload;

  zona = zona !== undefined ? normalize(zona) : currentRow.zona;
  calle = calle !== undefined ? normalize(calle) : currentRow.calle;
  num_puerta = num_puerta !== undefined ? normalize(num_puerta) : currentRow.num_puerta;
  estado = typeof estado === "boolean" ? estado : currentRow.estado;

  if (!zona || !calle || !num_puerta) {
    return fail(400, "Todos los campos de la direcciİn son obligatorios");
  }

  if (estado === true) {
    const dup = await repository.findDuplicateDireccionExcludingId({
      zona: normalizeLower(zona),
      calle: normalizeLower(calle),
      num_puerta: normalize(num_puerta),
      iddireccion,
    });
    if (dup.rows.length) {
      return fail(409, "Ya existe otra direcciİn idゼntica activa");
    }
  }

  await repository.updateDireccion({ zona, calle, num_puerta, estado, iddireccion });
  return ok(null);
};

export const deleteDireccion = async (iddireccion) => {
  const result = await repository.fetchDireccionActivaId(iddireccion);
  if (!result.rows.length) {
    return fail(404, "Direcciİn no encontrada o ya desactivada");
  }
  await repository.softDeleteDireccion(iddireccion);
  return ok(null);
};
