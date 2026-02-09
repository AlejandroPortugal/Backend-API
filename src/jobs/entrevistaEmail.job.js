import schedule from "node-schedule";
import { pool } from "../db.js";
import { enviarCorreoPadres } from "../modules/entrevistas/entrevistas.usecase.js";

const DEFAULT_TIMEZONE = "America/La_Paz";

const formatDateInTimeZone = (date, timeZone) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const startEntrevistaEmailJob = () => {
  const timeZone = process.env.EMAIL_JOB_TZ || DEFAULT_TIMEZONE;
  const hour = Number(process.env.EMAIL_JOB_HOUR ?? 20);
  const minute = Number(process.env.EMAIL_JOB_MINUTE ?? 0);

  const rule = new schedule.RecurrenceRule();
  rule.tz = timeZone;
  rule.hour = Number.isNaN(hour) ? 20 : hour;
  rule.minute = Number.isNaN(minute) ? 0 : minute;

  schedule.scheduleJob(rule, async () => {
    const today = formatDateInTimeZone(new Date(), timeZone);
    console.log(
      `Ejecutando tarea de correos de entrevistas: ${today} (${timeZone})`
    );

    try {
      const entrevistas = await pool.query(
        `SELECT re.idpadre,
                re.fecha,
                re.descripcion,
                m.nombremotivo,
                h.horainicio::text AS horainicio,
                h.horafin::text AS horafin,
                COALESCE(mat.nombre, 'Psicologo') AS materia,
                re.idpsicologo,
                re.idprofesor,
                TRIM(CONCAT(
                  COALESCE(pr.nombres, ps.nombres, ''),
                  ' ',
                  COALESCE(pr.apellidopaterno, ps.apellidopaterno, ''),
                  ' ',
                  COALESCE(pr.apellidomaterno, ps.apellidomaterno, '')
                )) AS profesional
         FROM reservarentrevista re
         JOIN motivo m ON re.idmotivo = m.idmotivo
         LEFT JOIN profesor pr ON re.idprofesor = pr.idprofesor
         LEFT JOIN psicologo ps ON re.idpsicologo = ps.idpsicologo
         LEFT JOIN horario h ON h.idhorario = COALESCE(pr.idhorario, ps.idhorario)
         LEFT JOIN materia mat ON h.idmateria = mat.idmateria
         WHERE re.fecha = $1 AND re.idestado = 1`,
        [today]
      );

      if (entrevistas.rows.length === 0) {
        console.log("No hay entrevistas pendientes para enviar correos.");
        return;
      }

      for (const entrevista of entrevistas.rows) {
        const profesionalTitulo = entrevista.idpsicologo
          ? "Psicologo"
          : "Profesor";

        await enviarCorreoPadres({
          idPadre: entrevista.idpadre,
          motivo: entrevista.nombremotivo,
          materia: entrevista.materia,
          fecha: entrevista.fecha,
          horario: entrevista.horainicio,
          horafin: entrevista.horafin,
          descripcion: entrevista.descripcion || "",
          profesor: entrevista.profesional,
          profesionalTitulo,
        });
      }

      console.log("Tarea de envio de correos completada.");
    } catch (error) {
      console.error("Error al ejecutar la tarea programada:", error);
    }
  });
};
