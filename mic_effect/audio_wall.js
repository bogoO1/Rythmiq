import * as THREE from "three";

import { getShader } from "../shader_utils.js";
import { startMicAudio, getFrequencyDataMic, FFT_SIZE } from "../audio.js";

import {
  BLOOM_SCENE,
  setUpBloomUniforms,
} from "../post_processing/setup_post.js";

const b = 5;

// add a specific bloom to the audio wall to only bloom the higher intensities.

function createPlane(position, look, width, height) {
  const planeGeometry = new THREE.PlaneGeometry(
    width,
    height,
    width * 100,
    height * 100
  );

  const planeMaterial = new THREE.ShaderMaterial({});

  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

  planeMesh.position.copy(position);
  planeMesh.lookAt(look);

  return planeMesh;
}

// user selects mic or .mp3 file.

export default class AudioWall {
  constructor(camera, scene, position, look, width, height, max_intensity = 2) {
    // Start audio processing
    this.audioAnalyser;
    setUpBloomUniforms(position, look, max_intensity);
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
        this.analyser = await startMicAudio();
      },
      { once: true }
    );

    // document.addEventListener(
    //   "click",
    //   async () => {
    //     setUpCustomAudio(this.onNewAudio);
    //   },
    //   { once: true }
    // );
    // this.analyser;
    // (async () => (this.analyser = setUpCustomAudio(this.onNewAudio)))();

    this.uniforms = {
      audio: { value: new Array(FFT_SIZE).fill(0) },
      shape_color: { value: shape_color },
      ambient: { value: 0.5 },
      planePos: { value: position },
      // normal: {
      //   value: new THREE.Vector3().subVectors(look, position).normalize(),
      // },
      maxDist: {
        value: Math.min(width, height) / 2, //Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)),
      },
      max_depth_intensity: { value: max_intensity },
    };

    this.vertexShader = "";
    this.fragmentShader = "";

    this.wall = createPlane(position, look, width, height);
    this.wall.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
    });
    this.wall.geometry.computeVertexNormals();

    this.wall.layers.enable(BLOOM_SCENE);

    this.addAudioWall(scene);
  }

  onNewAudio(stream, audioContext) {
    // console.log("aud2: ", audioContext);
    // this.audioAnalyser = startAudio(stream, audioContext);
  }

  addAudioWall(scene) {
    scene.add(this.wall);
  }

  async setMaterial() {
    this.vertexShader = await getShader("/shaders/audio_wall.vert", [
      {
        textToReplace: "FFT_SIZE_REPLACE_1",
        replaceValue: (FFT_SIZE - 1).toString(),
      },
      { textToReplace: "FFT_SIZE_REPLACE", replaceValue: FFT_SIZE.toString() },
    ]);
    this.fragmentShader = await getShader("/shaders/audio_wall.frag", [
      {
        textToReplace: "FFT_SIZE_REPLACE_1",
        replaceValue: (FFT_SIZE - 1).toString(),
      },
      { textToReplace: "FFT_SIZE_REPLACE", replaceValue: FFT_SIZE.toString() },
    ]);

    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
    });

    this.wall.material = this.material;
  }

  attenuationFunction(x) {
    return (Math.pow(b, x) - 1) / (b - 1);
  }

  updateAudioWall(time) {
    // Get frequency data
    const frequencyData = getFrequencyDataMic(this.analyser);
    // for (let i = 0; i < frequencyData.length; i++) {
    //   frequencyData[i] = i / 2;
    // }
    const previousAudioData = this.uniforms.audio.value;

    let newFrequencyData = [];

    for (let i = 0; i < frequencyData.length; i++) {
      // newFrequencyData[i] = this.attenuationFunction(
      //   Number(frequencyData[i]) / 255.0
      // );
      newFrequencyData[i] = frequencyData[i] / 255.0;
    }
    // console.log(newFrequencyData);
    for (let i = 0; i < newFrequencyData.length; i++) {
      this.uniforms.audio.value[i] =
        previousAudioData[i] +
        (newFrequencyData[i] - previousAudioData[i]) * 0.5; // Interpolating with a factor of 0.1
    }

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
