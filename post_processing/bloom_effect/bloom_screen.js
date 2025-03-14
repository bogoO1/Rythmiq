import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { getShader } from "../../shader_utils";
import { FFT_SIZE } from "../../audio";

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
  strength: 3.0, //1.2,
  radius: 0.5,
};

let bloomComposer;
let mixPass;
let gui;
let bloomFolder;
let tempUniforms;

bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

export async function setUpScreenBloom(renderer, scene, camera, renderScene) {
  const bloomFragShader = await getShader("/shaders/bloom/bloom_screen.frag", [
    {
      textToReplace: "FFT_SIZE_REPLACE_1",
      replaceValue: (FFT_SIZE - 1).toString(),
    },
    { textToReplace: "FFT_SIZE_REPLACE", replaceValue: FFT_SIZE.toString() },
  ]);
  const bloomVertShader = await getShader("/shaders/bloom/bloom_screen.vert", [
    {
      textToReplace: "FFT_SIZE_REPLACE_1",
      replaceValue: (FFT_SIZE - 1).toString(),
    },
    { textToReplace: "FFT_SIZE_REPLACE", replaceValue: FFT_SIZE.toString() },
  ]);

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
  // bloomTexture: { value: bloomComposer.renderTarget2.texture },

  mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
        ...tempUniforms,
      },
      vertexShader: bloomVertShader,
      fragmentShader: bloomFragShader,
      defines: {},
    }),
    "baseTexture"
  );

  mixPass.needsSwap = true;

  gui = new GUI();

  bloomFolder = gui.addFolder("bloom");

  bloomFolder.add(params, "threshold", 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  bloomFolder.add(params, "strength", 0.0, 3).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  bloomFolder
    .add(params, "radius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });
  return { bloomComposer, mixPass };
}

export function updateUniforms(audio) {
  tempUniforms = {
    audio: { value: audio },
  };
  mixPass.material.uniforms = tempUniforms;

  return tempUniforms;
}

export function darkenNonBloomed(obj) {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

export function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}
