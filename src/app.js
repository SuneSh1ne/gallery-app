const express = require('express');
const path = require('path');
const imagesRouter = require('./routes/images');
const logger = require('./middleware/logger');

const app = express();

// Middleware
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Маршруты
app.use('/api/images', imagesRouter);

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

module.exports = app;
