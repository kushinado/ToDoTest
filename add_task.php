<?php
// Подключение к базе данных с использованием PDO
$pdo = new PDO('mysql:host=localhost;dbname=todolist', 'root', '');

// Получение данных из запроса в формате JSON
$data = json_decode(file_get_contents('php://input'), true);

// Подготовка SQL-запроса для вставки новой задачи в базу данных
$stmt = $pdo->prepare("INSERT INTO tasks (title, status) VALUES (:title, :status)");

// Выполнение SQL-запроса с передачей значений для полей title и status
$stmt->execute([
    ':title' => $data['title'],  // Заголовок задачи
    ':status' => $data['status']  // Статус задачи
]);
?>
