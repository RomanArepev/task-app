document.addEventListener('DOMContentLoaded', () => {
    const currentTasksList = document.getElementById('current-tasks-list');
    const laterTasksList = document.getElementById('later-tasks-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');



// Функция для форматирования времени
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Функция для получения текущего времени в Лондоне
function getLondonTime() {
    const now = new Date();
    const londonTime = now.toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24-часовой формат
    });
    return londonTime;
}

// Обновление времени каждую секунду
function updateLondonTime() {
    const timeElement = document.getElementById('london-time');
    if (timeElement) {
        timeElement.textContent = getLondonTime();
    }
}

// Запуск обновления времени
setInterval(updateLondonTime, 1000);
updateLondonTime(); // Инициализация сразу

    function fetchTasks() {
        fetch('http://localhost:3000/tasks')
            .then(response => response.json())
            .then(tasks => {
                currentTasksList.innerHTML = '';
                laterTasksList.innerHTML = '';
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task.text;
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = '×';
                    deleteButton.addEventListener('click', () => {
                        deleteTask(task.id);
                    });
                    li.appendChild(deleteButton);
                    if (task.later) {
                        laterTasksList.appendChild(li);
                    } else {
                        currentTasksList.appendChild(li);
                    }
                });
            });
    }

    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: Date.now().toString(), text: taskText, later: false }),
            }).then(() => {
                newTaskInput.value = '';
                fetchTasks();
            });
        }
    }

    function deleteTask(taskId) {
        fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE',
        }).then(() => {
            fetchTasks();
        });
    }

    addTaskButton.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    fetchTasks();
});