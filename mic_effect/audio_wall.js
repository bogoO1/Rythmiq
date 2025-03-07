import * as THREE from "three";

import { getShader } from "../shader_utils.js";
import { startAudio, getFrequencyData } from "../audio.js";

import { BLOOM_SCENE } from "../main.js";

function createPlane(position, look, width, height) {
  const planeGeometry = new THREE.PlaneGeometry(
    width,
    height,
    width * 10,
    height * 10
  );

  const planeMaterial = new THREE.ShaderMaterial({});

  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

  planeMesh.position.copy(position);
  planeMesh.lookAt(look);

  return planeMesh;
}

export default class AudioWall {
  constructor(camera, scene, position, look, width, height) {
    // Start audio processing
    const wallMaterialProperties = {
      color: 0x0000ff,
      ambient: 0.5,
      diffusivity: 1.0,
      specularity: 1.0,
      shininess: 0.0,
      smoothness: 100,
    };

    const shape_color_rep = new THREE.Color(wallMaterialProperties.color);

    let shape_color = new THREE.Vector4(
      shape_color_rep.r,
      shape_color_rep.g,
      shape_color_rep.b,
      1.0
    );

    document.addEventListener(
      "click",
      async () => {
        await startAudio();
      },
      { once: true }
    );

    this.uniforms = {
      audio: { value: new Uint8Array(128) },
      shape_color: { value: shape_color },
      ambient: { value: 0.5 },
      planePos: { value: position },
      // normal: {
      //   value: new THREE.Vector3().subVectors(look, position).normalize(),
      // },
      maxDist: { value: (Math.max(width, height) / 2.0) * Math.sqrt(2) },
    };

    this.vertexShader = "";
    this.fragmentShader = "";

    console.log(this.vertexShader);

    this.geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    this.wall = createPlane(position, look, width, height);
    this.wall.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
    });
    this.wall.geometry.computeVertexNormals();

    this.wall.layers.enable(BLOOM_SCENE);

    this.addAudioWall(scene);
  }

  addAudioWall(scene) {
    scene.add(this.wall);
  }

  async setMaterial() {
    this.vertexShader = await getShader("/shaders/audio_wall.vert");
    this.fragmentShader = await getShader("/shaders/audio_wall.frag");

    console.log(this.fragmentShader);

    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
    });

    this.wall.material = this.material;
  }

  updateAudioWall(time) {
    // Get frequency data
    const frequencyData = getFrequencyData();
    this.uniforms.audio.value = frequencyData;

    // Visualization code
    const canvas = document.getElementById("audioVisualizer");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / frequencyData.length;
      const barHeightMultiplier = canvas.height / 256; // since frequency data is 0-255

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
