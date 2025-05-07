/**
 * Employee DTR Main JS File
 * -----------------------
 * This is the main entry point for the DTR system JavaScript.
 * It initializes all the modules and sets up event listeners.
 */

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing DTR system...');
    
    // Check if Bootstrap is properly loaded
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap is not loaded! Modal functionality will not work.');
    } else {
        console.log('Bootstrap is loaded successfully.');
    }
    
    // Set initial month and year (do this first)
    DTRCore.currentMonth = new Date().getMonth() + 1;
    DTRCore.currentYear = new Date().getFullYear();
    
    // Initialize core DTR functionality
    DTRCore.initializeDTRTable();
    
    // Initialize month picker before setting up button
    DTRMonthPicker.initializeMonthPicker();
    
    // Update period display
    DTRMonthPicker.updatePeriodDisplay();
    
    // Setup month change button immediately (no delay needed with improved code)
    DTRMonthPicker.setupMonthChangeButton();
    console.log('Month change button initialized');
    
    // Load employees (with branch parameter)
    DTREmployees.fetchEmployeesByBranch('all');
    
    // Set up branch selection
    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
        branchSelect.addEventListener('change', function() {
            DTREmployees.fetchEmployeesByBranch(this.value);
            
            // Reset employee info and disable buttons
            const employeeInfo = document.getElementById('employeeInfo');
            if (employeeInfo) {
                employeeInfo.style.display = 'none';
            }
        });
    } else {
        console.error('Branch select element not found');
    }
    
    // Set up employee search
    DTREmployees.setupEmployeeSearch();
    
    // Set up fullscreen functionality
    if (typeof DTRUI !== 'undefined' && DTRUI.setupFullscreen) {
        DTRUI.setupFullscreen();
    } else {
        console.error('DTRUI module or setupFullscreen function not found');
    }
    
    console.log('DTR system initialization complete.');
});