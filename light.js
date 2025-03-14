import * as THREE from "three";

export function addLight(scene) {
    //Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Soft white light
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.7); // Soft white light
    light1.position.set(50, 50, 50); // Positioned diagonally above one corner of the room
    scene.add(light1);

    // Second directional light
    const light2 = new THREE.DirectionalLight(0xffffff, 0.7); // Similarly soft white light
    light2.position.set(-50, 50, -50); // Positioned diagonally above the opposite corner
    scene.add(light2);

}
