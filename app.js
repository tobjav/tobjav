// TOBJAM Splash Screen Timer
window.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    
    // Wait 1.5 seconds (1500 milliseconds)
    setTimeout(() => {
        splash.classList.add('fade-away');
        
        // Wait 0.5 seconds for the CSS fade transition to finish, then delete it
        setTimeout(() => {
            splash.remove();
        }, 500);
        
    }, 2000);
});

const canvasTrack = document.getElementById('canvas-track');
const exportCanvas = document.getElementById('export-canvas');
const addImgBtn = document.getElementById('add-img-btn');
const exportBtn = document.getElementById('export-btn');

const TOTAL_SLIDES = 20;
const SLIDE_WIDTH = 500;   // Custom editor slide width (Scale maps to 1080px automatically on export)
const CANVAS_HEIGHT = 600; // Custom editor height
const SNAP_THRESHOLD = 15; // Proximity in pixels to trigger structural snap

// Configure Track Bounds
canvasTrack.style.width = `${SLIDE_WIDTH * TOTAL_SLIDES}px`;

// Generate the 20 Document Dividers
// Start at 0 so Slide 1 gets a left border too!
for (let i = 0; i < TOTAL_SLIDES; i++) { 
    const seam = document.createElement('div');
    seam.className = 'slide-seam';
    seam.style.left = `${i * SLIDE_WIDTH}px`;
    
    const label = document.createElement('span');
    label.className = 'slide-label';
    label.innerText = `Slide ${i + 1}`; // Adjust label to say Slide 1, 2, 3...
    seam.appendChild(label);
    
    canvasTrack.appendChild(seam);
}

// State array tracking layered items
let items = [];

// Image Adding Routine
addImgBtn.addEventListener('click', () => {
    const imgUrl = prompt("Paste any image URL:", "https://picsum.photos/400/400");
    if (!imgUrl) return;

    const imgElement = document.createElement('img');
    imgElement.src = imgUrl;
    imgElement.className = 'draggable-image';
    imgElement.style.width = '200px';
    imgElement.style.left = '100px';
    imgElement.style.top = '100px';

    canvasTrack.appendChild(imgElement);
    makeElementTransformable(imgElement);
});

// Drag & Snapping Math
let activeWrapper = null;

// Global click listener to deselect if clicking the empty canvas background
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.image-wrapper') && activeWrapper) {
        activeWrapper.classList.remove('active');
        activeWrapper = null;
    }
});

function makeElementTransformable(wrapper) {
    const deleteBtn = wrapper.querySelector('.delete-btn');
    const resizeHandle = wrapper.querySelector('.resize-handle');
    const img = wrapper.querySelector('img');

    let isDragging = false;
    let isResizing = false;
    let startX, startY, initialLeft, initialTop, initialWidth, initialHeight;
    let aspectRatio = 1;

    // Handle Selection & Moving
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target === deleteBtn || e.target === resizeHandle) return;

        // Set active layer
        if (activeWrapper) activeWrapper.classList.remove('active');
        activeWrapper = wrapper;
        wrapper.classList.add('active');

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(wrapper.style.left) || 0;
        initialTop = parseInt(wrapper.style.top) || 0;
        
        // Bring to front
        canvasTrack.appendChild(wrapper);
        e.preventDefault();
    });

    // Handle Deletion
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.remove();
        if (activeWrapper === wrapper) activeWrapper = null;
    });

    // Handle Resizing Initiation
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        initialWidth = wrapper.offsetWidth;
        initialHeight = wrapper.offsetHeight;
        aspectRatio = img.naturalWidth / img.naturalHeight || 1; // Read native aspect ratio
    });

    // Universal Mouse Move Calculations
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            let deltaX = e.clientX - startX;
            let deltaY = e.clientY - startY;
            let targetX = initialLeft + deltaX;
            let targetY = initialTop + deltaY;

            // Snap Grid Engine
            for (let i = 0; i <= TOTAL_SLIDES; i++) {
                let seamX = i * SLIDE_WIDTH;
                if (Math.abs(targetX - seamX) < SNAP_THRESHOLD) {
                    targetX = seamX;
                }
                if (Math.abs((targetX + wrapper.offsetWidth) - seamX) < SNAP_THRESHOLD) {
                    targetX = seamX - wrapper.offsetWidth;
                }
            }

            wrapper.style.left = `${targetX}px`;
            wrapper.style.top = `${targetY}px`;
        }

        if (isResizing) {
            let deltaX = e.clientX - startX;
            
            // Calculate proportional resizing based on horizontal mouse drift
            let newWidth = Math.max(50, initialWidth + deltaX);
            let newHeight = newWidth / aspectRatio;

            wrapper.style.width = `${newWidth}px`;
            wrapper.style.height = `${newHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
}

// Slice Engine (Saves directly to your browser download queue)
exportBtn.addEventListener('click', async () => {
    const imagesInTrack = document.querySelectorAll('.image-wrapper');
    // if (imagesInTrack.length === 0) {
    //     alert("Add some images to your project first!");
    //     return;
    // }

    // High Res Output Target Matrix: 1080px wide per slice
    const outputSlideWidth = 1080;
    const outputHeight = 1350; 
    const scaleConversion = outputSlideWidth / SLIDE_WIDTH;

    const ctx = exportCanvas.getContext('2d');
    exportCanvas.height = outputHeight;
    exportCanvas.width = outputSlideWidth;

    // Loop through individual slide allocations
    for (let i = 0; i < TOTAL_SLIDES; i++) {
        // Clear background for canvas buffer pass
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outputSlideWidth, outputHeight);

        let windowLeftBound = i * SLIDE_WIDTH;

        imagesInTrack.forEach(wrapper => {
            const imgElement = wrapper.querySelector('img');
            
            // FIX: Use offsetLeft and offsetTop to find true position on the track layout
            let imgX = wrapper.offsetLeft;
            let imgY = wrapper.offsetTop;
            let imgW = wrapper.offsetWidth;
            let imgH = wrapper.offsetHeight;

            // Relocate standard coordinates back inside localized matrix translation 
            let relativeX = imgX - windowLeftBound;

            // Only draw the image if it actually lands inside the current slice window view
            if (imgX + imgW > windowLeftBound && imgX < windowLeftBound + SLIDE_WIDTH) {
                ctx.drawImage(
                    imgElement, 
                    relativeX * scaleConversion, 
                    imgY * scaleConversion, 
                    imgW * scaleConversion, 
                    imgH * scaleConversion
                );
            }
        });

        // Trigger Direct PC Download
        let dataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);
        let link = document.createElement('a');
        link.download = `scrl_slice_${i + 1}.jpg`;
        link.href = dataUrl;
        link.click();
    }
    alert("Export Process Complete! Check your desktop Downloads directory.");
});
const workspace = document.getElementById('workspace-container');
const dropOverlay = document.getElementById('drop-overlay');

// 1. Prevent default browser behavior (e.g., opening the image file in a new tab)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    workspace.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 2. Toggle visual overlay when dragging files over the window
workspace.addEventListener('dragenter', () => dropOverlay.style.display = 'flex');
workspace.addEventListener('dragover', () => dropOverlay.style.display = 'flex');
workspace.addEventListener('dragleave', (e) => {
    // Only hide if we actually leave the container window
    if (e.relatedTarget === null || !workspace.contains(e.relatedTarget)) {
        dropOverlay.style.display = 'none';
    }
});

// 3. Handle the drop event
workspace.addEventListener('drop', (e) => {
    dropOverlay.style.display = 'none';
    
    const dt = e.dataTransfer;
    const files = dt.files;

    // Process all dropped items
    handleFiles(files, e.clientX, e.clientY);
});

function handleFiles(files, dropX, dropY) {
    [...files].forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert("Please drop image files only!");
            return;
        }

        // Use FileReader instead of URL.createObjectURL to comply with Neocities CSP
        const reader = new FileReader();
        
        // Convert the local file into an inline Base64 data string
        reader.readAsDataURL(file);
        
        reader.onloadend = function() {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';
            
            const imgElement = document.createElement('img');
            imgElement.src = reader.result; // This is now a safe "data:image..." URI string
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.display = 'block';
            imgElement.setAttribute('draggable', 'false');

            // Wait for the inline data string to resolve in browser memory
            imgElement.onload = function() {
                // Create UI Controls
                const deleteBtn = document.createElement('div');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '&times;';

                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'resize-handle';

                wrapper.appendChild(imgElement);
                wrapper.appendChild(deleteBtn);
                wrapper.appendChild(resizeHandle);

                wrapper.style.width = '250px';
                wrapper.style.height = '250px';

                const trackRect = canvasTrack.getBoundingClientRect();
                const relativeLeft = dropX - trackRect.left - 125;
                const relativeTop = dropY - trackRect.top - 125;

                wrapper.style.left = `${relativeLeft}px`;
                wrapper.style.top = `${relativeTop}px`;

                canvasTrack.appendChild(wrapper);
                makeElementTransformable(wrapper);
            };
        };
    });
}