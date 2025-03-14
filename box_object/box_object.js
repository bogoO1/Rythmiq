import * as THREE from "three";

export class Box {
  constructor(scene, texturePath, shaderClass, position) {
    this.scene = scene;
    this.texturePath = texturePath;
    this.shaderClass = shaderClass;
    this.position = position;
    this.animation_time = 0.0;
    this.rotation = 0;
    this.uniforms = {};
    this.init();
  }

  init() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const textureLoader = new THREE.TextureLoader();

    // Load two textures to be used in the shader
    const texture1 = textureLoader.load("textures/earth.gif");
    const texture2 = textureLoader.load("textures/stars.png");

    this.uniforms = {
      textureLayer01: { value: texture1 },
      textureLayer02: { value: texture2 },
      animation_time: { value: this.animation_time },
      light_intensity: { value: 0.5 },
      flowDirection01: { value: new THREE.Vector2(1.0, 0.5) },
      flowDirection02: { value: new THREE.Vector2(-0.5, 1.0) },
      flowSpeed01: { value: 0.2 },
      flowSpeed02: { value: 0.3 },
      repeat01: { value: new THREE.Vector2(2.0, 2.0) },
      repeat02: { value: new THREE.Vector2(3.0, 3.0) },
    };

    let shader;
    if (typeof this.shaderClass === "function") {
      shader = new this.shaderClass();
    } else {
      console.error("Shader class is not a constructor:", this.shaderClass);
      return;
    }

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader(),
      fragmentShader: shader.fragmentShader(),
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(...this.position);
    this.scene.add(this.mesh);
  }

  update(deltaTime) {
    this.animation_time += deltaTime;
    this.uniforms.animation_time.value = this.animation_time;
  }

  rotate(axis, speed) {
    this.rotation += (speed * Math.PI) / 180 / 15;
    this.mesh.rotation[axis] = this.rotation;
  }
}
