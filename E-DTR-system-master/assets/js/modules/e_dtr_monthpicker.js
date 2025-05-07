/**
 * DTR Month Picker Module
 * ---------------------
 * Handles the month and year selection functionality
 */

const DTRMonthPicker = (function() {
    // Store modal instance globally within this module
    let monthPickerModalInstance = null;
    
    /**
     * Initialize month picker calendar and functions
     */
    function initializeMonthPicker() {
        console.log('Initializing month picker...');
        
        // Populate year select
        const yearSelect = document.getElementById('yearSelect');
        if (!yearSelect) {
            console.error('Year select element not found');
            return;
        }
        
        yearSelect.innerHTML = ''; // Clear existing options
        const currentYear = new Date().getFullYear();
        
        // Add years (current year - 5 to current year + 5)
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
        
        // Set current month in select
        const monthSelect = document.getElementById('monthSelect');
        if (!monthSelect) {
            console.error('Month select element not found');
            return;
        }
        
        const currentMonth = new Date().getMonth() + 1; // 1-based month
        monthSelect.value = currentMonth;
        
        // Update month display when month/year changes
        monthSelect.addEventListener('change', updateMonthDisplay);
        yearSelect.addEventListener('change', updateMonthDisplay);
        
        // Initial month display
        updateMonthDisplay();
        
        // Pre-initialize the modal
        try {
            const modalElement = document.getElementById('monthPickerModal');
            if (!modalElement) {
                console.error('Month picker modal element not found');
                return;
            }
            
            if (typeof bootstrap !== 'undefined') {
                monthPickerModalInstance = new bootstrap.Modal(modalElement);
                console.log('Month picker modal initialized successfully');
            } else {
                console.warn('Bootstrap is not loaded, modal functionality may not work');
            }
        } catch (err) {
            console.error('Error pre-initializing month picker modal:', err);
        }
        
        // Handle confirm button
        const confirmMonthBtn = document.getElementById('confirmMonthBtn');
        if (!confirmMonthBtn) {
            console.error('Confirm month button not found');
            return;
        }
        
        confirmMonthBtn.addEventListener('click', function() {
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            
            console.log(`Changing month to: ${selectedMonth}/${selectedYear}`);
            
            // Update current month and year
            DTRCore.currentMonth = selectedMonth;
            DTRCore.currentYear = selectedYear;
            
            // Update period display
            updatePeriodDisplay();
            
            // Refetch DTR data if employee is selected
            if (DTRCore.currentEmployee) {
                DTREmployees.fetchEmployeeDTR(DTRCore.currentEmployee);
            } else {
                // Just update the table structure for the new month
                DTRCore.initializeDTRTable();
            }
            
            // Close modal
            closeMonthPickerModal();
        });
    }
    
    /**
     * Helper function to close the month picker modal
     */
    function closeMonthPickerModal() {
        try {
            // Try multiple approaches to close the modal
            if (monthPickerModalInstance) {
                // Use the stored instance first (most reliable)
                monthPickerModalInstance.hide();
                console.log('Closed modal using stored instance');
            } else {
                // Try to get an instance from the DOM element
                const modalEl = document.getElementById('monthPickerModal');
                if (modalEl) {
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) {
                        modalInstance.hide();
                        console.log('Closed modal using retrieved instance');
                    } else {
                        // As a last resort, use jQuery if available
                        if (typeof $ !== 'undefined') {
                            $('#monthPickerModal').modal('hide');
                            console.log('Closed modal using jQuery');
                        } else {
                            // Or try to click the close button
                            const closeButton = modalEl.querySelector('[data-bs-dismiss="modal"]');
                            if (closeButton) {
                                closeButton.click();
                                console.log('Closed modal by clicking close button');
                            } else {
                                console.warn('Could not find a way to close the modal');
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error closing month picker modal:', err);
            // Final fallback: try clicking any close button
            const closeButton = document.querySelector('#monthPickerModal [data-bs-dismiss="modal"]');
            if (closeButton) {
                closeButton.click();
                console.log('Closed modal by clicking close button (fallback)');
            }
        }
    }

    /**
     * Update month display in picker
     */
    function updateMonthDisplay() {
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');
        
        if (!monthSelect || !yearSelect) {
            console.error('Month or year select elements not found');
            return;
        }
        
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        
        // Update month display
        const selectedMonthDisplay = document.getElementById('selectedMonthDisplay');
        if (selectedMonthDisplay) {
            selectedMonthDisplay.textContent = `${DTRCore.getMonthName(month)} ${year}`;
        }
    }

    /**
     * Update the period display in the employee info section
     */
    function updatePeriodDisplay() {
        const currentPeriod = document.getElementById('currentPeriod');
        if (!currentPeriod) {
            console.error('Current period element not found');
            return;
        }
        
        const monthName = DTRCore.getMonthName(DTRCore.currentMonth);
        currentPeriod.textContent = `${monthName} ${DTRCore.currentYear}`;
    }

    /**
     * Setup month change button functionality
     */
    function setupMonthChangeButton() {
        const changeMonthBtn = document.getElementById('changeMonthBtn');
        if (!changeMonthBtn) {
            console.error('Change month button not found');
            return;
        }
        
        changeMonthBtn.addEventListener('click', function(e) {
            // Prevent default if this button has a form submit action
            e.preventDefault();
            
            console.log('Change month button clicked');
            
            // Set the current values in the month picker
            const monthSelect = document.getElementById('monthSelect');
            const yearSelect = document.getElementById('yearSelect');
            
            if (monthSelect && yearSelect) {
                monthSelect.value = DTRCore.currentMonth;
                yearSelect.value = DTRCore.currentYear;
                
                // Update month display
                updateMonthDisplay();
            }
            
            // Show the month picker modal
            try {
                if (monthPickerModalInstance) {
                    // Use the pre-initialized instance
                    monthPickerModalInstance.show();
                    console.log('Showing modal using stored instance');
                } else {
                    // Try to create a new instance
                    const modalEl = document.getElementById('monthPickerModal');
                    if (modalEl && typeof bootstrap !== 'undefined') {
                        const modal = new bootstrap.Modal(modalEl);
                        modal.show();
                        // Store for future use
                        monthPickerModalInstance = modal;
                        console.log('Created and showed new modal instance');
                    } else {
                        console.error('Could not create modal: bootstrap not loaded or modal element not found');
                        alert('Could not open month picker. Please try refreshing the page.');
                    }
                }
            } catch (err) {
                console.error('Error showing month picker modal:', err);
                alert('Could not open month picker. Please try refreshing the page.');
            }
        });
        
        console.log('Month change button initialized');
    }

    // Public API
    return {
        initializeMonthPicker,
        updatePeriodDisplay,
        updateMonthDisplay,
        setupMonthChangeButton,
        closeMonthPickerModal
    };
})();