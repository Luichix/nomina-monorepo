const express = require('express');
const bodyParser = require('body-parser');

import { Request, Response } from 'express';
import routerPayroll from './routes/payroll';

const app = express();
const port = process.env.PORT || 3003;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/setting', routerPayroll);

app.get('/', (_: Request, res: Response) => {
  res.send('Payroll Calculation Micro Service');
});

app.listen(port, () => {
  console.log(`API Payroll Calculation - Started on port ${port} 🚀`);
});
