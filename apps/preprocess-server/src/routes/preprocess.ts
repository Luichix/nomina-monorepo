import { Router, Request, Response } from 'express';

const routerPreprocess: Router = Router();

// Analizar y transformar el registro de horas para un colaborador
routerPreprocess.post('/:id', async (req, res) => {
  const idEmployee = req.params.id;
  //   const { date, startTime, endTime } = req.body;
  // const validatedRecord = await isValidateRecords(parseInt(idEmployee), [
  //   { date, startTime, endTime },
  // ]);
  // if (!validatedRecord.isValid) {
  //   res.status(400).send(validatedRecord.message);
  //   return;
  // }
  // try {
  //   const duration = diffDuration(startTime, endTime);
  //   const { rows: timeLogs } = await pool.query(
  //     `INSERT INTO time_logs (date, duration, start_time, end_time, employee_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
  //     [date, duration, startTime, endTime, idEmployee]
  //   );
  //   res.status(201).send(timeLogs[0]);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).send('Error creando el registro de horas');
  // }
});

export default routerPreprocess;
