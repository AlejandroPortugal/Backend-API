import * as repository from "./inicioDocente.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

const quickActions = [
  { title: "Actas", subtitle: "Registrar cambios", badge: "ACT", route: "/profesores/actas" },
  { title: "Plan", subtitle: "Semana en curso", badge: "PLAN", route: "/profesores/planificacion" },
  { title: "Grupos", subtitle: "Listado por aula", badge: "AULAS", route: "/profesores/estudiantes" },
];

export const obtenerPanelDocente = async (idProfesor) => {
  const { rows: profesorRows } = await repository.fetchProfesorPanel(idProfesor);

  let docente = profesorRows[0];
  let docenteTipo = "Profesor";

  if (!docente) {
    const { rows: psicologoRows } = await repository.fetchPsicologoPanel(idProfesor);
    docente = psicologoRows[0];
    docenteTipo = "Psicologo";
  }

  if (!docente) {
    return fail(404, "Docente no encontrado o inactivo");
  }

  const idMateria = docente.idmateria || null;
  const docenteId = docenteTipo === "Profesor" ? docente.idprofesor : docente.idpsicologo;
  const entrevistaColumna = docenteTipo === "Profesor" ? "idprofesor" : "idpsicologo";

  const { rows: statsRows } = await repository.fetchDocenteStats(
    idMateria,
    docenteId,
    entrevistaColumna
  );

  const { rows: todayRows } = await repository.fetchDocenteTodayStats(
    idMateria,
    docenteId,
    entrevistaColumna
  );

  const stats = statsRows.length ? statsRows[0] : { cursos: 0, actas: 0, avisos: 0 };
  const today = todayRows.length
    ? todayRows[0]
    : { actas_hoy: 0, entrevistas_programadas: 0, citas_enviadas: 0 };

  const response = {
    docente: {
      id: docenteId,
      nombre: `${docente.nombres ?? ""} ${docente.apellidopaterno ?? ""} ${
        docente.apellidomaterno ?? ""
      }`
        .replace(/\s+/g, " ")
        .trim(),
      idMateria,
    },
    stats: [
      { label: "Cursos", value: String(stats.cursos ?? 0) },
      { label: "Actas", value: String(stats.actas ?? 0) },
      { label: "Avisos", value: String(stats.avisos ?? 0) },
    ],
    quickActions,
    todayPanels: [
      {
        title: "Actas de hoy",
        value: String(today.actas_hoy ?? 0),
        detail: today.actas_hoy === 0 ? "Sin cursos pendientes" : "Cursos pendientes de registrar",
        actionLabel: "Abrir actas",
        route: "/profesores/actas",
      },
      {
        title: "Entrevistas programadas",
        value: String(today.entrevistas_programadas ?? 0),
        detail: "Reuniones con familias",
        actionLabel: "Ver entrevistas",
        route: "/profesores/entrevistas",
      },
      {
        title: "Citas enviadas",
        value: String(today.citas_enviadas ?? 0),
        detail: "Notificaciones compartidas",
        actionLabel: "Revisar citas",
        route: "/profesores/citas",
      },
    ],
  };

  return ok(response);
};
