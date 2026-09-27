// Configuración de la escena Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Mensajes de amor para las estrellas
const loveMessages = [
  "Eres la estrella más brillante de todo mi universo. ✨❤️",
  "Contigo aprendí que el amor no se busca, se encuentra cuando menos lo esperas 💖",
  "Me encantas exactamente tal como eres. 🥰",
  "Mi lugar favorito en el mundo es a tu lado. 👩‍❤️‍👨",
  "Gracias por iluminar mis días con tu sonrisa. ☀️",
  "Eres mi amor, mi vida y mi todo. 💕",
  "Pintaste mi mundo de colores mágicos. 🎨✨",
  "Te amo hoy, mañana y para siempre. 🌌❤️"
];

// 1. Galaxia en espiral
const parameters = {
  count: 80000,
  size: 0.015,
  radius: 6,
  branches: 5,
  spin: 1.2,
  randomness: 0.6,
  power: 3,
  insideColor: '#ff4db8',
  outsideColor: '#3d1259'
};

let geometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

for (let i = 0; i < parameters.count; i++) {
  const i3 = i * 3;
  const radius = Math.random() * parameters.radius;
  const spinAngle = radius * parameters.spin;
  const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

  const randomX = Math.pow(Math.random(), parameters.power) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
  const randomY = Math.pow(Math.random(), parameters.power) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
  const randomZ = Math.pow(Math.random(), parameters.power) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

  positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

  const mixedColor = colorInside.clone();
  mixedColor.lerp(colorOutside, radius / parameters.radius);

  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: parameters.size,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true
});

const galaxyPoints = new THREE.Points(geometry, material);
scene.add(galaxyPoints);

// 2. Crear Estrellas Interactivas Especiales
const interactiveStars = [];
const starGeometry = new THREE.SphereGeometry(0.12, 16, 16);

loveMessages.forEach((msg, index) => {
  const starMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ffffff'),
    wireframe: false
  });

  const starMesh = new THREE.Mesh(starGeometry, starMaterial);

  // Posicionar estrellas flotando en círculo alrededor de la galaxia
  const angle = (index / loveMessages.length) * Math.PI * 2;
  const radius = 2.5 + Math.random() * 1.2;
  starMesh.position.x = Math.cos(angle) * radius;
  starMesh.position.y = (Math.random() - 0.5) * 1.5;
  starMesh.position.z = Math.sin(angle) * radius;

  starMesh.userData = { message: msg, baseScale: 1, angle: angle, radius: radius };
  scene.add(starMesh);
  interactiveStars.push(starMesh);
});

camera.position.set(0, 3.5, 5);
camera.lookAt(0, 0, 0);

// Raycaster para detectar clics/toques en las estrellas
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const closeBtn = document.getElementById('close-btn');

function onPointerDown(event) {
  let clientX = event.clientX;
  let clientY = event.clientY;

  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveStars);

  if (intersects.length > 0) {
    const clickedStar = intersects[0].object;
    modalText.innerText = clickedStar.userData.message;
    modal.classList.remove('hidden');
    createSparkle(clientX, clientY);
  }
}

window.addEventListener('click', onPointerDown);
window.addEventListener('touchstart', onPointerDown);

closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

// Polvo de estrellas interactivo
const sparkleContainer = document.getElementById('sparkle-container');

function createSparkle(x, y) {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkleContainer.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 1000);
}

window.addEventListener('mousemove', (e) => {
  if (Math.random() < 0.3) createSparkle(e.clientX, e.clientY);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animación
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Rotación de la galaxia
  galaxyPoints.rotation.y = elapsedTime * 0.08;

  // Movimiento suave y titilante de las estrellas especiales
  interactiveStars.forEach((star, i) => {
    star.userData.angle += 0.003;
    star.position.x = Math.cos(star.userData.angle) * star.userData.radius;
    star.position.z = Math.sin(star.userData.angle) * star.userData.radius;
    star.position.y += Math.sin(elapsedTime * 2 + i) * 0.003;

    // Efecto de pulso / brillo
    const scale = 1 + Math.sin(elapsedTime * 4 + i) * 0.25;
    star.scale.set(scale, scale, scale);
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();