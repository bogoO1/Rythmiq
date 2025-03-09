import * as THREE from "three";

import { getShader } from "../shader_utils.js";
import { startMicAudio, getFrequencyData, FFT_SIZE } from "../audio.js";

export default class AudioSphere {
  constructor(camera, scene) {
    // Start audio processing
    const sphereMaterialProperties = {
      color: 0x0000ff,
      ambient: 0.5,
      diffusivity: 1.0,
      specularity: 1.0,
      shininess: 0.0,
      smoothness: 100,
    };

    const shape_color_rep = new THREE.Color(sphereMaterialProperties.color);

    let shape_color = new THREE.Vector4(
      shape_color_rep.r,
      shape_color_rep.g,
      shape_color_rep.b,
      1.0
    );

    document.addEventListener(
      "click",
      async () => {
        await startMicAudio();
      },
      { once: true }
    );

    this.uniforms = {
      audio: { value: new Uint8Array(FFT_SIZE) },
      shape_color: { value: shape_color },
      ambient: { value: 0.5 },
      iResolution: { value: { x: 1, y: 1 } },
      iTime: { value: 0 },
      iTimeDelta: { value: 0 },
      iFrameRate: { value: 0 },
      iFrame: { value: 0 },
      iChannelTime: { value: 0 },
      iChannelResolution: { value: 0 },
      iMouse: { value: 0 },
      iChannel0: { value: 0 },
      iDate: { value: 0 },
    };

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

  async setMaterial() {
    this.vertexShader = await getShader("/shaders/audio_sphere.vert");
    this.fragmentShader = await getShader("/shaders/audio_sphere.frag");

    console.log(this.fragmentShader);

    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
    });

    this.sphere.material = this.material;
  }

  updateAudioSphere(time) {
    // Get frequency data
    const frequencyData = getFrequencyData();
    this.uniforms.audio.value = frequencyData;

    // Visualization code
    const canvas = document.getElementById("audioVisualizer");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / frequencyData.length;
      const barHeightMultiplier = canvas.height / 255; // since frequency data is 0-255

      ctx.fillStyle = "#00ff00"; // Green bars
      frequencyData.forEach((value, index) => {
        const barHeight = value * barHeightMultiplier;
        ctx.fillRect(
          index * barWidth,
          canvas.height - barHeight,
          barWidth - 1,
          barHeight
        );
      });
    }
  }
}
