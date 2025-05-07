/**
 * DTR Employees Module
 * ------------------
 * Handles employee data fetching, searching, and display
 */

const DTREmployees = (function() {
    // Module variables
    let employeesList = [];
    let selectedEmployeeId = null;

    /**
     * Fetch and display employees by branch
     */
    function fetchEmployeesByBranch(branch) {
        console.log(`Fetching employees for branch: ${branch}`);
        
        // Find required DOM elements
        const employeeListBody = document.getElementById('employeeListBody');
        const employeeListContainer = document.getElementById('employeeListContainer');
        const noEmployeesMessage = document.getElementById('noEmployeesMessage');
        
        if (!employeeListBody || !employeeListContainer || !noEmployeesMessage) {
            console.error('Required DOM elements for employee list not found');
            return;
        }
        
        // Show loading indicator
        employeeListBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading employees...</p>
                </td>
            </tr>
        `;
        
        employeeListContainer.style.display = 'block';
        noEmployeesMessage.style.display = 'none';
        
        // AJAX request to fetch employees by branch
        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'fetchEmployeesByBranch=true&branch=' + encodeURIComponent(branch)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(employees => {
            console.log(`Received ${employees.length} employees from server`);
            
            if (employees.length > 0) {
                employeeListBody.innerHTML = '';
                
                employees.forEach(employee => {
                    // Format schedule
                    let scheduleStart = employee.schedule_start ? DTRCore.convertTo12HourFormat(employee.schedule_start) : '-';
                    let scheduleEnd = employee.schedule_end ? DTRCore.convertTo12HourFormat(employee.schedule_end) : '-';
                    let scheduleText = `${scheduleStart} - ${scheduleEnd}`;
                    
                    const row = document.createElement('tr');
                    
                    // Add the 'selected-employee' class if this is the selected employee
                    if (selectedEmployeeId && employee.employee_id == selectedEmployeeId) {
                        row.classList.add('selected-employee');
                    }
                    
                    row.innerHTML = `
                        <td>${employee.employee_id}</td>
                        <td>${employee.name}</td>
                        <td>${scheduleText}</td>
                        <td>
                            <span class="badge branch-badge">${employee.branch || 'Not specified'}</span>
                        </td>
                        <td class="employee-actions">
                            <button class="btn btn-primary action-btn view-dtr-btn" title="View DTR">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-success action-btn export-excel-btn" title="Export Excel">
                                <i class="fas fa-file-excel"></i>
                            </button>
                        </td>
                    `;
                    
                    // Add employee ID as a data attribute for easy retrieval
                    row.dataset.employeeId = employee.employee_id;
                    
                    // Add event listeners to the newly created elements
                    attachEmployeeRowEventListeners(row, employee);
                    
                    employeeListBody.appendChild(row);
                });
                
                employeeListContainer.style.display = 'block';
                noEmployeesMessage.style.display = 'none';
            } else {
                employeeListContainer.style.display = 'none';
                noEmployeesMessage.style.display = 'block';
            }
            
            // Update global employees list for search functionality
            employeesList = employees;
        })
        .catch(error => {
            console.error('Error fetching employees:', error);
            employeeListBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
                        <p>Error loading employees. Please try again.</p>
                        <small class="text-muted">${error.message}</small>
                    </td>
                </tr>
            `;
        });
    }
    
    /**
     * Helper function to attach event listeners to employee row
     */
    function attachEmployeeRowEventListeners(row, employee) {
        // Add click event to the row to select employee
        row.addEventListener('click', function(e) {
            // Don't trigger if clicked on a button
            if (!e.target.closest('button')) {
                fetchEmployeeDTR(employee);
                highlightSelectedEmployee(employee.employee_id);
            }
        });
        
        // Add click event to view DTR button
        const viewDTRBtn = row.querySelector('.view-dtr-btn');
        if (viewDTRBtn) {
            viewDTRBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent row click from triggering
                fetchEmployeeDTR(employee);
                highlightSelectedEmployee(employee.employee_id);
                setTimeout(() => {
                    if (typeof DTRExports !== 'undefined' && DTRExports.generatePDF) {
                        DTRExports.generatePDF();
                    } else {
                        console.error('DTRExports module or generatePDF function not found');
                    }
                }, 500);
            });
        }
        
        // Add click event to export Excel button
        const exportExcelBtn = row.querySelector('.export-excel-btn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent row click from triggering
                
                fetchEmployeeDTR(employee);
                highlightSelectedEmployee(employee.employee_id);
                
                // Use the new direct export function
                if (typeof DTRExports !== 'undefined' && DTRExports.directExportToExcel) {
                    DTRExports.directExportToExcel(employee);
                } else {
                    console.error('DTRExports module or directExportToExcel function not found');
                    // Fallback to old method if needed
                    setTimeout(() => {
                        if (typeof DTRExports !== 'undefined' && DTRExports.exportToExcel) {
                            DTRExports.exportToExcel();
                        } else {
                            console.error('DTRExports module or exportToExcel function not found');
                        }
                    }, 500);
                }
            });
        }
    }
    
    /**
     * Highlight the selected employee in the table
     */
    function highlightSelectedEmployee(employeeId) {
        // Set the selected employee ID
        selectedEmployeeId = employeeId;
        
        // Remove highlight from all employees
        const allRows = document.querySelectorAll('#employeeListBody tr');
        allRows.forEach(row => {
            row.classList.remove('selected-employee');
        });
        
        // Add highlight to the selected employee
        if (employeeId) {
            const selectedRow = document.querySelector(`#employeeListBody tr[data-employee-id="${employeeId}"]`);
            if (selectedRow) {
                selectedRow.classList.add('selected-employee');
                
                // Scroll to the selected employee
                selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    /**
     * Filter employee list to show only a specific employee
     */
    function filterEmployeeList(employeeId) {
        if (!employeeId) return;
        
        const allRows = document.querySelectorAll('#employeeListBody tr');
        allRows.forEach(row => {
            const rowEmployeeId = row.dataset.employeeId;
            if (rowEmployeeId == employeeId) {
                row.style.display = '';
                row.classList.add('selected-employee');
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show the clear button since we're filtering
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
            clearBtn.style.display = 'inline-flex';
        }
    }
    
    /**
     * Reset employee list filter to show all employees
     */
    function resetEmployeeListFilter() {
        const allRows = document.querySelectorAll('#employeeListBody tr');
        allRows.forEach(row => {
            row.style.display = '';
        });
        
        // Hide the clear button since we're showing all employees
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
    }

    /**
     * Fetch employee DTR data
     */
    function fetchEmployeeDTR(employee) {
        console.log(`Fetching DTR data for employee: ${employee.name} (${employee.employee_id})`);
        
        // Check if employee object is valid
        if (!employee || !employee.employee_id) {
            console.error('Invalid employee object');
            return;
        }
        
        // Save current employee to global variable
        DTRCore.currentEmployee = employee;
        
        // Update employee info display
        const employeeInfo = document.getElementById('employeeInfo');
        const employeeName = document.getElementById('employeeName');
        const employeeId = document.getElementById('employeeId');
        const employeeBranch = document.getElementById('employeeBranch');
        const employeeSchedule = document.getElementById('employeeSchedule');
        
        if (!employeeInfo || !employeeName || !employeeId || !employeeBranch || !employeeSchedule) {
            console.error('Required DOM elements for employee info not found');
            return;
        }
        
        employeeInfo.style.display = 'block';
        employeeName.textContent = employee.name;
        employeeId.textContent = employee.employee_id;
        employeeBranch.textContent = employee.branch || 'Not specified';
        
        // Format schedule in 12-hour format
        let scheduleStart = employee.schedule_start ? DTRCore.convertTo12HourFormat(employee.schedule_start) : 'Not specified';
        let scheduleEnd = employee.schedule_end ? DTRCore.convertTo12HourFormat(employee.schedule_end) : 'Not specified';
        employeeSchedule.textContent = `${scheduleStart} - ${scheduleEnd}`;
        
        // Filter the employee list to show only this employee
        filterEmployeeList(employee.employee_id);
        
        // Update search input with employee info
        const searchInput = document.getElementById('employeeSearch');
        if (searchInput) {
            searchInput.value = `${employee.employee_id} - ${employee.name}`;
        }
        
        // Update period display
        if (typeof DTRMonthPicker !== 'undefined' && DTRMonthPicker.updatePeriodDisplay) {
            DTRMonthPicker.updatePeriodDisplay();
        } else {
            console.error('DTRMonthPicker module or updatePeriodDisplay function not found');
        }
        
        // AJAX request to fetch DTR data
        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `fetchDTR=true&employee_id=${encodeURIComponent(employee.employee_id)}&month=${DTRCore.currentMonth}&year=${DTRCore.currentYear}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(dtr => {
            console.log(`Received ${dtr.length} time records for ${employee.name}`);
            
            // Update employee object with time records
            employee.timeRecords = dtr;
            
            // Populate table with actual time records
            if (typeof DTRCore !== 'undefined' && DTRCore.populateDTRTable) {
                DTRCore.populateDTRTable(dtr);
            } else {
                console.error('DTRCore module or populateDTRTable function not found');
            }
        })
        .catch(error => {
            console.error('Error fetching DTR:', error);
            // Initialize with empty data on error
            if (typeof DTRCore !== 'undefined' && DTRCore.populateDTRTable) {
                DTRCore.populateDTRTable([]);
            }
        });
    }

    /**
     * Setup employee search functionality
     */
    function setupEmployeeSearch() {
        console.log('Setting up employee search functionality');
        
        const searchInput = document.getElementById('employeeSearch');
        const searchResults = document.getElementById('searchResults');
        const searchBtn = document.getElementById('searchBtn');
        const clearBtn = document.getElementById('clearSearchBtn');
        const branchSelect = document.getElementById('branchSelect');
        
        if (!searchInput || !searchResults) {
            console.error('Required DOM elements for employee search not found');
            return;
        }
        
        // Initial state for clear button - hidden until search is performed
        if (clearBtn) {
            clearBtn.style.display = 'none';
            
            // Add click event to clear button
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Clear search input
                if (searchInput) {
                    searchInput.value = '';
                }
                // Hide search results
                if (searchResults) {
                    searchResults.style.display = 'none';
                }
                // Hide clear button
                this.style.display = 'none';
                
                // Reset filter to show all employees
                resetEmployeeListFilter();
                
                // Reset selected employee
                selectedEmployeeId = null;
                
                // Hide employee info section
                const employeeInfo = document.getElementById('employeeInfo');
                if (employeeInfo) {
                    employeeInfo.style.display = 'none';
                }
                
                // Refresh the employee list based on branch
                if (branchSelect) {
                    fetchEmployeesByBranch(branchSelect.value);
                } else {
                    fetchEmployeesByBranch('all');
                }
            });
        }
        
        // Initial load of all employees for search (if not loaded already)
        if (employeesList.length === 0) {
            console.log('Loading all employees for search functionality');
            
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'fetchEmployeesByBranch=true&branch=all'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Loaded ${data.length} employees for search functionality`);
                employeesList = data;
            })
            .catch(error => console.error('Error loading employees for search:', error));
        }
        
        // Show search results
        function showSearchResults(query) {
            searchResults.innerHTML = '';
            
            if (!query.trim()) {
                searchResults.style.display = 'none';
                if (clearBtn) {
                    clearBtn.style.display = 'none';
                }
                return;
            }
            
            // Show clear button whenever there's a query
            if (clearBtn) {
                clearBtn.style.display = 'inline-flex';
            }
            
            const filteredEmployees = employeesList.filter(emp => {
                const lowerQuery = query.toLowerCase();
                return (
                    emp.employee_id.toString().toLowerCase().includes(lowerQuery) ||
                    emp.name.toLowerCase().includes(lowerQuery)
                );
            });
            
            if (filteredEmployees.length > 0) {
                filteredEmployees.slice(0, 10).forEach(emp => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    
                    // Format the display with ID, name and branch
                    const branchInfo = emp.branch ? ` (${emp.branch})` : '';
                    item.textContent = `${emp.employee_id} - ${emp.name}${branchInfo}`;
                    
                    item.addEventListener('click', () => {
                        fetchEmployeeDTR(emp);
                        searchResults.style.display = 'none';
                        searchInput.value = `${emp.employee_id} - ${emp.name}`;
                        // Keep clear button visible
                        if (clearBtn) {
                            clearBtn.style.display = 'inline-flex';
                        }
                    });
                    
                    searchResults.appendChild(item);
                });
                
                searchResults.style.display = 'block';
            } else {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = 'No employees found';
                searchResults.appendChild(item);
                searchResults.style.display = 'block';
            }
        }
        
        // Handle input changes
        searchInput.addEventListener('input', function() {
            showSearchResults(this.value);
            
            // Show/hide clear button based on input
            if (clearBtn) {
                clearBtn.style.display = this.value.trim() ? 'inline-flex' : 'none';
            }
            
            // If search is cleared, reset filter
            if (!this.value.trim()) {
                resetEmployeeListFilter();
            }
        });
        
        // Handle search button click
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                showSearchResults(searchInput.value);
            });
        }
        
        // Handle Enter key in search field
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                showSearchResults(this.value);
                
                // If there's only one result, select it automatically
                const items = searchResults.querySelectorAll('.search-result-item');
                if (items.length === 1 && items[0].textContent !== 'No employees found') {
                    items[0].click();
                }
            }
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && 
                !searchResults.contains(e.target) && 
                !e.target.classList.contains('clear-search') &&
                !e.target.id === 'clearSearchBtn') {
                searchResults.style.display = 'none';
            }
        });
    }

    // Public API
    return {
        fetchEmployeesByBranch,
        fetchEmployeeDTR,
        setupEmployeeSearch,
        filterEmployeeList,
        resetEmployeeListFilter,
        highlightSelectedEmployee
    };
})();