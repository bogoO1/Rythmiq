import * as THREE from "three";
import { createWall } from "../wall-utils";
export function buildRoom(scene, startPoint, endPoint, thickness = 1) {
  // build a room that must be facing perfectly vertical
  // stat and end point are the inside bounds, the walls are assumed to be 1 unit thick.
  // TODO: update to support angled rooms
  const size = new THREE.Vector3().subVectors(startPoint, endPoint);
  const width = Math.abs(size.x);
  const height = Math.abs(size.y);
  const depth = Math.abs(size.z);

  const center = new THREE.Vector3()
    .addVectors(startPoint, endPoint)
    .divideScalar(2);

  console.log(center);

  const room = [
    [
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(-width / 2, -height / 2, -depth / 2)
      ),
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(
          width / 2 + thickness,
          height / 2,
          -depth / 2 - thickness
        )
      ),
    ],
    [
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(width / 2, -height / 2, -depth / 2)
      ),
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(
          width / 2 + thickness,
          height / 2,
          depth / 2 + thickness
        )
      ),
    ],
    [
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(-width / 2 - thickness, -height / 2, depth / 2)
      ),
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(width / 2, height / 2, depth / 2 + thickness)
      ),
    ],
    [
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(-width / 2, -height / 2, -depth / 2 - thickness)
      ),
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(-width / 2 - thickness, height / 2, depth / 2)
      ),
    ],
    // top
    [
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(
          width / 2 + thickness,
          +height / 2,
          depth / 2 + thickness
        )
      ),
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(
          -(width / 2 + thickness),
          +height / 2 + thickness,
          -(depth / 2 + thickness)
        )
      ),
    ],
    //bottom
    [
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(
          width / 2 + thickness,
          -height / 2,
          depth / 2 + thickness
        )
      ),
      new THREE.Vector3().addVectors(
        center,
        new THREE.Vector3(
          -(width / 2 + thickness),
          -(height / 2 + thickness),
          -(depth / 2 + thickness)
        )
      ),
    ],
  ];

  return buildRoomHelper(scene, room);
}

function buildRoomHelper(scene, room) {
  room.forEach((wall) => scene.add(createWall(wall[0], wall[1])));
}

// build a room facing any direction, implement if needed
export function buildSlantedRoom(center, size, up) {}
