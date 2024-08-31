
let zIndexCounter = 1;

let activePopup = null;



if (window.innerWidth <= 768) { 
    window.location.href = 'mobile.html'; 
}


function openPopup(id) {
      // Close the currently active popup if there is one 
     //X THIS OUT IF YOU WANT ALL THE WINDOWS TO DISPLAY
      if (activePopup) {
          activePopup.classList.remove('active');
      }

      const popup = document.getElementById(id);
      if (popup) {
          zIndexCounter++; 
          popup.style.zIndex = zIndexCounter; // set the z-index for the clicked popup
          popup.classList.add('active');

          // if opening a project popup, hide the programming window
          if (id.startsWith('project-')) {
              document.getElementById('programming-popup').classList.remove('active');
          }

          activePopup = popup; // update the active popup

            // testing - make home go away
          document.getElementById('home').style.display = 'none';
      }
  }


function closePopup(id) {
      const popup = document.getElementById(id);
      if (popup) {
          popup.classList.remove('active');
          activePopup = null; // Reset the active popup

          // If closing a project popup, show the programming window
          if (id.startsWith('project-')) {
              document.getElementById('programming-popup').classList.add('active');
          }
          
    // pause a video in a closed popup
    const closedVideo = popup.querySelector('video');
    if (closedVideo) {
        closedVideo.pause();
    }
          // testing - bring home back
          document.getElementById('home').style.display = 'block';
    }
  }



function minimizeWindow() {
    const window = document.querySelector('.window.active');
    if (window) {
        window.classList.remove('active');
    }
}

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

function closeWindow() {
    const window = document.querySelector('.window.active');
    if (window) {
        window.classList.remove('active');
    }
}




// DRAGGING
// var isDragging = false;
// var activeElement = null;
// var initialX = 0;
// var initialY = 0;

// document.addEventListener('mousedown', function (e) {
//     if (e.target.classList.contains('window') || (e.target.classList.contains('title-bar'))) {
//         isDragging = true;
//         activeElement = e.target;
//         initialX = e.clientX - activeElement.getBoundingClientRect().left;
//         initialY = e.clientY - activeElement.getBoundingClientRect().top;
//     }
// });

// document.addEventListener('mousemove', function (e) {
//     if (isDragging) {
//         e.preventDefault();
//         const newX = e.clientX - initialX;
//         const newY = e.clientY - initialY;
//         activeElement.style.left = newX + 'px';
//         activeElement.style.top = newY + 'px';
//     }
// });

// document.addEventListener('mouseup', function () {
//     isDragging = false;
//     activeElement = null;
// });


// opening and closing the project popups inside the programming projects window
function openProjectPopup(projectId) {
    const programmingPopup = document.getElementById('programming-popup');
    const projectPopup = document.getElementById(`${projectId}-popup`);

    if (programmingPopup && projectPopup) {

        // make it the exact same position/size as the programming projects window
        const rect = programmingPopup.getBoundingClientRect();
        projectPopup.style.left = rect.left + 'px';
        projectPopup.style.top = rect.top + 'px';
        projectPopup.style.width = rect.width + 'px';
        projectPopup.style.height = rect.height + 'px';
        
        projectPopup.classList.add('active');
        projectPopup.style.display = 'block';
        zIndexCounter++;
        projectPopup.style.zIndex = zIndexCounter;
        activePopup = projectPopup;
    }
}

function closeProjectPopup(popupId) {
    const projectPopup = document.getElementById(popupId);
    const programmingPopup = document.getElementById('programming-popup');

    if (projectPopup && programmingPopup) {
        projectPopup.classList.remove('active');
        programmingPopup.classList.add('active');
        zIndexCounter++;
        programmingPopup.style.zIndex = zIndexCounter;
        activePopup = programmingPopup;
        projectPopup.style.display = 'none';
    }
}