/**
 * DTR Core Module
 * --------------
 * Handles core DTR functionality including table initialization,
 * time calculations, and data population
 */

const DTRCore = (function() {
    // Module variables
    let currentMonth = new Date().getMonth() + 1; // 1-12
    let currentYear = new Date().getFullYear();
    let currentEmployee = null;

    /**
     * Initialize the DTR table with blank days
     */
    function initializeDTRTable() {
        const dtrTableBody = document.getElementById('dtrTableBody');
        if (!dtrTableBody) {
            console.error('DTR table body element not found');
            return;
        }
        
        dtrTableBody.innerHTML = '';
        
        // Get number of days in the month (using new Date with day 0 gives last day of previous month)
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        console.log(`Initializing table with ${daysInMonth} days for ${getMonthName(currentMonth)} ${currentYear}`);
        
        for (let i = 1; i <= daysInMonth; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>0</td>
                <td>0</td>
            `;
            dtrTableBody.appendChild(row);
        }
        
        // Calculate totals
        calculateTotals();
    }

    /**
     * Calculate total hours and minutes
     */
    function calculateTotals() {
        const rows = document.querySelectorAll('#dtrTableBody tr');
        let totalHours = 0;
        let totalMinutes = 0;
        
        rows.forEach(row => {
            const hours = parseInt(row.querySelector('td:nth-child(6)').textContent) || 0;
            const minutes = parseInt(row.querySelector('td:nth-child(7)').textContent) || 0;
            
            totalHours += hours;
            totalMinutes += minutes;
        });
        
        // Convert excess minutes to hours
        if (totalMinutes >= 60) {
            const additionalHours = Math.floor(totalMinutes / 60);
            totalHours += additionalHours;
            totalMinutes = totalMinutes % 60;
        }
        
        document.getElementById('totalHours').textContent = totalHours;
        document.getElementById('totalMinutes').textContent = totalMinutes;
    }

    /**
     * Convert time from 24-hour to 12-hour format
     */
    function convertTo12HourFormat(timeStr) {
        if (timeStr === '-' || !timeStr) return '-';
        
        // If already in 12-hour format, return as is
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) return timeStr;
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Populate table with time record data
     */
    function populateDTRTable(timeRecords) {
        const dtrTableBody = document.getElementById('dtrTableBody');
        if (!dtrTableBody) {
            console.error('DTR table body element not found');
            return;
        }
        
        dtrTableBody.innerHTML = '';
        
        // Get number of days in the month
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        
        // Create a lookup object for fast access to time records by day
        const recordsByDay = {};
        if (timeRecords && timeRecords.length > 0) {
            timeRecords.forEach(record => {
                // Extract day from date (assuming date format is YYYY-MM-DD)
                const day = new Date(record.date).getDate();
                recordsByDay[day] = record;
            });
        }
        
        // Create rows for each day (1 to daysInMonth)
        for (let i = 1; i <= daysInMonth; i++) {
            const record = recordsByDay[i] || null;
            
            // Use record data if available, otherwise use '-'
            const morningIn = record ? (record.time_in_morning ? convertTo12HourFormat(record.time_in_morning) : '-') : '-';
            const morningOut = record ? (record.time_out_morning ? convertTo12HourFormat(record.time_out_morning) : '-') : '-';
            const afternoonIn = record ? (record.time_in_afternoon ? convertTo12HourFormat(record.time_in_afternoon) : '-') : '-';
            const afternoonOut = record ? (record.time_out_afternoon ? convertTo12HourFormat(record.time_out_afternoon) : '-') : '-';
            
            // Calculate hours worked
            const morningDiff = calculateTimeDifference(morningIn, morningOut);
            const afternoonDiff = calculateTimeDifference(afternoonIn, afternoonOut);
            
            const totalHours = morningDiff.hours + afternoonDiff.hours;
            const totalMinutes = morningDiff.minutes + afternoonDiff.minutes;
            
            // Adjust if minutes exceed 60
            const adjustedHours = totalHours + Math.floor(totalMinutes / 60);
            const adjustedMinutes = totalMinutes % 60;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td>${morningIn}</td>
                <td>${morningOut}</td>
                <td>${afternoonIn}</td>
                <td>${afternoonOut}</td>
                <td>${adjustedHours}</td>
                <td>${adjustedMinutes}</td>
            `;
            dtrTableBody.appendChild(row);
        }
        
        // Calculate totals
        calculateTotals();
    }

    /**
     * Calculate time difference between two time strings
     */
    function calculateTimeDifference(start, end) {
        if (start === '-' || end === '-') return { hours: 0, minutes: 0 };
        
        // Remove AM/PM and convert to 24-hour for calculation
        const convertTo24Hour = (timeStr) => {
            if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
            
            const isPM = timeStr.includes('PM');
            const timePart = timeStr.replace(/(AM|PM)/g, '').trim();
            const [hoursStr, minutesStr] = timePart.split(':');
            let hours = parseInt(hoursStr);
            
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
            
            return `${hours}:${minutesStr}`;
        };
        
        const start24 = convertTo24Hour(start);
        const end24 = convertTo24Hour(end);
        
        const [startHour, startMinute] = start24.split(':').map(Number);
        const [endHour, endMinute] = end24.split(':').map(Number);
        
        let hours = endHour - startHour;
        let minutes = endMinute - startMinute;
        
        if (minutes < 0) {
            hours--;
            minutes += 60;
        }
        
        return { hours, minutes };
    }

    /**
     * Get month name from month number (1-12)
     */
    function getMonthName(month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month - 1];
    }

    /**
     * Get the number of days in the specified month and year
     */
    function getDaysInMonth(month, year) {
        // Month parameter is 1-12, but Date constructor uses 0-11 for months,
        // and passing 0 as the day gives us the last day of the previous month
        return new Date(year, month, 0).getDate();
    }

    // Public API
    return {
        initializeDTRTable,
        populateDTRTable,
        calculateTotals,
        convertTo12HourFormat,
        getMonthName,
        calculateTimeDifference,
        getDaysInMonth,
        
        // Properties with getters and setters
        get currentMonth() {
            return currentMonth;
        },
        set currentMonth(value) {
            currentMonth = value;
        },
        get currentYear() {
            return currentYear;
        },
        set currentYear(value) {
            currentYear = value;
        },
        get currentEmployee() {
            return currentEmployee;
        },
        set currentEmployee(value) {
            currentEmployee = value;
        }
    };
})();