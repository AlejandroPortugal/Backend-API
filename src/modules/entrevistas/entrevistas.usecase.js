import * as repository from "./entrevistas.repository.js";
import { sendEmailWithFallback } from "../../services/email.service.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const validarPadreEstudianteActivos = async (idPadre, idEstudiante) => {
  if (!idPadre || !idEstudiante) {
    return {
      valido: false,
      mensaje: "idPadre e idEstudiante son obligatorios.",
    };
  }

  const [padre, estudiante, vinculo] = await Promise.all([
    repository.fetchPadreEstado(idPadre),
    repository.fetchEstudianteEstado(idEstudiante),
    repository.fetchVinculoPadreEstudiante(idPadre, idEstudiante),
  ]);

  if (!padre.rowCount || padre.rows[0].estado !== true) {
    return {
      valido: false,
      mensaje: "Padre de familia no encontrado o inactivo.",
    };
  }

  if (!estudiante.rowCount || estudiante.rows[0].estado !== true) {
    return {
      valido: false,
      mensaje: "Estudiante no encontrado o inactivo.",
    };
  }

  if (!vinculo.rowCount || vinculo.rows[0].estado !== true) {
    return {
      valido: false,
      mensaje: "El estudiante no esta vinculado a este padre o tutor.",
    };
  }

  return { valido: true };
};

const obtenerEntrevistasActivasPorPadreYFecha = async (
  idPadre,
  idEstudiante,
  fecha
) => {
  if (!idPadre || !fecha) return [];

  const result = await repository.fetchEntrevistasActivasPorPadreYFecha(
    idPadre,
    idEstudiante,
    fecha
  );
  return result.rows || [];
};

const encontrarEntrevistaMismaMateria = ({
  entrevistas,
  idProfesor,
  idPsicologo,
  idMateriaActual,
  materiaActualNombre,
}) => {
  if (!Array.isArray(entrevistas) || entrevistas.length === 0) return null;

  const materiaActualLower = (materiaActualNombre || "")
    .toString()
    .trim()
    .toLowerCase();
  const materiaActualId = idMateriaActual ? Number(idMateriaActual) : null;

  for (const entrevista of entrevistas) {
    if (!entrevista) continue;

    if (idPsicologo) {
      if (
        entrevista.idpsicologo &&
        Number(entrevista.idpsicologo) === Number(idPsicologo)
      ) {
        return entrevista;
      }
      continue;
    }

    if (entrevista.idpsicologo) continue;

    const entrevistaMateriaId = entrevista.idmateria
      ? Number(entrevista.idmateria)
      : null;
    if (
      entrevistaMateriaId !== null &&
      materiaActualId !== null &&
      entrevistaMateriaId === materiaActualId
    ) {
      return entrevista;
    }

    const entrevistaMateriaNombre = (entrevista.materia || "")
      .toString()
      .trim()
      .toLowerCase();
    if (
      entrevistaMateriaNombre &&
      materiaActualLower &&
      entrevistaMateriaNombre === materiaActualLower
    ) {
      return entrevista;
    }
  }

  return null;
};

const EMAIL_BRAND_COLOR = "#0f5132";
const EMAIL_ICON_URL =
  "https://cdn-icons-png.flaticon.com/512/1047/1047711.png";

const buildEntrevistaEmailContent = ({
  destinatario,
  motivo,
  materia,
  fecha,
  horaInicio,
  horaFin,
  descripcion,
  profesional,
}) => {
  const descripcionTexto = (descripcion ?? "").toString().trim();
  const descripcionHtml = descripcionTexto
    ? descripcionTexto.replace(/\n/g, "<br />")
    : "Sin descripciÃ³n adicional.";
  const descripcionPlain =
    descripcionTexto || "Sin descripciÃ³n adicional.";

  const rows = [
    { label: "Motivo", value: motivo },
    { label: "Materia", value: materia },
    { label: "Fecha", value: fecha },
    { label: "Hora de inicio", value: horaInicio },
  ];

  if (horaFin) {
    rows.push({ label: "Hora de fin", value: horaFin });
  }

  const detailsHtml = rows
    .filter((row) => row.value)
    .map(
      (row) => `
        <tr>
          <td style="padding:6px 12px;font-weight:600;color:${EMAIL_BRAND_COLOR};width:40%;">${row.label}</td>
          <td style="padding:6px 12px;color:#1f2933;">${row.value}</td>
        </tr>`
    )
    .join("");

  const html = `
  <div style="background-color:#f4f6f8;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background-color:#ffffff;border-radius:12px;box-shadow:0 8px 20px rgba(12,53,31,0.18);overflow:hidden;">
      <tr>
        <td style="background:${EMAIL_BRAND_COLOR};color:#ffffff;padding:18px 24px;">
          <table role="presentation" width="100%">
            <tr>
              <td style="width:56px;">
                <img src="${EMAIL_ICON_URL}" alt="IDEB" style="width:48px;height:48px;border-radius:50%;border:2px solid #ffffff;display:block;" />
              </td>
              <td style="text-align:right;font-size:20px;font-weight:600;">IDEB</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="font-size:16px;color:#0b2e13;margin:0 0 12px;">Estimado(a) ${destinatario},</p>
          <p style="font-size:15px;color:#1f2933;margin:0 0 20px;">
            Nos comunicamos para confirmarle que se ha registrado una entrevista. A continuaciÃ³n se detalla la informaciÃ³n mÃ¡s relevante:
          </p>
          <table role="presentation" width="100%" style="border-collapse:collapse;border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">
            ${detailsHtml}
          </table>
          <div style="margin:20px 0;padding:16px;border:1px solid #e9ecef;border-radius:8px;background-color:#f9fafb;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${EMAIL_BRAND_COLOR};">DescripciÃ³n del docente</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#1f2933;">${descripcionHtml}</p>
          </div>
          <p style="font-size:14px;color:#1f2933;margin:0 0 16px;">Atentamente,<br/>${profesional}</p>
          <div style="text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e9ecef;padding-top:16px;">
            Este mensaje fue enviado automÃ¡ticamente por el sistema de entrevistas del IDEB.
          </div>
        </td>
      </tr>
    </table>
  </div>`;

  const text = [
    `Estimado(a) ${destinatario},`,
    "",
    "Se registrÃ³ una entrevista con el siguiente detalle:",
    rows
      .filter((row) => row.value)
      .map((row) => `- ${row.label}: ${row.value}`)
      .join("\n"),
    "",
    `DescripciÃ³n: ${descripcionPlain}`,
    "",
    `Atentamente, ${profesional}`,
  ].join("\n");

  return { html, text };
};

const getEstadoId = async (nombre) => {
  const { rows } = await repository.fetchEstadoIdByNombre(nombre);
  if (rows.length > 0) return rows[0].id;

  const insertResult = await repository.insertEstado(nombre);
  return insertResult.rows[0].id;
};

export const agendarEntrevista = async (payload) => {
  const {
    idProfesor,
    idPsicologo,
    idPadre,
    idEstudiante: idEstudianteBody,
    idestudiante: idEstudianteLower,
    fecha,
    descripcion,
    idMotivo,
    idMateria: idMateriaBody,
    idmateria: idMateriaLower,
  } = payload;

  const idEstudiante = idEstudianteBody ?? idEstudianteLower;
  const idMateria = idMateriaBody ?? idMateriaLower;

  try {
    console.log("Datos recibidos desde el frontend:", payload);

    if (
      (!idProfesor && !idPsicologo) ||
      !idPadre ||
      !idEstudiante ||
      !fecha ||
      !idMotivo
    ) {
      return fail(400, "Todos los campos obligatorios deben ser completados.");
    }

    const validacionRelacion = await validarPadreEstudianteActivos(
      idPadre,
      idEstudiante
    );

    if (!validacionRelacion.valido) {
      return fail(400, validacionRelacion.mensaje);
    }

    // Validar motivo y prioridad
    const motivoCheck = await repository.fetchMotivoPrioridad(idMotivo);

    if (motivoCheck.rows.length === 0) {
      return fail(400, "Motivo no vÃ¡lido.");
    }

    const { tipoprioridad } = motivoCheck.rows[0];
    const duracionAtencion =
      tipoprioridad.toLowerCase() === "alta"
        ? 25
        : tipoprioridad.toLowerCase() === "media"
        ? 20
        : 10;

    // Obtener horario
    const horarioData = await repository.fetchHorarioByProfesional({
      idProfesor,
      idPsicologo,
    });

    if (horarioData.rows.length === 0) {
      return fail(400, "No se encontrÃ³ un horario vÃ¡lido.");
    }

    const { horainicio, horafin, materia, idmateria: materiaIdHorario } =
      horarioData.rows[0];

    const entrevistasExistentes =
      await obtenerEntrevistasActivasPorPadreYFecha(
        idPadre,
        idEstudiante,
        fecha
      );
    const materiaActualId = materiaIdHorario ?? idMateria;
    const entrevistaMismaMateria = encontrarEntrevistaMismaMateria({
      entrevistas: entrevistasExistentes,
      idProfesor,
      idPsicologo,
      idMateriaActual: materiaActualId,
      materiaActualNombre: materia,
    });

    if (entrevistaMismaMateria) {
      const materiaExistente =
        entrevistaMismaMateria.materia || "el profesional asignado";
      return fail(
        400,
        `El padre de familia ya tiene una entrevista programada para ${fecha} con ${materiaExistente}.`
      );
    }

    // Obtener entrevistas existentes
    const entrevistasPrevias = await repository.fetchEntrevistasPrevias(
      fecha,
      idProfesor,
      idPsicologo
    );

    let horaActual = horainicio;
    const recalculatedInterviews = [];

    for (const entrevista of entrevistasPrevias.rows) {
      const duracion =
        entrevista.prioridad.toLowerCase() === "alta"
          ? 25
          : entrevista.prioridad.toLowerCase() === "media"
          ? 20
          : 10;

      const [horas, minutos] = horaActual.split(":").map(Number);
      const nuevaHoraFinMinutos = horas * 60 + minutos + duracion;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevaHoraFinRestantesMinutos = nuevaHoraFinMinutos % 60;

      const nuevaHoraFin = `${String(nuevaHoraFinHoras).padStart(2, "0")}:${String(
        nuevaHoraFinRestantesMinutos
      ).padStart(2, "0")}:00`;

      if (nuevaHoraFin > horafin) {
        console.log("La agenda estÃ¡ llena para la fecha seleccionada.");
        break;
      }

      recalculatedInterviews.push({
        ...entrevista,
        horainicio: horaActual,
        horafin: nuevaHoraFin,
      });

      horaActual = nuevaHoraFin;
    }

    // Validar espacio para la nueva entrevista
    const nuevaEntrevistaInicio = horaActual;
    const nuevaEntrevistaFinMinutos =
      Number(nuevaEntrevistaInicio.split(":")[0]) * 60 +
      Number(nuevaEntrevistaInicio.split(":")[1]) +
      duracionAtencion;

    const nuevaEntrevistaFin = `${String(Math.floor(nuevaEntrevistaFinMinutos / 60)).padStart(
      2,
      "0"
    )}:${String(nuevaEntrevistaFinMinutos % 60).padStart(2, "0")}:00`;

    if (nuevaEntrevistaFin > horafin) {
      console.log("No hay espacio para la nueva entrevista. Enviando correos.");
      for (const entrevista of recalculatedInterviews) {
        await enviarCorreoProfesores({
          idPadre: entrevista.idpadre,
          idProfesor,
          idPsicologo,
          motivo: entrevista.nombremotivo,
          materia,
          fecha,
          horarioInicio: entrevista.horainicio,
          descripcion,
        });
      }

      return fail(
        400,
        "No hay espacio disponible. Correos enviados para entrevistas vÃ¡lidas."
      );
    } else {
      const estadoPendienteId = await getEstadoId("Pendiente");
      await repository.insertReservaEntrevista({
        idProfesor,
        idPsicologo,
        idPadre,
        idEstudiante,
        fecha,
        descripcion,
        idMotivo,
        idEstado: estadoPendienteId,
      });

      console.log("Nueva entrevista insertada correctamente (sin evento virtual).");
      return ok({
        success: true,
        message: "Entrevista agendada correctamente.",
        horaInicio: nuevaEntrevistaInicio,
        horaFin: nuevaEntrevistaFin,
      });
    }
  } catch (error) {
    console.error("Error al agendar la entrevista:", error.message);
    return fail(500, "Error interno del servidor.");
  }
};

export const enviarCorreoProfesores = async ({
  idPadre,
  idProfesor,
  idPsicologo,
  motivo,
  materia,
  fecha,
  horarioInicio,
  descripcion,
}) => {
  try {
    // Validar que todos los campos requeridos estÃ¡n presentes
    if (
      !idPadre ||
      !motivo ||
      !materia ||
      !fecha ||
      !horarioInicio ||
      !descripcion ||
      (!idProfesor && !idPsicologo)
    ) {
      console.error("Faltan datos para enviar el correo", {
        idPadre,
        idProfesor,
        idPsicologo,
        motivo,
        materia,
        fecha,
        horarioInicio,
        descripcion,
      });
      return;
    }

    // Obtener informaciÃ³n del padre de familia
    const padreQuery = await repository.fetchPadreContacto(idPadre);

    if (padreQuery.rows.length === 0) {
      console.error("Padre de familia no encontrado");
      return;
    }

    const padre = padreQuery.rows[0];
    const nombresPadre = `${padre.nombres} ${padre.apellidopaterno} ${padre.apellidomaterno}`;
    const emailPadre = padre.email;

    // Obtener informaciÃ³n del profesor o psicÃ³logo
    let profesional;
    if (idProfesor) {
      const profesorQuery = await repository.fetchProfesorContacto(idProfesor);

      if (profesorQuery.rows.length === 0) {
        console.error("Profesor no encontrado");
        return;
      }

      profesional = profesorQuery.rows[0];
    } else if (idPsicologo) {
      const psicologoQuery = await repository.fetchPsicologoContacto(idPsicologo);

      if (psicologoQuery.rows.length === 0) {
        console.error("PsicÃ³logo no encontrado");
        return;
      }

      profesional = psicologoQuery.rows[0];
    }

    const nombresProfesional = `${profesional.nombres} ${profesional.apellidopaterno} ${profesional.apellidomaterno}`;

    const { html, text } = buildEntrevistaEmailContent({
      destinatario: nombresPadre,
      motivo,
      materia,
      fecha,
      horaInicio: horarioInicio,
      descripcion,
      profesional: `${idProfesor ? "Profesor" : "PsicÃ³logo"}: ${nombresProfesional}`,
    });
    const { provider } = await sendEmailWithFallback({
      to: emailPadre,
      subject: "Confirmacion de entrevista IDEB",
      text,
      html,
    });
    console.log(`Correo enviado a: ${emailPadre} (proveedor: ${provider})`);
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
  }
};

const obtenerFechasHabilitadasLegacy = async (idhorario) => {
  try {
    if (!idhorario) {
      return fail(400, "El parÃ¡metro idhorario es obligatorio.");
    }

    // Obtener el horario del usuario
    const horarioData = await repository.fetchHorarioPorIdConDia(idhorario);

    if (horarioData.rows.length === 0) {
      return fail(404, "Horario no encontrado.");
    }

    const horarios = horarioData.rows;

    // Obtener fechas habilitadas (de lunes a viernes)
    const fechasHabilitadas = [];
    const hoy = new Date();
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      // Verificar si el dÃ­a de la semana estÃ¡ en el horario
      const diaSemana = fecha.getDay(); // 0: Domingo, 1: Lunes, ..., 6: SÃ¡bado
      const dia = [
        "Domingo",
        "Lunes",
        "Martes",
        "MiÃ©rcoles",
        "Jueves",
        "Viernes",
        "SÃ¡bado",
      ][diaSemana];

      if (horarios.some((h) => h.dia === dia)) {
        fechasHabilitadas.push(fecha.toISOString().split("T")[0]);
      }
    }

    return ok(fechasHabilitadas);
  } catch (error) {
    console.error("Error al obtener fechas habilitadas:", error.message);
    return fail(500, "Error interno del servidor.");
  }
};

export const obtenerFechasHabilitadas = async (params = {}) => {
  const {
    idhorario: idhorarioRaw,
    idProfesor,
    idPsicologo,
    idMotivo,
    dia,
    dias,
  } = params;

  try {
    const hasProfesional = Boolean(idProfesor || idPsicologo);
    let idhorario = idhorarioRaw;

    if (!idhorario) {
      if (idProfesor) {
        const profesorData = await repository.fetchProfesorHorarioId(idProfesor);
        idhorario = profesorData.rows[0]?.idhorario ?? null;
      } else if (idPsicologo) {
        const psicologoData = await repository.fetchPsicologoHorarioId(idPsicologo);
        idhorario = psicologoData.rows[0]?.idhorario ?? null;
      }
    }

    if (!idhorario) {
      return fail(400, "El parametro idhorario es obligatorio.");
    }

    const horarioData = await repository.fetchHorarioPorIdConDia(idhorario);
    if (horarioData.rows.length === 0) {
      return fail(404, "Horario no encontrado.");
    }

    const { horainicio, horafin, dia: diaHorario } = horarioData.rows[0];
    const diaBase = dia || diaHorario;
    if (!diaBase) {
      return fail(400, "El parametro dia es obligatorio.");
    }

    const normalizeDia = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/á|à|ä|â/g, "a")
        .replace(/é|è|ë|ê/g, "e")
        .replace(/í|ì|ï|î/g, "i")
        .replace(/ó|ò|ö|ô/g, "o")
        .replace(/ú|ù|ü|û/g, "u")
        .replace(/ñ/g, "n")
        .replace(/ã¡/g, "a")
        .replace(/ã©/g, "e")
        .replace(/ã­/g, "i")
        .replace(/ã³/g, "o")
        .replace(/ãº/g, "u")
        .replace(/ã±/g, "n");

    const diaKey = normalizeDia(diaBase);
    const dayIndexMap = {
      domingo: 0,
      lunes: 1,
      martes: 2,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sabado: 6,
    };
    const dayIndex = dayIndexMap[diaKey];
    if (dayIndex === undefined) {
      return fail(400, "El dia proporcionado no es valido.");
    }

    const diasMax =
      Number.isFinite(Number(dias)) && Number(dias) > 0 ? Number(dias) : 30;

    let duracionNueva = null;
    if (idMotivo) {
      if (!hasProfesional) {
        return fail(400, "Se requiere idProfesor o idPsicologo para validar capacidad.");
      }
      const motivoCheck = await repository.fetchMotivoPrioridad(idMotivo);
      if (motivoCheck.rows.length === 0) {
        return fail(400, "Motivo no valido.");
      }
      const prioridad = (motivoCheck.rows[0].tipoprioridad || "")
        .toString()
        .toLowerCase();
      duracionNueva = prioridad === "alta" ? 25 : prioridad === "media" ? 20 : 10;
    }

    const addMinutes = (timeValue, minutesToAdd) => {
      const [hours, minutes] = String(timeValue).split(":").map(Number);
      const total = (hours || 0) * 60 + (minutes || 0) + minutesToAdd;
      const outHours = Math.floor(total / 60);
      const outMinutes = total % 60;
      return `${String(outHours).padStart(2, "0")}:${String(outMinutes).padStart(2, "0")}:00`;
    };

    const fechasHabilitadas = [];
    const hoy = new Date();
    for (let i = 0; i < diasMax; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      if (fecha.getDay() !== dayIndex) continue;
      const fechaIso = fecha.toISOString().split("T")[0];

      let disponible = true;
      if (duracionNueva !== null && hasProfesional) {
        const entrevistasPrevias = await repository.fetchEntrevistasPrevias(
          fechaIso,
          idProfesor,
          idPsicologo
        );

        let horaActual = horainicio;
        for (const entrevista of entrevistasPrevias.rows) {
          const prioridad = (entrevista.prioridad || "").toString().toLowerCase();
          const duracion =
            prioridad === "alta" ? 25 : prioridad === "media" ? 20 : 10;
          const nuevaHoraFin = addMinutes(horaActual, duracion);
          if (nuevaHoraFin > horafin) {
            break;
          }
          horaActual = nuevaHoraFin;
        }

        const nuevaHoraFin = addMinutes(horaActual, duracionNueva);
        if (nuevaHoraFin > horafin) {
          disponible = false;
        }
      }

      if (disponible) {
        fechasHabilitadas.push(fechaIso);
      }
    }

    return ok(fechasHabilitadas);
  } catch (error) {
    console.error("Error al obtener fechas habilitadas:", error.message);
    return fail(500, "Error interno del servidor.");
  }
};

export const obtenerColaEsperaPrioridadFIFO = async (idhorario) => {
  console.log("IDHorario recibido desde el frontend:", idhorario);

  if (!idhorario) {
    console.error("Error: El parÃ¡metro idhorario es obligatorio.");
    return fail(400, "El parÃ¡metro idhorario es obligatorio.");
  }

  try {
    // Validar que el horario existe y estÃ¡ activo
    const horarioData = await repository.fetchHorarioPorId(idhorario);

    if (horarioData.rows.length === 0) {
      console.error(
        "Error: No se encontrÃ³ un horario vÃ¡lido para el idhorario proporcionado."
      );
      return fail(
        400,
        "No se encontrÃ³ un horario vÃ¡lido para el idhorario proporcionado."
      );
    }

    const { horainicio, horafin } = horarioData.rows[0];
    console.log("Horario encontrado:", { horainicio, horafin });

    // Procesar entrevistas
    const entrevistas = await repository.fetchEntrevistasHoy();

    console.log("Entrevistas obtenidas:", entrevistas.rows);

    const entrevistasRecalculadas = [];
    let horaActual = horainicio; // Inicializamos con el horainicio del horario

    for (const entrevista of entrevistas.rows) {
      const duracion =
        entrevista.prioridad.toLowerCase() === "alta"
          ? 25
          : entrevista.prioridad.toLowerCase() === "media"
          ? 20
          : 10;

      const [horas, minutos] = horaActual.split(":").map(Number);
      const nuevaHoraFinMinutos = horas * 60 + minutos + duracion;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevaHoraFinRestantesMinutos = nuevaHoraFinMinutos % 60;

      const nuevaHoraFin = `${String(nuevaHoraFinHoras).padStart(
        2,
        "0"
      )}:${String(nuevaHoraFinRestantesMinutos).padStart(2, "0")}:00`;

      if (nuevaHoraFin > horafin) {
        console.log(
          `Entrevista ID ${entrevista.idreservarentrevista} excede el horario permitido. Fin calculado: ${nuevaHoraFin}, Fin permitido: ${horafin}`
        );
        break;
      }

      entrevistasRecalculadas.push({
        ...entrevista,
        horainicio: horaActual,
        horafin: nuevaHoraFin,
      });

      console.log(
        `Entrevista ID ${entrevista.idreservarentrevista} recalculada. Inicio: ${horaActual}, Fin: ${nuevaHoraFin}`
      );

      horaActual = nuevaHoraFin;
    }

    console.log(
      "Entrevistas recalculadas finalizadas:",
      entrevistasRecalculadas
    );

    return ok(entrevistasRecalculadas);
  } catch (error) {
    console.error("Error al obtener la cola de espera:", error.message);
    return fail(500, `Error al obtener la cola de espera: ${error.message}`);
  }
};

export const obtenerListaEntrevistaPorFecha = async ({
  fecha,
  idProfesor,
  idPsicologo,
}) => {
  console.log("Fecha recibida:", fecha);
  console.log("IDProfesor recibido:", idProfesor);
  console.log("IDPsicologo recibido:", idPsicologo);

  // Validar que se envÃ­e un identificador vÃ¡lido (Profesor o PsicÃ³logo)
  if (!idProfesor && !idPsicologo) {
    console.error("Error: Se requiere el idProfesor o el idPsicologo.");
    return fail(400, "Se requiere el idProfesor o el idPsicologo.");
  }

  try {
    // Determinar el idhorario segÃºn el rol del usuario
    let idhorario;

    if (idProfesor) {
      const profesorData = await repository.fetchProfesorHorarioId(idProfesor);

      if (profesorData.rows.length === 0) {
        console.error(
          "Error: No se encontrÃ³ un profesor activo con el ID proporcionado."
        );
        return fail(
          400,
          "No se encontrÃ³ un profesor activo con el ID proporcionado."
        );
      }

      idhorario = profesorData.rows[0].idhorario;
      console.log("IDHorario del profesor:", idhorario);
    } else if (idPsicologo) {
      const psicologoData = await repository.fetchPsicologoHorarioId(idPsicologo);

      if (psicologoData.rows.length === 0) {
        console.error(
          "Error: No se encontrÃ³ un psicÃ³logo activo con el ID proporcionado."
        );
        return fail(
          400,
          "No se encontrÃ³ un psicÃ³logo activo con el ID proporcionado."
        );
      }

      idhorario = psicologoData.rows[0].idhorario;
      console.log("IDHorario del psicÃ³logo:", idhorario);
    }

    // Obtener horario asociado al idhorario
    const horarioData = await repository.fetchHorarioPorId(idhorario);

    if (horarioData.rows.length === 0) {
      console.error(
        "Error: No se encontrÃ³ un horario vÃ¡lido para el idhorario proporcionado."
      );
      return fail(
        400,
        "No se encontrÃ³ un horario vÃ¡lido para el idhorario proporcionado."
      );
    }

    const { horainicio, horafin } = horarioData.rows[0];
    console.log("Horario asociado encontrado:", { horainicio, horafin });

    // Obtener entrevistas para la fecha especificada, pero filtrando por el idProfesor o idPsicologo
    const entrevistas = await repository.fetchEntrevistasPorFechaYProfesional(
      fecha,
      idProfesor,
      idPsicologo
    );

    if (entrevistas.rows.length === 0) {
      console.log("No se encontraron entrevistas para la fecha especificada.");
      return ok([]);
    }

    console.log("Entrevistas obtenidas:", entrevistas.rows);

    // Recalcular las horas basÃ¡ndose en el horario del usuario
    const entrevistasRecalculadas = [];
    let horaActual = horainicio;

    for (const entrevista of entrevistas.rows) {
      const duracion =
        entrevista.prioridad.toLowerCase() === "alta"
          ? 25
          : entrevista.prioridad.toLowerCase() === "media"
          ? 20
          : 10;

      const [horas, minutos] = horaActual.split(":").map(Number);
      const nuevaHoraFinMinutos = horas * 60 + minutos + duracion;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevaHoraFinRestantesMinutos = nuevaHoraFinMinutos % 60;

      const nuevaHoraFin = `${String(nuevaHoraFinHoras).padStart(
        2,
        "0"
      )}:${String(nuevaHoraFinRestantesMinutos).padStart(2, "0")}:00`;

      if (nuevaHoraFin > horafin) {
        console.log(
          `Entrevista ID ${entrevista.idreservarentrevista} excede el horario permitido. Fin calculado: ${nuevaHoraFin}, Fin permitido: ${horafin}`
        );
        break;
      }

      entrevistasRecalculadas.push({
        ...entrevista,
        horainicio: horaActual,
        horafin: nuevaHoraFin,
      });

      console.log(
        `Entrevista ID ${entrevista.idreservarentrevista} recalculada. Inicio: ${horaActual}, Fin: ${nuevaHoraFin}`
      );

      horaActual = nuevaHoraFin;
    }

    console.log(
      "Entrevistas recalculadas finalizadas:",
      entrevistasRecalculadas
    );

    return ok(entrevistasRecalculadas);
  } catch (error) {
    console.error("Error al obtener las entrevistas por fecha:", error.message);
    return fail(
      500,
      `Error al obtener las entrevistas por fecha: ${error.message}`
    );
  }
};

export const insertarReservaEntrevista = async (payload) => {
  const {
    idProfesor,
    idPsicologo,
    idPadre,
    idEstudiante: idEstudianteBody,
    idestudiante: idEstudianteLower,
    fecha,
    idMotivo,
    descripcion,
    idMateria: idMateriaBody,
    idmateria: idMateriaLower,
  } = payload;

  const idEstudiante = idEstudianteBody ?? idEstudianteLower;
  const idMateria = idMateriaBody ?? idMateriaLower;
  const descripcionPadre = "Entrevista agendada por el padre de familia";
  const descripcionFinal = descripcionPadre;

  console.log("Datos recibidos del frontend:", payload);

  try {
    // Validar campos obligatorios
    if (
      (!idProfesor && !idPsicologo) ||
      !idPadre ||
      !idEstudiante ||
      !fecha ||
      !idMotivo
    ) {
      return fail(400, "Todos los campos obligatorios deben ser completados.");
    }

    const validacionRelacion = await validarPadreEstudianteActivos(
      idPadre,
      idEstudiante
    );

    if (!validacionRelacion.valido) {
      return fail(400, validacionRelacion.mensaje);
    }

    // Validar motivo y obtener su prioridad
    const motivoCheck = await repository.fetchMotivoPrioridad(idMotivo);

    if (motivoCheck.rows.length === 0) {
      return fail(400, "Motivo no vÃ¡lido.");
    }

    const { nombremotivo, tipoprioridad } = motivoCheck.rows[0];
    const duracionAtencion =
      tipoprioridad.toLowerCase() === "alta"
        ? 25
        : tipoprioridad.toLowerCase() === "media"
        ? 20
        : 10;

    // Obtener el horario y materia del profesor o psicÃ³logo
    const horarioData = await repository.fetchHorarioByProfesional({
      idProfesor,
      idPsicologo,
    });

    if (horarioData.rows.length === 0) {
      return fail(400, "No se encontrÃ³ un horario vÃ¡lido.");
    }

    const { horainicio, horafin, materia, idmateria: materiaIdHorario } =
      horarioData.rows[0];

    const entrevistasExistentes =
      await obtenerEntrevistasActivasPorPadreYFecha(
        idPadre,
        idEstudiante,
        fecha
      );
    const materiaActualId = materiaIdHorario ?? idMateria;
    const entrevistaMismaMateria = encontrarEntrevistaMismaMateria({
      entrevistas: entrevistasExistentes,
      idProfesor,
      idPsicologo,
      idMateriaActual: materiaActualId,
      materiaActualNombre: materia,
    });

    if (entrevistaMismaMateria) {
      const materiaExistente =
        entrevistaMismaMateria.materia || "el profesional asignado";
      return fail(
        400,
        `El padre de familia ya tiene una entrevista programada para ${fecha} con ${materiaExistente}.`
      );
    }

    // Obtener entrevistas existentes para la fecha
    const entrevistasPrevias = await repository.fetchEntrevistasPrevias(
      fecha,
      idProfesor,
      idPsicologo
    );

    let horaActual = horainicio;
    const recalculatedInterviews = [];

    // Procesar entrevistas previas y recalcular horarios
    for (const entrevista of entrevistasPrevias.rows) {
      const duracion =
        entrevista.prioridad.toLowerCase() === "alta"
          ? 25
          : entrevista.prioridad.toLowerCase() === "media"
          ? 20
          : 10;

      const [horas, minutos] = horaActual.split(":").map(Number);
      const nuevaHoraFinMinutos = horas * 60 + minutos + duracion;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevaHoraFinRestantesMinutos = nuevaHoraFinMinutos % 60;

      const nuevaHoraFin = `${String(nuevaHoraFinHoras).padStart(
        2,
        "0"
      )}:${String(nuevaHoraFinRestantesMinutos).padStart(2, "0")}:00`;

      if (nuevaHoraFin > horafin) {
        console.log(
          `No hay espacio disponible para la entrevista ID ${entrevista.idreservarentrevista}.`
        );
        break;
      }

      recalculatedInterviews.push({
        ...entrevista,
        horainicio: horaActual,
        horafin: nuevaHoraFin,
      });

      horaActual = nuevaHoraFin;
    }

    // Validar espacio para la nueva entrevista
    const nuevaEntrevistaInicio = horaActual;
    const nuevaEntrevistaFinMinutos =
      Number(nuevaEntrevistaInicio.split(":")[0]) * 60 +
      Number(nuevaEntrevistaInicio.split(":")[1]) +
      duracionAtencion;

    const nuevaEntrevistaFin = `${String(
      Math.floor(nuevaEntrevistaFinMinutos / 60)
    ).padStart(2, "0")}:${String(nuevaEntrevistaFinMinutos % 60).padStart(
      2,
      "0"
    )}:00`;

    if (nuevaEntrevistaFin > horafin) {
      console.log(
        "La nueva entrevista excede el horario permitido. SerÃ¡ marcada como no vÃ¡lida."
      );

      // Enviar correos a las entrevistas vÃ¡lidas
      for (const entrevista of recalculatedInterviews) {
        const emailQuery = await repository.fetchPadreEmail(entrevista.idpadre);
        const { email } = emailQuery.rows[0] || {};

        let profesional;
        if (idPsicologo) {
          // Consultar los datos del psicÃ³logo
          const psicologoQuery = await repository.fetchPsicologoNombre(idPsicologo);

          if (psicologoQuery.rows.length === 0) {
            console.error("Error: PsicÃ³logo no encontrado.");
            return fail(400, "PsicÃ³logo no encontrado.");
          }
          profesional = psicologoQuery.rows[0];
        } else if (idProfesor) {
          // Consultar los datos del profesor
          const profesorQuery = await repository.fetchProfesorNombre(idProfesor);

          if (profesorQuery.rows.length === 0) {
            console.error("Error: Profesor no encontrado.");
            return fail(400, "Profesor no encontrado.");
          }
          profesional = profesorQuery.rows[0];
        }

        // Construir el objeto profesor para incluir los nombres y apellidos
        const profesorData = {
          nombres: profesional.nombres,
          apellidopaterno: profesional.apellidopaterno,
          apellidomaterno: profesional.apellidomaterno,
        };

        // Llamar a la funciÃ³n enviarCorreoPadres con los datos correctos
        const profesionalTitulo = idPsicologo ? "Psicologo" : "Profesor";

        await enviarCorreoPadres({
          idPadre: entrevista.idpadre,
          motivo: entrevista.nombremotivo,
          materia,
          fecha,
          horario: entrevista.horainicio,
          horafin: entrevista.horafin,
          descripcion: descripcionFinal,
          profesor: profesorData,
          profesionalTitulo, // Incluir los datos del profesor o psicÃ³logo
        });

        console.log(`Correo enviado a: ${email}`);
      }

      return fail(
        400,
        "La nueva entrevista excede el horario permitido. Correos enviados para las entrevistas vÃ¡lidas."
      );
    } else {
      const estadoPendienteId = await getEstadoId("Pendiente");
      await repository.insertReservaEntrevista({
        idProfesor,
        idPsicologo,
        idPadre,
        idEstudiante,
        fecha,
        descripcion: descripcionFinal,
        idMotivo,
        idEstado: estadoPendienteId,
      });

      recalculatedInterviews.push({
        idpadre: idPadre,
        nombremotivo: nombremotivo,
        prioridad: tipoprioridad,
        horainicio: nuevaEntrevistaInicio,
        horafin: nuevaEntrevistaFin,
      });

      console.log("Nueva entrevista insertada correctamente.");
    }

    return ok({
      message:
        "Nueva entrevista agendada y procesada correctamente. Se confirmara la hora a su correo a las 20:00",
      success: true, // Indicamos que fue exitoso
    });
  } catch (error) {
    console.error("Error al insertar la reserva de entrevista:", error);
    return fail(500, "Error al insertar la reserva de entrevista.");
  }
};

export const enviarCorreoPadres = async ({
  idPadre,
  motivo,
  materia,
  fecha,
  horario,
  horafin, // Recibir el nuevo parÃ¡metro
  descripcion,
  profesor,
  profesionalTitulo,
}) => {
  console.log("Datos recibidos para enviar correo:", {
    idPadre,
    motivo,
    materia,
    fecha,
    horario,
    horafin, // Mostrar tambiÃ©n el valor de horafin
    descripcion,
    profesor,
  });

  try {
    // Verificar que todos los campos requeridos esten presentes
    if (
      !idPadre ||
      !motivo ||
      !materia ||
      !fecha ||
      !horario ||
      !horafin ||
      !profesor
    ) {
      console.error("Faltan datos para enviar el correo", {
        idPadre,
        motivo,
        materia,
        fecha,
        horario,
        horafin,
        descripcion,
        profesor,
      });
      return;
    }

    // Obtener informacion del padre de familia desde la base de datos
    const padreQuery = await repository.fetchPadreContacto(idPadre);

    if (padreQuery.rows.length === 0) {
      console.error("Padre de familia no encontrado para idPadre:", idPadre);
      return;
    }

    const padre = padreQuery.rows[0];
    const nombresPadre = `${padre.nombres} ${padre.apellidopaterno} ${padre.apellidomaterno}`;
    const emailPadre = padre.email;

    if (!emailPadre) {
      console.error(
        "Correo electrÃ³nico del padre no encontrado para idpadre:",
        idPadre
      );
      return;
    }

    console.log("Correo a enviar a:", emailPadre);
    const nombreProfesor =
      typeof profesor === "string"
        ? profesor.trim()
        : [profesor?.nombres, profesor?.apellidopaterno, profesor?.apellidomaterno]
            .filter(Boolean)
            .join(" ")
            .trim();

    const titulo = profesionalTitulo || "Profesor";
    const profesionalLabel = nombreProfesor
      ? `${titulo}: ${nombreProfesor}`
      : `${titulo}: Profesional IDEB`;

    const { html, text } = buildEntrevistaEmailContent({
      destinatario: nombresPadre,
      motivo,
      materia,
      fecha,
      horaInicio: horario,
      horaFin: horafin,
      descripcion,
      profesional: profesionalLabel,
    });
    const { provider } = await sendEmailWithFallback({
      to: emailPadre,
      subject: "Confirmacion de entrevista IDEB",
      text,
      html,
    });

    console.log(`Correo enviado a: ${emailPadre} (proveedor: ${provider})`);
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
  }
};

export const eliminarEntrevista = async ({ idReservarEntrevista, nuevoEstado }) => {
  try {
    // Validar que se proporcionen los datos necesarios
    if (!idReservarEntrevista || nuevoEstado === undefined) {
      return fail(
        400,
        "Faltan datos requeridos para cambiar el estado de la entrevista."
      );
    }

    // Normalizar a idestado (1=Pendiente, 2=Completado, 3=Cancelado)
    let idEstado = null;
    if (typeof nuevoEstado === "number") {
      idEstado = nuevoEstado;
    } else if (typeof nuevoEstado === "string" && nuevoEstado.trim() !== "") {
      const normalized = nuevoEstado.trim().toLowerCase();
      if (["1", "pendiente"].includes(normalized)) idEstado = 1;
      else if (["2", "completado", "completada", "true"].includes(normalized))
        idEstado = 2;
      else if (["3", "cancelado", "cancelada", "false", "no realizado"].includes(normalized))
        idEstado = 3;
    } else if (typeof nuevoEstado === "boolean") {
      idEstado = nuevoEstado ? 2 : 3;
    }

    if (![1, 2, 3].includes(idEstado)) {
      return fail(
        400,
        "nuevoEstado debe ser 1 (Pendiente), 2 (Completado) o 3 (Cancelado)"
      );
    }

    // Actualizar el estado de la entrevista en la base de datos
    const resultado = await repository.updateEntrevistaEstado(
      idEstado,
      idReservarEntrevista
    );

    // Verificar si se encontrÃ³ la entrevista
    if (resultado.rows.length === 0) {
      return fail(404, "Entrevista no encontrada.");
    }

    const mensajeEstado =
      idEstado === 2 ? "completado" : idEstado === 3 ? "cancelado" : "pendiente";
    return ok({
      message: `Estado de la entrevista actualizado a ${mensajeEstado}`,
      entrevista: resultado.rows[0],
    });
  } catch (error) {
    console.error(
      "Error al cambiar el estado de la entrevista:",
      error.message
    );
    return fail(500, "Error al cambiar el estado de la entrevista.");
  }
};

export const obtenerListaEntrevistaPorRango = async (startDate, endDate) => {
  try {
    const citas = await repository.fetchEntrevistasPorRango(startDate, endDate);

    // Procesar los resultados para incluir nuevaHorafinEntrevista
    const duracionAtencion = 25; // Puedes ajustar esto segÃºn la prioridad si es necesario

    const citasConNuevaHora = citas.rows.map((cita) => {
      // Si horafinentrevista es null, no se puede calcular la nueva hora
      if (!cita.horafinentrevista) {
        return { ...cita, nuevaHorafinEntrevista: "No disponible" };
      }

      const [horas, minutos] = cita.horafinentrevista.split(":").map(Number);
      const nuevaHoraFinMinutos = horas * 60 + minutos + duracionAtencion;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevaHoraFinRestantesMinutos = nuevaHoraFinMinutos % 60;
      const nuevaHorafinEntrevista = `${String(nuevaHoraFinHoras).padStart(
        2,
        "0"
      )}:${String(nuevaHoraFinRestantesMinutos).padStart(2, "0")}:00`;

      return { ...cita, nuevaHorafinEntrevista };
    });

    return ok(citasConNuevaHora);
  } catch (error) {
    console.error("Error al obtener la lista de entrevistas:", error.message);
    return fail(
      500,
      `Error al obtener la lista de entrevistas: ${error.message}`
    );
  }
};

export const verEntrevistasPadres = async (idPadre) => {
  try {
    if (!idPadre) {
      return fail(400, "El idPadre es obligatorio");
    }

    const entrevistas = await repository.fetchEntrevistasPorPadre(idPadre);

    return ok(entrevistas.rows || []);
  } catch (error) {
    console.error("Error al obtener el historial de citas:", error.message);
    return fail(500, "Error al obtener el historial de citas");
  }
};
