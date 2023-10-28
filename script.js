
let zIndexCounter = 1; // Initialize a counter for z-index val

let activePopup = null; // Track the active popup
//drag


if (window.innerWidth <= 768) { // Example width for mobile devices
    window.location.href = 'mobile.html'; // Redirect to the mobile page
}

  // Function to open the pop-up window
  function openPopup(id) {
      // Close the currently active popup if there is one 
    //X THIS OUT IF YOU WANT ALL THE WINDOWS TO DISPLAY
      if (activePopup) {
          activePopup.classList.remove('active');
      }



      const popup = document.getElementById(id);
      if (popup) {
          zIndexCounter++; 
          popup.style.zIndex = zIndexCounter; // Set the z-index for the clicked popup
          popup.classList.add('active');

          activePopup = popup; // Update the active popup
      }


  }

  // Function to close the pop-up window
  function closePopup(id) {
      const popup = document.getElementById(id);
      if (popup) {
          popup.classList.remove('active');
          activePopup = null; // Reset the active popup
      }
    // pause a video in a closed popup
    const closedVideo = popup.querySelector('video');
    if (closedVideo) {
        closedVideo.pause();
    }
  }




// Function to minimize a window
function minimizeWindow() {
    const window = document.querySelector('.window.active');
    if (window) {
        window.classList.remove('active');
    }
}

// Function to maximize or restore a window
function maximizeRestoreWindow() {
    const window = document.querySelector('.window.active');
    if (window) {
        if (window.classList.contains('maximized')) {
            window.classList.remove('maximized');
        } else {
            window.classList.add('maximized');
        }
    }
}

// Function to close a window
function closeWindow() {
    const window = document.querySelector('.window.active');
    if (window) {
        window.classList.remove('active');
    }
}




// DRAGGING
var isDragging = false;
var activeElement = null;
var initialX = 0;
var initialY = 0;

document.addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('window')) {
        isDragging = true;
        activeElement = e.target;
        initialX = e.clientX - activeElement.getBoundingClientRect().left;
        initialY = e.clientY - activeElement.getBoundingClientRect().top;
    }
});

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        e.preventDefault();
        const newX = e.clientX - initialX;
        const newY = e.clientY - initialY;
        activeElement.style.left = newX + 'px';
        activeElement.style.top = newY + 'px';
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    activeElement = null;
});

//DRAGGING







const canvas = document.getElementById('smileyCanvas');
const ctx = canvas.getContext('2d');

let frame = 0;

// Function to draw a smiley face
function drawSmiley() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the smiley face
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.fillStyle = 'yellow';
    ctx.fill();

    // Draw the eyes
    ctx.beginPath();
    ctx.arc(70, 70, 10, 0, Math.PI * 2);
    ctx.arc(130, 70, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw the mouth
    const mouthRadius = 30;
    const startAngle = 0.2 * Math.PI + Math.sin(frame * 0.05) * 0.1;
    const endAngle = 0.8 * Math.PI - Math.sin(frame * 0.05) * 0.1;
    ctx.beginPath();
    ctx.arc(100, 100, mouthRadius, startAngle, endAngle);
    ctx.lineWidth = 3;
    ctx.stroke();
}

function animate() {
    frame++;
    drawSmiley();
    requestAnimationFrame(animate);
}

animate();