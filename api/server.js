const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(bodyParser.json());

// Получить все задачи
app.get('/tasks', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла задач');
        }
        res.json(JSON.parse(data));
    });
});

// Добавить новую задачу
app.post('/tasks', (req, res) => {
    const newTask = req.body;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла задач');
        }
        const tasks = JSON.parse(data);
        tasks.push(newTask);
        fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка записи файла задач');
            }
            res.status(201).send('Задача добавлена');
        });
    });
});

// Удалить задачу
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла задач');
        }
        let tasks = JSON.parse(data);
        tasks = tasks.filter(task => task.id !== taskId);
        fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка записи файла задач');
            }
            res.status(200).send('Задача удалена');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});