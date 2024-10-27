import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

console.log('Script started');

let container, scene, camera, renderer, logoGroup;
let letterMeshes = [];
let startPositions = [];
let offScreenPositions = [];
let randomRotations = [];
let font;

function init() {
  console.log('Initializing...');

  container = document.getElementById('threeDContent');
  if (!container) {
    console.error('Container element with id "threeDContent" not found. Please check your HTML.');
    return;
  }
  console.log('Container found:', container);

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  console.log('Container dimensions:', containerWidth, containerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(containerWidth, containerHeight);
  container.appendChild(renderer.domElement);

  updateCameraPosition();

  logoGroup = new THREE.Group();
  scene.add(logoGroup);

  const loader = new THREE.FontLoader();
  loader.load("/fonts/GT America Bold_Italic.json", function(loadedFont) {
    font = loadedFont;
    console.log('Font loaded successfully:', font);
    createText();
    animate();
    onScroll();
  }, undefined, function(error) {
    console.error('An error occurred while loading the font:', error);
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(fallbackFont) {
      font = fallbackFont;
      console.log('Fallback font loaded successfully:', font);
      createText();
      animate();
    });
  });

  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', onWindowResize);

  console.log('Initialization complete');
}

function updateCameraPosition() {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const aspect = containerWidth / containerHeight;
  camera.position.z = 15 * (1000 / containerWidth); // adjust camera distance based on container width
}

function createText() {
  console.log('Creating text...');

  const textLines = ["HI,I'MORE"];
  const baseSize = 4; // Base size for standard display
  const minSize = 3;  // Minimum size when resizing
  const maxSize = 4;  // Maximum size to maintain visibility
  const containerWidth = container.clientWidth;
  const targetWidth = 1900; // Reference width
  let fontSize = maxSize; // Start with the maximum size

  // Calculate the scaling factor based on container width
  const scaleFactor = containerWidth / targetWidth;

  // Set font size based on scale factor, but clamp it to a minimum size
  fontSize = Math.max(minSize, baseSize * scaleFactor);
  
  const lineHeight = 6 * fontSize / baseSize; // Line height scaling with baseSize
  console.log('Font size (pixels):', fontSize);
  console.log('Line height (pixels):', lineHeight);

  let totalWidth = 0;
  
  textLines.forEach((line, lineIndex) => {
    const letters = line.split('');
    let letterOffset = 0;

    letters.forEach((letter) => {
      const letterGeometry = new THREE.TextGeometry(letter, {
        font: font,
        size: fontSize,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
      });

      letterGeometry.computeBoundingBox();
      const letterWidth = letterGeometry.boundingBox.max.x - letterGeometry.boundingBox.min.x;
      
      totalWidth += letterWidth; // Accumulate total width

      const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
      const edges = new THREE.EdgesGeometry(letterGeometry);
      const outlineMesh = new THREE.LineSegments(edges, outlineMaterial);

      // Position the letter
      outlineMesh.position.x = letterOffset;
      outlineMesh.position.y = -lineIndex * lineHeight; // Adjust line height correctly
      outlineMesh.position.z = 0;

      logoGroup.add(outlineMesh);
      letterMeshes.push(outlineMesh);

      startPositions.push(outlineMesh.position.clone());
      const angle = Math.random() * Math.PI * 2;
      const distance = (30 + Math.random() * 20) * (fontSize / baseSize);
      const offScreenX = Math.cos(angle) * distance;
      const offScreenY = Math.sin(angle) * distance;
      offScreenPositions.push(new THREE.Vector3(offScreenX, offScreenY, Math.random() * 20 - 10));
      randomRotations.push(new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2));

      letterOffset += letterWidth * 1.1; // Offset by letter width
    });
  });

  // Centering horizontally by adjusting logoGroup's position
  const centerX = -(totalWidth / 2) - 0.3; // Slight adjustment to the left
  const centerY = -lineHeight / 4; // Adjust to lift text slightly higher for better centering

  logoGroup.position.set(centerX, centerY, 0); // Centering x and y

  console.log('Text creation complete. Group centered at:', logoGroup.position);
}



function onScroll() {
  const scrollPosition = window.pageYOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = Math.min((scrollPosition / maxScroll), 1);

  console.log('Scroll progress:', scrollProgress);
  animateShatter(scrollProgress);
}

function animateShatter(progress) {
  letterMeshes.forEach((letterMesh, index) => {
    if (progress <= 0.8) { //animate up to 80% scroll
      
      letterMesh.position.lerpVectors(
        startPositions[index],
        offScreenPositions[index],
        progress 
      );

      letterMesh.rotation.set(
        randomRotations[index].x * progress,
        randomRotations[index].y * progress,
        randomRotations[index].z * progress 
      );

      letterMesh.scale.setScalar(1 - progress * 0.5);

      letterMesh.visible = true;
    } else {
      // after 80% scroll, letters invisible
      letterMesh.visible = false;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerWidth, containerHeight);

  updateCameraPosition();

  // Clear existing text and recreate it
  while(logoGroup.children.length > 0) {
    logoGroup.remove(logoGroup.children[0]);
  }
  letterMeshes = [];
  startPositions = [];
  offScreenPositions = [];
  randomRotations = [];
  createText();

  console.log('Window resized:', containerWidth, containerHeight);
  onScroll();
}

init();