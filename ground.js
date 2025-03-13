import * as THREE from "three";

export function createGround(loader, scene) {
    //ground implementation
    const groundGeometry = new THREE.PlaneGeometry(100, 100); // Adjust size as needed

    // Load the granite tile texture

    const graniteTexture = loader.load("textures/granite_tile.png"); // Make sure to use the correct path where the texture is stored
    graniteTexture.wrapS = graniteTexture.wrapT = THREE.RepeatWrapping;
    graniteTexture.repeat.set(10, 10); // Adjust based on the size of your geometry and the scale of the texture

    let groundMaterial = new THREE.MeshPhongMaterial({
    map: graniteTexture, // Use the loaded granite texture
    shininess: 60, // Adjust this value for the desired glossiness of the ceramic-like surface
    specular: new THREE.Color("grey"), // Specular highlights to add reflective properties typical of polished granite
    side: THREE.DoubleSide, // Render both sides of the plane
    });

    //groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
    ground.position.y = -1; // Adjust height to align with the camera's y
    scene.add(ground);
}
