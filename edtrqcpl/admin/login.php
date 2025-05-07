<?php
session_start();
$conn = new mysqli('localhost', 'root', '', 'login_system');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = md5($_POST['password']);

    $stmt = $conn->prepare("SELECT * FROM users WHERE username=? AND password=?");
    $stmt->bind_param("ss", $username, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $_SESSION['username'] = $row['username'];
        $_SESSION['role'] = $row['role'];
        header("Location: dashboard.php");
    } else {
        header("Location: index.php?error=Invalid username or password");
    }

    $stmt->close();
} else {
    header("Location: index.php?error=Please enter username and password");
}

$conn->close();
?>
