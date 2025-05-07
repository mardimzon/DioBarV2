/**
 * DTR UI Module
 * -----------
 * Handles UI utilities such as fullscreen functionality
 */

const DTRUI = (function() {
    // Track fullscreen state
    let isFullscreen = false;

    /**
     * Toggle fullscreen state
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            isFullscreen = true;
            updateFullscreenButtonIcon();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                isFullscreen = false;
                updateFullscreenButtonIcon();
            }
        }
    }
    
    /**
     * Update fullscreen button icon based on current state
     */
    function updateFullscreenButtonIcon() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = isFullscreen ? 
                '<i class="fas fa-compress"></i>' : 
                '<i class="fas fa-expand"></i>';
        }
    }

    /**
     * Setup fullscreen functionality with both button and F11 key
     */
    function setupFullscreen() {
        // Setup fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent any default behavior
                toggleFullscreen();
            });
        }
        
        // Setup F11 key handler for the entire document
        document.addEventListener('keydown', function(e) {
            // Check if F11 key is pressed (key code 122)
            if (e.key === 'F11' || e.keyCode === 122) {
                e.preventDefault(); // Prevent default F11 behavior
                toggleFullscreen();
            }
        });
        
        // Update button icon when exiting fullscreen via Esc key
        document.addEventListener('fullscreenchange', function() {
            isFullscreen = !!document.fullscreenElement;
            updateFullscreenButtonIcon();
        });
        
        // Add fullscreen instructions tooltip to button
        if (fullscreenBtn) {
            fullscreenBtn.title = "Toggle Fullscreen (F11)";
            
            // Optionally add a label next to button for visibility
            const parent = fullscreenBtn.parentElement;
            if (parent) {
                const label = document.createElement('small');
                label.className = 'text-muted ms-2 d-none d-md-inline';
                parent.appendChild(label);
            }
        }
    }

    // Public API
    return {
        setupFullscreen,
        toggleFullscreen
    };
})();