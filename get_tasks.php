<?php
// Подключение к базе данных с использованием PDO
$pdo = new PDO('mysql:host=localhost;dbname=todolist', 'root', '');

// Выполнение SQL-запроса для получения всех задач из таблицы tasks
$stmt = $pdo->query("SELECT * FROM tasks");

// Извлечение всех задач в виде ассоциативного массива
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Преобразование массива задач в формат JSON и вывод его в качестве ответа
echo json_encode($tasks);
?>
