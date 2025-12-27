import { pool } from "../db.js";

const quickActions = [
  { title: "Actas", subtitle: "Registrar cambios", badge: "ACT", route: "/profesores/actas" },
  { title: "Plan", subtitle: "Semana en curso", badge: "PLAN", route: "/profesores/planificacion" },
  { title: "Grupos", subtitle: "Listado por aula", badge: "AULAS", route: "/profesores/estudiantes" },
];

export const obtenerPanelDocente = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    const { rows: docenteRows } = await pool.query(
      `
        SELECT
          idprofesor,
          nombres,
          apellidopaterno,
          apellidomaterno,
          idmateria
        FROM profesor
        WHERE idprofesor = $1
          AND COALESCE(estado::text, '') = 'true'
      `,
      [idProfesor]
    );

    if (docenteRows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado o inactivo" });
    }

    const docente = docenteRows[0];
    const idMateria = docente.idmateria;

    const { rows: statsRows } = await pool.query(
      `
        SELECT
          COALESCE((
            SELECT COUNT(*)::int
            FROM horario
            WHERE idmateria = $1
              AND COALESCE(estado::text, '') IN ('true', 't', '1')
          ), 0) AS cursos,
          COALESCE((
            SELECT COUNT(*)::int
            FROM actadereunion
            WHERE idmateria = $1
              AND COALESCE(estado::text, '') IN ('true', 't', '1')
          ), 0) AS actas,
          COALESCE((
            SELECT COUNT(*)::int
            FROM reservarentrevista
            WHERE idprofesor = $2
              AND fecha >= CURRENT_DATE
          ), 0) AS avisos
      `,
      [idMateria, idProfesor]
    );

    const { rows: todayRows } = await pool.query(
      `
        SELECT
          COALESCE((
            SELECT COUNT(*)::int
            FROM actadereunion
            WHERE idmateria = $1
              AND COALESCE(estado::text, '') IN ('true', 't', '1')
              AND DATE(fechadecreacion) = CURRENT_DATE
          ), 0) AS actas_hoy,
          COALESCE((
            SELECT COUNT(*)::int
            FROM reservarentrevista
            WHERE idprofesor = $2
              AND fecha = CURRENT_DATE
          ), 0) AS entrevistas_programadas,
          COALESCE((
            SELECT COUNT(*)::int
            FROM reservarentrevista
            WHERE idprofesor = $2
              AND fecha = CURRENT_DATE
              AND COALESCE(estado::text, '') IN ('true', 't', '1')
          ), 0) AS citas_enviadas
      `,
      [idMateria, idProfesor]
    );

    const stats = statsRows.length
      ? statsRows[0]
      : { cursos: 0, actas: 0, avisos: 0 };

    const today = todayRows.length
      ? todayRows[0]
      : { actas_hoy: 0, entrevistas_programadas: 0, citas_enviadas: 0 };

    const response = {
      docente: {
        id: docente.idprofesor,
        nombre: `${docente.nombres ?? ""} ${docente.apellidopaterno ?? ""} ${docente.apellidomaterno ?? ""}`.replace(/\s+/g, " ").trim(),
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

    return res.json(response);
  } catch (error) {
    console.error("Error al obtener el panel docente:", error);
    return res.status(500).json({ error: "Error al obtener el panel docente" });
  }
};
