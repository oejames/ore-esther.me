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
  camera.position.z = 15 * (1000 / containerWidth); // Adjust camera distance based on container width
}

function createText() {
  console.log('Creating text...');

  const textLines = ["HI,I'MORE"];
  const baseSize = 4; // Original size
  const scaleFactor = container.clientWidth / 2200; // Adjust based on a reference width of 1000px
  const fontSize = baseSize * scaleFactor;
  const lineHeight = 6 * scaleFactor; // Scaled line height
  const leftMargin = -13 * scaleFactor; // Scaled left margin: og -12 with the sidebar line, -13 without

  console.log('Font object:', font);

  textLines.forEach((line, lineIndex) => {
    const letters = line.split('');
    let letterOffset = 0;

    letters.forEach((letter, letterIndex) => {
      const letterGeometry = new THREE.TextGeometry(letter, {
        font: font,
        size: fontSize,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
      });

      letterGeometry.computeBoundingBox();
      const letterWidth = letterGeometry.boundingBox.max.x - letterGeometry.boundingBox.min.x;

      const outlineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000,
        linewidth: 1
      });

      const edges = new THREE.EdgesGeometry(letterGeometry);
      const outlineMesh = new THREE.LineSegments(edges, outlineMaterial);

      outlineMesh.position.x = leftMargin + letterOffset;
      outlineMesh.position.y = -lineIndex * lineHeight;
      outlineMesh.position.z = 0;

      logoGroup.add(outlineMesh);
      letterMeshes.push(outlineMesh);

      startPositions.push(outlineMesh.position.clone());
      const angle = Math.random() * Math.PI * 2;
      const distance = (30 + Math.random() * 20) * scaleFactor;
      const offScreenX = Math.cos(angle) * distance;
      const offScreenY = Math.sin(angle) * distance;
      offScreenPositions.push(new THREE.Vector3(offScreenX, offScreenY, Math.random() * 20 - 10));
      randomRotations.push(new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2));

      console.log(`Letter "${letter}" positioned at:`, outlineMesh.position);
      letterOffset += letterWidth * 1.1;
    });
  });

  // Center the entire text group vertically
  const bbox = new THREE.Box3().setFromObject(logoGroup);
  const centerY = -(bbox.max.y + bbox.min.y) / 2;
  logoGroup.position.y = centerY;

  console.log('Text creation complete');
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