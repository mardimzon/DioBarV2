/**
 * DTR Exports Module
 * ----------------
 * Handles PDF generation and XLSX export functionality
 */

const DTRExports = (function() {
    /**
     * Generate PDF from DTR data
     */
    function generatePDF() {
        console.log("generatePDF function is running"); // Debug line
        
        // Get employee info
        const employeeName = document.getElementById('employeeName').textContent;
        const employeeId = document.getElementById('employeeId').textContent;
        const employeeBranch = document.getElementById('employeeBranch').textContent;
        const employeeSchedule = document.getElementById('employeeSchedule').textContent;
        
        // Get period display
        const periodDisplay = document.getElementById('currentPeriod').textContent;
        console.log("Generating PDF for period:", periodDisplay);
        
        // COMPLETELY CLEAR the pdfPreview div before adding new content
        const pdfPreview = document.getElementById('pdfPreview');
        if (!pdfPreview) {
            console.error('PDF preview element not found');
            return;
        }
        pdfPreview.innerHTML = '';
        
        // Create a temporary div for the PDF content
        const pdfContent = document.createElement('div');
        pdfContent.style.width = '800px';
        pdfContent.style.padding = '20px';
        pdfContent.style.fontFamily = 'Arial, sans-serif';
        
        // Add Civil Service Form header
        const csFormHeader = document.createElement('div');
        csFormHeader.style.textAlign = 'left';
        csFormHeader.style.fontSize = '8px';
        csFormHeader.style.marginBottom = '10px';
        csFormHeader.innerHTML = `
            Civil Service Form No. 48
        `;
        pdfContent.appendChild(csFormHeader);
        
        // Add DAILY TIME RECORD header
        const dtrHeader = document.createElement('div');
        dtrHeader.style.textAlign = 'center';
        dtrHeader.style.marginBottom = '15px';
        dtrHeader.innerHTML = `
            <h3 style="margin: 0; text-decoration: underline; font-size: 14px;">DAILY TIME RECORD</h3>
        `;
        pdfContent.appendChild(dtrHeader);
        
        // Add employee information
        const empInfo = document.createElement('div');
        empInfo.style.marginBottom = '15px';
        empInfo.style.fontSize = '10px';
        empInfo.innerHTML = `
            <div style="margin-bottom: 5px;">Name: <b>${employeeName}</b></div>
            <div style="margin-bottom: 5px;">For the month of: <b>${periodDisplay}</b></div>
            <div style="margin-bottom: 5px;">Official Hours: ____________ 8:00 A.M. - 5:00 P.M.</div>
            <div style="margin-bottom: 10px;">For Arrival and Departure Regular Days: ____________ 8:00 A.M. - 5:00 P.M.</div>
        `;
        pdfContent.appendChild(empInfo);
        
        // Create a fresh DTR table based on current month and year
        const dtrTable = createCurrentMonthTable();
        dtrTable.style.width = '100%';
        dtrTable.style.borderCollapse = 'collapse';
        dtrTable.style.marginBottom = '20px';
        
        // Style the table
        const cells = dtrTable.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.border = '1px solid #000';
            cell.style.padding = '5px';
            cell.style.textAlign = 'center';
            cell.style.fontSize = '10px'; // Reduce font size to fit more content
        });
        
        pdfContent.appendChild(dtrTable);
        
        // Add certification and signature section
        const signatureSection = document.createElement('div');
        signatureSection.style.marginTop = '30px';
        signatureSection.innerHTML = `
            <div style="text-align: center; font-size: 8px; margin-bottom: 20px; max-width: 80%; margin-left: auto; margin-right: auto;">
                I certify to my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.
            </div>
            
            <div style="text-align: center; margin-bottom: 5px;">
                <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
                <div style="font-size: 10px; font-weight: bold;">SIGNATURE OF EMPLOYEE</div>
            </div>
            
            <div style="text-align: center; font-size: 8px; margin-bottom: 20px;">
                Verified as to the prescribed office hours.
            </div>
            
            <div style="text-align: center;">
                <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto;"></div>
                <div style="font-size: 10px; font-weight: bold;">NAME OF SUPERVISOR</div>
                <div style="font-size: 8px;">Position, Department</div>
            </div>
        `;
        pdfContent.appendChild(signatureSection);
        
        // Create a temporary container for the PDF content
        pdfPreview.appendChild(pdfContent);
        
        // Log the content before showing the modal (for debugging)
        console.log("PDF content generated with correct days for the month");
        
        // Show the modal with PDF preview
        try {
            const pdfModal = new bootstrap.Modal(document.getElementById('pdfPreviewModal'));
            pdfModal.show();
        } catch (error) {
            console.error("Error showing PDF preview modal:", error);
            alert("There was an error showing the PDF preview. Please try again.");
        }
        
        // Setup the download button
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.onclick = function() {
                downloadPDF(pdfContent, employeeId, employeeName);
            };
        }
        
        // Setup the "Save as Excel" button
        const saveAsExcelBtn = document.getElementById('saveAsExcelBtn');
        if (saveAsExcelBtn) {
            saveAsExcelBtn.onclick = function() {
                exportToExcel();
            };
        }
    }
    
    /**
     * Create a new DTR table based on the current month and year
     * This ensures we have the correct number of days
     */
    function createCurrentMonthTable() {
        // Create a new table element
        const table = document.createElement('table');
        table.className = 'table table-bordered text-center';
        
        // Create header rows
        const thead = document.createElement('thead');
        thead.innerHTML = `
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
        `;
        table.appendChild(thead);
        
        // Create tbody with correct number of days
        const tbody = document.createElement('tbody');
        
        // Get data from the existing DTR table
        const existingRows = document.querySelectorAll('#dtrTableBody tr');
        
        // Determine number of days in current month
        const daysInMonth = DTRCore.getDaysInMonth(DTRCore.currentMonth, DTRCore.currentYear);
        console.log(`Creating table for ${DTRCore.getMonthName(DTRCore.currentMonth)} with ${daysInMonth} days`);
        
        // Add a row for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const tr = document.createElement('tr');
            
            // Get data from existing row if available
            if (day <= existingRows.length) {
                const cells = existingRows[day-1].querySelectorAll('td');
                
                // Copy content from existing table
                tr.innerHTML = `
                    <td>${day}</td>
                    <td>${cells[1].textContent}</td>
                    <td>${cells[2].textContent}</td>
                    <td>${cells[3].textContent}</td>
                    <td>${cells[4].textContent}</td>
                    <td>${cells[5].textContent}</td>
                    <td>${cells[6].textContent}</td>
                `;
            } else {
                // Create empty row if no data available
                tr.innerHTML = `
                    <td>${day}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>0</td>
                    <td>0</td>
                `;
            }
            
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
        
        // Create tfoot with totals
        const tfoot = document.createElement('tfoot');
        tfoot.innerHTML = `
            <tr>
                <td colspan="5" class="text-end"><strong>Total</strong></td>
                <td>${document.getElementById('totalHours').textContent}</td>
                <td>${document.getElementById('totalMinutes').textContent}</td>
            </tr>
        `;
        table.appendChild(tfoot);
        
        return table;
    }
    
    /**
     * Download the PDF
     */
    function downloadPDF(pdfContent, employeeId, employeeName) {
        const { jsPDF } = window.jspdf;
        
        if (!jsPDF) {
            console.error("jsPDF library not loaded");
            alert("PDF generation library not loaded. Please refresh the page and try again.");
            return;
        }
        
        // Create a PDF instance (Letter size: 8.5 x 11 inches, converted to points)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter' // 8.5 x 11 inches
        });
        
        // Use html2canvas to render the content
        html2canvas(pdfContent, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            allowTaint: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate proper scaling to fit letter size paper
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, 10.5 / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            
            pdf.addImage(imgData, 'PNG', imgX, 0.5, imgWidth * ratio, imgHeight * ratio);
            
            // Add footer with date
            const today = new Date();
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            pdf.text(`Generated on ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`, 0.5, 10.8);
            
            // Save the PDF
            pdf.save(`DTR_${employeeId}_${employeeName.replace(/[^a-z0-9]/gi, '_')}_${DTRCore.getMonthName(DTRCore.currentMonth)}_${DTRCore.currentYear}.pdf`);
        });
    }

    /**
     * Export DTR data to Excel (XLSX)
     * Using SheetJS library
     */
    function exportToExcel() {
        try {
            if (typeof XLSX === 'undefined') {
                console.error("SheetJS (XLSX) library not found");
                alert("Excel export library not loaded. Please refresh the page and try again.");
                return;
            }
            
            console.log("Exporting to Excel (XLSX)...");
            
            // Get employee info
            const employeeName = document.getElementById('employeeName').textContent;
            const employeeId = document.getElementById('employeeId').textContent;
            const employeeBranch = document.getElementById('employeeBranch').textContent;
            const periodDisplay = document.getElementById('currentPeriod').textContent;
            
            // Create a new workbook
            const wb = XLSX.utils.book_new();
            
            // Create sheet with header information
            const headerData = [
                ["DAILY TIME RECORD"],
                [""],
                ["Name:", employeeName],
                ["ID:", employeeId],
                ["Branch:", employeeBranch],
                ["Period:", periodDisplay],
                [""],
                [""], // Empty row before table
            ];
            
            // Table headers (merged into proper structure)
            headerData.push(["Days", "Morning", "", "Afternoon", "", "Hours Rendered", ""]);
            headerData.push(["", "Arrived", "Departure", "Arrived", "Departure", "Hours", "Minutes"]);
            
            // Determine number of days in current month
            const daysInMonth = DTRCore.getDaysInMonth(DTRCore.currentMonth, DTRCore.currentYear);
            
            // Get data from the existing DTR table
            const existingRows = document.querySelectorAll('#dtrTableBody tr');
            
            // Add a row for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
                let rowData = [day, "-", "-", "-", "-", 0, 0];
                
                // Get data from existing row if available
                if (day <= existingRows.length) {
                    const cells = existingRows[day-1].querySelectorAll('td');
                    rowData = [
                        day,
                        cells[1].textContent,
                        cells[2].textContent,
                        cells[3].textContent,
                        cells[4].textContent,
                        cells[5].textContent,
                        cells[6].textContent
                    ];
                }
                
                headerData.push(rowData);
            }
            
            // Add total row
            const totalHours = document.getElementById('totalHours').textContent;
            const totalMinutes = document.getElementById('totalMinutes').textContent;
            headerData.push(["Total", "", "", "", "", totalHours, totalMinutes]);
            
            // Add signature section
            headerData.push([""]);
            headerData.push([""]);
            headerData.push(["I certify to my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office."]);
            headerData.push([""]);
            headerData.push([""]);
            headerData.push(["SIGNATURE OF EMPLOYEE"]);
            headerData.push([""]);
            headerData.push(["Verified as to the prescribed office hours."]);
            headerData.push([""]);
            headerData.push([""]);
            headerData.push(["NAME OF SUPERVISOR"]);
            headerData.push(["Position, Department"]);
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(headerData);
            
            // Set column widths
            const cols = [
                { wch: 10 },  // Days column
                { wch: 12 },  // Morning Arrived
                { wch: 12 },  // Morning Departure
                { wch: 12 },  // Afternoon Arrived
                { wch: 12 },  // Afternoon Departure
                { wch: 10 },  // Hours
                { wch: 10 },  // Minutes
            ];
            ws['!cols'] = cols;
            
            // Define merged cell regions
            ws['!merges'] = [
                // Title
                { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
                
                // Morning column header
                { s: { r: 8, c: 1 }, e: { r: 8, c: 2 } },
                
                // Afternoon column header
                { s: { r: 8, c: 3 }, e: { r: 8, c: 4 } },
                
                // Hours rendered column header
                { s: { r: 8, c: 5 }, e: { r: 8, c: 6 } },
                
                // Certification text
                { s: { r: daysInMonth + 12, c: 0 }, e: { r: daysInMonth + 12, c: 6 } },
                
                // Signature line
                { s: { r: daysInMonth + 15, c: 0 }, e: { r: daysInMonth + 15, c: 6 } },
                
                // Verification text
                { s: { r: daysInMonth + 17, c: 0 }, e: { r: daysInMonth + 17, c: 6 } },
                
                // Supervisor line
                { s: { r: daysInMonth + 20, c: 0 }, e: { r: daysInMonth + 20, c: 6 } },
                
                // Position text
                { s: { r: daysInMonth + 21, c: 0 }, e: { r: daysInMonth + 21, c: 6 } },
            ];
            
            // Apply cell styles for title
            ws.A1 = { v: "DAILY TIME RECORD", t: "s", s: { 
                font: { bold: true, sz: 14 },
                alignment: { horizontal: "center" }
            }};
            
            // Apply styles to headers
            for (let c = 0; c < 7; c++) {
                const cell1 = XLSX.utils.encode_cell({r: 8, c: c});
                const cell2 = XLSX.utils.encode_cell({r: 9, c: c});
                
                if (ws[cell1]) {
                    ws[cell1].s = {
                        font: { bold: true },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
                    };
                }
                
                if (ws[cell2]) {
                    ws[cell2].s = {
                        font: { bold: true },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
                    };
                }
            }
            
            // Apply styles to data cells
            for (let r = 10; r < 10 + daysInMonth; r++) {
                for (let c = 0; c < 7; c++) {
                    const cell = XLSX.utils.encode_cell({r: r, c: c});
                    if (ws[cell]) {
                        ws[cell].s = {
                            alignment: { horizontal: "center" },
                            border: { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
                        };
                    }
                }
            }
            
            // Apply styles to total row
            const totalRow = 10 + daysInMonth;
            for (let c = 0; c < 7; c++) {
                const cell = XLSX.utils.encode_cell({r: totalRow, c: c});
                if (ws[cell]) {
                    ws[cell].s = {
                        font: { bold: c >= 5 },
                        alignment: { horizontal: c === 0 ? "right" : "center" },
                        border: { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
                    };
                }
            }
            
            // Apply styles to signature text
            const certRow = daysInMonth + 12;
            const signRow = daysInMonth + 15;
            const verifyRow = daysInMonth + 17;
            const supRow = daysInMonth + 20;
            const posRow = daysInMonth + 21;
            
            ws[XLSX.utils.encode_cell({r: certRow, c: 0})].s = {
                font: { italic: true, sz: 8 },
                alignment: { horizontal: "center", vertical: "center", wrapText: true }
            };
            
            ws[XLSX.utils.encode_cell({r: signRow, c: 0})].s = {
                font: { bold: true, sz: 10 },
                alignment: { horizontal: "center" }
            };
            
            ws[XLSX.utils.encode_cell({r: verifyRow, c: 0})].s = {
                font: { italic: true, sz: 8 },
                alignment: { horizontal: "center" }
            };
            
            ws[XLSX.utils.encode_cell({r: supRow, c: 0})].s = {
                font: { bold: true, sz: 10 },
                alignment: { horizontal: "center" }
            };
            
            ws[XLSX.utils.encode_cell({r: posRow, c: 0})].s = {
                font: { sz: 8 },
                alignment: { horizontal: "center" }
            };
            
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, "DTR");
            
            // Generate filename
            const filename = `DTR_${employeeId}_${employeeName.replace(/[^a-z0-9]/gi, '_')}_${DTRCore.getMonthName(DTRCore.currentMonth)}_${DTRCore.currentYear}.xlsx`;
            
            // Save the workbook
            XLSX.writeFile(wb, filename);
            console.log("Excel export complete:", filename);
            
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("There was an error creating the Excel file. Please try again.");
        }
    }
    
    /**
     * Export directly from the employee list without showing PDF preview
     */
    function directExportToExcel(employee) {
        if (!employee) {
            console.error("No employee data provided for export");
            return;
        }
        
        console.log(`Direct export to Excel for employee: ${employee.name} (${employee.employee_id})`);
        
        // Set current employee for export
        DTRCore.currentEmployee = employee;
        
        // Fetch employee data then export
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
            console.log(`Received ${dtr ? dtr.length : 0} time records for direct export`);
            
            // Update employee object with time records
            employee.timeRecords = dtr;
            
            // Populate table with actual time records (in background)
            DTRCore.populateDTRTable(dtr);
            
            // Export to Excel
            exportToExcel();
        })
        .catch(error => {
            console.error('Error fetching DTR for export:', error);
            alert("Error fetching employee data for export. Please try again.");
        });
    }

    // Public API
    return {
        generatePDF,
        exportToExcel,
        directExportToExcel,
        createCurrentMonthTable
    };
})();