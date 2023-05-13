const express = require('express');
const dataHours = require('../database/data/hours.json');
const insertDurations = require('../functions/insertDurations');
const sumDurations = require('../functions/sumDurations');

import pool from '../database/connection';
import { TimeRecord } from '../interfaces/types';

const routerHours = express.Router();

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
      `SELECT * FROM registros_horas WHERE empleado_id = $1 ORDER BY fecha DESC`,
      [idEmployee]
    );
    res.send(registrosHoras);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo los registros de horas');
  }
});

// Crear un nuevo registro de horas de un colaborador
routerHours.post('/', (req, res) => {
  const timeRecord = req.body;

  const hours = insertDurations(timeRecord.hours);
  const totalHours = sumDurations(hours);

  const newTimeRecord: TimeRecord = {
    ...timeRecord,
    hours: hours,
    totalHours: totalHours,
  };

  dataHours.push(newTimeRecord);
  res.json(dataHours);
});

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
