// injectRightPan.js - Right-click pan functionality for PDF viewer
// This module provides ephemeral right-mouse drag panning that works in all modes

class RightPanInjector {
    constructor(pdfCursorTools) {
        this.pdfCursorTools = pdfCursorTools;
        this.setupGlobalRightMouseHandler();
    }

    setupGlobalRightMouseHandler() {
        let rightMouseDown = false;
        let panStarted = false;
        let recentPanActivity = false;
        let startX = 0;
        let startY = 0;
        const PAN_THRESHOLD = 5; // pixels to move before starting pan

        // Handle right mouse down - prepare for potential pan
        document.addEventListener("mousedown", (event) => {
            if (event.button !== 2) {
                return;
            }
            // Restrict to viewer container region only
            if (!this.pdfCursorTools.container.contains(event.target)) {
                return;
            }
            // Check for interactive elements that should not trigger pan
            if (this.isInteractiveElement(event.target)) {
                return;
            }

            rightMouseDown = true;
            panStarted = false;
            recentPanActivity = false; // Reset recent activity
            startX = event.clientX;
            startY = event.clientY;

            // Don't prevent default yet - wait to see if user wants to pan or context menu
        }, { capture: true });

        // Handle mouse movement - detect if user wants to pan
        document.addEventListener("mousemove", (event) => {
            if (!rightMouseDown || panStarted) {
                return;
            }

            // Check if mouse has moved enough to start panning
            const deltaX = Math.abs(event.clientX - startX);
            const deltaY = Math.abs(event.clientY - startY);

            if (deltaX > PAN_THRESHOLD || deltaY > PAN_THRESHOLD) {
                // User is wiggling - start panning
                panStarted = true;
                recentPanActivity = true;

                // Prevent context menu now that we know it's a pan
                event.preventDefault();

                // If Hand tool is already active, its own handler will manage pan
                // Otherwise use ephemeral pan start
                if (this.pdfCursorTools.activeTool !== 1) { // CursorTool.HAND = 1
                    // Create a proper event object with all required properties
                    const panEvent = {
                        button: 2, // Right mouse button
                        clientX: startX,
                        clientY: startY,
                        target: event.target, // Preserve the original target
                        originalTarget: event.originalTarget,
                        preventDefault: () => { },
                        stopPropagation: () => { }
                    };
                    this.pdfCursorTools._handTool.beginPanFromMouseDown(panEvent);
                }
            }
        }, { capture: true });

        // Handle mouse up - reset state
        document.addEventListener("mouseup", (event) => {
            if (event.button === 2) {
                rightMouseDown = false;
                panStarted = false;
                // Keep recentPanActivity true for a short time to prevent context menu
                setTimeout(() => {
                    recentPanActivity = false;
                }, 100); // 100ms should be enough to prevent context menu
            }
        }, { capture: true });

        // Prevent context menu if we recently had pan activity
        this.pdfCursorTools.container.addEventListener("contextmenu", (event) => {
            if (recentPanActivity) {
                event.preventDefault();
            }
            // If recentPanActivity is false, allow context menu to show normally
        }, { capture: true });
    }

    // Check if element is interactive and should not trigger pan
    isInteractiveElement(node) {
        return node.matches("a[href], a[href] *, input, textarea, button, button *, select, option");
    }
}

// Export for use in viewer.mjs
window.RightPanInjector = RightPanInjector;