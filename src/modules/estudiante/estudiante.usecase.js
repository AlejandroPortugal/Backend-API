import * as repository from "./estudiante.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const validateEstudianteFields = (payload) => {
  const idPadre = payload.idPadre ?? payload.idpadre;
  const idCurso = payload.idCurso ?? payload.idcurso;
  const nombres = payload.nombres;
  const apellidoPaterno = payload.apellidoPaterno ?? payload.apellidopaterno;
  const apellidoMaterno = payload.apellidoMaterno ?? payload.apellidomaterno;
  const fechaNacimiento =
    payload.fechaNacimiento ?? payload.fechaDeNacimiento ?? payload.fechadenacimiento;
  const rol = (payload.rol ?? "").toString();

  if (
    !idPadre ||
    !idCurso ||
    !nombres?.trim() ||
    !apellidoPaterno?.trim() ||
    !apellidoMaterno?.trim() ||
    !fechaNacimiento ||
    !rol.trim()
  ) {
    return fail(
      400,
      "Todos los campos son obligatorios y no pueden contener solo espacios en blanco"
    );
  }

  const namePattern = /^[\p{L}\s']+$/u;
  if (
    !namePattern.test(nombres) ||
    !namePattern.test(apellidoPaterno) ||
    !namePattern.test(apellidoMaterno)
  ) {
    return fail(
      400,
      "Los nombres y apellidos no deben contener caracteres especiales o numeros"
    );
  }

  if (rol.toLowerCase() !== "estudiante") {
    return fail(400, "El rol debe ser 'estudiante'");
  }

  return ok({
    idPadre,
    idCurso,
    nombres: nombres.trim(),
    apellidoPaterno: apellidoPaterno.trim(),
    apellidoMaterno: apellidoMaterno.trim(),
    fechaNacimiento,
    rol: rol.trim(),
  });
};

export const getEstudiantes = async () => {
  const { rows } = await repository.fetchEstudiantes();
  return ok(rows);
};

export const getEstudianteById = async (idEstudiante) => {
  const { rows } = await repository.fetchEstudianteById(idEstudiante);
  if (!rows.length) {
    return fail(404, "Estudiante no encontrado");
  }
  const estudiante = rows[0];
  if (!estudiante.estado) {
    return fail(400, "Estudiante deshabilitado");
  }
  return ok(estudiante);
};

export const createEstudiante = async (payload) => {
  const validated = validateEstudianteFields(payload);
  if (validated.error) return validated;

  const { idPadre, idCurso, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento } =
    validated.data;

  const result = await repository.withTransaction(async (client) => {
    const padreActivo = await repository.fetchPadreActivo(idPadre, client);
    if (padreActivo.rowCount === 0) {
      return fail(400, "Padre de familia no encontrado o inactivo");
    }

    const insertResult = await repository.insertEstudiante(
      { idCurso, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento },
      client
    );

    const nuevoEstudiante = insertResult.rows[0];
    const idEstudiante = nuevoEstudiante.idestudiante ?? nuevoEstudiante.idEstudiante;

    await repository.linkPadreEstudiante(idPadre, idEstudiante, client);
    return ok(nuevoEstudiante);
  });

  return result;
};

export const updateEstudiante = async (idEstudiante, payload) => {
  const idPadre = payload.idPadre ?? payload.idpadre;
  const { idcurso, nombres, apellidopaterno, apellidomaterno, fechadenacimiento, estado } =
    payload;

  const result = await repository.withTransaction(async (client) => {
    const existing = await repository.fetchEstudianteById(idEstudiante);
    if (!existing.rows.length) {
      return fail(404, "Estudiante no encontrado");
    }

    await repository.updateEstudiante(
      {
        idcurso,
        nombres: nombres?.trim(),
        apellidopaterno: apellidopaterno?.trim(),
        apellidomaterno: apellidomaterno?.trim(),
        fechadenacimiento,
        estado,
        idEstudiante,
      },
      client
    );

    if (idPadre) {
      const padreActivo = await repository.fetchPadreActivo(idPadre, client);
      if (padreActivo.rowCount === 0) {
        return fail(400, "Padre de familia no encontrado o inactivo");
      }

      await repository.linkPadreEstudiante(idPadre, idEstudiante, client);
    }

    return ok(null);
  });

  return result;
};

export const deleteEstudiante = async (idEstudiante) => {
  const result = await repository.fetchEstudianteActivo(idEstudiante);
  if (result.rows.length === 0) {
    return fail(404, "Estudiante no encontrado o ya desactivado");
  }

  await repository.softDeleteEstudiante(idEstudiante);
  return ok(null);
};
