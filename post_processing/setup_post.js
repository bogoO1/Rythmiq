import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { getShader } from "../shader_utils";
import { setUpBloomUniformsHelper } from "./bloom_effect/bloom_audio";

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

// TODO: set up all post processing in this file and add that screen strange feature.

const params = {
  threshold: 0,
  strength: 0.0, //1.2,
  radius: 0.5,
  exposure: 1,
};

let tempUniforms;
let bloomComposer;
let renderScene;
let outputPass;
let mixPass;
let finalComposer;
let gui;
let bloomFolder;
let toneMappingFolder;
let myScene;

bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

export async function setUpBloom(renderer, scene, camera) {
  const screenBloomFragShader = await getShader("/shaders/bloom/bloom.frag");
  const screenBloomVertShader = await getShader("/shaders/bloom/bloom.vert");

  const audioBloomFragShader = await getShader(
    "/shaders/bloom/bloom_audio.frag"
  );
  const audioBloomVertShader = await getShader(
    "/shaders/bloom/bloom_audio.vert"
  );

  myScene = scene;
  renderScene = new RenderPass(scene, camera);

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
        ...tempUniforms,
      },
      vertexShader: audioBloomVertShader,
      fragmentShader: audioBloomFragShader,
      defines: {},
    }),
    "baseTexture"
  );

  mixPass.needsSwap = true;

  outputPass = new OutputPass();

  finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(mixPass);
  finalComposer.addPass(outputPass);

  gui = new GUI();

  bloomFolder = gui.addFolder("bloom");

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

  toneMappingFolder = gui.addFolder("tone mapping");

  toneMappingFolder.add(params, "exposure", 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
    render();
  });
}

export function setUpBloomUniforms(planePos, normal, max_intensity) {
  tempUniforms = setUpBloomUniformsHelper(planePos, normal, max_intensity);
}

export default function render() {
  if (finalComposer == undefined) {
    return;
  }

  myScene.traverse(darkenNonBloomed);

  bloomComposer.render();

  myScene.traverse(restoreMaterial);
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
