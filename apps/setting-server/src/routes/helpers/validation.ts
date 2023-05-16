import { Router, Request, Response } from 'express';
import pool from '../../database/connection';

const router = Router();

router.put('/config', async (req: Request, res: Response) => {
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
    // Si la empr no tiene una configuración, creamos un nuevo registro en la base de datos
    await pool.none(
      'INSERT INTO company_config (company_name, min_work_hours, max_work_hours) VALUES ($1, $2, $3)',
      [company_name, min_work_hours, max_work_hours]
    );
  }

  res.sendStatus(200);
});

export const getCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await pool.findByPk(req.params.id);
    if (!company) {
      res.status(404).send(`Company with id ${req.params.id} not found`);
      return;
    }

    // Obtener las horas mínimas y máximas
    const minHours = company.min_hours_per_day;
    const maxHours = company.max_hours_per_day;

    // Devolver la configuración de la empresa junto con la respuesta
    res.status(200).json({
      id: company.id,
      name: company.name,
      minHours,
      maxHours,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving company configuration');
  }
};

interface ConfiguracionEmpresa {
  id: number;
  max_horas_diarias: number;
  max_horas_semanales: number;
  empresa_id: number;
}

async function getConfiguracionEmpresa(req: Request, res: Response) {
  const { empresaId } = req.params;
  try {
    const configuracionEmpresa = await pool.findOne({
      empresa_id: empresaId,
    });
    if (configuracionEmpresa) {
      return res.status(200).json(configuracionEmpresa);
    } else {
      return res
        .status(404)
        .json({ message: 'Configuración de empresa no encontrada' });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error al recuperar configuración de empresa' });
  }
}

async function updateConfiguracionEmpresa(req: Request, res: Response) {
  const { empresaId } = req.params;
  const { maxHorasDiarias, maxHorasSemanas } = req.body;
  try {
    const configuracionEmpresa = await pool.findOne({ empresa_id: empresaId });
    if (configuracionEmpresa) {
      configuracionEmpresa.max_horas_diarias = maxHorasDiarias;
      configuracionEmpresa.max_horas_semanales = maxHorasSemanas;
      await configuracionEmpresa.save();
      return res.status(200).json(configuracionEmpresa);
    } else {
      return res
        .status(404)
        .json({ message: 'Configuración de empresa no encontrada' });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error al actualizar configuración de empresa' });
  }
}

function isWithinPayPeriod(date: Date, config: any): boolean {
  const { payPeriodStart, payPeriodEnd } = config;

  // If pay period start or end is not defined, consider it to be valid
  if (!payPeriodStart || !payPeriodEnd) {
    return true;
  }

  // Check if date is within pay period
  return date >= payPeriodStart && date <= payPeriodEnd;
}

export { updateConfiguracionEmpresa, getConfiguracionEmpresa };
