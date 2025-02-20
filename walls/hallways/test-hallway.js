import * as THREE from "three";
import { buildHallway } from "./hallway-utils"; // declare walls as pairs of 2 numbers, the first being one corner, and the other being the opposite corner.
// import { addLights } from "../lights-utils";

// add lights to rooms

const TEST_HALLWAY = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)];

const lights = [
  { light: { color: 0xffffff, intensity: 250 }, position: [10, 25, 10] },
  { light: { color: 0xffffff, intensity: 250 }, position: [-10, 25, -10] },
];

export default function testHallway(scene) {
  // addLights(scene, lights);
  return buildHallway(scene, TEST_HALLWAY[0], TEST_HALLWAY[1], 5, 10, 1);
}
