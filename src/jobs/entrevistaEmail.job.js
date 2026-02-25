import schedule from "node-schedule";
import { procesarCierreAgendaEntrevistas } from "../modules/entrevistas/entrevistas.usecase.js";

const DEFAULT_TIMEZONE = "America/La_Paz";
const DEFAULT_JOB_HOUR = 20;
const DEFAULT_JOB_MINUTE = 0;
const DEFAULT_TARGET_OFFSET_DAYS = 0;

const formatDateInTimeZone = (date, timeZone) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const addDaysToISODate = (isoDate, offsetDays = 0) => {
  if (!isoDate) return isoDate;
  const [year, month, day] = String(isoDate)
    .split("-")
    .map((value) => Number(value));
  if (![year, month, day].every(Number.isFinite)) return isoDate;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  parsed.setUTCDate(parsed.getUTCDate() + offsetDays);

  const nextYear = parsed.getUTCFullYear();
  const nextMonth = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(parsed.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export const startEntrevistaEmailJob = () => {
  const timeZone = process.env.EMAIL_JOB_TZ || DEFAULT_TIMEZONE;
  const hour = Number(process.env.EMAIL_JOB_HOUR ?? DEFAULT_JOB_HOUR);
  const minute = Number(process.env.EMAIL_JOB_MINUTE ?? DEFAULT_JOB_MINUTE);
  const targetOffsetDays = Number(
    process.env.EMAIL_JOB_TARGET_OFFSET_DAYS ?? DEFAULT_TARGET_OFFSET_DAYS
  );

  const rule = new schedule.RecurrenceRule();
  rule.tz = timeZone;
  rule.hour = Number.isNaN(hour) ? DEFAULT_JOB_HOUR : hour;
  rule.minute = Number.isNaN(minute) ? DEFAULT_JOB_MINUTE : minute;

  schedule.scheduleJob(rule, async () => {
    const baseDate = formatDateInTimeZone(new Date(), timeZone);
    const targetDate = addDaysToISODate(
      baseDate,
      Number.isNaN(targetOffsetDays) ? DEFAULT_TARGET_OFFSET_DAYS : targetOffsetDays
    );

    console.log(
      `Ejecutando cierre de agenda de entrevistas: fecha objetivo ${targetDate} (${timeZone})`
    );

    try {
      const result = await procesarCierreAgendaEntrevistas(targetDate);
      if (result?.error) {
        console.error(
          `Error en cierre de agenda (${targetDate}):`,
          result.error.message
        );
        return;
      }

      const resumen = result?.data || {};
      console.log(
        `Cierre de agenda completado (${targetDate}). Pendientes: ${
          resumen.totalPendientes ?? 0
        }, procesadas: ${resumen.procesadas ?? 0}, correos: ${
          resumen.correosEnviados ?? 0
        }, grupos: ${resumen.gruposProcesados ?? 0}.`
      );

      if (Array.isArray(resumen.errores) && resumen.errores.length > 0) {
        console.warn(
          `Cierre de agenda (${targetDate}) finalizado con ${resumen.errores.length} errores.`
        );
      }
    } catch (error) {
      console.error("Error al ejecutar la tarea programada:", error);
    }
  });
};
