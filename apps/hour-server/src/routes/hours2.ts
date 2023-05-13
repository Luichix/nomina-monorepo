import { Router, Request, Response } from 'express';
import pool from '../database/connection';
import {
  isEntryExitConsistent,
  isValidDate,
  isValidateNotFutureDate,
} from './helpers/validation';

const routerEmployees = Router();

// Ruta para obtener todos los registros de horas de un empleado

// Ruta para crear un nuevo registro de horas para un empleado
routerEmployees.post('/:id', async (req, res) => {
  const idEmpleado = req.params.id;
  // const { date, startTime, endTime } = req.body;
  const { fecha, horaInicio, horaFin } = req.body;

  // Validar que la fecha sea válida
  if (!isValidDate(fecha)) {
    res.status(400).send('Fecha inválida');
    return;
  }

  // Validar que la fecha no sea futura

  if (!isValidateNotFutureDate(fecha)) {
    res.status(400).send('Fecha inválida');
    return;
  }

  // Validar que la hora de entrada y salida sean consistentes
  if (!isEntryExitConsistent(horaInicio, horaFin)) {
    res.status(400).send('Hora de entrada y salida no son consistentes');
    return;
  }

  async function isValidWorkHours(
    entry: string,
    exit: string,
    company: string
  ): Promise<boolean> {
    // Obtenemos la configuración de la empresa desde la base de datos
    const config = await pool.one(
      'SELECT * FROM company_config WHERE company_name = $1',
      [company]
    );

    // Validamos que la hora de entrada sea anterior a la hora de salida
    if (entry >= exit) {
      return false;
    }

    // Validamos que la diferencia entre la hora de entrada y la hora de salida esté dentro de los valores mínimos
  }

  try {
    const { rows: registroHora } = await pool.query(
      `INSERT INTO registros_horas (fecha, hora_inicio, hora_fin, empleado_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [fecha, horaInicio, horaFin, idEmpleado]
    );
    res.status(201).send(registroHora[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando el registro de horas');
  }
});

// Obtener registros de tiempo para un período quincenal específico
routerEmployees.get(
  '/quincenal/:empleado/:fecha_inicio',
  async (req: Request, res: Response) => {
    const { empleado, fecha_inicio } = req.params;
    const fecha_fin = new Date(fecha_inicio);
    fecha_fin.setDate(fecha_fin.getDate() + 14); // Sumar 14 días para obtener el final del período quincenal
    try {
      const result = await pool.query(
        'SELECT * FROM registros_tiempo WHERE empleado_id = $1 AND fecha BETWEEN $2 AND $3',
        [empleado, fecha_inicio, fecha_fin]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener registros de tiempo' });
    }
  }
);

// Crear registros de tiempo para un período quincenal específico
routerEmployees.post(
  '/quincenal/:empleado/:fecha_inicio',
  async (req: Request, res: Response) => {
    const { empleado, fecha_inicio } = req.params;
    const fecha_fin = new Date(fecha_inicio);
    fecha_fin.setDate(fecha_fin.getDate() + 14); // Sumar 14 días para obtener el final del período quincenal
    const registrosTiempo = req.body;
    try {
      // Iterar por los registros de tiempo y crear cada uno en la base de datos
      for (const registroTiempo of registrosTiempo) {
        await pool.query(
          'INSERT INTO registros_tiempo (empleado_id, fecha, horas_trabajadas) VALUES ($1, $2, $3)',
          [empleado, registroTiempo.fecha, registroTiempo.horas_trabajadas]
        );
      }
      res
        .status(201)
        .json({ message: 'Registros de tiempo creados exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al crear registros de tiempo' });
    }
  }
);

// Obtener registros de tiempo para un período específico (diario o quincenal)
routerEmployees.get(
  '/registros-tiempo/:empleado/:fecha_inicio/:tipo_periodo',
  async (req: Request, res: Response) => {
    const { empleado, fecha_inicio, tipo_periodo } = req.params;
    const fecha_fin = new Date(fecha_inicio);
    if (tipo_periodo === 'quincenal') {
      fecha_fin.setDate(fecha_fin.getDate() + 14); // Sumar 14 días para obtener el final del período quincenal
    }
    try {
      const result = await pool.query(
        'SELECT * FROM registros_tiempo WHERE empleado_id = $1 AND fecha BETWEEN $2 AND $3',
        [empleado, fecha_inicio, fecha_fin]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener registros de tiempo' });
    }
  }
);

// Crear registros de tiempo para un período específico (diario o quincenal)
routerEmployees.post(
  '/registros-tiempo/:empleado/:fecha_inicio/:tipo_periodo',
  async (req: Request, res: Response) => {
    const { empleado, fecha_inicio, tipo_periodo } = req.params;
    const fecha_fin = new Date(fecha_inicio);
    if (tipo_periodo === 'quincenal') {
      fecha_fin.setDate(fecha_fin.getDate() + 14); // Sumar 14 días para obtener el final del período quincenal
    }
    const registrosTiempo = req.body;
    try {
      // Iterar por los registros de tiempo y crear cada uno en la base de datos
      for (const registroTiempo of registrosTiempo) {
        await pool.query(
          'INSERT INTO registros_tiempo (empleado_id, fecha, horas_trabajadas) VALUES ($1, $2, $3)',
          [empleado, registroTiempo.fecha, registroTiempo.horas_trabajadas]
        );
      }
      res
        .status(201)
        .json({ message: 'Registros de tiempo creados exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al crear registros de tiempo' });
    }
  }
);

export default routerEmployees;
