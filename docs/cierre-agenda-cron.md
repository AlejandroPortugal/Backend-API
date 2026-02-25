# Cierre de agenda por cron (entrevistas)

## Objetivo
- A una hora fija (por ejemplo, 20:00), calcular hora exacta por entrevista.
- Enviar correo al padre con fecha y rango de hora confirmado.
- Marcar la entrevista como `agenda_cerrada = true` y `correo_enviado = true`.
- Solo despues de eso debe verse en historial de padres.

## Variables de entorno
- `EMAIL_JOB_TZ`: zona horaria del cron. Ejemplo: `America/La_Paz`.
- `EMAIL_JOB_HOUR`: hora del cierre (0-23). Ejemplo: `20`.
- `EMAIL_JOB_MINUTE`: minuto del cierre (0-59). Ejemplo: `0`.
- `EMAIL_JOB_TARGET_OFFSET_DAYS`: dias de adelanto respecto a la fecha actual en la zona del job.
  - `0`: procesa la fecha de hoy.
  - `1`: procesa la fecha de manana.
- `CRON_SECRET`: token opcional para proteger el endpoint manual de cierre.

## Flujo
1. El job toma entrevistas pendientes (`idestado = 1`) no cerradas y no notificadas.
2. Agrupa por profesional (profesor/psicologo).
3. Recalcula horario exacto por prioridad (`Alta=25`, `Media=20`, `Baja=10`).
4. Envia correo por cada entrevista con hora exacta.
5. Si el correo se envia, marca cierre y confirmacion en BD.

## Prueba manual
- Ejecutar por fecha (YYYY-MM-DD):
```bash
npm run job:cierre-agenda -- 2026-03-03
```
- Si no pasas fecha, usa la de hoy.

## Endpoint para cron externo
- Metodo: `POST /jobs/entrevistas/cierre-agenda`
- Header recomendado: `x-cron-secret: TU_TOKEN`
- Body opcional:
```json
{
  "fecha": "2026-03-03"
}
```
- Si no envias `fecha`, usa la fecha actual segun `EMAIL_JOB_TZ`.

## Requisito de despliegue
- `node-schedule` corre dentro del proceso Node.
- El backend debe estar siempre encendido para que el cron se ejecute en hora.
