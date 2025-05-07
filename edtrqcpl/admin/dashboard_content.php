<h1>Welcome to the Dashboard</h1>
<?php
if ($_SESSION['role'] == 'admin') {
    echo "<p>You are an admin.</p>";
} else {
    echo "<p>You are a user.</p>";
}
?>
<div class="row">
    <div class="col-lg-3 col-6">
        <!-- small box -->
        <div class="small-box bg-info">
            <div class="inner">
                <h3><?php echo $totalEmployees; ?></h3>
                <p>Total Employees</p>
            </div>
            <div class="icon">
                <i class="fas fa-users"></i>
            </div>
        </div>
    </div>
    <div class="col-lg-3 col-6">
        <!-- small box -->
        <div class="small-box bg-success">
            <div class="inner">
                <h3><?php echo $attendanceToday; ?></h3>
                <p>Attendance Today</p>
            </div>
            <div class="icon">
                <i class="fas fa-clock"></i>
            </div>
        </div>
    </div>
    <div class="col-lg-3 col-6">
        <!-- small box -->
        <div class="small-box bg-warning">
            <div class="inner">
                <h3><?php echo $absentToday; ?></h3>
                <p>Absent Today</p>
            </div>
            <div class="icon">
                <i class="fas fa-user-times"></i>
            </div>
        </div>
    </div>
    <div class="col-lg-3 col-6">
        <!-- small box -->
        <div class="small-box bg-danger">
            <div class="inner">
                <h3><?php echo $lateToday; ?></h3>
                <p>Late Today</p>
            </div>
            <div class="icon">
                <i class="fas fa-user-clock"></i>
            </div>
        </div>
    </div>
    <div class="col-lg-3 col-6">
        <!-- small box -->
        <div class="small-box bg-primary">
            <div class="inner">
                <h3><?php echo $earlyLeaversToday; ?></h3>
                <p>Early Leavers Today</p>
            </div>
            <div class="icon">
                <i class="fas fa-user-minus"></i>
            </div>
        </div>
    </div>
</div>
<a href="logout.php">Logout</a>
