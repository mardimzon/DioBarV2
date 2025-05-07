<h1>Manage Branches</h1>
<table class="table table-bordered">
    <thead>
        <tr>
            <th>ID</th>
            <th>Branch Name</th>
            <th>Branch Address</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php
        // Fetch branches from the database
        $result = $conn->query("SELECT id, branch_name, branch_address FROM branches");
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$row['id']}</td>";
            echo "<td>{$row['branch_name']}</td>";
            echo "<td>{$row['branch_address']}</td>";
            echo "<td>
                    <button class='btn btn-warning' data-toggle='modal' data-target='#editBranchModal' data-id='{$row['id']}' data-branch_name='{$row['branch_name']}' data-branch_address='{$row['branch_address']}'>Edit</button>
                    <button class='btn btn-danger' data-toggle='modal' data-target='#deleteBranchModal' data-id='{$row['id']}'>Delete</button>
                  </td>";
            echo "</tr>";
        }
        ?>
    </tbody>
</table>
<button class="btn btn-success" data-toggle='modal' data-target='#createBranchModal'>Create New Branch</button>

<!-- Modals for creating, editing, and deleting branches -->
<!-- ...existing code... -->