import * as THREE from "three";

// Function to create a wall with support for Y-axis rotation, reference plane, and wall thickness
export function createWall(
  lowerCorner,
  upperCorner,
  wallThickness,
  materialParams = {},
  geometryType = "BoxGeometry"
) {
  // Calculate the center position
  const pos = new THREE.Vector3()
    .addVectors(lowerCorner, upperCorner)
    .multiplyScalar(0.5);

  // Compute size vector
  const size = new THREE.Vector3().subVectors(upperCorner, lowerCorner);

  // Compute the direction vector of the wall along the Y-Z plane
  const direction = new THREE.Vector3(size.x, 0, size.z).normalize();

  // Compute the wall length along the X-axis
  const wallLength = Math.sqrt(size.x ** 2 + size.z ** 2);

  // Determine the rotation angle around the Y-axis
  const rotationY = Math.atan2(size.z, size.x); // Ensures X is always the longest axis

  // Create the wall geometry
  let wallGeometry;
  if (geometryType === "BoxGeometry") {
    wallGeometry = new THREE.BoxGeometry(
      wallLength,
      Math.abs(size.y),
      wallThickness
    );
  } else {
    console.warn("Unsupported geometry type. Defaulting to BoxGeometry.");
    wallGeometry = new THREE.BoxGeometry(
      wallLength,
      Math.abs(size.y),
      wallThickness
    );
  }

  // Create the material
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0xffaaaa,
    ...materialParams,
  });

  // Create the wall mesh
  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

  // Position and rotate the wall
  wallMesh.position.copy(pos);
  wallMesh.rotation.y = rotationY; // Apply rotation so X aligns with the longest part

  return wallMesh;
}

// Function should also accept shader, material parameters, and geometry types
export function createCeiling(lowerCorner, upperCorner) {
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
