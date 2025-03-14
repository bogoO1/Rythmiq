// collision.js
import * as THREE from "three";

export class CameraCollision {
  constructor(scene) {
    this.scene = scene;
  }

  willCollide(nextPosition, camera) {
    const boundingBox = this.getDynamicBoundingBox(nextPosition, camera);
    let collisionDetected = false;
    let pushOutVector = new THREE.Vector3(0, 0, 0);
    let normal;

    for (let object of this.scene.children) {
      if (object.isMesh) {
        let objectBox = new THREE.Box3().setFromObject(object);
        if (boundingBox.intersectsBox(objectBox)) {
          collisionDetected = true;

          // Calculate push-out direction
          normal = this.getCollisionNormal(objectBox, camera);

          // Push the player slightly out
          pushOutVector.add(normal.multiplyScalar(0.1));
        }
      }
    }

    return {
      colliding: collisionDetected,
      normal: normal,
      pushOutVector: collisionDetected ? pushOutVector : null,
    };
  }
  getDynamicBoundingBox(position, camera) {
    let forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    // Ignore Y-axis movement to keep bounding box stable in XZ plane
    forward.y = 0;
    forward.normalize(); // Re-normalize after zeroing Y

    // Bounding box dimensions: wider in XZ plane, taller, and deeper in forward direction
    const boxSize = new THREE.Vector3(
      0.1, // Width (Left-Right)
      0.1, // Height (Up-Down)
      0.5 // Depth (Forward-Backward)
    );

    // Shift the bounding box slightly forward
    const centerOffset = forward.clone().multiplyScalar(0); // Moves box forward
    const boxCenter = position.clone().add(centerOffset);

    // Create the bounding box
    return new THREE.Box3().setFromCenterAndSize(boxCenter, boxSize);
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
