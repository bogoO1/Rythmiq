import * as THREE from "three";

export class CameraCollision {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.boundingBox = new THREE.Box3(); // 1x1x1 bounding box
  }

  update() {
    // Set camera bounding box around its position
    this.boundingBox.setFromCenterAndSize(
      this.camera.position,
      new THREE.Vector3(1, 1, 1)
    );

    // Check for collisions with meshes in the scene
    for (let object of this.scene.children) {
      if (object.isMesh) {
        // Ignore non-mesh objects
        let objectBox = new THREE.Box3().setFromObject(object);
        if (this.boundingBox.intersectsBox(objectBox)) {
          console.log("Camera collision detected!");
          this.resolveCollision(objectBox);
        }
      }
    }
  }

  resolveCollision(objectBox) {
    // Simple collision resolution: move camera back in the opposite direction
    const cameraPosition = this.camera.position;

    if (this.boundingBox.intersectsBox(objectBox)) {
      const overlap = new THREE.Vector3();

      // Compute overlap distance
      if (
        cameraPosition.x > objectBox.min.x &&
        cameraPosition.x < objectBox.max.x
      ) {
        overlap.x =
          this.boundingBox.max.x - objectBox.min.x >
          objectBox.max.x - this.boundingBox.min.x
            ? this.boundingBox.max.x - objectBox.min.x
            : objectBox.max.x - this.boundingBox.min.x;
      }

      if (
        cameraPosition.y > objectBox.min.y &&
        cameraPosition.y < objectBox.max.y
      ) {
        overlap.y =
          this.boundingBox.max.y - objectBox.min.y >
          objectBox.max.y - this.boundingBox.min.y
            ? this.boundingBox.max.y - objectBox.min.y
            : objectBox.max.y - this.boundingBox.min.y;
      }

      if (
        cameraPosition.z > objectBox.min.z &&
        cameraPosition.z < objectBox.max.z
      ) {
        overlap.z =
          this.boundingBox.max.z - objectBox.min.z >
          objectBox.max.z - this.boundingBox.min.z
            ? this.boundingBox.max.z - objectBox.min.z
            : objectBox.max.z - this.boundingBox.min.z;
      }

      // Push the camera back by the smallest overlap amount
      if (
        Math.abs(overlap.x) <= Math.abs(overlap.y) &&
        Math.abs(overlap.x) <= Math.abs(overlap.z)
      ) {
        cameraPosition.x += overlap.x > 0 ? -0.1 : 0.1;
      } else if (
        Math.abs(overlap.y) <= Math.abs(overlap.x) &&
        Math.abs(overlap.y) <= Math.abs(overlap.z)
      ) {
        cameraPosition.y += overlap.y > 0 ? -0.1 : 0.1;
      } else {
        cameraPosition.z += overlap.z > 0 ? -0.1 : 0.1;
      }
    }
  }
}
