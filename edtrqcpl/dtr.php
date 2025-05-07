<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Employee Daily Time Record</title>

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    
    <!-- Google Fonts & Icons -->
    <link rel="stylesheet" href="css/css2.css">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

<div class="container">
    <!-- Notification Container -->
    <div id="notification" class="notification">
        <button class="close-btn" onclick="closeNotification()">&times;</button>
    </div>
    <div class="header">
        <div class="d-flex align-items-center">
            <img src="logo.png" alt="Logo">
            <h4><i class="fas fa-clock"></i> Quezon City Public Library<br>Employee Daily Time Record</h4>
        </div>
        <div class="d-flex">
            <div class="clock-container">
                <span class="date" id="date"></span><br>
                <span class="clock" id="clock"></span>
            </div>
        </div>
    </div>
    <div class="d-flex flex-column flex-grow-1" style="margin-top: 0;">
        <div class="row flex-grow-1 align-items-center">
            <!-- Camera Capture (Left) -->
            <div class="col-md-6 text-center">
                <div class="video-container">
                    <video id="video" autoplay playsinline></video>
                    <canvas id="canvas" style="display:none;"></canvas>
                    <!-- Display Last Captured Image -->
                    <img id="lastImage" class="last-image" src="" alt="Last Captured Image">
                </div>
            </div>

            <!-- Employee Input Form and Display (Right) -->
            <div class="col-md-6">
                <form action="" method="POST" onsubmit="return capturePhoto()">
                    <div class="mb-3">
                        <input type="text" id="employeeId" name="employeeId" class="form-control mb-2 form-control-large" placeholder="Enter Employee ID">
                        <input type="password" id="passcode" name="passcode" class="form-control mb-2 form-control-large" placeholder="Enter Passcode">
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="btn btn-success py-2 mt-3 btn-submit">
                        <i class="fas fa-check-circle"></i> Submit Attendance
                    </button>

                    <!-- View My DTR Button -->
                    <a href="view_dtr.php" class="btn btn-primary btn-view-dtr mt-3">
                        <i class="fas fa-calendar-alt"></i> View My DTR
                    </a>
                </form>

                <!-- Display Employee Name, Time In and Time Out -->
                <div id="timeRecords" class="mt-3">
                    <p><strong>Employee Name:</strong> <span id="employeeName"></span></p>
                    <p><strong>Morning - Time In:</strong> 
                        <span id="timeInMorning"></span> 
                        <strong>&nbsp;&nbsp;&nbsp;&nbsp;Time Out:</strong> 
                        <span id="timeOutMorning"></span>
                    </p>
                    <p><strong>Afternoon - Time In:</strong> 
                        <span id="timeInAfternoon"></span> 
                        <strong>&nbsp;&nbsp;&nbsp;&nbsp;Time Out:</strong> 
                        <span id="timeOutAfternoon"></span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="js/bootstrap.bundle.min.js"></script>

<!-- Clock, Camera & Submit Script -->
<script>
    // Real-time clock update (12-hour format with AM/PM)
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

        const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
        document.getElementById('clock').textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock(); // Initialize immediately

    // Display current date
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        document.getElementById('date').textContent = dateString;
    }
    updateDate(); // Initialize immediately

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    // Access camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => { video.srcObject = stream; })
        .catch(error => { console.error("Error accessing camera:", error); });

    // Function to format time in 12-hour format with AM/PM
    function formatTime(timeString) {
        if (!timeString) return "N/A";
        const [hours, minutes, seconds] = timeString.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
        return `${hour}:${minutes} ${ampm}`;
    }

    // Capture photo & replace live feed
    function capturePhoto() {
        const employeeId = document.getElementById('employeeId').value;
        const passcode = document.getElementById('passcode').value;

        if (employeeId === "" || passcode === "") {
            alert("Please enter Employee ID and Passcode.");
            return false;
        }

        // Capture photo
        const context = canvas.getContext('2d');
        canvas.width = 400; // Fixed width
        canvas.height = 400; // Fixed height
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add timestamp to the image
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
        const timestamp = `${now.toLocaleDateString()} ${hours}:${minutes} ${ampm}`;
        context.font = '20px Arial';
        context.fillStyle = 'green';
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        context.strokeText(timestamp, canvas.width - 200, 30);
        context.fillText(timestamp, canvas.width - 200, 30);

        // Stop camera and replace video with captured image
        video.srcObject.getTracks().forEach(track => track.stop());
        video.style.display = "none";
        canvas.style.display = "block";

        // Add captured image to form data
        const imageData = canvas.toDataURL('image/png');
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.name = 'image';
        imageInput.value = imageData;
        document.querySelector('form').appendChild(imageInput);

        // Update last captured image
        const lastImage = document.getElementById('lastImage');
        lastImage.src = imageData;
        lastImage.style.display = 'block';

        return true;
    }

    // Update time records display
    function updateTimeRecords(employeeName, timeInMorning, timeOutMorning, timeInAfternoon, timeOutAfternoon) {
        document.getElementById('employeeName').textContent = employeeName;
        document.getElementById('timeInMorning').textContent = formatTime(timeInMorning);
        document.getElementById('timeOutMorning').textContent = formatTime(timeOutMorning);
        document.getElementById('timeInAfternoon').textContent = formatTime(timeInAfternoon);
        document.getElementById('timeOutAfternoon').textContent = formatTime(timeOutAfternoon);
    }

    // Function to show notification
    function showNotification(message, employeeName, timestamp) {
        const notification = document.getElementById('notification');
        notification.innerHTML = `<button class="close-btn" onclick="closeNotification()">&times;</button><strong>${employeeName}</strong><br>${message}<br><small>${timestamp}</small>`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 20000); // 20 seconds
    }

    // Function to close notification
    function closeNotification() {
        document.getElementById('notification').style.display = 'none';
    }
</script>

<?php
date_default_timezone_set('Asia/Manila'); // Set your local timezone

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "qcpl"; // Replace with your database name

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $employee_id = $_POST['employeeId'];
    $passcode = $_POST['passcode'];
    $current_time = date('H:i:s'); // Only record the time (HH:MM:SS)
    $date = date('Y-m-d');
    $image_data = $_POST['image'];

    // Validate employee ID and passcode (you should implement proper validation)
    $sql = "SELECT * FROM employees WHERE employee_id = '$employee_id' AND passcode = '$passcode'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Fetch employee name and schedule
        $employee = $result->fetch_assoc();
        $employee_name = $employee['employee_firstname'] . ' ' . $employee['employee_lastname'];
        $schedule_start = new DateTime($employee['schedule_start']);
        $schedule_end = new DateTime($employee['schedule_end']);
        $grace_period_end = clone $schedule_start;
        $grace_period_end->modify('+15 minutes');

        // Save the image to the server
        $image_path = "images/" . preg_replace('/[^A-Za-z0-9_\-]/', '_', "{$employee_id}_{$date}_{$current_time}") . ".png";
        file_put_contents($image_path, base64_decode(explode(',', $image_data)[1]));

        // Check if there is already a time_in record for the same day
        $sql = "SELECT * FROM timerecords WHERE employee_id = '$employee_id' AND date = '$date'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            // Fetch the existing record
            $row = $result->fetch_assoc();
            $time_in_morning = $row['time_in_morning'];
            $time_out_morning = $row['time_out_morning'];
            $time_in_afternoon = $row['time_in_afternoon'];
            $time_out_afternoon = $row['time_out_afternoon'];

            // Determine which time slot to update
            if (empty($time_in_morning)) {
                // Update time_in_morning
                $sql = "UPDATE timerecords SET time_in_morning = '$current_time', time_in_img_morning = '$image_path' WHERE employee_id = '$employee_id' AND date = '$date'";
                $time_in_morning = $current_time;
                $time_in_status = ($current_time <= $grace_period_end->format('H:i:s')) ? "Successful Time In" : "Late - Time In";
            } elseif (empty($time_out_morning)) {
                // Update time_out_morning
                $sql = "UPDATE timerecords SET time_out_morning = '$current_time', time_out_img_morning = '$image_path' WHERE employee_id = '$employee_id' AND date = '$date'";
                $time_out_morning = $current_time;
                $time_out_status = ($current_time <= '12:00:00') ? "Undertime - Time Out Morning" : "Successful - Time Out Morning";
            } elseif (empty($time_in_afternoon)) {
                // Update time_in_afternoon
                $sql = "UPDATE timerecords SET time_in_afternoon = '$current_time', time_in_img_afternoon = '$image_path' WHERE employee_id = '$employee_id' AND date = '$date'";
                $time_in_afternoon = $current_time;
                $time_in_status = ($current_time <= '13:00:00') ? "Successful Time In Afternoon" : "Late - Time In Afternoon";
            } elseif (empty($time_out_afternoon)) {
                // Update time_out_afternoon
                $sql = "UPDATE timerecords SET time_out_afternoon = '$current_time', time_out_img_afternoon = '$image_path' WHERE employee_id = '$employee_id' AND date = '$date'";
                $time_out_afternoon = $current_time;
                $time_out_status = ($current_time <= '16:59:59') ? "Undertime - Time Out Afternoon" : "Successful - Time Out Afternoon";
            } else {
                echo "All time slots for today are already filled.";
                exit();
            }

            if ($conn->query($sql) === TRUE) {
                echo "<script>
                    updateTimeRecords('$employee_name', '$time_in_morning', '$time_out_morning', '$time_in_afternoon', '$time_out_afternoon');
                    document.getElementById('lastImage').src = '$image_path';
                    document.getElementById('lastImage').style.display = 'block';
                    showNotification('$time_in_status $time_out_status', '$employee_name', '$current_time');
                </script>";
                echo "Time recorded successfully";
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        } else {
            // Insert new record with time_in_morning
            $sql = "INSERT INTO timerecords (employee_id, date, time_in_morning, time_in_img_morning) VALUES ('$employee_id', '$date', '$current_time', '$image_path')";
            if ($conn->query($sql) === TRUE) {
                $time_in_status = ($current_time <= $grace_period_end->format('H:i:s')) ? "Successful Time In" : "Late - Time In";
                echo "<script>
                    updateTimeRecords('$employee_name', '$current_time', '', '', '');
                    document.getElementById('lastImage').src = '$image_path';
                    document.getElementById('lastImage').style.display = 'block';
                    showNotification('$time_in_status', '$employee_name', '$current_time');
                </script>";
                echo "Time in recorded successfully";
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        }
    } else {
        echo "Invalid Employee ID or Passcode";
    }

    $conn->close();
}
?>

</body>
</html>