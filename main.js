// main.js
import * as THREE from "three";
import { CameraCollision } from "./collision.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

//ground implementation
const groundGeometry = new THREE.PlaneGeometry(100, 100); // Adjust size as needed

// Load the granite tile texture
const loader = new THREE.TextureLoader();
const graniteTexture = loader.load('textures/granite_tile.png'); // Make sure to use the correct path where the texture is stored
graniteTexture.wrapS = graniteTexture.wrapT = THREE.RepeatWrapping;
graniteTexture.repeat.set(10, 10); // Adjust based on the size of your geometry and the scale of the texture

let groundMaterial = new THREE.MeshPhongMaterial({
  map: graniteTexture, // Use the loaded granite texture
  shininess: 60, // Adjust this value for the desired glossiness of the ceramic-like surface
  specular: new THREE.Color('grey'), // Specular highlights to add reflective properties typical of polished granite
  side: THREE.DoubleSide // Render both sides of the plane
});

//groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
ground.position.y = -1; // Adjust height to align with the camera's y
scene.add(ground);


// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0
const moveSpeed = 5; // Movement speed
const lookSpeed = 0.002; // Mouse sensitivity
let yaw = 0,
  pitch = 0; // Camera rotation angles

// Collision Detection System
const collisionSystem = new CameraCollision(scene);

// Add test objects (obstacles)
const boxGeo = new THREE.BoxGeometry();
const boxMat = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});
const cube = new THREE.Mesh(boxGeo, boxMat);
cube.position.set(0, 0, 3); // Example obstacle
scene.add(cube);

//wall objects
const wallTexture = loader.load('textures/seaworn_sandstone_brick.png');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4); 
const wallGeometry = new THREE.BoxGeometry(10, 10, 0.5); // Width, height, depth
const wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture
});
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.set(5, -1, 0); // Adjust position accordingly
scene.add(wall);


// Movement input tracking
const keys = {};
window.addEventListener("keydown", (event) => (keys[event.code] = true));
window.addEventListener("keyup", (event) => (keys[event.code] = false));

// Mouse movement tracking for look controls
document.body.requestPointerLock =
  document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener("click", () => document.body.requestPointerLock());
document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === document.body) {
    yaw -= event.movementX * lookSpeed; // Rotate left/right
    pitch -= event.movementY * lookSpeed; // Rotate up/down
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch (-90° to 90°)
  }
});

// Clock for framerate-independent movement
const clock = new THREE.Clock();

function updateCameraPosition(deltaTime) {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)); // XZ only (Fixed Direction)
  const right = new THREE.Vector3(forward.z, 0, -forward.x); // Right vector perpendicular to forward and up

  const velocity = moveSpeed * deltaTime;
  let nextPosition = camera.position.clone();

  if (keys["KeyW"]) nextPosition.addScaledVector(forward, velocity);
  if (keys["KeyS"]) nextPosition.addScaledVector(forward, -velocity);
  if (keys["KeyA"]) nextPosition.addScaledVector(right, velocity);
  if (keys["KeyD"]) nextPosition.addScaledVector(right, -velocity);

  nextPosition.y = 0; // Keep Y locked

  // Check collision BEFORE moving
  const collision = collisionSystem.willCollide(nextPosition, camera);
  if (!collision.colliding) {
    camera.position.copy(nextPosition);
  } else {
    // Slide along the collision surface
    let slideDirection = nextPosition.clone().sub(camera.position).normalize();
    slideDirection = slideDirection.projectOnPlane(collision.normal);

    // Apply slide movement
    const slideAmount = velocity * 0.5;
    const slidePosition = camera.position
      .clone()
      .addScaledVector(slideDirection, slideAmount);

    // Final check if sliding is possible
    if (!collisionSystem.willCollide(slidePosition, camera).colliding) {
      camera.position.copy(slidePosition);
    } else if (collision.pushOutVector) {
      // If still colliding, push player out
      camera.position.add(collision.pushOutVector);
    }
  }
}
// Use quaternions for rotation to prevent gimbal lock
function updateCameraRotation() {
  const quaternion = new THREE.Quaternion();

  // Rotate around X for pitch (up/down)
  const pitchQuat = new THREE.Quaternion();
  pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);

  // Rotate around Y for yaw (left/right)
  const yawQuat = new THREE.Quaternion();
  yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

  // Apply yaw first, then pitch
  quaternion.multiplyQuaternions(yawQuat, pitchQuat);
  camera.quaternion.copy(quaternion);
}

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  updateCameraPosition(deltaTime);
  updateCameraRotation();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
