import * as THREE from "three";
import { buildRoom } from "./room-utils"; // declare walls as pairs of 2 numbers, the first being one corner, and the other being the opposite corner.
import { addLights } from "../lights-utils";

// add lights to rooms

const TEST_ROOM = [new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5)];

const lights = [
  { light: { color: 0xffffff, intensity: 250 }, position: [10, 25, 10] },
  { light: { color: 0xffffff, intensity: 250 }, position: [-10, 25, -10] },
];

export default function testRoom(scene) {
  addLights(scene, lights);
  return buildRoom(scene, TEST_ROOM[0], TEST_ROOM[1]);
}
