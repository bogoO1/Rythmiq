// main.js
import * as THREE from "three";
import { CameraCollision } from "./collision.js";
import { WalkingSound } from "./walking_sound.js";
import { WelcomeScreen } from "./loading_screen.js";

// Scene setup
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getPhongFShader } from "./shader_utils";
import { PlayerController } from "./movement.js";

// console.log(getPhongFShader(1));

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

// Add walking sound
const walkingSound = new WalkingSound(camera);

// Ground implementation
const groundGeometry = new THREE.PlaneGeometry(100, 100); // Adjust size as needed

// Load the granite tile texture
const loader = new THREE.TextureLoader();
const graniteTexture = loader.load("textures/granite_tile.png");
graniteTexture.wrapS = graniteTexture.wrapT = THREE.RepeatWrapping;
graniteTexture.repeat.set(10, 10);

// create a welcome scene
const Walking = new WelcomeScreen(scene, camera);

let groundMaterial = new THREE.MeshPhongMaterial({
  map: graniteTexture,
  shininess: 60,
  specular: new THREE.Color("grey"),
  side: THREE.DoubleSide,
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);

// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0
const moveSpeed = 5; // Movement speed
const lookSpeed = 0.002; // Mouse sensitivity
let yaw = 0,
  pitch = 0; // Camera rotation angles

// Collision Detection System
const collisionSystem = new CameraCollision(scene);

//wall objects
const wallTexture = loader.load("textures/seaworn_sandstone_brick.png");
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(100, 10);

const wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture,
  shininess: 10, // Reduced shininess for a matte look
  specular: new THREE.Color(0x222222),
});
const wall1Geometry = new THREE.BoxGeometry(100, 10, 0.5);

const wallFront = new THREE.Mesh(wall1Geometry, wallMaterial); //front
wallFront.position.set(0, 4, -50); // Adjust position accordingly

const wallBack = new THREE.Mesh(wall1Geometry, wallMaterial); //back
wallBack.position.set(0, 4, 50);

const wallLeft = new THREE.Mesh(wall1Geometry, wallMaterial); //back
wallLeft.rotation.y = Math.PI / 2;
wallLeft.position.set(-50, 4, 0);

const wallRight = new THREE.Mesh(wall1Geometry, wallMaterial); //back
wallRight.rotation.y = Math.PI / 2;
wallRight.position.set(50, 4, 0);

scene.add(wallFront);
scene.add(wallBack);
scene.add(wallLeft);
scene.add(wallRight);

//Adel Shaders
async function loadShader(url) {
  const response = await fetch(url);
  return response.text();
}
const vertexShader = await loadShader("shaders/gradient.vert");
const fragmentShader = await loadShader("shaders/gradient.frag");
const canvas = renderer.domElement;
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    renderWidth: { value: canvas.width },
    renderHeight: { value: canvas.height },
  },
});
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
sphere.position.set(0, 1, -10);

scene.add(sphere);

// Movement input tracking
const keys = {};
window.addEventListener("keydown", (event) => (keys[event.code] = true));
window.addEventListener("keyup", (event) => (keys[event.code] = false));

// Mouse movement tracking for look controls
document.body.requestPointerLock =
  document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener("click", () => {
  document.body.requestPointerLock();

  // Allow audio context to resume when played
  //creating a user interaction in order to play it in the web
  const audioContext = THREE.AudioContext.getContext();
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
});

//making the audio more clearer based on movement
document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === document.body) {
    yaw -= event.movementX * lookSpeed; // Rotate left/right
    pitch -= event.movementY * lookSpeed; // Rotate up/down
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch (-90° to 90°)
  }
});

// Clock for framerate-independent movement
const clock = new THREE.Clock();
let isMoving = false;

function updateCameraPosition(deltaTime) {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)); // XZ only (Fixed Direction)
  const right = new THREE.Vector3(forward.z, 0, -forward.x); // Right vector perpendicular to forward and up

  const velocity = moveSpeed * deltaTime;
  let nextPosition = camera.position.clone();
  isMoving = false; // Reset movement status

  if (keys["KeyW"]) {
    nextPosition.addScaledVector(forward, velocity);
    isMoving = true;
  }
  if (keys["KeyS"]) {
    nextPosition.addScaledVector(forward, -velocity);
    isMoving = true;
  }
  if (keys["KeyA"]) {
    nextPosition.addScaledVector(right, velocity);
    isMoving = true;
  }
  if (keys["KeyD"]) {
    nextPosition.addScaledVector(right, -velocity);
    isMoving = true;
  }

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

  // Play walking sound if moving, stop otherwise
  if (isMoving) {
    walkingSound.play();
  } else {
    walkingSound.stop();
  }
}

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  updateCameraPosition(deltaTime);
  updateCameraRotation();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (controls.enabled) {
    controls.update();
  }

  // Update player movement and camera control
  playerController.update();

  renderer.render(scene, camera);
}
animate();
