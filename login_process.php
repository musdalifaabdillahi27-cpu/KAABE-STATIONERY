<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST['username'];
    $pass = $_POST['password'];

    // Hardcoded credentials for demo
    $users = [
        'admin' => ['password' => 'admin123', 'role' => 'admin'],
        'staff' => ['password' => 'staff123', 'role' => 'staff'],
        'customer1' => ['password' => 'cust123', 'role' => 'customer']
    ];

    if (isset($users[$user]) && $users[$user]['password'] === $pass) {
        $_SESSION['user_id'] = $user;
        $_SESSION['username'] = $user;
        $_SESSION['role'] = $users[$user]['role'];
        header("Location: dashboard.php");
        exit();
    } else {
        $redirect = isset($_POST['redirect']) && !empty($_POST['redirect']) ? $_POST['redirect'] : 'index.php';
        header("Location: " . $redirect . "?error=1");
        exit();
    }
}
?>