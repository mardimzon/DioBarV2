<!DOCTYPE html>
<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: index.php");
    exit();
}

// Database connection
$conn = new mysqli("localhost", "root", "", "login_system");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the user is an admin
$username = $_SESSION['username'];
$stmt = $conn->prepare("SELECT role FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->bind_result($role);
$stmt->fetch();
$stmt->close();

if ($role !== 'admin') {
    header("Location: dashboard.php");
    exit();
}

// Handle form submission for creating a new branch
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['create_branch'])) {
    $branch_name = $_POST['branch_name'];
    $branch_address = $_POST['branch_address'];

    $stmt = $conn->prepare("INSERT INTO branches (branch_name, branch_address) VALUES (?, ?)");
    $stmt->bind_param("ss", $branch_name, $branch_address);
    $stmt->execute();
    $stmt->close();
}

// Handle form submission for editing a branch
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['edit_branch'])) {
    $id = $_POST['id'];
    $branch_name = $_POST['branch_name'];
    $branch_address = $_POST['branch_address'];

    $stmt = $conn->prepare("UPDATE branches SET branch_name = ?, branch_address = ? WHERE id = ?");
    $stmt->bind_param("ssi", $branch_name, $branch_address, $id);
    $stmt->execute();
    $stmt->close();
}

// Handle form submission for deleting a branch
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete_branch'])) {
    $id = $_POST['id'];

    $stmt = $conn->prepare("DELETE FROM branches WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
}

$title = "Branches";
$content = "branches_content.php";
include('template.php');
?>
<!-- ./wrapper -->

<!-- AdminLTE JS -->
<script src="https://adminlte.io/themes/v3/plugins/jquery/jquery.min.js"></script>
<script src="https://adminlte.io/themes/v3/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="https://adminlte.io/themes/v3/dist/js/adminlte.min.js"></script>
<script>
    $('#editBranchModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var branch_name = button.data('branch_name');
        var branch_address = button.data('branch_address');
        var modal = $(this);
        modal.find('#edit-id').val(id);
        modal.find('#edit-branch_name').val(branch_name);
        modal.find('#edit-branch_address').val(branch_address);
    });

    $('#deleteBranchModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var modal = $(this);
        modal.find('#delete-id').val(id);
    });
</script>
</body>
</html>