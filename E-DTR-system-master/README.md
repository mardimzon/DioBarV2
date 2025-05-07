# Employee DTR System

A modular Daily Time Record (DTR) system for tracking employee attendance and generating reports.

## File Structure

```
├── e_dtr.php                        # Main page (renamed from timerecords.php)
├── e_dtr.sql                        # SQL file (renamed from timerecords.sql)
├── includes/
│   ├── header.php                  # Updated to include modular CSS files
│   ├── footer.php                  # Updated to include modular JS files
│   └── db.php                      # Database connection (unchanged)
└── assets/
    ├── css/
    │   ├── e_dtr.css               # Main CSS file with common styles
    │   └── modules/
    │       ├── e_dtr_core.css      # Core DTR styling
    │       ├── e_dtr_monthpicker.css # Month picker styles
    │       └── e_dtr_modal.css     # Modal styles
    └── js/
        ├── e_dtr.js                # Main JS file that initializes everything
        └── modules/
            ├── e_dtr_core.js       # Core DTR functionality
            ├── e_dtr_employees.js  # Employee data handling
            ├── e_dtr_exports.js    # PDF and Excel exports
            ├── e_dtr_monthpicker.js # Month picker functionality
            └── e_dtr_ui.js         # UI utilities
```

## Features

- Employee time record tracking with morning and afternoon check-ins/check-outs
- Monthly time record generation and display
- PDF and Excel export functionality
- Month picker for selecting specific periods
- Employee search and filtering by branch
- Responsive design for desktop and mobile devices
- F11 keyboard shortcut for fullscreen mode

## Key Improvements

1. **Accurate Month Days Display**: System correctly displays the proper number of days for each month (28/29 days for February, 30/31 for other months).

2. **Reliable Month Picker**: Enhanced modal functionality allows users to change months multiple times without issues.

3. **Professional Excel Export**: Properly formatted XLSX exports that match the DTR Preview appearance with styling, headers, and correct structure.

4. **Enhanced Search UI**: Improved search functionality with proper styling, filtering, and a Clear button that matches the system design.

5. **Employee List Filtering**: The system can filter to show only the selected employee, with highlighting for better visibility.

6. **Improved User Experience**: Added keyboard shortcuts, consistent styling, and better responsive behavior across devices.

## Installation

1. Clone the repository
2. Import the `e_dtr.sql` file into your MySQL database
3. Configure database connection in `includes/db.php`
4. Place the files in your web server directory
5. Access the system through your web browser

## Dependencies

- PHP 7.4+
- MySQL 5.7+
- Bootstrap 5.3.0
- Font Awesome 6.4.0
- jsPDF 2.5.1
- html2canvas 1.4.1
- SheetJS 0.18.5+ (for Excel export)

## Modular Architecture

This project uses a modular architecture to improve maintainability and organization:

- **Core Module**: Handles table initialization, time calculations, and data display
- **Employees Module**: Manages employee data fetching, searching, and display
- **Exports Module**: Provides PDF generation and Excel export functionality
- **Month Picker Module**: Handles month and year selection for time records
- **UI Module**: Manages general user interface utilities

Each module is self-contained with its own CSS and JavaScript files, making the codebase easier to maintain and extend.
