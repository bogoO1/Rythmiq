import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getPhongFShader } from "./shader_utils";
import { PlayerController } from "./movement.js";

// console.log(getPhongFShader(1));

const scene = new THREE.Scene();
let clock = new THREE.Clock();

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.minDistance = 10;
controls.maxDistance = 50;

// Initialize the PlayerController
const playerController = new PlayerController(camera, scene);
playerController.initializeControls();

// Example object to test collisions
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(5, 5, 5),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
wall.position.set(0, 0, -10);
wall.userData.isWall = true; // Mark this object as a wall for collision detection
scene.add(wall);

// Commented out planet1 definition
// const planet1 = new THREE.Mesh(
//   new THREE.SphereGeometry(1, 8, 6),
//   new THREE.MeshBasicMaterial({ color: 0x808080 })
// );
// planet1.position.set(0, 0, 0);
// scene.add(planet1);

function animate() {
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
