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

    // Функция для получения задач
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

    // Функция для добавления задачи
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

    // Функция для удаления задачи
    function deleteTask(taskId) {
        fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE',
        }).then(() => {
            fetchTasks();
        });
    }

    // Обработчик для кнопки добавления задачи
    addTaskButton.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Инициализация задач
    fetchTasks();

    // Создание кнопки для получения тикетов
    const fetchTicketsButton = document.createElement('button');
    fetchTicketsButton.textContent = 'Получить тикеты';
    laterTasksList.parentElement.appendChild(fetchTicketsButton); // Добавляем кнопку в раздел "later tasks"

    // Функция для получения тикетов из API
    function fetchTickets() {
        const headers = {
            'Authorization': 'Basic ' + btoa('YZR3zoq1VN8cesmw1lY:Y'), // Basic Auth
        };

        const fetchPage = (groupId, page) => {
            const url = `https://itsgroup.freshdesk.com/api/v2/search/tickets?query="group_id:${groupId}"&page=${page}`;
            return fetch(url, { headers })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                });
        };

        // Массив с group_id
        const groupIds = ['2043001607962', '2043001591715'];

        // Создаем массив промисов для страниц от 1 до 10 для каждого group_id
        const pagePromises = groupIds.flatMap(groupId => 
            Array.from({ length: 10 }, (_, i) => fetchPage(groupId, i + 1))
        );

        Promise.all(pagePromises)
            .then(results => {
                console.log('Fetched tickets from all pages:', results); // Отладочное сообщение
                laterTasksList.innerHTML = ''; // Очистить существующие задачи

                results.forEach(data => {
                    if (data.results && data.results.length > 0) {
                        data.results.forEach(ticket => {
                            console.log('Processing ticket:', ticket); // Отладочное сообщение для каждого тикета
                            console.log('Ticket status:', ticket.status); // Отладочное сообщение для статуса тикета
                            const createdAtYear = new Date(ticket.created_at).getFullYear(); // Получаем год создания тикета
                            if (createdAtYear === 2025 && ticket.status === 2) { // Проверка года и статуса
                                const li = document.createElement('li');
                                li.textContent = `Ticket ID: ${ticket.id}, Subject: ${ticket.subject}`; // Отображение ID и Subject тикета
                                laterTasksList.appendChild(li);
                            } else {
                                console.log(`Ticket ID: ${ticket.id} has status: ${ticket.status} or created in year: ${createdAtYear}, not adding to list.`); // Сообщение, если статус не 2 или год не 2025
                            }
                        });
                    } else {
                        console.log('No tickets found on this page.'); // Сообщение, если нет тикетов на странице
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching tickets:', error);
                const li = document.createElement('li');
                li.textContent = 'Error fetching tickets. Check console for details.';
                laterTasksList.appendChild(li);
            });
    }

    // Обработчик для кнопки получения тикетов
    fetchTicketsButton.addEventListener('click', fetchTickets);
});