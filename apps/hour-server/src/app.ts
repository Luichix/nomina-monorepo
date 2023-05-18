const express = require('express');
const bodyParser = require('body-parser');
import { Request, Response } from 'express';

import routerHours from './routes/hours';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/hours', routerHours);

app.get('/', (req: Request, res: Response) => {
  res.send('Time Record Micro Service');
});

app.listen(port, () => {
  console.log(`API Time Record - Started on port ${port} 🚀`);
});
