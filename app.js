import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// 1. SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 0, 750);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.y = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
light.position.set(0.5, 1, 0.75);
scene.add(light);

// 2. THE ARENA & TARGET
const floorGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// The Target Box (Enemy)
const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const targetBox = new THREE.Mesh(boxGeometry, boxMaterial);
targetBox.position.set(0, 5, -30);
scene.add(targetBox);

// 3. CONTROLS & UI
const controls = new PointerLockControls(camera, document.body);
const startButton = document.getElementById('startButton');

startButton.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => startButton.style.display = 'none');
controls.addEventListener('unlock', () => startButton.style.display = 'block');
scene.add(controls.getObject());

// 4. MOVEMENT & PHYSICS VARIABLES
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': 
            if (canJump === true) velocity.y += 350; // Jump force
            canJump = false;
            break;
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

// 5. SHOOTING MECHANIC (Raycasting)
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0); // Crosshair is always dead center

document.addEventListener('mousedown', (event) => {
    if (!controls.isLocked || event.button !== 0) return; // Only shoot if locked and left-clicking

    // Shoot a ray from the camera through the center of the screen
    raycaster.setFromCamera(screenCenter, camera);

    // Check if the ray hits our target box
    const intersects = raycaster.intersectObject(targetBox);

    if (intersects.length > 0) {
        // We hit the box! Change its color to show damage
        targetBox.material.color.setHex(Math.random() * 0xffffff);
        
        // Push the box back slightly to simulate bullet impact
        targetBox.position.z -= 2;
    }
});

// 6. GAME LOOP
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    
    if (controls.isLocked) {
        const delta = (time - prevTime) / 1000;

        // Friction and Gravity
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass/gravity multiplier

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        const speed = 400.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        controls.getObject().position.y += (velocity.y * delta); // Apply vertical velocity

        // Floor collision (prevents falling forever)
        if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }
    }

    prevTime = time;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
