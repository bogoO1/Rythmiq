import * as THREE from "three";

import AudioWall from "../audio_effects/audio_wall.js";
// import { setUpAudioBloom } from "../post_processing/bloom_effect/bloom_audio.js";
let audioWalls = [];

export function createAudioWalls(renderer, scene, camera) {
  audioWalls.push(
    new AudioWall(
      scene,
      new THREE.Vector3(-16, 5, -16),
      new THREE.Vector3(0, 5, 0),
      10
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(16, 5, -16),
      new THREE.Vector3(0, 5, 0),
      10
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(-16, 5, 16),
      new THREE.Vector3(0, 5, 0),
      10
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(16, 5, 16),
      new THREE.Vector3(0, 5, 0),
      10
    )
  );

  (async () =>
    await Promise.all(
      audioWalls.map((audioWall) => audioWall.setMaterial())
    ))();
  // (async () => await audioWall2.setMaterial())();
  //   (async () => await setUpAudioBloom(renderer, scene, camera))(); // must be called after audio wall is declared!!
}

export function renderAudioWalls(time) {
  audioWalls.forEach((audioWall) => audioWall.updateAudioWall(time));
}
