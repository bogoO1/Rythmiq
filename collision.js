// collision.js
import * as THREE from "three";

export class CameraCollision {
  constructor(scene) {
    this.scene = scene;
  }

  willCollide(nextPosition) {
    const boundingBox = new THREE.Box3().setFromCenterAndSize(
      nextPosition,
      new THREE.Vector3(1, 1, 1)
    );

    for (let object of this.scene.children) {
      if (object.isMesh) {
        let objectBox = new THREE.Box3().setFromObject(object);
        if (boundingBox.intersectsBox(objectBox)) {
          console.log("Collision detected! Movement prevented.");
          return true; // Collision detected
        }
      }
    }
    return false; // No collision
  }
}
