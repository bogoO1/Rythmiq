import * as THREE from "three";

export class CameraCollision {
  constructor(scene) {
    this.scene = scene;
  }

  willCollide(nextPosition, camera) {
    const boundingBox = new THREE.Box3().setFromCenterAndSize(
      nextPosition,
      new THREE.Vector3(1, 1, 1)
    );

    for (let object of this.scene.children) {
      if (object.isMesh) {
        let objectBox = new THREE.Box3().setFromObject(object);
        if (boundingBox.intersectsBox(objectBox)) {
          // Find collision normal and allow sliding
          const normal = this.getCollisionNormal(objectBox, camera);
          return { colliding: true, normal: normal };
        }
      }
    }
    return { colliding: false, normal: null };
  }

  getCollisionNormal(objectBox, camera) {
    const cameraPosition = camera.position.clone();

    // Find the closest point on the object's bounding box to the camera
    const closestPoint = new THREE.Vector3(
      THREE.MathUtils.clamp(cameraPosition.x, objectBox.min.x, objectBox.max.x),
      THREE.MathUtils.clamp(cameraPosition.y, objectBox.min.y, objectBox.max.y),
      THREE.MathUtils.clamp(cameraPosition.z, objectBox.min.z, objectBox.max.z)
    );

    // Compute the surface normal based on where the camera is colliding
    const normal = new THREE.Vector3(0, 0, 0);

    // Determine the axis of collision
    const dx = cameraPosition.x - closestPoint.x;
    const dz = cameraPosition.z - closestPoint.z;

    if (Math.abs(dx) > Math.abs(dz)) {
      normal.set(Math.sign(dx), 0, 0); // Collision on X-axis
    } else {
      normal.set(0, 0, Math.sign(dz)); // Collision on Z-axis
    }

    return normal;
  }
}
