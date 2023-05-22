const express = require('express');
const bodyParser = require('body-parser');

import { Request, Response } from 'express';
import routerPreprocess from './routes/preprocess';

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/preprocess', routerPreprocess);

app.get('/', (_: Request, res: Response) => {
  res.send('Time Preprocessor Micro Service');
});

app.listen(port, () => {
  console.log(`API Time Preprocessor - Started on port ${port} 🚀`);
});
