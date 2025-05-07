<?php
include 'db.php';

// Create connection
$conn = connectDB();

// Set default date range to the current month
$start_date = date('Y-m-01');
$end_date = date('Y-m-t');

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $employee_id = $_POST['employeeId'];
    $passcode = $_POST['passcode'];
    $start_date = $_POST['startDate'];
    $end_date = $_POST['endDate'];

    // Validate employee ID and passcode
    $sql = "SELECT * FROM employees WHERE employee_id = '$employee_id' AND passcode = '$passcode'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Fetch employee name
        $employee = $result->fetch_assoc();
        $employee_name = $employee['employee_firstname'] . ' ' . $employee['employee_lastname'];

        // Fetch DTR records for the selected date range
        $sql = "SELECT * FROM timerecords WHERE employee_id = '$employee_id' AND date BETWEEN '$start_date' AND '$end_date'";
        $dtr_records = $conn->query($sql);
    } else {
        $error_message = "Invalid Employee ID or Passcode";
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View DTR</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="css/daterangepicker.css">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .btn-lg {
            padding: 1rem 1.5rem;
            font-size: 1.25rem;
        }
        .form-control-lg {
            padding: 1rem;
            font-size: 1.25rem;
        }
        .container-fluid {
            padding: 0;
            margin: 0;
        }
        .card {
            margin: 0;
            border: none;
            border-radius: 0.75rem;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .card-body {
            padding: 1.5rem;
        }
        .card-title {
            color: #007bff;
        }
        .form-label {
            color: #495057;
        }
        .table-striped tbody tr:nth-of-type(odd) {
            background-color: rgba(0, 123, 255, 0.05);
        }
        .table-striped tbody tr:hover {
            background-color: rgba(0, 123, 255, 0.15);
        }
        .alert-danger {
            background-color: #f8d7da;
            color: #721c24;
            border-color: #f5c6cb;
        }
    </style>
</head>
<body>
<div class="container-fluid mt-0">
    <?php if (!isset($employee_name)): ?>
        <h2 class="text-center mb-4">View My DTR</h2>
    <?php endif; ?>
    <div class="row">
        <div class="col-md-6 offset-md-3">
            <div class="card" id="authForm">
                <div class="card-body">
                    <form action="" method="POST" class="mb-3">
                        <div class="mb-3">
                            <label for="employeeId" class="form-label">Employee ID</label>
                            <input type="text" class="form-control form-control-lg" id="employeeId" name="employeeId" required>
                        </div>
                        <div class="mb-3">
                            <label for="passcode" class="form-label">Passcode</label>
                            <input type="password" class="form-control form-control-lg" id="passcode" name="passcode" required>
                        </div>
                        <input type="hidden" id="startDate" name="startDate" value="<?php echo $start_date; ?>">
                        <input type="hidden" id="endDate" name="endDate" value="<?php echo $end_date; ?>">
                        <div class="d-flex justify-content-between">
                            <button type="submit" class="btn btn-primary btn-lg w-50">View DTR</button>
                            <a href="dtr.php" class="btn btn-secondary btn-lg w-50 ms-2">Home</a>
                        </div>
                    </form>

                    <?php if (isset($error_message)): ?>
                        <div class="alert alert-danger"><?php echo $error_message; ?></div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <?php if (isset($employee_name)): ?>
        <script>
            document.getElementById('authForm').style.display = 'none';
        </script>
        <div class="card mt-0">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="card-title" id="dtrTitle">DTR for <?php echo $employee_name; ?> (<?php echo date('F d, Y', strtotime($start_date)); ?> - <?php echo date('F d, Y', strtotime($end_date)); ?>)</h3>
                    <a href="dtr.php" class="btn btn-secondary btn-lg">Home</a>
                </div>
                
                <div class="d-flex justify-content-between mb-3">
                    <div>
                        <label for="tableDateRange" class="form-label">Filter Date Range</label>
                        <input type="text" class="form-control form-control-lg" id="tableDateRange" name="tableDateRange">
                    </div>
                </div>

                <table id="dtrTable" class="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time In (Morning)</th>
                            <th>Time Out (Morning)</th>
                            <th>Time In (Afternoon)</th>
                            <th>Time Out (Afternoon)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($row = $dtr_records->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo $row['date']; ?></td>
                                <td><?php echo isset($row['time_in_morning']) ? date('h:i A', strtotime($row['time_in_morning'])) : 'N/A'; ?></td>
                                <td><?php echo isset($row['time_out_morning']) ? date('h:i A', strtotime($row['time_out_morning'])) : 'N/A'; ?></td>
                                <td><?php echo isset($row['time_in_afternoon']) ? date('h:i A', strtotime($row['time_in_afternoon'])) : 'N/A'; ?></td>
                                <td><?php echo isset($row['time_out_afternoon']) ? date('h:i A', strtotime($row['time_out_afternoon'])) : 'N/A'; ?></td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>
</div>

<script src="js/bootstrap.bundle.min.js"></script>
<script src="js/jquery-3.6.0.min.js"></script>
<script src="js/jquery.dataTables.min.js"></script>
<script src="js/dataTables.bootstrap5.min.js"></script>
<script src="js/moment.min.js"></script>
<script src="js/daterangepicker.min.js"></script>
<script>
    $(document).ready(function() {
        var table = $('#dtrTable').DataTable();

        $('#tableDateRange').daterangepicker({
            opens: 'left'
        }, function(start, end, label) {
            $.fn.dataTable.ext.search.push(
                function(settings, data, dataIndex) {
                    var min = start.format('YYYY-MM-DD');
                    var max = end.format('YYYY-MM-DD');
                    var date = data[0]; // use data for the date column

                    if (
                        (min === null && max === null) ||
                        (min === null && date <= max) ||
                        (min <= date && max === null) ||
                        (min <= date && date <= max)
                    ) {
                        return true;
                    }
                    return false;
                }
            );
            table.draw();
            $.fn.dataTable.ext.search.pop();

            // Update the date range in the title
            $('#dtrTitle').text('DTR for <?php echo $employee_name; ?> (' + start.format('MMMM DD, YYYY') + ' - ' + end.format('MMMM DD, YYYY') + ')');
        });

        // Initialize the date range picker with the current month
        $('#tableDateRange').val('<?php echo date('m/d/Y', strtotime($start_date)); ?> - <?php echo date('m/d/Y', strtotime($end_date)); ?>');
        $('#tableDateRange').data('daterangepicker').setStartDate('<?php echo date('m/d/Y', strtotime($start_date)); ?>');
        $('#tableDateRange').data('daterangepicker').setEndDate('<?php echo date('m/d/Y', strtotime($end_date)); ?>');
    });
</script>
</body>
</html>