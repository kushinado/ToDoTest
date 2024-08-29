document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов управления
    const addButton = document.getElementById('add-button');
    const taskTitleInput = document.getElementById('task-title');
    const clearInputButton = document.getElementById('clear-input');
    const taskList = document.getElementById('tasks');
    const showMoreButton = document.getElementById('show-more');
    const taskColumns = document.querySelectorAll('.task-column');
    const popup = document.getElementById('task-popup');
    const popupCloseButton = document.getElementById('popup-close');
    const popupApplyButton = document.getElementById('popup-apply');
    const popupDeleteButton = document.getElementById('popup-delete');
    const popupTaskTitle = document.getElementById('popup-task-title');
    const popupStatusButtons = document.querySelector('.popup-status-buttons');
    const popupOverlay = document.querySelector('.popup-overlay');

    // Инициализация переменных
    let tasks = []; // Массив задач
    const tasksPerPage = 5; // Количество задач на страницу
    let currentPage = 1; // Текущая страница
    let isShowingAll = false; // Флаг показа всех задач
    let currentTask = null; // Текущая выбранная задача

    // Обновление информации о задачах
    function updateTaskSummary() {
        const openCount = tasks.filter(task => task.status === 'open').length;
        const inWorkCount = tasks.filter(task => task.status === 'in-work').length;
        const doneCount = tasks.filter(task => task.status === 'done').length;

        document.getElementById('open-count').textContent = openCount;
        document.getElementById('in-work-count').textContent = inWorkCount;
        document.getElementById('done-count').textContent = doneCount;
    }

    // Отображение задач на странице
    function renderTasks() {
        taskList.innerHTML = ''; // Очистка списка задач
        taskColumns.forEach(column => column.innerHTML = ''); // Очистка колонок на доске

        // Сортировка задач по статусам
        const sortedTasks = tasks.sort((a, b) => {
            const statusOrder = { 'open': 1, 'in-work': 2, 'done': 3 };
            return statusOrder[a.status] - statusOrder[b.status];
        });

        // Пагинация задач
        const start = 0;
        const end = isShowingAll ? tasks.length : tasksPerPage;
        const paginatedTasks = sortedTasks.slice(start, end);

        paginatedTasks.forEach(task => {
            // Отображаем задачи в списке с текстовым статусом
            const listItem = document.createElement('li');
            listItem.textContent = task.title;

            const statusSpan = document.createElement('span');
            statusSpan.textContent = task.status.replace('-', ' ').toUpperCase();
            statusSpan.className = 'task-status';
            statusSpan.addEventListener('click', () => openTaskPopup(task));

            listItem.appendChild(statusSpan);
            taskList.appendChild(listItem);

            // Отображаем задачи на доске
            const column = document.getElementById(task.status);
            const boardItem = document.createElement('div');
            boardItem.textContent = task.title;
            boardItem.draggable = true;
            boardItem.dataset.id = task.id;
            boardItem.dataset.status = task.status;
            boardItem.className = 'task-item';

            boardItem.addEventListener('dragstart', handleDragStart);
            boardItem.addEventListener('dragend', handleDragEnd);

            column.appendChild(boardItem);
        });

        // Управление кнопкой "Показать еще"
        showMoreButton.style.display = tasks.length > tasksPerPage ? 'block' : 'none';
        showMoreButton.textContent = isShowingAll ? 'Скрыть' : 'Показать еще';
    }

    // Обработка начала перетаскивания задачи
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
    }

    // Обработка окончания перетаскивания задачи
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    // Обработка сброса задачи в колонку
    function handleDrop(e) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = e.target.dataset.status;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            updateTaskSummary();
            renderTasks();
            saveTaskStatus(taskId, newStatus); // Обновляем статус задачи в БД
        }
    }

    // Обработка события перетаскивания над колонкой
    function handleDragOver(e) {
        e.preventDefault();
    }

    // Добавление новой задачи
    function addTask(title) {
        const newTask = {
            id: String(tasks.length + 1),
            title: title,
            status: 'open'
        };
        tasks.push(newTask);
        updateTaskSummary();
        renderTasks();
        saveTaskToDatabase(newTask);
    }

    // Сохранение новой задачи в базу данных
    function saveTaskToDatabase(task) {
        fetch('add_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
    }

    // Обновление задачи в базе данных
    function updateTaskInDatabase(task) {
        fetch('update_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
    }

    // Сохранение статуса задачи в базе данных
    function saveTaskStatus(id, status) {
        fetch('update_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        }).catch(error => {
            console.error('Error updating task status:', error);
        });
    }

    // Удаление задачи из базы данных
    function deleteTaskFromDatabase(taskId) {
        fetch('delete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId })
        });
    }

    // Обработка кнопки "Показать еще"
    function handleShowMore() {
        isShowingAll = !isShowingAll;
        renderTasks();
        if (!isShowingAll) {
            taskList.scrollTop = 0;
        }
    }

    // Обработка фокуса на поле ввода
    function handleInputFocus() {
        clearInputButton.style.display = 'block';
    }

    // Обработка потери фокуса с поля ввода
    function handleInputBlur() {
        if (!taskTitleInput.value) {
            clearInputButton.style.display = 'none';
        }
    }

    // Очистка поля ввода
    function clearInput() {
        taskTitleInput.value = '';
        clearInputButton.style.display = 'none';
        taskTitleInput.focus();
    }

    // Открытие модального окна для редактирования задачи
    function openTaskPopup(task) {
        currentTask = task;
        popupTaskTitle.value = task.title;

        // Очистить и добавить кнопки статусов
        popupStatusButtons.innerHTML = '';
        let statusOptions = [];

        if (task.status === 'open') {
            statusOptions = ['in-work', 'done'];
        } else if (task.status === 'in-work') {
            statusOptions = ['open', 'done'];
        } else if (task.status === 'done') {
            statusOptions = ['open'];
        }

        statusOptions.forEach(status => {
            const button = document.createElement('button');
            button.textContent = status.replace('-', ' ').toUpperCase();
            button.dataset.status = status;
            button.addEventListener('click', () => changeStatus(status));
            popupStatusButtons.appendChild(button);
        });

        popup.classList.add('show');
    }

    // Закрытие модального окна
    function closeTaskPopup(saveChanges = false) {
        if (saveChanges && currentTask) {
            const newTitle = popupTaskTitle.value.trim();
            if (newTitle !== currentTask.title) {
                currentTask.title = newTitle;
            }
            updateTaskInDatabase(currentTask); // Обновляем задачу в БД
            renderTasks();
        }
        popup.classList.remove('show');
        currentTask = null;
    }

    // Изменение статуса задачи через модальное окно
    function changeStatus(newStatus) {
        if (currentTask) {
            currentTask.status = newStatus;
            updateTaskInDatabase(currentTask); // Обновляем статус задачи в БД
            closeTaskPopup(true);
        }
    }

    // Удаление задачи через модальное окно
    function deleteTask() {
        if (currentTask) {
            tasks = tasks.filter(task => task.id !== currentTask.id);
            deleteTaskFromDatabase(currentTask.id); // Удаляем задачу из БД
            renderTasks();
            closeTaskPopup();
        }
    }

    // Обработчики событий для элементов управления
    popupApplyButton.addEventListener('click', () => closeTaskPopup(true));
    popupDeleteButton.addEventListener('click', deleteTask);
    popupCloseButton.addEventListener('click', () => closeTaskPopup());
    popupOverlay.addEventListener('click', () => closeTaskPopup());

    addButton.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        if (title) {
            addTask(title);
            taskTitleInput.value = '';
            clearInputButton.style.display = 'none';
        }
    });

    showMoreButton.addEventListener('click', handleShowMore);
    clearInputButton.addEventListener('click', clearInput);

    taskTitleInput.addEventListener('focus', handleInputFocus);
    taskTitleInput.addEventListener('blur', handleInputBlur);

    // Обработчики событий перетаскивания для колонок на доске
    taskColumns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });

    // Загрузка задач с сервера при загрузке страницы
    fetch('get_tasks.php')
        .then(response => response.json())
        .then(data => {
            tasks = data;
            updateTaskSummary();
            renderTasks();
        });
});
