import * as THREE from "three";
import { buildRoom } from "../wall-utils";
// declare walls as pairs of 2 numbers, the first being one corner, and the other being the opposite corner.

const TEST_ROOM = [
  [new THREE.Vector3(-5, 0, -6), new THREE.Vector3(5, 10, -5)],
];

export default function testRoom(scene) {
  return buildRoom(scene, TEST_ROOM);
}
