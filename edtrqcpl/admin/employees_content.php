<h1>Manage Employees</h1>
<form method="post" class="form-inline mb-3">
    <div class="form-group mr-2">
        <label for="search_keyword" class="mr-2">Search</label>
        <input type="text" class="form-control" id="search_keyword" name="search_keyword" value="<?php echo $search_keyword; ?>">
    </div>
    <div class="form-group mr-2">
        <label for="sort_by" class="mr-2">Sort By</label>
        <select class="form-control" id="sort_by" name="sort_by">
            <option value="id" <?php if ($sort_by == 'id') echo 'selected'; ?>>ID</option>
            <option value="employee_id" <?php if ($sort_by == 'employee_id') echo 'selected'; ?>>Employee ID</option>
            <option value="employee_firstname" <?php if ($sort_by == 'employee_firstname') echo 'selected'; ?>>First Name</option>
            <option value="branch" <?php if ($sort_by == 'branch') echo 'selected'; ?>>Branch</option>
            <!-- Add other sort options as needed -->
        </select>
    </div>
    <div class="form-group mr-2">
        <label for="sort_order" class="mr-2">Order</label>
        <select class="form-control" id="sort_order" name="sort_order">
            <option value="ASC" <?php if ($sort_order == 'ASC') echo 'selected'; ?>>Ascending</option>
            <option value="DESC" <?php if ($sort_order == 'DESC') echo 'selected'; ?>>Descending</option>
        </select>
    </div>
    <div class="form-group mr-2">
        <label for="items_per_page" class="mr-2">Items Per Page</label>
        <input type="number" class="form-control" id="items_per_page" name="items_per_page" value="<?php echo $items_per_page; ?>" min="1">
    </div>
    <button type="submit" class="btn btn-primary">Apply</button>
</form>
<table class="table table-bordered">
    <thead>
        <tr>
            <th>ID</th>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Birthday</th>
            <th>Branch</th>
            <th>Schedule Start</th>
            <th>Schedule End</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php
        // Fetch employees from the database
        while ($row = $result->fetch_assoc()) {
            $employee_name = $row['employee_firstname'] . ' ' . $row['employee_middlename'] . ' ' . $row['employee_lastname'];
            
            // Convert time to 12-hour format without seconds, leave blank if null
            $schedule_start = $row['schedule_start'] ? (new DateTime($row['schedule_start']))->format('h:i A') : '';
            $schedule_end = $row['schedule_end'] ? (new DateTime($row['schedule_end']))->format('h:i A') : '';

            echo "<tr>";
            echo "<td>{$row['id']}</td>";
            echo "<td>{$row['employee_id']}</td>";
            echo "<td>{$employee_name}</td>";
            echo "<td>{$row['employee_birthday']}</td>";
            echo "<td>{$row['branch']}</td>";
            echo "<td>{$schedule_start}</td>";
            echo "<td>{$schedule_end}</td>";
            echo "<td>
                    <button class='btn btn-warning' data-toggle='modal' data-target='#editEmployeeModal' data-id='{$row['id']}' data-employee_id='{$row['employee_id']}' data-employee_firstname='{$row['employee_firstname']}' data-employee_middlename='{$row['employee_middlename']}' data-employee_lastname='{$row['employee_lastname']}' data-employee_birthday='{$row['employee_birthday']}' data-passcode='{$row['passcode']}' data-branch='{$row['branch']}' data-schedule_start='{$row['schedule_start']}' data-schedule_end='{$row['schedule_end']}'>Edit</button>
                    <button class='btn btn-danger' data-toggle='modal' data-target='#deleteEmployeeModal' data-id='{$row['id']}'>Delete</button>
                  </td>";
            echo "</tr>";
        }
        ?>
    </tbody>
</table>
<nav aria-label="Page navigation">
    <ul class="pagination">
        <?php for ($i = 1; $i <= $total_pages; $i++): ?>
            <li class="page-item <?php if ($i == $page) echo 'active'; ?>">
                <form method="post" style="display:inline;">
                    <input type="hidden" name="page" value="<?php echo $i; ?>">
                    <input type="hidden" name="search_keyword" value="<?php echo $search_keyword; ?>">
                    <input type="hidden" name="sort_by" value="<?php echo $sort_by; ?>">
                    <input type="hidden" name="sort_order" value="<?php echo $sort_order; ?>">
                    <input type="hidden" name="items_per_page" value="<?php echo $items_per_page; ?>">
                    <button type="submit" class="page-link"><?php echo $i; ?></button>
                </form>
            </li>
        <?php endfor; ?>
    </ul>
</nav>
<button class="btn btn-success" data-toggle="modal" data-target="#createEmployeeModal">Create New Employee</button>

<!-- Create Employee Modal -->
<div class="modal fade" id="createEmployeeModal" tabindex="-1" role="dialog" aria-labelledby="createEmployeeModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form method="post">
                <div class="modal-header">
                    <h5 class="modal-title" id="createEmployeeModalLabel">Create New Employee</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="employee_id">Employee ID</label>
                        <input type="text" class="form-control" id="employee_id" name="employee_id" required>
                    </div>
                    <div class="form-group">
                        <label for="employee_firstname">First Name</label>
                        <input type="text" class="form-control" id="employee_firstname" name="employee_firstname" required>
                    </div>
                    <div class="form-group">
                        <label for="employee_middlename">Middle Name</label>
                        <input type="text" class="form-control" id="employee_middlename" name="employee_middlename">
                    </div>
                    <div class="form-group">
                        <label for="employee_lastname">Last Name</label>
                        <input type="text" class="form-control" id="employee_lastname" name="employee_lastname" required>
                    </div>
                    <div class="form-group">
                        <label for="employee_birthday">Birthday</label>
                        <input type="date" class="form-control" id="employee_birthday" name="employee_birthday" required>
                    </div>
                    <div class="form-group">
                        <label for="passcode">Passcode</label>
                        <input type="text" class="form-control" id="passcode" name="passcode" required>
                    </div>
                    <div class="form-group">
                        <label for="branch">Branch</label>
                        <select class="form-control" id="branch" name="branch" required>
                            <?php foreach ($branches as $branch): ?>
                                <option value="<?php echo $branch; ?>"><?php echo $branch; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="schedule_start">Schedule Start</label>
                        <input type="time" class="form-control" id="schedule_start" name="schedule_start" required>
                    </div>
                    <div class="form-group">
                        <label for="schedule_end">Schedule End</label>
                        <input type="time" class="form-control" id="schedule_end" name="schedule_end" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" name="create_employee">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Employee Modal -->
<div class="modal fade" id="editEmployeeModal" tabindex="-1" role="dialog" aria-labelledby="editEmployeeModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form method="post">
                <div class="modal-header">
                    <h5 class="modal-title" id="editEmployeeModalLabel">Edit Employee</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="edit-id" name="id">
                    <div class="form-group">
                        <label for="edit-employee_id">Employee ID</label>
                        <input type="text" class="form-control" id="edit-employee_id" name="employee_id" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-employee_firstname">First Name</label>
                        <input type="text" class="form-control" id="edit-employee_firstname" name="employee_firstname" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-employee_middlename">Middle Name</label>
                        <input type="text" class="form-control" id="edit-employee_middlename" name="employee_middlename">
                    </div>
                    <div class="form-group">
                        <label for="edit-employee_lastname">Last Name</label>
                        <input type="text" class="form-control" id="edit-employee_lastname" name="employee_lastname" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-employee_birthday">Birthday</label>
                        <input type="date" class="form-control" id="edit-employee_birthday" name="employee_birthday" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-passcode">Passcode</label>
                        <input type="text" class="form-control" id="edit-passcode" name="passcode" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-branch">Branch</label>
                        <select class="form-control" id="edit-branch" name="branch" required>
                            <?php foreach ($branches as $branch): ?>
                                <option value="<?php echo $branch; ?>"><?php echo $branch; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-schedule_start">Schedule Start</label>
                        <input type="time" class="form-control" id="edit-schedule_start" name="schedule_start" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-schedule_end">Schedule End</label>
                        <input type="time" class="form-control" id="edit-schedule_end" name="schedule_end" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" name="edit_employee">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Employee Modal -->
<div class="modal fade" id="deleteEmployeeModal" tabindex="-1" role="dialog" aria-labelledby="deleteEmployeeModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form method="post">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteEmployeeModalLabel">Delete Employee</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="delete-id" name="id">
                    <p>Are you sure you want to delete this employee?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-danger" name="delete_employee">Delete</button>
                </div>
            </form>
        </div>
    </div>
</div>