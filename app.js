// Import Three.js and the First Person controls via CDN so it works on GitHub Pages
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

// 1. SET UP SCENE, CAMERA, AND RENDERER
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 0, 750); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.y = 10; // Player eye level

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. ADD LIGHTING
const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
light.position.set(0.5, 1, 0.75);
scene.add(light);

// 3. BUILD THE ARENA
const floorGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Lay it flat on the ground
scene.add(floor);

// Create an enemy target box (The "Bot")
const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 5, -30); // Place it in front of the player
scene.add(box);

// 4. SET UP CONTROLS (Pointer Lock)
const controls = new PointerLockControls(camera, document.body);
const startButton = document.getElementById('startButton');

startButton.addEventListener('click', () => {
    controls.lock(); 
});

controls.addEventListener('lock', () => {
    startButton.style.display = 'none'; 
});

controls.addEventListener('unlock', () => {
    startButton.style.display = 'block'; 
});

scene.add(controls.getObject());

// 5. SET UP MOVEMENT LOGIC
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyD': moveRight = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
    }
});

// 6. THE GAME LOOP
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    
    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;

        // Apply friction to slow down
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // Ensure diagonal movement isn't faster

        // Apply speed
        const speed = 400.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        // Move the camera based on velocity
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }

    prevTime = time;
    renderer.render(scene, camera);
}

animate();

// Handle window resizing dynamically
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
