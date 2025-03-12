import * as THREE from "three";
import { Texture_Rotate, Texture_Scroll_X } from "./box_fragment.js";
import { Box } from "./box_object.js";

export function createBoxes(scene) {
  const cube1 = new Box(scene, "", Texture_Rotate, [2, 0, 0]);
  const cube2 = new Box(scene, "", Texture_Scroll_X, [-2, 0, 0]);

  return { cube1, cube2 };
}

export function updateBoxes(cube1, cube2, deltaTime, isRotating) {
  cube1.update(deltaTime);
  cube2.update(deltaTime);

  if (isRotating) {
    cube1.rotate("x", 15);
    cube2.rotate("y", 40);
  }
}
