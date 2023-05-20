const express = require('express');
const bodyParser = require('body-parser');

import routerSetting from './routes/setting';

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/setting', routerSetting);

app.get('/', (_, res) => {
  res.send('Company Setting Micro Service');
});

app.listen(port, () => {
  console.log(`API Company Setting - Started on port ${port} 🚀`);
});
