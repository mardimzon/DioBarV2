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

// Handle form submission for creating a new time record
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['create_timerecord'])) {
    $employee_id = $_POST['employee_id'];
    $date = $_POST['date'];
    $time_in_morning = $_POST['time_in_morning'];
    $time_out_morning = $_POST['time_out_morning'];
    $time_in_afternoon = $_POST['time_in_afternoon'];
    $time_out_afternoon = $_POST['time_out_afternoon'];
    $time_in_img_morning = $_POST['time_in_img_morning'];
    $time_out_img_morning = $_POST['time_out_img_morning'];
    $time_in_img_afternoon = $_POST['time_in_img_afternoon'];
    $time_out_img_afternoon = $_POST['time_out_img_afternoon'];

    $stmt = $conn->prepare("INSERT INTO timerecords (employee_id, date, time_in_morning, time_out_morning, time_in_afternoon, time_out_afternoon, time_in_img_morning, time_out_img_morning, time_in_img_afternoon, time_out_img_afternoon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssssss", $employee_id, $date, $time_in_morning, $time_out_morning, $time_in_afternoon, $time_out_afternoon, $time_in_img_morning, $time_out_img_morning, $time_in_img_afternoon, $time_out_img_afternoon);
    $stmt->execute();
    $stmt->close();
}

// Handle form submission for editing a time record
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['edit_timerecord'])) {
    $id = $_POST['id'];
    $employee_id = $_POST['employee_id'];
    $date = $_POST['date'];
    $time_in_morning = $_POST['time_in_morning'];
    $time_out_morning = $_POST['time_out_morning'];
    $time_in_afternoon = $_POST['time_in_afternoon'];
    $time_out_afternoon = $_POST['time_out_afternoon'];
    $time_in_img_morning = $_POST['time_in_img_morning'];
    $time_out_img_morning = $_POST['time_out_img_morning'];
    $time_in_img_afternoon = $_POST['time_in_img_afternoon'];
    $time_out_img_afternoon = $_POST['time_out_img_afternoon'];

    $stmt = $conn->prepare("UPDATE timerecords SET employee_id = ?, date = ?, time_in_morning = ?, time_out_morning = ?, time_in_afternoon = ?, time_out_afternoon = ?, time_in_img_morning = ?, time_out_img_morning = ?, time_in_img_afternoon = ?, time_out_img_afternoon = ? WHERE id = ?");
    $stmt->bind_param("isssssssssi", $employee_id, $date, $time_in_morning, $time_out_morning, $time_in_afternoon, $time_out_afternoon, $time_in_img_morning, $time_out_img_morning, $time_in_img_afternoon, $time_out_img_afternoon, $id);
    $stmt->execute();
    $stmt->close();
}

// Handle form submission for deleting a time record
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete_timerecord'])) {
    $id = $_POST['id'];

    $stmt = $conn->prepare("DELETE FROM timerecords WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
}

// Handle form submission for filtering and sorting time records
$filter_employee_name = isset($_POST['filter_employee_name']) ? $_POST['filter_employee_name'] : '';
$filter_date_start = isset($_POST['filter_date_start']) ? $_POST['filter_date_start'] : '';
$filter_date_end = isset($_POST['filter_date_end']) ? $_POST['filter_date_end'] : '';
$sort_by = isset($_POST['sort_by']) ? $_POST['sort_by'] : 'id';
$sort_order = isset($_POST['sort_order']) ? $_POST['sort_order'] : 'DESC';
$items_per_page = isset($_POST['items_per_page']) ? $_POST['items_per_page'] : 10;
$page = isset($_POST['page']) ? $_POST['page'] : 1;
$offset = ($page - 1) * $items_per_page;

// Fetch time records from the database with filters and sorting
$query = "SELECT tr.*, e.employee_firstname, e.employee_middlename, e.employee_lastname, e.branch 
          FROM timerecords tr 
          JOIN employees e ON tr.employee_id = e.employee_id 
          WHERE 1=1";
if ($filter_employee_name) {
    $query .= " AND (e.employee_firstname LIKE '%$filter_employee_name%' OR e.employee_middlename LIKE '%$filter_employee_name%' OR e.employee_lastname LIKE '%$filter_employee_name%')";
}
if ($filter_date_start && $filter_date_end) {
    $query .= " AND tr.date BETWEEN '$filter_date_start' AND '$filter_date_end'";
}
$query .= " ORDER BY $sort_by $sort_order LIMIT $items_per_page OFFSET $offset";
$result = $conn->query($query);

// Get total number of time records for pagination
$total_result = $conn->query("SELECT COUNT(*) AS total FROM timerecords WHERE 1=1");
$total_row = $total_result->fetch_assoc();
$total_items = $total_row['total'];
$total_pages = ceil($total_items / $items_per_page);

$title = "Employees";
$content = "timerecords_content.php";
include('template.php');
?>


<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<!-- Bootstrap 4 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"></script>
<!-- AdminLTE App -->
<script src="https://adminlte.io/themes/v3/dist/js/adminlte.min.js"></script>
<script>
    $('#editTimeRecordModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var employee_id = button.data('employee_id');
        var date = button.data('date');
        var time_in_morning = button.data('time_in_morning');
        var time_out_morning = button.data('time_out_morning');
        var time_in_afternoon = button.data('time_in_afternoon');
        var time_out_afternoon = button.data('time_out_afternoon');
        var time_in_img_morning = button.data('time_in_img_morning');
        var time_out_img_morning = button.data('time_out_img_morning');
        var time_in_img_afternoon = button.data('time_in_img_afternoon');
        var time_out_img_afternoon = button.data('time_out_img_afternoon');

        var modal = $(this);
        modal.find('#edit_id').val(id);
        modal.find('#edit_employee_id').val(employee_id);
        modal.find('#edit_date').val(date);
        modal.find('#edit_time_in_morning').val(time_in_morning);
        modal.find('#edit_time_out_morning').val(time_out_morning);
        modal.find('#edit_time_in_afternoon').val(time_in_afternoon);
        modal.find('#edit_time_out_afternoon').val(time_out_afternoon);
        modal.find('#edit_time_in_img_morning').val(time_in_img_morning);
        modal.find('#edit_time_out_img_morning').val(time_out_img_morning);
        modal.find('#edit_time_in_img_afternoon').val(time_in_img_afternoon);
        modal.find('#edit_time_out_img_afternoon').val(time_out_img_afternoon);
    });

    $('#deleteTimeRecordModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');

        var modal = $(this);
        modal.find('#delete_id').val(id);
    });
</script>
</body>
</html>