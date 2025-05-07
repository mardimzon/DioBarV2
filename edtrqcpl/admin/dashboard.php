<!DOCTYPE html>
<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: index.php");
    exit();
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "login_system"; // Replace with your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query for total employees
$totalEmployeesQuery = "SELECT COUNT(*) as total FROM employees";
$totalEmployeesResult = $conn->query($totalEmployeesQuery);
$totalEmployees = $totalEmployeesResult->fetch_assoc()['total'];

// Query for today's attendance
$today = date('Y-m-d');
$attendanceQuery = "SELECT COUNT(*) as total FROM timerecords WHERE date = '$today'";
$attendanceResult = $conn->query($attendanceQuery);
$attendanceToday = $attendanceResult->fetch_assoc()['total'];

// Query for today's absentees
$absentQuery = "SELECT COUNT(*) as total FROM employees WHERE id NOT IN (SELECT employee_id FROM timerecords WHERE date = '$today')";
$absentResult = $conn->query($absentQuery);
$absentToday = $absentResult->fetch_assoc()['total'];

// Query for today's late comers
$lateQuery = "SELECT COUNT(*) as total FROM timerecords tr JOIN employees e ON tr.employee_id = e.id WHERE tr.date = '$today' AND (tr.time_in_morning > e.schedule_start OR tr.time_in_afternoon > e.schedule_start)";
$lateResult = $conn->query($lateQuery);
$lateToday = $lateResult->fetch_assoc()['total'];

// Query for today's early leavers
$earlyLeaversQuery = "SELECT COUNT(*) as total FROM timerecords tr JOIN employees e ON tr.employee_id = e.id WHERE tr.date = '$today' AND (tr.time_out_morning < e.schedule_end OR tr.time_out_afternoon < e.schedule_end)";
$earlyLeaversResult = $conn->query($earlyLeaversQuery);
$earlyLeaversToday = $earlyLeaversResult->fetch_assoc()['total'];

$conn->close();

$title = "Dashboard";
$content = "dashboard_content.php";
include('template.php');
?>

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