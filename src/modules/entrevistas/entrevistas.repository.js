import { pool } from "../../db.js";

export const fetchPadreEstado = (idPadre) =>
  pool.query("SELECT estado FROM padredefamilia WHERE idpadre = $1", [idPadre]);

export const fetchEstudianteEstado = (idEstudiante) =>
  pool.query("SELECT estado FROM estudiante WHERE idestudiante = $1", [idEstudiante]);

export const fetchVinculoPadreEstudiante = (idPadre, idEstudiante) =>
  pool.query(
    "SELECT estado FROM padre_estudiante WHERE idpadre = $1 AND idestudiante = $2",
    [idPadre, idEstudiante]
  );

export const fetchEntrevistasActivasPorPadreYFecha = (idPadre, idEstudiante, fecha) => {
  const params = [idPadre, fecha];
  let filtroEstudiante = "";

  if (idEstudiante) {
    params.push(idEstudiante);
    filtroEstudiante = ` AND re.idestudiante = $${params.length}`;
  }

  return pool.query(
    `SELECT 
       re.idreservarentrevista,
       re.idprofesor,
       re.idpsicologo,
       CASE 
         WHEN re.idpsicologo IS NOT NULL THEN NULL
         ELSE m.idmateria
       END AS idmateria,
       CASE 
         WHEN re.idpsicologo IS NOT NULL THEN 'Psicologo'
         ELSE COALESCE(m.nombre, 'el profesional asignado')
       END AS materia
     FROM reservarentrevista re
     LEFT JOIN profesor prof ON re.idprofesor = prof.idprofesor
     LEFT JOIN horario h ON prof.idhorario = h.idhorario
     LEFT JOIN materia m ON h.idmateria = m.idmateria
     WHERE re.idpadre = $1
       AND re.fecha = $2
       ${filtroEstudiante}
       AND re.idestado <> 3
     ORDER BY re.idreservarentrevista`,
    params
  );
};

export const fetchEstadoIdByNombre = (nombre) =>
  pool.query(
    `SELECT "idEstado" AS id FROM t_estados WHERE LOWER(nombre) = LOWER($1) LIMIT 1`,
    [nombre]
  );

export const insertEstado = (nombre) =>
  pool.query(
    `INSERT INTO t_estados (nombre, descripcion)
     VALUES ($1, '')
     RETURNING "idEstado" AS id`,
    [nombre]
  );

export const fetchMotivoPrioridad = (idMotivo) =>
  pool.query(
    `SELECT m.nombremotivo, p.tipoprioridad 
     FROM motivo m 
     JOIN prioridad p ON m.idprioridad = p.idprioridad 
     WHERE m.idmotivo = $1 AND m.estado = TRUE`,
    [idMotivo]
  );

export const fetchHorarioByProfesional = ({ idProfesor, idPsicologo }) => {
  const query = `
      SELECT h.horainicio::text,
             h.horafin::text,
             ${idProfesor ? "m.nombre AS materia" : "'Psicologo' AS materia"},
             ${idProfesor ? "m.idmateria AS idmateria" : "NULL::integer AS idmateria"} 
      FROM horario h
      LEFT JOIN materia m ON h.idmateria = m.idmateria
      WHERE h.idhorario = (
        SELECT idhorario FROM ${idProfesor ? "profesor" : "psicologo"} 
        WHERE ${idProfesor ? "idprofesor" : "idpsicologo"} = $1 AND estado = TRUE
      )
    `;
  return pool.query(query, [idProfesor || idPsicologo]);
};

export const fetchEntrevistasPrevias = (fecha, idProfesor, idPsicologo) =>
  pool.query(
    `SELECT re.idreservarentrevista, re.idpadre, m.nombremotivo, pr.tipoprioridad AS prioridad
     FROM reservarentrevista re
     JOIN motivo m ON re.idmotivo = m.idmotivo
     JOIN prioridad pr ON m.idprioridad = pr.idprioridad
     WHERE re.fecha = $1
     AND re.idestado <> 3
     AND (
       (re.idprofesor = $2 AND $2 IS NOT NULL) OR 
       (re.idpsicologo = $3 AND $3 IS NOT NULL)
     )
     ORDER BY CASE 
                WHEN pr.tipoprioridad = 'Alta' THEN 1
                WHEN pr.tipoprioridad = 'Media' THEN 2
                ELSE 3 
              END, re.idreservarentrevista`,
    [fecha, idProfesor, idPsicologo]
  );

export const insertReservaEntrevista = ({
  idProfesor,
  idPsicologo,
  idPadre,
  idEstudiante,
  fecha,
  descripcion,
  idMotivo,
  idEstado,
}) =>
  pool.query(
    `INSERT INTO reservarentrevista 
     (idprofesor, idpsicologo, idpadre, idestudiante, fecha, descripcion, idmotivo, idestado) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [idProfesor, idPsicologo, idPadre, idEstudiante, fecha, descripcion, idMotivo, idEstado]
  );

export const fetchPadreContacto = (idPadre) =>
  pool.query(
    "SELECT nombres, apellidopaterno, apellidomaterno, email FROM padredefamilia WHERE idpadre = $1",
    [idPadre]
  );

export const fetchProfesorContacto = (idProfesor) =>
  pool.query(
    "SELECT nombres, apellidopaterno, apellidomaterno, email FROM profesor WHERE idprofesor = $1",
    [idProfesor]
  );

export const fetchPsicologoContacto = (idPsicologo) =>
  pool.query(
    "SELECT nombres, apellidopaterno, apellidomaterno, email FROM psicologo WHERE idpsicologo = $1",
    [idPsicologo]
  );

export const fetchHorarioPorIdConDia = (idhorario) =>
  pool.query(
    `SELECT horainicio::text, horafin::text, dia 
     FROM horario 
     WHERE idhorario = $1 AND estado = TRUE`,
    [idhorario]
  );

export const fetchHorarioPorId = (idhorario) =>
  pool.query(
    `SELECT horainicio::text, horafin::text 
     FROM horario 
     WHERE idhorario = $1 AND estado = TRUE`,
    [idhorario]
  );

export const fetchEntrevistasHoy = () =>
  pool.query(
    `SELECT 
       re.idreservarentrevista,
       TO_CHAR(re.fecha, 'YYYY-MM-DD') AS fecha,
       re.descripcion,
       CONCAT(p.nombres, ' ', p.apellidopaterno, ' ', p.apellidomaterno) AS nombre_completo,
       p.email,
       m.nombremotivo AS motivo,
       pr.tipoprioridad AS prioridad,
       re.idestado,
       COALESCE(te.nombre, 'Pendiente') AS estado,
       re.idpadre,
       re.idestudiante,
       CONCAT(e.nombres, ' ', e.apellidopaterno, ' ', e.apellidomaterno) AS nombre_estudiante
     FROM reservarentrevista re
     JOIN padredefamilia p ON re.idpadre = p.idpadre
     JOIN motivo m ON re.idmotivo = m.idmotivo
     JOIN prioridad pr ON m.idprioridad = pr.idprioridad
     LEFT JOIN estudiante e ON e.idestudiante = re.idestudiante
     LEFT JOIN t_estados te ON te."idEstado" = re.idestado
     WHERE re.fecha = CURRENT_DATE
      ORDER BY CASE 
                 WHEN pr.tipoprioridad = 'Alta' THEN 1
                 WHEN pr.tipoprioridad = 'Media' THEN 2
                 ELSE 3 
               END, re.idreservarentrevista`
  );

export const fetchProfesorHorarioId = (idProfesor) =>
  pool.query(
    `SELECT idhorario 
     FROM Profesor 
     WHERE idprofesor = $1 AND estado = TRUE`,
    [idProfesor]
  );

export const fetchPsicologoHorarioId = (idPsicologo) =>
  pool.query(
    `SELECT idhorario 
     FROM Psicologo 
     WHERE idpsicologo = $1 AND estado = TRUE`,
    [idPsicologo]
  );

export const fetchEntrevistasPorFechaYProfesional = (fecha, idProfesor, idPsicologo) =>
  pool.query(
    `SELECT 
       re.idreservarentrevista,
       TO_CHAR(re.fecha, 'YYYY-MM-DD') AS fecha,
       re.descripcion,
       CONCAT(p.nombres, ' ', p.apellidopaterno, ' ', p.apellidomaterno) AS nombre_completo,
       p.email,
       m.nombremotivo AS motivo,
       pr.tipoprioridad AS prioridad,
       re.idestado,
       COALESCE(te.nombre, 'Pendiente') AS estado,
       re.idpadre,
       re.idestudiante,
       CONCAT(e.nombres, ' ', e.apellidopaterno, ' ', e.apellidomaterno) AS nombre_estudiante
     FROM reservarentrevista re
     JOIN padredefamilia p ON re.idpadre = p.idpadre
     JOIN motivo m ON re.idmotivo = m.idmotivo
     JOIN prioridad pr ON m.idprioridad = pr.idprioridad
     LEFT JOIN estudiante e ON e.idestudiante = re.idestudiante
     LEFT JOIN t_estados te ON te."idEstado" = re.idestado
     WHERE TO_CHAR(re.fecha, 'YYYY-MM-DD') = $1
     AND (
       (re.idprofesor = $2 AND $2 IS NOT NULL) OR
       (re.idpsicologo = $3 AND $3 IS NOT NULL)
     )
     ORDER BY CASE 
                WHEN pr.tipoprioridad = 'Alta' THEN 1
                WHEN pr.tipoprioridad = 'Media' THEN 2
                ELSE 3 
              END, re.idreservarentrevista`,
    [fecha, idProfesor, idPsicologo]
  );

export const fetchPadreEmail = (idPadre) =>
  pool.query("SELECT email FROM padredefamilia WHERE idpadre = $1", [idPadre]);

export const fetchProfesorNombre = (idProfesor) =>
  pool.query(
    `SELECT nombres, apellidopaterno, apellidomaterno 
     FROM profesor 
     WHERE idprofesor = $1`,
    [idProfesor]
  );

export const fetchPsicologoNombre = (idPsicologo) =>
  pool.query(
    `SELECT nombres, apellidopaterno, apellidomaterno 
     FROM psicologo 
     WHERE idpsicologo = $1`,
    [idPsicologo]
  );

export const updateEntrevistaEstado = (idEstado, idReservarEntrevista) =>
  pool.query(
    `UPDATE reservarentrevista 
     SET idestado = $1 
     WHERE idreservarentrevista = $2
     RETURNING *`,
    [idEstado, idReservarEntrevista]
  );

export const fetchEntrevistasPorRango = (startDate, endDate) =>
  pool.query(
    `
    SELECT 
      re.idreservarentrevista,
      TO_CHAR(re.fecha, 'YYYY-MM-DD') AS fecha,
      re.descripcion,
      TO_CHAR(re.horafinentrevista, 'HH24:MI:SS') AS horainicio,
      p.nombres,
      p.apellidopaterno,
      p.apellidomaterno,
      p.email,
      re.idpadre,
      re.idestudiante,
      CONCAT(e.nombres, ' ', e.apellidopaterno, ' ', e.apellidomaterno) AS estudiante,
      re.idestado,
      COALESCE(te.nombre, 'Pendiente') AS estado_nombre,
      CASE 
        WHEN re.idestado = 2 THEN 'Completado'
        WHEN re.idestado = 3 THEN 'Cancelado'
        ELSE 'Pendiente'
      END AS accion,
      re.horafinentrevista
    FROM reservarentrevista re
    JOIN padredefamilia p ON re.idpadre = p.idpadre
    LEFT JOIN estudiante e ON e.idestudiante = re.idestudiante
    LEFT JOIN t_estados te ON te."idEstado" = re.idestado
    WHERE re.fecha BETWEEN $1 AND $2
    ORDER BY re.fecha ASC
    `,
    [startDate, endDate]
  );

export const fetchEntrevistasPorPadre = (idPadre) =>
  pool.query(
    `
    SELECT 
      re.idreservarentrevista AS id,
      TO_CHAR(re.fecha, 'YYYY-MM-DD') AS fecha,
      COALESCE(
        CONCAT(prof.nombres, ' ', prof.apellidopaterno, ' ', prof.apellidomaterno),
        CONCAT(ps.nombres, ' ', ps.apellidopaterno, ' ', ps.apellidomaterno),
        'Profesional IDEB'
      ) AS profesor,
      COALESCE(mprof.nombre, mps.nombre, 'Psicologo') AS materia,
      COALESCE(hprof.horainicio::text, hps.horainicio::text) AS horainicio,
      COALESCE(hprof.horafin::text, hps.horafin::text) AS horafin,
      COALESCE(te.nombre, 'Pendiente') AS estado,
      ar.idacta AS acta_id,
      TO_CHAR(ar.fechadecreacion, 'YYYY-MM-DD') AS acta_fechadecreacion,
      ar.descripcion AS acta_descripcion,
      am.nombremotivo AS acta_motivo,
      ma.nombre AS acta_materia,
      re.idestudiante,
      CONCAT(e.nombres, ' ', e.apellidopaterno, ' ', e.apellidomaterno) AS estudiante
    FROM reservarentrevista re
    LEFT JOIN profesor prof ON re.idprofesor = prof.idprofesor
    LEFT JOIN psicologo ps ON re.idpsicologo = ps.idpsicologo
    LEFT JOIN horario hprof ON prof.idhorario = hprof.idhorario
    LEFT JOIN materia mprof ON hprof.idmateria = mprof.idmateria
    LEFT JOIN horario hps ON ps.idhorario = hps.idhorario
    LEFT JOIN materia mps ON COALESCE(ps.idmateria, hps.idmateria) = mps.idmateria
    LEFT JOIN actadereunion ar ON ar.idreservarentrevista = re.idreservarentrevista AND ar.estado = true
    LEFT JOIN motivo am ON ar.idmotivo = am.idmotivo
    LEFT JOIN materia ma ON ar.idmateria = ma.idmateria
    LEFT JOIN estudiante e ON e.idestudiante = re.idestudiante
    LEFT JOIN t_estados te ON te."idEstado" = re.idestado
    WHERE re.idpadre = $1
    ORDER BY re.fecha ASC,
             COALESCE(hprof.horainicio, hps.horainicio) ASC,
             re.idreservarentrevista ASC;
  `,
    [idPadre]
  );
