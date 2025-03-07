// main.js
import * as THREE from "three";
import { PlayerController } from "./movement.js";
import { addWalls } from "./walls/default.js";
// import AudioSphere from "./mic_effect/audio_sphere.js";
import AudioWall from "./mic_effect/audio_wall.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

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

const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const materials = {};
export const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);

const params = {
  threshold: 0,
  strength: 1,
  radius: 0.5,
  exposure: 1,
};

bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const renderScene = new RenderPass(scene, camera);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: `varying vec2 vUv;

			void main() {

				vUv = uv;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}`,
    fragmentShader: `uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;

			varying vec2 vUv;

			void main() {

				vec4 baseColor = texture2D(baseTexture, vUv);
				vec4 bloomColor = texture2D(bloomTexture, vUv);
				
				// Blend the bloom color based on the base color's alpha
				gl_FragColor = baseColor + bloomColor * baseColor.a; // Use baseColor.a for blending

			}`,
    defines: {},
  }),
  "baseTexture"
);
mixPass.needsSwap = true;

const outputPass = new OutputPass();

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

const gui = new GUI();

const bloomFolder = gui.addFolder("bloom");

bloomFolder.add(params, "threshold", 0.0, 1.0).onChange(function (value) {
  bloomPass.threshold = Number(value);
  render();
});

bloomFolder.add(params, "strength", 0.0, 3).onChange(function (value) {
  bloomPass.strength = Number(value);
  render();
});

bloomFolder
  .add(params, "radius", 0.0, 1.0)
  .step(0.01)
  .onChange(function (value) {
    bloomPass.radius = Number(value);
    render();
  });

const toneMappingFolder = gui.addFolder("tone mapping");

toneMappingFolder.add(params, "exposure", 0.1, 2).onChange(function (value) {
  renderer.toneMappingExposure = Math.pow(value, 4.0);
  render();
});

const playerController = new PlayerController(camera, scene);

// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0

addWalls(scene);

// Clock for framerate-independent movement
const clock = new THREE.Clock();
document.addEventListener("mousemove", playerController.handleMouseMove);

document.addEventListener("keydown", playerController.handleKeyDown);
document.addEventListener("keyup", playerController.handleKeyUp);

const audioWall = new AudioWall(
  camera,
  scene,
  new THREE.Vector3(0, 5, -10),
  new THREE.Vector3(0, 0, 0),
  10,
  10
);

(async () => await audioWall.setMaterial())();

let time = 0;

function render() {
  scene.traverse(darkenNonBloomed);
  // scene.traverse(darkenNonBloomed);
  bloomComposer.render();
  // scene.traverse(darkenNonBloomed);
  scene.traverse(restoreMaterial);

  // render the entire scene, then render bloom scene on top
  finalComposer.render();
}

function darkenNonBloomed(obj) {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  time += deltaTime;
  playerController.update(deltaTime);
  requestAnimationFrame(animate);

  audioWall.updateAudioWall(time);

  // Render the scene
  //  renderer.render(scene, camera);
  render();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
