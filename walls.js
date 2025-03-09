// walls.js
import * as THREE from "three";

export function createWalls(loader, scene) {
    const wallTexture = loader.load("textures/seaworn_sandstone_brick.png");
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(100, 10);

    const wallMaterial = new THREE.MeshPhongMaterial({
      map: wallTexture,
      shininess: 10, // Reduced shininess for a matte look
      specular: new THREE.Color(0x222222)
    });

    const wallGeometry = new THREE.BoxGeometry(100, 10, 0.5);

    const walls = {
        front: new THREE.Mesh(wallGeometry, wallMaterial),
        back: new THREE.Mesh(wallGeometry, wallMaterial),
        left: new THREE.Mesh(wallGeometry, wallMaterial),
        right: new THREE.Mesh(wallGeometry, wallMaterial)
    };

    walls.front.position.set(0, 4, -50);
    walls.back.position.set(0, 4, 50);
    walls.left.rotation.y = Math.PI / 2;
    walls.left.position.set(-50, 4, 0);
    walls.right.rotation.y = Math.PI / 2;
    walls.right.position.set(50, 4, 0);

    scene.add(walls.front);
    scene.add(walls.back);
    scene.add(walls.left);
    scene.add(walls.right);
}

