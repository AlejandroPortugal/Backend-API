import crypto from "crypto";
import { sendEmailWithFallback } from "../../services/email.service.js";
import * as repository from "./correo.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const enviarCorreo = async ({
  idPadre,
  motivo,
  materia,
  fecha,
  horario,
  descripcion,
  profesor,
}) => {
  if (!idPadre || !motivo || !materia || !fecha || !horario || !descripcion || !profesor) {
    return fail(400, "Faltan datos para enviar el correo");
  }

  const padreQuery = await repository.fetchPadreById(idPadre);
  if (padreQuery.rows.length === 0) {
    return fail(404, "Padre de familia no encontrado");
  }

  const padre = padreQuery.rows[0];
  const nombresPadre = `${padre.nombres} ${padre.apellidopaterno} ${padre.apellidomaterno}`;
  const emailPadre = padre.email;

  const mensaje = `
Estimado(a) ${nombresPadre},

Nos comunicamos para informarle que se ha programado una entrevista con el siguiente detalle:

- Motivo: ${motivo}
- Materia: ${materia}
- Fecha: ${fecha}
- Hora de inicio: ${horario}
- Descripcion: ${descripcion}

Atentamente,
Profesor: ${profesor.nombres} ${profesor.apellidopaterno} ${profesor.apellidomaterno}
  `;

  const { provider } = await sendEmailWithFallback({
    to: emailPadre,
    subject: "Cita agendada",
    text: mensaje,
  });

  return ok({ email: emailPadre, provider });
};

export const enviarCodigoConfirmacion = async (email) => {
  if (!email) {
    return fail(400, "El correo electronico es obligatorio.");
  }

  const codigoConfirmacion = crypto.randomInt(100000, 999999);
  const mensaje = `
Estimado usuario,

Hemos recibido una solicitud para confirmar tu correo electronico. Este es tu codigo de confirmacion:

Codigo: ${codigoConfirmacion}

Si no solicitaste este codigo, ignora este mensaje.

Atentamente,
El equipo de soporte
  `;

  const { provider } = await sendEmailWithFallback({
    to: email,
    subject: "Codigo de Confirmacion",
    text: mensaje,
  });

  return ok({ codigoConfirmacion, provider });
};
