import * as THREE from "three";

export class Box {
  constructor(scene, texturePath, shaderClass, position) {
    this.scene = scene;
    this.texturePath = texturePath;
    this.shaderClass = shaderClass;
    this.position = position;
    this.animation_time = 0.0;
    this.rotation = 0;

    this.init();
  }

  init() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.texturePath);

    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    this.uniforms = {
      uTexture: { value: texture },
      animation_time: { value: this.animation_time },
    };

    const shader = new this.shaderClass();
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
