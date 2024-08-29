<?php
// Подключение к базе данных с использованием PDO
$pdo = new PDO('mysql:host=localhost;dbname=todolist', 'root', '');

// Получение данных из запроса в формате JSON
$data = json_decode(file_get_contents('php://input'), true);

// Проверка, задан ли идентификатор задачи для удаления
if (isset($data['id'])) {
    // Подготовка SQL-запроса для удаления задачи с указанным идентификатором
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
    
    // Выполнение SQL-запроса с передачей значения идентификатора задачи
    $stmt->execute([':id' => $data['id']]);
}
?>
