<h1>Manage Time Records</h1>
<form method="post" class="form-inline mb-3">
    <div class="form-group mr-2">
        <label for="filter_employee_name" class="mr-2">Employee Name</label>
        <input type="text" class="form-control" id="filter_employee_name" name="filter_employee_name" value="<?php echo $filter_employee_name; ?>">
    </div>
    <div class="form-group mr-2">
        <label for="filter_date_start" class="mr-2">Start Date</label>
        <input type="date" class="form-control" id="filter_date_start" name="filter_date_start" value="<?php echo $filter_date_start; ?>">
    </div>
    <div class="form-group mr-2">
        <label for="filter_date_end" class="mr-2">End Date</label>
        <input type="date" class="form-control" id="filter_date_end" name="filter_date_end" value="<?php echo $filter_date_end; ?>">
    </div>
    <div class="form-group mr-2">
        <label for="sort_by" class="mr-2">Sort By</label>
        <select class="form-control" id="sort_by" name="sort_by">
            <option value="id" <?php if ($sort_by == 'id') echo 'selected'; ?>>ID</option>
            <option value="employee_id" <?php if ($sort_by == 'employee_id') echo 'selected'; ?>>Employee ID</option>
            <option value="date" <?php if ($sort_by == 'date') echo 'selected'; ?>>Date</option>
            <option value="branch" <?php if ($sort_by == 'branch') echo 'selected'; ?>>Branch</option>
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
<div class="table-responsive">
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Branch</th>
                <th>Date</th>
                <th>IN - AM</th>
                <th>OUT - AM</th>
                <th>IN - PM</th>
                <th>OUT - PM</th>
                <th>MORNING IN IMAGE</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $employee_name = $row['employee_firstname'] . ' ' . $row['employee_middlename'] . ' ' . $row['employee_lastname'];

                    // Convert time to 12-hour format without seconds, leave blank if null
                    $time_in_morning = $row['time_in_morning'] ? (new DateTime($row['time_in_morning']))->format('h:i A') : '';
                    $time_out_morning = $row['time_out_morning'] ? (new DateTime($row['time_out_morning']))->format('h:i A') : '';
                    $time_in_afternoon = $row['time_in_afternoon'] ? (new DateTime($row['time_in_afternoon']))->format('h:i A') : '';
                    $time_out_afternoon = $row['time_out_afternoon'] ? (new DateTime($row['time_out_afternoon']))->format('h:i A') : '';

                    echo "<tr>";
                    echo "<td>{$row['id']}</td>";
                    echo "<td>{$employee_name}</td>";
                    echo "<td>{$row['branch']}</td>";
                    echo "<td>{$row['date']}</td>";
                    echo "<td>{$time_in_morning}</td>";
                    echo "<td>{$time_out_morning}</td>";
                    echo "<td>{$time_in_afternoon}</td>";
                    echo "<td>{$time_out_afternoon}</td>";
                    echo "<td><img src='../{$row['time_in_img_morning']}' alt='Time In Morning' width='50' height='50'></td>";
                    echo "<td>
                            <button class='btn btn-warning' data-toggle='modal' data-target='#editTimeRecordModal' data-id='{$row['id']}' data-employee_id='{$row['employee_id']}' data-date='{$row['date']}' data-time_in_morning='{$row['time_in_morning']}' data-time_out_morning='{$row['time_out_morning']}' data-time_in_afternoon='{$row['time_in_afternoon']}' data-time_out_afternoon='{$row['time_out_afternoon']}' data-time_in_img_morning='{$row['time_in_img_morning']}' data-time_out_img_morning='{$row['time_out_img_morning']}' data-time_in_img_afternoon='{$row['time_in_img_afternoon']}' data-time_out_img_afternoon='{$row['time_out_img_afternoon']}'>Edit</button>
                            <button class='btn btn-danger' data-toggle='modal' data-target='#deleteTimeRecordModal' data-id='{$row['id']}'>Delete</button>
                        </td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='10'>No records found</td></tr>";
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
                        <input type="hidden" name="filter_employee_name" value="<?php echo $filter_employee_name; ?>">
                        <input type="hidden" name="filter_date" value="<?php echo $filter_date; ?>">
                        <input type="hidden" name="filter_date_start" value="<?php echo $filter_date_start; ?>">
                        <input type="hidden" name="filter_date_end" value="<?php echo $filter_date_end; ?>">
                        <input type="hidden" name="sort_by" value="<?php echo $sort_by; ?>">
                        <input type="hidden" name="sort_order" value="<?php echo $sort_order; ?>">
                        <input type="hidden" name="items_per_page" value="<?php echo $items_per_page; ?>">
                        <button type="submit" class="page-link"><?php echo $i; ?></button>
                    </form>
                </li>
            <?php endfor; ?>
        </ul>
    </nav>
</div>

<!-- Edit Time Record Modal -->
<div class="modal fade" id="editTimeRecordModal" tabindex="-1" role="dialog" aria-labelledby="editTimeRecordModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form method="post" action="timerecords.php">
                <div class="modal-header">
                    <h5 class="modal-title" id="editTimeRecordModalLabel">Edit Time Record</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="edit_id" name="id">
                    <div class="form-group">
                        <label for="edit_employee_id">Employee ID</label>
                        <input type="text" class="form-control" id="edit_employee_id" name="employee_id">
                    </div>
                    <div class="form-group">
                        <label for="edit_date">Date</label>
                        <input type="date" class="form-control" id="edit_date" name="date">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_in_morning">Time In Morning</label>
                        <input type="time" class="form-control" id="edit_time_in_morning" name="time_in_morning">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_out_morning">Time Out Morning</label>
                        <input type="time" class="form-control" id="edit_time_out_morning" name="time_out_morning">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_in_afternoon">Time In Afternoon</label>
                        <input type="time" class="form-control" id="edit_time_in_afternoon" name="time_in_afternoon">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_out_afternoon">Time Out Afternoon</label>
                        <input type="time" class="form-control" id="edit_time_out_afternoon" name="time_out_afternoon">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_in_img_morning">Time In Image Morning</label>
                        <input type="text" class="form-control" id="edit_time_in_img_morning" name="time_in_img_morning">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_out_img_morning">Time Out Image Morning</label>
                        <input type="text" class="form-control" id="edit_time_out_img_morning" name="time_out_img_morning">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_in_img_afternoon">Time In Image Afternoon</label>
                        <input type="text" class="form-control" id="edit_time_in_img_afternoon" name="time_in_img_afternoon">
                    </div>
                    <div class="form-group">
                        <label for="edit_time_out_img_afternoon">Time Out Image Afternoon</label>
                        <input type="text" class="form-control" id="edit_time_out_img_afternoon" name="time_out_img_afternoon">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" name="edit_timerecord">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Time Record Modal -->
<div class="modal fade" id="deleteTimeRecordModal" tabindex="-1" role="dialog" aria-labelledby="deleteTimeRecordModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form method="post" action="timerecords.php">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteTimeRecordModalLabel">Delete Time Record</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="delete_id" name="id">
                    <p>Are you sure you want to delete this time record?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-danger" name="delete_timerecord">Delete</button>
                </div>
            </form>
        </div>
    </div>
</div>