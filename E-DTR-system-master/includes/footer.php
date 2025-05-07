</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<!-- Add SheetJS library - using full version for style support -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- Modular JS files -->
<script src="assets/js/modules/e_dtr_core.js"></script>
<script src="assets/js/modules/e_dtr_employees.js"></script>
<script src="assets/js/modules/e_dtr_exports.js"></script>
<script src="assets/js/modules/e_dtr_monthpicker.js"></script>
<script src="assets/js/modules/e_dtr_ui.js"></script>
<script src="assets/js/e_dtr.js"></script>

<script>
// Additional modal handling
document.addEventListener('DOMContentLoaded', function() {
    // Pre-fill the month picker with current values when opened
    const monthPickerModal = document.getElementById('monthPickerModal');
    if (monthPickerModal) {
        monthPickerModal.addEventListener('show.bs.modal', function () {
            // Update select values
            const monthSelect = document.getElementById('monthSelect');
            const yearSelect = document.getElementById('yearSelect');
            
            if (monthSelect && yearSelect) {
                monthSelect.value = DTRCore.currentMonth;
                yearSelect.value = DTRCore.currentYear;
                
                // Update display
                const month = parseInt(monthSelect.value);
                const year = parseInt(yearSelect.value);
                const selectedMonthDisplay = document.getElementById('selectedMonthDisplay');
                if (selectedMonthDisplay) {
                    selectedMonthDisplay.textContent = `${DTRCore.getMonthName(month)} ${year}`;
                }
            }
            
            // Ensure the confirm button has proper event handlers
            if (typeof DTRMonthPicker !== 'undefined' && DTRMonthPicker.setupConfirmMonthButton) {
                setTimeout(function() {
                    DTRMonthPicker.setupConfirmMonthButton();
                }, 100); // Small delay to ensure modal is fully shown
            }
        });
    }
    
    // Update modal titles and buttons for Excel export
    const pdfPreviewModal = document.getElementById('pdfPreviewModal');
    if (pdfPreviewModal) {
        // Update the modal title
        const modalTitle = pdfPreviewModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'DTR Preview';
        }
        
        // Update the Excel button text
        const saveAsExcelBtn = document.getElementById('saveAsExcelBtn');
        if (saveAsExcelBtn) {
            saveAsExcelBtn.innerHTML = '<i class="fas fa-file-excel me-1"></i> Export to Excel';
        }
    }
});
</script>

</body>
</html>