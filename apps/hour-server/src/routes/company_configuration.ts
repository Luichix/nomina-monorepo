import { Router, Request, Response } from 'express';
import pool from '../database/connection';

const routerCompanyConfig = Router();

routerCompanyConfig.put('/config', async (req: Request, res: Response) => {
  const { company_name, min_work_hours, max_work_hours } = req.body;

  // Verificamos si la empresa ya tiene una configuración almacenada
  const existingConfig = await pool.oneOrNone(
    'SELECT * FROM company_config WHERE company_name = $1',
    [company_name]
  );

  if (existingConfig) {
    // Si la empresa ya tiene una configuración, actualizamos los valores existentes
    await pool.none(
      'UPDATE company_config SET min_work_hours = $1, max_work_hours = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [min_work_hours, max_work_hours, existingConfig.id]
    );
  } else {
    // Si la empresa no tiene una configuración, creamos un nuevo registro en la base de datos
    await pool.none(
      'INSERT INTO company_config (company_name, min_work_hours, max_work_hours) VALUES ($1, $2, $3)',
      [company_name, min_work_hours, max_work_hours]
    );
  }

  res.sendStatus(200);
});

export default routerCompanyConfig;
