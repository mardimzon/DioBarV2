<?php
// Use a more robust way to include the db.php file
$dbPath = __DIR__ . '/includes/db.php';
if (file_exists($dbPath)) {
    include $dbPath;
} else {
    die("Error: Database connection file not found at: $dbPath");
}

// Check if the connectDB function exists
if (!function_exists('connectDB')) {
    die("Error: connectDB function not defined in database connection file.");
}

// Create connection
$conn = connectDB();

// Fetch employees by branch (AJAX call)
if (isset($_POST['fetchEmployeesByBranch'])) {
    $branch = $_POST['branch'];
    $query = "SELECT employee_id, employee_firstname, employee_middlename, employee_lastname, schedule_start, schedule_end, branch FROM employees";
    
    if ($branch !== "all") {
        $query .= " WHERE branch = '$branch'";
    }
    
    $query .= " ORDER BY employee_lastname, employee_firstname";
    
    $result = $conn->query($query);
    $employeesList = [];
    
    while ($row = $result->fetch_assoc()) {
        $fullName = $row['employee_lastname'] . ', ' . $row['employee_firstname'];
        if (!empty($row['employee_middlename'])) {
            $fullName .= ' ' . substr($row['employee_middlename'], 0, 1) . '.';
        }
        
        $employeesList[] = [
            'employee_id' => $row['employee_id'],
            'name' => $fullName,
            'schedule_start' => $row['schedule_start'],
            'schedule_end' => $row['schedule_end'],
            'branch' => $row['branch']
        ];
    }
    
    echo json_encode($employeesList);
    exit();
}

// Fetch DTR for a given employee
if (isset($_POST['fetchDTR'])) {
    $employee_id = $_POST['employee_id'];
    $month = isset($_POST['month']) ? $_POST['month'] : date('m');
    $year = isset($_POST['year']) ? $_POST['year'] : date('Y');
    
    // Add the month and year filtering to the query
    $query = "SELECT * FROM timerecords WHERE employee_id = '$employee_id' 
              AND MONTH(date) = '$month' AND YEAR(date) = '$year' 
              ORDER BY date ASC";
    
    $dtr = $conn->query($query)->fetch_all(MYSQLI_ASSOC);
    echo json_encode($dtr);
    exit();
}

// Include header
include 'includes/header.php';
?>

    <!-- Branch Filter -->
    <div class="row mb-3">
        <div class="col-md-4 mb-2 mb-md-0">
            <select id="branchSelect" class="form-select">
                <option value="all">All Branches</option>
                <option value="QCPL - Main">QCPL - Main</option>
                <option value="QCPL - Branch 1">QCPL - Branch 1</option>
                <option value="QCPL - Branch 2">QCPL - Branch 2</option>
                <option value="QCPL - Branch 3">QCPL - Branch 3</option>
                <option value="QCPL - Branch 4">QCPL - Branch 4</option>
            </select>
        </div>
        
        <div class="col-md-8">
            <div class="search-tools">
                <div class="search-container d-flex flex-grow-1">
                    <div class="flex-grow-1 me-2 position-relative">
                        <input type="text" id="employeeSearch" class="form-control" placeholder="Search by ID, Name, or Full Name">
                        <div id="searchResults" class="search-results"></div>
                    </div>
                    <button class="btn btn-primary" type="button" id="searchBtn">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>
                <button class="btn btn-outline-secondary" type="button" id="clearSearchBtn">
                    <i class="fas fa-times"></i> Clear
                </button>
            </div>
        </div>
    </div>
    
    <!-- Employee List Table (initially hidden) -->
    <div id="employeeListContainer" class="employee-list-container">
        <table class="table table-hover employee-list-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Schedule</th>
                    <th>Branch</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="employeeListBody">
                <!-- Employee list will be populated here -->
            </tbody>
        </table>
    </div>
    
    <!-- Message for no employees -->
    <div id="noEmployeesMessage" class="no-employees-message" style="display: none;">
        <i class="fas fa-users-slash fa-3x mb-3"></i>
        <h5>No employees found for this branch</h5>
        <p>Try selecting a different branch or search for a specific employee.</p>
    </div>

    <!-- Employee Information Display (hidden by default) -->
    <div id="employeeInfo" class="employee-info mb-3" style="display: none;">
        <h4 id="employeeName">Employee Name</h4>
        <div class="row">
            <div class="col-md-4">
                <p><strong>ID:</strong> <span id="employeeId"></span></p>
            </div>
            <div class="col-md-4">
                <p><strong>Branch:</strong> <span id="employeeBranch"></span></p>
            </div>
            <div class="col-md-4">
                <p><strong>Schedule:</strong> <span id="employeeSchedule"></span></p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <p><strong>Current Period:</strong> <span id="currentPeriod">Current Month</span></p>
            </div>
            <div class="col-md-6 text-end">
                <button id="changeMonthBtn" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#monthPickerModal">
                    <i class="fas fa-calendar-alt me-1"></i> Change Month
                </button>
            </div>
        </div>
    </div>

    <div class="row mb-3">
        <div class="col">
            <button id="fullscreenBtn" class="btn btn-secondary fullscreen-btn" title="Toggle Fullscreen (F11)">
                <i class="fas fa-expand"></i>
            </button>
        </div>
    </div>

<!-- Month Picker Modal -->
<div class="modal fade" id="monthPickerModal" tabindex="-1" aria-labelledby="monthPickerModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="monthPickerModalLabel">Select Month</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <label for="monthSelect" class="form-label">Month</label>
                        <select id="monthSelect" class="form-select">
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="yearSelect" class="form-label">Year</label>
                        <select id="yearSelect" class="form-select">
                            <!-- Will be populated dynamically -->
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="confirmMonthBtn">
                    <i class="fas fa-check me-1"></i> Apply
                </button>
            </div>
        </div>
    </div>
</div>

<!-- PDF Preview Modal -->
<div class="modal fade" id="pdfPreviewModal" tabindex="-1" aria-labelledby="pdfPreviewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="pdfPreviewModalLabel">DTR Preview</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="pdfPreview"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="downloadPdfBtn">
                    <i class="fas fa-download me-1"></i> Download PDF
                </button>
                <button type="button" class="btn btn-success" id="saveAsExcelBtn">
                    <i class="fas fa-file-excel me-1"></i> Export to Excel
                </button>
            </div>
        </div>
    </div>
</div>

<!-- DTR Data Container (hidden) - We'll use this to store the data -->
<div id="dtrDataContainer" style="display: none;">
    <table id="dtrTable" class="table table-bordered text-center">
        <thead>
            <tr>
                <th rowspan="2">Days</th>
                <th colspan="2">Morning</th>
                <th colspan="2">Afternoon</th>
                <th colspan="2">Hours Rendered</th>
            </tr>
            <tr>
                <th>Arrived</th>
                <th>Departure</th>
                <th>Arrived</th>
                <th>Departure</th>
                <th>Hours</th>
                <th>Minutes</th>
            </tr>
        </thead>
        <tbody id="dtrTableBody">
            <!-- This will be populated with appropriate days by JavaScript -->
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5" class="text-end"><strong>Total</strong></td>
                <td id="totalHours">0</td>
                <td id="totalMinutes">0</td>
            </tr>
        </tfoot>
    </table>
</div>
</div>

<?php
include 'includes/footer.php';
$conn->close();
?>