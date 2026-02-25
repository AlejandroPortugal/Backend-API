import { procesarCierreAgendaEntrevistas } from "../modules/entrevistas/entrevistas.usecase.js";

const getTodayISO = () => {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().split("T")[0];
};

const dateArg = process.argv
  .slice(2)
  .find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(String(arg)));
const fecha = dateArg || getTodayISO();

try {
  const result = await procesarCierreAgendaEntrevistas(fecha);
  if (result?.error) {
    console.error(`[CierreAgenda] Error (${fecha}): ${result.error.message}`);
    process.exit(1);
  }

  console.log(`[CierreAgenda] Resultado (${fecha}):`);
  console.log(JSON.stringify(result.data, null, 2));
  process.exit(0);
} catch (error) {
  console.error(`[CierreAgenda] Fallo inesperado (${fecha}):`, error);
  process.exit(1);
}
