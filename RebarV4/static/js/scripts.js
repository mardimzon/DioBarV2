// static/js/scripts.js

// Expose necessary functions to global scope
window.openImageModal = openImageModal;
window.deleteImage = deleteImage;

// Define these functions before the DOMContentLoaded event
function openImageModal(imageUrl, distance, timestamp, volume = '0.00') {
    const modalImage = document.getElementById('modal-image');
    const modalDistance = document.getElementById('modal-distance');
    const modalVolume = document.getElementById('modal-volume');
    const modalTimestamp = document.getElementById('modal-timestamp');
    const modalDownload = document.getElementById('modal-download');
    
    modalImage.src = imageUrl;
    modalDistance.textContent = distance;
    modalVolume.textContent = volume;
    modalTimestamp.textContent = timestamp;
    
    // Set up download button
    modalDownload.onclick = function() {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Open the modal
    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    modal.show();
}

function deleteImage(filename) {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
        return;
    }
    
    fetch(`/api/delete_image/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showAlert(data.message || 'Image deleted successfully', 'success');
        // Refresh the gallery
        loadGallery();
    })
    .catch(error => {
        console.error('Error deleting image:', error);
        showAlert(`Failed to delete image: ${error.message}`, 'danger');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const connectionStatus = document.getElementById('connection-status');
    const statusMessage = document.getElementById('status-message');
    const lastCaptureTime = document.getElementById('last-capture-time');
    const captureBtn = document.getElementById('capture-btn');
    const cameraSettingsBtn = document.getElementById('camera-settings-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const volumeInfoDiv = document.getElementById('volume-info');
    const volumeTableBody = document.querySelector('#volume-table tbody');
    const totalVolumeCell = document.getElementById('total-volume-cell');
    const distanceValue = document.getElementById('distance-value');
    const volumeValue = document.getElementById('volume-value');
    const downloadImageBtn = document.getElementById('download-image');
    const downloadCsvBtn = document.getElementById('download-csv');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const processedImageLink = document.getElementById('processed-image-link');
    const processedImage = document.getElementById('processed-image');
    const modalImage = document.getElementById('modal-image');
    const modalDistance = document.getElementById('modal-distance');
    const modalVolume = document.getElementById('modal-volume');
    const modalTimestamp = document.getElementById('modal-timestamp');
    const modalDownload = document.getElementById('modal-download');
    const imagePlaceholderIcon = document.getElementById('image-placeholder-icon');
    const imagePlaceholderText = document.getElementById('image-placeholder-text');
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const settingsForm = document.getElementById('settings-form');
    const detectionThreshold = document.getElementById('detection-threshold');
    const thresholdValue = document.getElementById('threshold-value');
    const cameraEnabled = document.getElementById('camera-enabled');
    const externalCameraIndex = document.getElementById('external-camera-index');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const showDistance = document.getElementById('show-distance');
    const showVolume = document.getElementById('show-volume');
    const cameraFeed = document.getElementById('camera-feed');
    
    // Camera settings elements
    const cameraBrightness = document.getElementById('camera-brightness');
    const cameraContrast = document.getElementById('camera-contrast');
    const cameraResolution = document.getElementById('camera-resolution');
    const saveCameraSettingsBtn = document.getElementById('save-camera-settings');

    // Socket.IO setup with better error handling
    const socket = io(window.location.origin, {
        reconnectionAttempts: 5,
        timeout: 10000,
        reconnectionDelay: 1000
    });
    
    let connected = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    
    // Current active captured image info
    let currentImageData = {
        path: null,
        timestamp: null,
        distance: null,
        volume: null
    };

    // Reset application state on page load
    function initializeApplication() {
        console.log("Initializing application");
        resetApplicationState();
        // Clear any cached data from sessionStorage
        sessionStorage.removeItem('lastImageData');
        
        // Add CSS classes for connection status
        const style = document.createElement('style');
        style.textContent = `
            .alert.connected {
                background-color: #d1e7dd;
                color: #0f5132;
                border-color: #badbcc;
            }
            .alert.disconnected {
                background-color: #f8d7da;
                color: #842029;
                border-color: #f5c2c7;
            }
        `;
        document.head.appendChild(style);
    }

    // Function to reset application state
    function resetApplicationState() {
        // Reset image display
        updateImageDisplay(null);
        
        // Reset volume table
        volumeTableBody.innerHTML = '';
        totalVolumeCell.textContent = 'Total Volume: 0.00 cc';
        
        // Hide volume info initially
        volumeInfoDiv.style.display = 'none';
        
        // Reset last capture time
        lastCaptureTime.textContent = 'None';
        
        // Reset measurements
        distanceValue.textContent = '--';
        volumeValue.textContent = '0.00';
        
        // Show the image placeholder
        const imagePlaceholder = document.querySelector('.image-placeholder');
        if (imagePlaceholder) {
            imagePlaceholder.style.display = 'flex';
            imagePlaceholderIcon.className = 'fas fa-camera fa-5x text-muted';
            imagePlaceholderText.textContent = 'No image available';
        }
        
        // Reset current image data
        currentImageData = {
            path: null,
            timestamp: null,
            distance: null,
            volume: null
        };
    }

    // Function to format timestamps
    function formatTimestamp(timestamp) {
        if (!timestamp) return 'None';
        
        // Check if timestamp is in YYYYMMDD-HHMMSS format
        if (/^\d{8}-\d{6}$/.test(timestamp)) {
            const year = timestamp.substring(0, 4);
            const month = timestamp.substring(4, 6);
            const day = timestamp.substring(6, 8);
            const hour = timestamp.substring(9, 11);
            const minute = timestamp.substring(11, 13);
            const second = timestamp.substring(13, 15);
            
            const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
            return date.toLocaleString();
        }
        
        // If it's a different format, try to parse it directly
        return new Date(timestamp).toLocaleString();
    }

    // Function to update connection status
    function updateConnectionStatus(isConnected) {
        connected = isConnected;
        
        if (isConnected) {
            connectionStatus.className = 'alert alert-success connected';
            statusMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>Connected to Raspberry Pi';
            captureBtn.disabled = false;
            reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        } else {
            connectionStatus.className = 'alert alert-danger disconnected';
            statusMessage.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Disconnected from Raspberry Pi';
            captureBtn.disabled = true;
            
            // Only attempt to reconnect if we haven't exceeded max attempts
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                statusMessage.innerHTML = `<i class="fas fa-sync fa-spin me-2"></i>Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`;
                
                // Try to reconnect after a delay
                setTimeout(checkConnectionStatus, 3000);
            }
        }
    }

    // Check connection status directly via API
    function checkConnectionStatus() {
        fetch('/api/connection_status')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updateConnectionStatus(data.connected);
            })
            .catch(error => {
                console.error('Error checking connection:', error);
                updateConnectionStatus(false);
            });
    }
    
    // Function to update distance measurement
    function updateDistance() {
        fetch('/api/distance')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.distance > 0) {
                    distanceValue.textContent = data.distance;
                }
            })
            .catch(error => {
                console.error('Error fetching distance:', error);
            });
    }

    // Function to show alerts
    function showAlert(message, type='success', duration=5000) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        alertPlaceholder.appendChild(wrapper);
        
        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                const alert = wrapper.querySelector('.alert');
                if (alert) {
                    alert.classList.remove('show');
                    setTimeout(() => {
                        wrapper.remove();
                    }, 150);
                }
            }, duration);
        }
    }

    // Function to clear alerts
    function clearAlerts() {
        alertPlaceholder.innerHTML = '';
    }

    // Populate the volume table with segments data
    function populateVolumeTable(segments, totalVolume) {
        // Clear existing rows
        volumeTableBody.innerHTML = '';

        // Add rows for each segment
        segments.forEach(seg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${seg.section_id}</td>
                <td>${seg.volume_cc.toFixed(2)}</td>
                <td>${seg.width_cm.toFixed(2)}</td>
                <td>${seg.length_cm.toFixed(2)}</td>
                <td>${seg.height_cm.toFixed(2)}</td>
            `;
            volumeTableBody.appendChild(tr);
        });

        // Set total volume
        totalVolumeCell.textContent = `Total Volume: ${totalVolume.toFixed(2)} cc`;
        
        // Update volume display
        volumeValue.textContent = totalVolume.toFixed(2);
        
        // Show the volume info div
        volumeInfoDiv.style.display = 'block';
    }

    // Function to update the image display
    function updateImageDisplay(imageData) {
        // Clear any previous image
        if (processedImage) processedImage.src = '';
        if (modalImage) modalImage.src = '';
        
        if (!imageData) {
            // Hide image and show placeholder
            if (processedImageLink) processedImageLink.style.display = 'none';
            const imagePlaceholder = document.querySelector('.image-placeholder');
            if (imagePlaceholder) {
                imagePlaceholder.style.display = 'flex';
                if (imagePlaceholderIcon) imagePlaceholderIcon.className = 'fas fa-camera fa-5x text-muted';
                if (imagePlaceholderText) imagePlaceholderText.textContent = 'No image available';
            }
            if (downloadImageBtn) downloadImageBtn.disabled = true;
            return;
        }
        
        // Set image source
        const imgSrc = `data:image/jpeg;base64,${imageData}`;
        if (processedImage) processedImage.src = imgSrc;
        if (modalImage) modalImage.src = imgSrc;
        
        // Hide placeholder and show image
        const imagePlaceholder = document.querySelector('.image-placeholder');
        if (imagePlaceholder) imagePlaceholder.style.display = 'none';
        if (processedImageLink) processedImageLink.style.display = 'block';
        if (downloadImageBtn) downloadImageBtn.disabled = false;
    }

    // Function to fetch and display the latest data
    function fetchLatestData() {
        // Clear current display data first
        updateImageDisplay(null);
        if (volumeTableBody) volumeTableBody.innerHTML = '';
        if (totalVolumeCell) totalVolumeCell.textContent = 'Total Volume: 0.00 cc';
        
        fetch('/api/latest_data')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.connected) {
                    updateConnectionStatus(true);
                    
                    // Update last capture time
                    if (lastCaptureTime) lastCaptureTime.textContent = formatTimestamp(data.timestamp);
                    
                    // Update distance value
                    if (data.distance > 0 && distanceValue) {
                        distanceValue.textContent = data.distance;
                    }
                    
                    // Update segments data if available
                    if (data.segments && data.segments.length > 0 && volumeTableBody) {
                        populateVolumeTable(data.segments, data.total_volume);
                        if (volumeInfoDiv) volumeInfoDiv.style.display = 'block';
                    } else if (volumeInfoDiv) {
                        volumeInfoDiv.style.display = 'none';
                    }
                    
                    // Check if there's an image to fetch
                    if (data.has_image) {
                        fetchLatestImage();
                    } else {
                        updateImageDisplay(null);
                    }
                } else {
                    updateConnectionStatus(false);
                    // Try to re-establish connection
                    checkConnectionStatus();
                }
            })
            .catch(error => {
                console.error('Error fetching latest data:', error);
                updateConnectionStatus(false);
                showAlert('Error fetching data from server', 'danger');
            });
    }

    // Function to fetch the latest processed image
    function fetchLatestImage() {
        fetch('/api/latest_image')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.image) {
                    updateImageDisplay(data.image);
                } else {
                    updateImageDisplay(null);
                }
            })
            .catch(error => {
                console.error('Error fetching image:', error);
                updateImageDisplay(null);
                showAlert('Error loading image', 'warning');
            });
    }

    // Function to trigger a capture
    function triggerCapture() {
        if (!connected) {
            showAlert('Not connected to Raspberry Pi', 'warning');
            return;
        }
        
        // Show loading spinner
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (captureBtn) captureBtn.disabled = true;
        
        // Clear previous image and show processing indicator
        updateImageDisplay(null);
        const imagePlaceholder = document.querySelector('.image-placeholder');
        if (imagePlaceholder) {
            imagePlaceholder.style.display = 'flex';
            if (imagePlaceholderIcon) imagePlaceholderIcon.className = 'fas fa-sync fa-spin fa-5x text-primary';
            if (imagePlaceholderText) imagePlaceholderText.textContent = 'Processing image...';
        }
        
        // First capture the local image with distance and volume overlays
        fetch('/api/capture_local', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || data.message || `Server responded with ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Save the current image data
                currentImageData = {
                    image: data.image,
                    timestamp: data.timestamp,
                    distance: data.distance,
                    volume: data.volume
                };
                
                // Update the display with local captured image
                updateImageDisplay(data.image);
                if (modalDistance) modalDistance.textContent = data.distance;
                if (modalVolume) modalVolume.textContent = data.volume ? data.volume.toFixed(2) : '0.00';
                if (modalTimestamp) modalTimestamp.textContent = formatTimestamp(data.timestamp);
                
                // Now trigger the analysis on the Raspberry Pi
                return fetch('/api/trigger_capture', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                throw new Error(data.message || 'Failed to capture local image');
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || `Analysis error: Server responded with ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide loading spinner
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (captureBtn) captureBtn.disabled = false;
            
            showAlert('Image captured and analyzed successfully', 'success');
            
            // Fetch the latest data to get analysis results
            setTimeout(fetchLatestData, 2000);
            
            // Refresh the gallery
            loadGallery();
        })
        .catch(error => {
            console.error('Error during capture/analysis:', error);
            showAlert(`Capture/Analysis error: ${error.message}`, 'danger');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (captureBtn) captureBtn.disabled = false;
            
            if (!currentImageData.image) {
                // Only show error icon if we didn't get a local image
                if (imagePlaceholderIcon) imagePlaceholderIcon.className = 'fas fa-exclamation-circle fa-5x text-warning';
                if (imagePlaceholderText) imagePlaceholderText.textContent = 'Capture failed';
            }
        });
    }
    
    // Function to load gallery of captured images
    function loadGallery() {
        fetch('/api/image_list')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const galleryContainer = document.getElementById('gallery-container');
                if (!galleryContainer) return;
                
                if (!data.images || data.images.length === 0) {
                    galleryContainer.innerHTML = '<div class="no-images">No images captured yet.</div>';
                    return;
                }
                
                let galleryHTML = '<div class="row">';
                data.images.forEach((image, index) => {
                    const filename = image.filename;
                    // Extract timestamp and possibly distance from filename
                    let timestamp = new Date(image.timestamp * 1000).toLocaleString();
                    let distanceMatch = filename.match(/_(\d+(?:\.\d+)?)cm/);
                    let distanceText = distanceMatch ? `${distanceMatch[1]} cm` : 'Not available';
                    
                    galleryHTML += `
                        <div class="col-md-3 col-sm-6 mb-4">
                            <div class="card h-100">
                                <img src="${image.url}" class="card-img-top" alt="${filename}" 
                                     style="height: 150px; object-fit: cover; cursor: pointer"
                                     onclick="openImageModal('${image.url}', '${distanceText}', '${timestamp}')">
                                <div class="card-body">
                                    <small class="text-muted">${timestamp}</small>
                                    <p class="card-text"><small>Distance: ${distanceText}</small></p>
                                </div>
                                <div class="card-footer d-flex justify-content-between">
                                    <a href="${image.url}" download="${filename}" class="btn btn-sm btn-success">
                                        <i class="fas fa-download"></i>
                                    </a>
                                    <button class="btn btn-sm btn-danger" onclick="deleteImage('${filename}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Create a new row every 4 cards for large screens, every 2 for small
                    if ((index + 1) % 4 === 0) {
                        galleryHTML += '</div><div class="row">';
                    }
                });
                
                galleryHTML += '</div>';
                galleryContainer.innerHTML = galleryHTML;
            })
            .catch(error => {
                console.error('Error loading gallery:', error);
                showAlert('Failed to load image gallery', 'warning');
            });
    }

    // Function to toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement &&    // Standard syntax
            !document.mozFullScreenElement && // Firefox
            !document.webkitFullscreenElement && // Chrome, Safari and Opera
            !document.msFullscreenElement) {  // IE/Edge
            
            // Enter fullscreen
            const docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) { // Firefox
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullscreen) { // Chrome, Safari and Opera
                docElm.webkitRequestFullscreen();
            } else if (docElm.msRequestFullscreen) { // IE/Edge
                docElm.msRequestFullscreen();
            }
            if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-compress me-2"></i>Exit Fullscreen';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-expand me-2"></i>Fullscreen';
        }
    }

    // Download the processed image
    function handleDownloadImage() {
        if (!processedImage || !processedImage.src || processedImage.src === '') {
            showAlert('No processed image available to download', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.href = processedImage.src;
        link.download = `rebar_analysis_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Download volume data as CSV
    function handleDownloadCsv() {
        const rows = document.querySelectorAll('#volume-table tbody tr');
        if (!rows || rows.length === 0) {
            showAlert('No volume data available to download', 'warning');
            return;
        }

        const headers = ['Segment No.', 'Volume (cc)', 'Width (cm)', 'Length (cm)', 'Height (cm)'];
        const csvRows = [headers.join(',')];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent);
            csvRows.push(rowData.join(','));
        });

        const totalText = totalVolumeCell.textContent.replace('Total Volume: ', '');
        csvRows.push(`Total,,,,${totalText}`);

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `rebar_volume_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Download volume data as PDF
    function handleDownloadPdf() {
        const rows = document.querySelectorAll('#volume-table tbody tr');
        if (!rows || rows.length === 0) {
            showAlert('No volume data available to download', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text('RebarVista Analysis Results', 14, 22);
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

        let y = 40;

        // Headers
        doc.setFontSize(10);
        doc.text('Segment No.', 14, y);
        doc.text('Volume (cc)', 50, y);
        doc.text('Width (cm)', 85, y);
        doc.text('Length (cm)', 120, y);
        doc.text('Height (cm)', 155, y);
        
        y += 8;

        // Rows
        doc.setFontSize(9);
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent);
            
            doc.text(rowData[0], 14, y);  // Segment No
            doc.text(rowData[1], 50, y);  // Volume
            doc.text(rowData[2], 85, y);  // Width
            doc.text(rowData[3], 120, y); // Length
            doc.text(rowData[4], 155, y); // Height
            
            y += 8;
        });

        // Total volume
        const totalText = totalVolumeCell.textContent;
        y += 5;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(totalText, 120, y);
        
        // Add distance measurement
        y += 10;
        doc.text(`Distance: ${distanceValue.textContent} cm`, 14, y);

        // Add image if available
        if (processedImage && processedImage.src && processedImage.src !== '') {
            try {
                y += 15;
                doc.text('Processed Image:', 14, y);
                y += 10;
                doc.addImage(processedImage.src, 'JPEG', 14, y, 180, 100);
            } catch (e) {
                console.error('Error adding image to PDF:', e);
            }
        }

        doc.save(`rebar_analysis_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);
    }

    // Function to fetch settings
    function fetchSettings() {
        fetch('/api/get_config')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Update form values
                if (data.detection_threshold && detectionThreshold) {
                    detectionThreshold.value = data.detection_threshold;
                    if (thresholdValue) thresholdValue.textContent = data.detection_threshold;
                }
                
                if (data.camera_enabled !== undefined && cameraEnabled) {
                    cameraEnabled.checked = data.camera_enabled;
                }
                
                if (data.external_camera_index !== undefined && externalCameraIndex) {
                    externalCameraIndex.value = data.external_camera_index;
                }
            })
            .catch(error => {
                console.error('Error fetching settings:', error);
                showAlert('Failed to load settings', 'warning');
            });
    }

    // Event listener for fullscreen change
    document.addEventListener('fullscreenchange', function() {
        if (!fullscreenBtn) return;
        
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress me-2"></i>Exit Fullscreen';
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand me-2"></i>Fullscreen';
        }
    });

    // Event listeners
    if (captureBtn) {
        captureBtn.addEventListener('click', triggerCapture);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    if (cameraSettingsBtn) {
        cameraSettingsBtn.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('cameraSettingsModal'));
            modal.show();
        });
    }

    // Detection threshold range input
    if (detectionThreshold) {
        detectionThreshold.addEventListener('input', function() {
            if (thresholdValue) thresholdValue.textContent = this.value;
        });
    }

    // Settings form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get values
            const configData = {
                detection_threshold: parseFloat(detectionThreshold.value),
                camera_enabled: cameraEnabled.checked,
                external_camera_index: parseInt(externalCameraIndex.value),
                show_distance: showDistance.checked,
                show_volume: showVolume.checked
            };
            
            // Submit settings to the server
            fetch('/api/set_config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || `Server responded with ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                showAlert('Settings updated successfully', 'success');
            })
            .catch(error => {
                console.error('Error saving settings:', error);
                showAlert(`Failed to save settings: ${error.message}`, 'danger');
            });
        });
    }
    
    // Camera settings form
    if (saveCameraSettingsBtn) {
        saveCameraSettingsBtn.addEventListener('click', function() {
            const cameraSettings = {
                brightness: cameraBrightness.value,
                contrast: cameraContrast.value,
                resolution: cameraResolution.value
            };
            
            // Save camera settings and close the modal
            showAlert('Camera settings updated', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('cameraSettingsModal'));
            if (modal) modal.hide();
            
            // In a real implementation, you would send this to the server
            console.log('Camera settings updated:', cameraSettings);
        });
    }

    // Download buttons
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', handleDownloadImage);
    }
    
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', handleDownloadCsv);
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', handleDownloadPdf);
    }

    // Socket.IO event listeners
    socket.on('connect', function() {
        console.log('Socket.IO connected');
        // Check connection status immediately after socket connects
        checkConnectionStatus();
    });

    socket.on('connect_error', function(error) {
        console.error('Socket.IO connection error:', error);
    });

    socket.on('connection_status', function(data) {
        console.log('Connection status update:', data);
        updateConnectionStatus(data.connected);
    });

    socket.on('new_data', function(data) {
        console.log('New data received:', data);
        
        // Update distance and volume displays
        if (data.distance && distanceValue) {
            distanceValue.textContent = data.distance;
        }
        
        if (data.total_volume && volumeValue) {
            volumeValue.textContent = data.total_volume.toFixed(2);
        }
        
        // Refresh the data display
        fetchLatestData();
    });

    socket.on('connection_error', function(data) {
        console.error('Socket connection error:', data.error);
        showAlert(`Connection error: ${data.error}`, 'danger');
    });

    // Initialize the application
    initializeApplication();
    
    // Initial setup
    fetchLatestData();
    fetchSettings();
    loadGallery();
    
    // Set up interval to update distance (independent of other data)
    setInterval(updateDistance, 1000);
    
    // Poll for connection status every 30 seconds
    setInterval(checkConnectionStatus, 30000);
});