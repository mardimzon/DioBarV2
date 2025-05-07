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

// Fetch branches from the database
$branches_result = $conn->query("SELECT branch_name FROM branches");
$branches = [];
while ($branch_row = $branches_result->fetch_assoc()) {
    $branches[] = $branch_row['branch_name'];
}

// Handle form submission for creating, editing, deleting, filtering, and sorting employees
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['create_employee'])) {
    $employee_id = $_POST['employee_id'];
    $employee_firstname = $_POST['employee_firstname'];
    $employee_middlename = $_POST['employee_middlename'];
    $employee_lastname = $_POST['employee_lastname'];
    $employee_birthday = $_POST['employee_birthday'];
    $passcode = $_POST['passcode'];
    $branch = $_POST['branch'];
    $schedule_start = $_POST['schedule_start'];
    $schedule_end = $_POST['schedule_end'];

    $stmt = $conn->prepare("INSERT INTO employees (employee_id, employee_firstname, employee_middlename, employee_lastname, employee_birthday, passcode, branch, schedule_start, schedule_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $employee_id, $employee_firstname, $employee_middlename, $employee_lastname, $employee_birthday, $passcode, $branch, $schedule_start, $schedule_end);
    $stmt->execute();
    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['edit_employee'])) {
    $id = $_POST['id'];
    $employee_id = $_POST['employee_id'];
    $employee_firstname = $_POST['employee_firstname'];
    $employee_middlename = $_POST['employee_middlename'];
    $employee_lastname = $_POST['employee_lastname'];
    $employee_birthday = $_POST['employee_birthday'];
    $passcode = $_POST['passcode'];
    $branch = $_POST['branch'];
    $schedule_start = $_POST['schedule_start'];
    $schedule_end = $_POST['schedule_end'];

    $stmt = $conn->prepare("UPDATE employees SET employee_id = ?, employee_firstname = ?, employee_middlename = ?, employee_lastname = ?, employee_birthday = ?, passcode = ?, branch = ?, schedule_start = ?, schedule_end = ? WHERE id = ?");
    $stmt->bind_param("sssssssssi", $employee_id, $employee_firstname, $employee_middlename, $employee_lastname, $employee_birthday, $passcode, $branch, $schedule_start, $schedule_end, $id);
    $stmt->execute();
    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete_employee'])) {
    $id = $_POST['id'];

    $stmt = $conn->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
}

$filter_branch = isset($_POST['filter_branch']) ? $_POST['filter_branch'] : '';
$search_keyword = isset($_POST['search_keyword']) ? $_POST['search_keyword'] : '';
$sort_by = isset($_POST['sort_by']) ? $_POST['sort_by'] : 'id';
$sort_order = isset($_POST['sort_order']) ? $_POST['sort_order'] : 'ASC';
$items_per_page = isset($_POST['items_per_page']) ? $_POST['items_per_page'] : 10;
$page = isset($_POST['page']) ? $_POST['page'] : 1;
$offset = ($page - 1) * $items_per_page;

// Fetch employees from the database with filters and sorting
$query = "SELECT id, employee_id, employee_firstname, employee_middlename, employee_lastname, employee_birthday, passcode, branch, schedule_start, schedule_end FROM employees WHERE 1=1";
if ($filter_branch) {
    $query .= " AND branch = '$filter_branch'";
}
if ($search_keyword) {
    $query .= " AND (employee_id LIKE '%$search_keyword%' OR employee_firstname LIKE '%$search_keyword%' OR employee_middlename LIKE '%$search_keyword%' OR employee_lastname LIKE '%$search_keyword%' OR branch LIKE '%$search_keyword%')";
}
$query .= " ORDER BY $sort_by $sort_order LIMIT $items_per_page OFFSET $offset";
$result = $conn->query($query);

// Get total number of employees for pagination
$total_result = $conn->query("SELECT COUNT(*) AS total FROM employees WHERE 1=1");
$total_row = $total_result->fetch_assoc();
$total_items = $total_row['total'];
$total_pages = ceil($total_items / $items_per_page);

$title = "Employees";
$content = "employees_content.php";
include('template.php');
?>
<!-- AdminLTE JS -->
<script src="https://adminlte.io/themes/v3/plugins/jquery/jquery.min.js"></script>
<script src="https://adminlte.io/themes/v3/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="https://adminlte.io/themes/v3/dist/js/adminlte.min.js"></script>
<script>
    $('#editEmployeeModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var employee_id = button.data('employee_id');
        var employee_firstname = button.data('employee_firstname');
        var employee_middlename = button.data('employee_middlename');
        var employee_lastname = button.data('employee_lastname');
        var employee_birthday = button.data('employee_birthday');
        var passcode = button.data('passcode');
        var branch = button.data('branch');
        var schedule_start = button.data('schedule_start');
        var schedule_end = button.data('schedule_end');
        var modal = $(this);
        modal.find('#edit-id').val(id);
        modal.find('#edit-employee_id').val(employee_id);
        modal.find('#edit-employee_firstname').val(employee_firstname);
        modal.find('#edit-employee_middlename').val(employee_middlename);
        modal.find('#edit-employee_lastname').val(employee_lastname);
        modal.find('#edit-employee_birthday').val(employee_birthday);
        modal.find('#edit-passcode').val(passcode);
        modal.find('#edit-branch').val(branch);
        modal.find('#edit-schedule_start').val(schedule_start);
        modal.find('#edit-schedule_end').val(schedule_end);
    });

    $('#deleteEmployeeModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var modal = $(this);
        modal.find('#delete-id').val(id);
    });
</script>
</body>
</html>