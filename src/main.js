const express = require('express');
const cors = require('cors');
const router = require('./routes/index');
const { default: helmet } = require('helmet');
const path = require('path');


const app = express();

app.use(helmet())
app.use(cors());

app.use(express.json());          
app.use(express.urlencoded({extended: true}));  

// Указываем абсолютный путь к папке public
const publicPath = path.join(__dirname, '..', 'public'); // Поднимаемся на уровень выше из src
// Настройка статических файлов
app.use(express.static(publicPath, {
  index: false // Отключаем автоматическую отдачу index.html
}));

// API маршруты
app.use('/api', router);

// Альтернативный вариант:
app.get(/^(?!\/?api).*/, (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});




app.listen(3005);