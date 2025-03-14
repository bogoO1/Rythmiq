import * as THREE from "three";
import { StarFragmentShader } from "./star_fragment.js"; // Import the shader

export class Star {
  constructor(scene, position) {
    this.scene = scene;
    this.position = position;
    this.outerRadius = 2;
    this.innerRadius = 1;
    this.spikes = 5; // Number of star points
    this.init();
  }

  init() {
    this.uniforms = {
      animation_time: { value: 0.0 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: StarFragmentShader,
    });

    this.geometry = this.createStarGeometry(
      this.outerRadius,
      this.innerRadius,
      this.spikes
    );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(...this.position);
    this.mesh.rotation.z = Math.PI / 2; // Rotate to face the camera
    this.scene.add(this.mesh);
  }

  createStarGeometry(outerRadius, innerRadius, spikes) {
    const shape = new THREE.Shape();

    for (let i = 0; i < 2 * spikes; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  }

  update(deltaTime) {
    this.uniforms.animation_time.value += deltaTime;

    let scaleFactor =
      Math.sin(this.uniforms.animation_time.value * 3) * 0.2 + 1.0;
    this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  rotate(axis, speed) {
    this.mesh.rotation[axis] += THREE.MathUtils.degToRad(speed);
  }
}
