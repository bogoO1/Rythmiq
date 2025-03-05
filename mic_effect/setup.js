import * as THREE from "three";

import { getShader } from "../shader_utils";

export default class AudioSphere {
  constructor(camera, scene) {
    this.uniforms = { name: { value: 1 } };

    this.vertexShader = "";
    this.fragmentShader = "";

    console.log(this.vertexShader);

    this.material = new THREE.ShaderMaterial({
      // vertexShader: this.vertexShader,
      // fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
    });
    this.geometry = new THREE.SphereGeometry(5, 100, 100);
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    this.sphere.position.set(0, 5, -10);
    this.addAudioSphere(scene);
  }

  addAudioSphere(scene) {
    scene.add(this.sphere);
  }

  setMaterial() {
    this.vertexShader = getShader("/shaders/audio_sphere.vert");
    this.fragmentShader = getShader("/shaders/audio_sphere.frag");

    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      // fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
    });
  }

  updateAudioSphere(time) {}
}
