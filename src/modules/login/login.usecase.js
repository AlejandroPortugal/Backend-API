import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as repository from "./login.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const loginUser = async ({ email, contrasenia }) => {
  if (!email || !contrasenia) {
    return fail(400, "Por favor, proporcione correo electronico y contrasena");
  }

  let user;
  let userType;
  let userIdColumn;

  const adminResult = await repository.fetchAdministradorByEmail(email);
  if (adminResult.rows.length > 0) {
    user = adminResult.rows[0];
    userType = "Administrador";
    userIdColumn = "idadministrador";
  }

  const profResult = await repository.fetchProfesorByEmail(email);
  if (profResult.rows.length > 0) {
    user = profResult.rows[0];
    userType = "Profesor";
    userIdColumn = "idprofesor";
  }

  const psyResult = await repository.fetchPsicologoByEmail(email);
  if (psyResult.rows.length > 0) {
    user = psyResult.rows[0];
    userType = "Psicologo";
    userIdColumn = "idpsicologo";
  }

  const padreResult = await repository.fetchPadreByEmail(email);
  if (padreResult.rows.length > 0) {
    user = padreResult.rows[0];
    userType = "Padre de Familia";
    userIdColumn = "idpadre";
  }

  if (!user) {
    return fail(404, "Usuario no encontrado");
  }

  const isMatch = await bcrypt.compare(contrasenia, user.contrasenia);
  if (!isMatch) {
    return fail(401, "Contrasena incorrecta");
  }

  const token = jwt.sign(
    {
      id: user[userIdColumn],
      role: userType,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "30m" }
  );

  const idhorario = user.idhorario ?? user.idHorario ?? null;
  const idmateria = user.idmateria ?? user.idMateria ?? null;

  return ok({
    message: "Inicio de sesion exitoso",
    token,
    user: {
      id: user[userIdColumn],
      role: userType,
      nombres: user.nombres,
      apellidopaterno: user.apellidopaterno,
      apellidomaterno: user.apellidomaterno,
      email: user.email,
      idhorario,
      idmateria,
    },
  });
};
