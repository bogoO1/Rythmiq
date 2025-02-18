import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { getPhongFShader } from "./shader_utils";

console.log(getPhongFShader(1));

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

const planet1 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0x808080 })
);

planet1.position.set(0, 0, 0);

animate();

scene.add(planet1);

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (controls.enabled) {
    controls.update();
  }

  renderer.render(scene, camera);
}
