import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { getShader } from "../shader_utils";
import {
  setUpBloomUniformsHelper,
  setUpAudioBloom,
  darkenNonBloomed as darkenNonBloomedAudio,
  restoreMaterial as restoreMaterialAudio,
} from "./bloom_effect/bloom_audio";

// import {
//   setUpScreenBloom,
//   darkenNonBloomed as darkenNonBloomedScreen,
//   restoreMaterial as restoreMaterialScreen,
// } from "./bloom_effect/bloom_screen";

const params = {
  exposure: 1,
};

let tempUniforms;
let bloomComposer;
let renderScene;
let outputPass;
let mixPass;
let finalComposer;
let gui;
let toneMappingFolder;
let myScene;
let bloomComposerScreen;
let mixPassScreen;

export async function setUpBloom(renderer, scene, camera) {
  const screenBloomFragShader = await getShader("/shaders/bloom/bloom.frag");
  const screenBloomVertShader = await getShader("/shaders/bloom/bloom.vert");

  myScene = scene;
  renderScene = new RenderPass(scene, camera);

  ({ bloomComposer, mixPass } = await setUpAudioBloom(
    renderer,
    scene,
    camera,
    renderScene
  ));

  //   ({ bloomComposer: bloomComposerScreen, mixPass: mixPassScreen } =
  //     await setUpScreenBloom(renderer, scene, camera, renderScene));

  outputPass = new OutputPass();

  finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  //   finalComposer.addPass(mixPassScreen);
  finalComposer.addPass(mixPass);
  finalComposer.addPass(outputPass);

  gui = new GUI();

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

  //   bloomComposerScreen.render();
  bloomComposer.render();

  myScene.traverse(restoreMaterial);
  // render the entire scene, then render bloom scene on top
  finalComposer.render();
}

function darkenNonBloomed(obj) {
  darkenNonBloomedAudio(obj);
  //   darkenNonBloomedScreen(obj);
}

function restoreMaterial(obj) {
  restoreMaterialAudio(obj);
  //   restoreMaterialScreen(obj);
}
