import * as THREE from "three";

export function addLight(scene) {
    // Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);
}
