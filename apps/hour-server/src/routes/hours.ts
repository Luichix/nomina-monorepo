const dataHours = require('../database/data/hours.json');

import pool from '../database/connection';
import { Router, Request, Response } from 'express';
import diffDuration from '../functions/diffDuration';
import { isValidateRecords } from './helpers/validation';

const routerHours = Router();

/* ---------------------------- Obtener Registros --------------------------- */

// Obtener todos los registros de horas
routerHours.get('/', async (_, res) => {
  try {
    // Buscar los registros de horas de un colaborador en la base de datos
    const { rows: registrosHoras } = await pool.query(
      `SELECT * FROM time_logs;`
    );
    res.send(registrosHoras);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo los registros de horas');
  }
});

// Obtener solo los registros de horas de un colaborador
routerHours.get('/:id', async (req, res) => {
  const idEmployee = req.params.id;

  try {
    // Buscar los registros de horas de un colaborador en la base de datos
    const { rows: registrosHoras } = await pool.query(
      `SELECT * FROM time_logs WHERE employee_id = $1 ORDER BY date ASC`,
      [idEmployee]
    );
    res.send(registrosHoras);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo los registros de horas');
  }
});

// Obtener registros de horas de un colaborador en un período específico (diario, semanal o quincenal)
routerHours.get(
  '/:id/:start_date/:type_period',
  async (req: Request, res: Response) => {
    const { id, start_date, type_period } = req.params;
    const end_date = new Date(start_date);

    if (type_period === 'dairy') {
      end_date.setDate(end_date.getDate() + 1); // Sumar 1 días para obtener el final del período diario
    } else if (type_period === 'biweekly') {
      end_date.setDate(end_date.getDate() + 7); // Sumar 6 días para obtener el final del período semanal
    } else if (type_period === 'biweekly') {
      end_date.setDate(end_date.getDate() + 15); // Sumar 14 días para obtener el final del período quincenal
    }

    try {
      const result = await pool.query(
        'SELECT * FROM time_logs  WHERE employee_id = $1 AND date BETWEEN $2 AND $3',
        [id, start_date, end_date]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener registros de tiempo' });
    }
  }
);

/* ---------------------------- Añadir Registros ---------------------------- */

// Crear un nuevo registro de horas para un colaborador
routerHours.post('/new-record/:id', async (req, res) => {
  const idEmployee = req.params.id;
  const { date, startTime, endTime } = req.body;

  if (!isValidateRecords(idEmployee, date, startTime, endTime, [])) {
    res.status(400).send('Fecha, hora de entrada y hora de salida inválidas');
    return;
  }

  try {
    const duration = diffDuration(startTime, endTime);
    const { rows: timeLogs } = await pool.query(
      `INSERT INTO time_logs (date, duration, start_time, end_time, employee_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [date, duration, startTime, endTime, idEmployee]
    );
    res.status(201).send(timeLogs[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando el registro de horas');
  }
});

// Crear múltiples registros de horas para un colaborador
routerHours.post('/new-records/:id', async (req, res) => {
  const idEmployee = req.params.id;
  const timeLogs = req.body;

  if (!Array.isArray(timeLogs) || timeLogs.length === 0) {
    res.status(400).send('Se esperaba un arreglo de registros de tiempo');
    return;
  }

  // Verificar la validez de cada registro
  for (const log of timeLogs) {
    const { date, startTime, endTime } = log;
    if (!isValidateRecords(idEmployee, date, startTime, endTime, [])) {
      res.status(400).send('Fecha, hora de entrada y hora de salida inválidas');
      return;
    }
  }

  try {
    const insertedLogs = [];

    for (const log of timeLogs) {
      const { date, startTime, endTime } = log;
      const duration = diffDuration(startTime, endTime);

      const { rows } = await pool.query(
        `INSERT INTO time_logs (date, duration, start_time, end_time, employee_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [date, duration, startTime, endTime, idEmployee]
      );

      insertedLogs.push(rows[0]);
    }

    res.status(201).send(insertedLogs);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send('Error creando los registros de horas por colaborador');
  }
});

// Crear múltiples registros de horas para diferentes colaboradores
routerHours.post('/all-new-records', async (req, res) => {
  const timeLogs = req.body;

  if (!Array.isArray(timeLogs) || timeLogs.length === 0) {
    res.status(400).send('Se esperaba un arreglo de registros de tiempo');
    return;
  }

  try {
    const insertedLogs = [];

    for (const log of timeLogs) {
      const { idEmployee, date, startTime, endTime } = log;

      if (!isValidateRecords(idEmployee, date, startTime, endTime, [])) {
        res
          .status(400)
          .send('Fecha, hora de entrada y hora de salida inválidas');
        return;
      }

      const duration = diffDuration(startTime, endTime);

      const { rows } = await pool.query(
        `INSERT INTO time_logs (date, duration, start_time, end_time, employee_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [date, duration, startTime, endTime, idEmployee]
      );

      insertedLogs.push(rows[0]);
    }

    res.status(201).send(insertedLogs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando los registros de horas');
  }
});

/* -------------------------- Actualizar Registros -------------------------- */

// Actualizar todo el registro de horas de un colaborador
routerHours.put('/:id', (req, res) => {
  const updatedEmployeeTimeRecord = req.body;
  const id = req.params.id;

  const index = dataHours.findIndex((employee) => employee.hoursID === id);

  if (index >= 0) {
    dataHours[index] = updatedEmployeeTimeRecord;
  }
  res.json(dataHours);
});

// Actualizar solo algunas propiedades del registro de horas de un colaborador
routerHours.patch('/:id', (req, res) => {
  const newInfo = req.body;
  const id = req.params.id;

  const index = dataHours.findIndex((employee) => employee.hoursID === id);

  if (index >= 0) {
    const employeeToUpdate = dataHours[index];
    Object.assign(employeeToUpdate, newInfo);
  }
  res.json(dataHours);
});

/* --------------------------- Eliminar Registros --------------------------- */

// Eliminar el registro de horas de un colaborador
routerHours.delete('/:id', (req, res) => {
  const id = req.params.id;
  const indice = dataHours.findIndex((employee) => employee.hoursID === id);

  if (indice >= 0) {
    dataHours.splice(indice, 1);
  }
  res.json(dataHours);
});

export default routerHours;
