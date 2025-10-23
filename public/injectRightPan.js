// injectRightPan.js - Right-click pan functionality for PDF viewer
// This module provides ephemeral right-mouse drag panning that works in all modes

console.log("[RightPan] injectRightPan.js loaded");

class RightPanInjector {
    constructor(pdfCursorTools) {
        console.log("[RightPan] RightPanInjector constructor called with:", pdfCursorTools);
        this.pdfCursorTools = pdfCursorTools;
        this.container = pdfCursorTools.container;
        console.log("[RightPan] Container:", this.container);

        // Create overlay for cursor display (like GrabToPan)
        this.overlay = document.createElement("div");
        this.overlay.className = "grab-to-pan-grabbing";

        this.setupGlobalRightMouseHandler();
    }

    setupGlobalRightMouseHandler() {
        console.log("[RightPan] setupGlobalRightMouseHandler called");
        let rightMouseDown = false;
        let panStarted = false;
        let recentPanActivity = false;
        let startX = 0;
        let startY = 0;
        let scrollLeftStart = 0;
        let scrollTopStart = 0;
        const PAN_THRESHOLD = 5; // pixels to move before starting pan
        const self = this;

        // Handle right mouse down - prepare for potential pan
        document.addEventListener("mousedown", (event) => {
            console.log("[RightPan] mousedown event, button:", event.button);
            if (event.button !== 2) {
                return;
            }
            // Restrict to viewer container region only
            if (!self.container || !self.container.contains(event.target)) {
                console.log("[RightPan] target not in container");
                return;
            }
            // Check for interactive elements that should not trigger pan
            if (self.isInteractiveElement(event.target)) {
                console.log("[RightPan] interactive element, skipping");
                return;
            }

            console.log("[RightPan] right mouse down detected");
            rightMouseDown = true;
            panStarted = false;
            recentPanActivity = false; // Reset recent activity
            startX = event.clientX;
            startY = event.clientY;

            // Don't prevent default yet - wait to see if user wants to pan or context menu
        }, { capture: true });

        // Handle mouse movement - detect if user wants to pan
        document.addEventListener("mousemove", (event) => {
            if (!rightMouseDown) {
                return;
            }

            // Check if mouse has moved enough to start panning
            const deltaX = Math.abs(event.clientX - startX);
            const deltaY = Math.abs(event.clientY - startY);

            if (!panStarted && (deltaX > PAN_THRESHOLD || deltaY > PAN_THRESHOLD)) {
                console.log("[RightPan] starting pan, deltaX:", deltaX, "deltaY:", deltaY);
                // User is wiggling - start panning
                panStarted = true;
                recentPanActivity = true;
                scrollLeftStart = self.container.scrollLeft;
                scrollTopStart = self.container.scrollTop;
                console.log("[RightPan] Initial scroll position - Left:", scrollLeftStart, "Top:", scrollTopStart);

                // Prevent context menu now that we know it's a pan
                event.preventDefault();

                // If Hand tool is already active, its own handler will manage pan and cursor
                if (self.pdfCursorTools.activeTool === 1) { // CursorTool.HAND = 1
                    console.log("[RightPan] hand tool active, letting it handle");
                    // Let the hand tool handle it
                    return;
                }

                // For right-click pan when hand tool is not active, show overlay for cursor
                console.log("[RightPan] showing overlay for right-click pan cursor");
                if (!self.overlay.parentNode) {
                    document.body.append(self.overlay);
                }
            }

            if (panStarted && self.pdfCursorTools.activeTool !== 1) {
                // Perform panning
                const xDiff = event.clientX - startX;
                const yDiff = event.clientY - startY;
                console.log("[RightPan] panning - xDiff:", xDiff, "yDiff:", yDiff);
                self.container.scrollTo({
                    top: scrollTopStart - yDiff,
                    left: scrollLeftStart - xDiff,
                    behavior: "instant"
                });
            }
        }, { capture: true });

        // Handle mouse up - reset state
        document.addEventListener("mouseup", (event) => {
            if (event.button === 2) {
                console.log("[RightPan] mouseup right button");
                rightMouseDown = false;
                panStarted = false;

                // Remove overlay
                self.overlay.remove();
                console.log("[RightPan] removed overlay");

                // Keep recentPanActivity true for a short time to prevent context menu
                setTimeout(() => {
                    recentPanActivity = false;
                }, 100); // 100ms should be enough to prevent context menu
            }
        }, { capture: true });

        // Prevent context menu if we recently had pan activity
        if (self.container) {
            self.container.addEventListener("contextmenu", (event) => {
                console.log("[RightPan] contextmenu event, recentPanActivity:", recentPanActivity);
                if (recentPanActivity) {
                    console.log("[RightPan] preventing context menu");
                    event.preventDefault();
                }
                // If recentPanActivity is false, allow context menu to show normally
            }, { capture: true });
        }
    }

    // Check if element is interactive and should not trigger pan
    isInteractiveElement(node) {
        return node.matches("a[href], a[href] *, input, textarea, button, button *, select, option");
    }
}

// Initialize right pan when PDF viewer is ready
function initializeRightPan() {
    console.log("[RightPan] initializeRightPan called");

    // Check if already initialized
    if (window.rightPanInitialized) {
        console.log("[RightPan] Already initialized, skipping");
        return;
    }

    const checkDependencies = () => {
        console.log("[RightPan] Checking dependencies...");
        console.log("[RightPan] window.PDFViewerApplication:", !!window.PDFViewerApplication);

        if (!window.PDFViewerApplication) {
            console.log("[RightPan] Retrying in 100ms (PDFViewerApplication not ready)");
            setTimeout(checkDependencies, 100);
            return;
        }

        console.log("[RightPan] PDFViewerApplication.pdfCursorTools:", !!window.PDFViewerApplication.pdfCursorTools);

        if (!window.PDFViewerApplication.pdfCursorTools) {
            console.log("[RightPan] Retrying in 100ms (pdfCursorTools not ready)");
            setTimeout(checkDependencies, 100);
            return;
        }

        console.log("[RightPan] All dependencies ready! Creating RightPanInjector");
        window.rightPanInitialized = true;
        new RightPanInjector(window.PDFViewerApplication.pdfCursorTools);
    };

    checkDependencies();
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        console.log("[RightPan] DOMContentLoaded - initializing");
        setTimeout(initializeRightPan, 100);
    });
} else {
    console.log("[RightPan] DOM already loaded - initializing immediately");
    setTimeout(initializeRightPan, 100);
}

// Also listen for webviewerloaded event
document.addEventListener("webviewerloaded", () => {
    console.log("[RightPan] webviewerloaded event - initializing");
    setTimeout(initializeRightPan, 200);
}, { capture: true });

// Export for backward compatibility
window.RightPanInjector = RightPanInjector;
window.initializeRightPan = initializeRightPan;