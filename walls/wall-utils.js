import * as THREE from "three";

export function createWall(lowerCorner, upperCorner) {
  // TODO: add support for angled walls in func.
  const pos = new THREE.Vector3()
    .addVectors(lowerCorner, upperCorner)
    .divideScalar(2);

  const size = upperCorner.sub(lowerCorner);

  const wallGeometry = new THREE.BoxGeometry(
    Math.abs(size.x),
    Math.abs(size.y),
    Math.abs(size.z)
  );
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffaaaa });

  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

  wallMesh.position.copy(pos);

  return wallMesh;
}
