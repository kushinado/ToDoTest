<?php
// Подключение к базе данных с использованием PDO
$pdo = new PDO('mysql:host=localhost;dbname=todolist', 'root', '');

// Декодирование входных данных из JSON в ассоциативный массив
$data = json_decode(file_get_contents('php://input'), true);

// Проверка, что в данных присутствуют и 'id', и 'status'
if (isset($data['id']) && isset($data['status'])) {
    // Подготовка SQL-запроса для обновления статуса задачи по её id
    $stmt = $pdo->prepare("UPDATE tasks SET status = :status WHERE id = :id");
    
    // Выполнение запроса с передачей параметров 'status' и 'id'
    $stmt->execute([
        ':status' => $data['status'],
        ':id' => $data['id']
    ]);
}
?>
