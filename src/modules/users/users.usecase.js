import * as repository from "./users.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getAllUsers = async () => {
  const administradorQuery = await repository.fetchAllAdministradores();
  const profesorQuery = await repository.fetchAllProfesores();
  const psicologoQuery = await repository.fetchAllPsicologos();
  const padreQuery = await repository.fetchAllPadres();
  const estudianteQuery = await repository.fetchAllEstudiantes();

  const allUsers = [
    ...administradorQuery.rows,
    ...profesorQuery.rows,
    ...psicologoQuery.rows,
    ...padreQuery.rows,
    ...estudianteQuery.rows,
  ];

  return ok(allUsers);
};

export const filterUsuarios = async (searchTerm) => {
  if (!searchTerm) {
    return fail(400, "Debe proporcionar un termino de busqueda.");
  }

  const { rows } = await repository.filterUsuarios(searchTerm);
  if (rows.length === 0) {
    return fail(404, "No se encontraron usuarios.");
  }
  return ok(rows);
};

export const getallUserEntry = async () => {
  const { rows } = await repository.fetchAllUsersEntry();
  return ok(rows);
};

export const filterUsers = async (searchTerm) => {
  if (!searchTerm) {
    return fail(400, "Debe proporcionar un termino de busqueda.");
  }

  const { rows } = await repository.filterUsers(searchTerm);
  if (rows.length === 0) {
    return fail(404, "No se encontraron usuarios.");
  }
  return ok(rows);
};

export const registrarIngreso = async ({
  idUsuario,
  nombreCompleto,
  rol,
}) => {
  if (!idUsuario || !nombreCompleto || !rol) {
    return fail(400, "Faltan datos para registrar el ingreso");
  }

  const normalizedRole = String(rol || "").trim();

  const roleColumnMap = {
    Administrador: "idadministrador",
    Profesor: "idprofesor",
    Psicologo: "idpsicologo",
  };

  const actorColumn = roleColumnMap[normalizedRole];
  if (!actorColumn) {
    return fail(400, "Rol no valido para registrar ingreso");
  }

  const actorId = Number(idUsuario);
  if (!Number.isInteger(actorId) || actorId <= 0) {
    return fail(400, "ID de usuario no valido para registrar ingreso");
  }

  const actorIds = {
    idprofesor: normalizedRole === "Profesor" ? actorId : 0,
    idadministrador: normalizedRole === "Administrador" ? actorId : 0,
    idpsicologo: normalizedRole === "Psicologo" ? actorId : 0,
  };

  await repository.insertIngreso({
    idUsuario: actorId,
    nombreCompleto,
    rol: normalizedRole,
    ...actorIds,
  });

  return ok(null);
};

export const obtenerIngresos = async () => {
  const { rows } = await repository.fetchIngresos();
  return ok(rows);
};

export const obtenerDatosUsuariosConIngresos = async () => {
  const { rows } = await repository.fetchIngresosConUsuarios();
  return ok(rows);
};

export const obtenerIngresosPorRango = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    return fail(400, "Por favor, proporciona las fechas de inicio y fin.");
  }

  const { rows } = await repository.fetchIngresosPorRango(startDate, endDate);
  if (rows.length === 0) {
    return fail(404, "No se encontraron ingresos en el rango de fechas proporcionado.");
  }

  return ok(rows);
};

export const obtenerCantidadUsuariosConIngresos = async () => {
  const { rows } = await repository.fetchCantidadUsuariosConIngresos();
  const cantidad = rows[0]?.cantidad || 0;
  return ok({ cantidad });
};

export const listarUsuariosInactivos = async () => {
  const { rows } = await repository.fetchUsuariosInactivos();
  if (rows.length === 0) {
    return fail(404, "No hay usuarios inactivos.");
  }
  return ok(rows);
};

export const activarUsuario = async ({ id, rol }) => {
  if (!id || !rol) {
    return fail(400, "Faltan datos: id o rol del usuario.");
  }

  const roleTableMap = {
    Administrador: { table: "administrador", idColumn: "idadministrador" },
    Profesor: { table: "profesor", idColumn: "idprofesor" },
    Psicologo: { table: "psicologo", idColumn: "idpsicologo" },
    "Padre de Familia": { table: "padredefamilia", idColumn: "idpadre" },
  };

  const roleDef = roleTableMap[rol];
  if (!roleDef) {
    return fail(400, "Rol no valido.");
  }

  const result = await repository.activateUsuario({
    table: roleDef.table,
    idColumn: roleDef.idColumn,
    id,
  });

  if (result.rowCount === 0) {
    return fail(404, "Usuario no encontrado.");
  }

  return ok(null);
};
