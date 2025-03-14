import * as THREE from "three";

export function createWalls(loader, scene, isCrossSection = false) {
  const wallTexture = loader.load("textures/seaworn_sandstone_brick.png");
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(100, 10);
  
  const bumpTexture = loader.load('textures/seaworn_sandstone_brick.png');
  bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(100, 10);

  const wallMaterial = new THREE.MeshPhongMaterial({
    map: wallTexture,
    bumpMap: bumpTexture, 
    bumpScale: 2,
    shininess: 10,
    specular: new THREE.Color(0x222222),
  });

  if (!isCrossSection) {
    // Create outer walls
    const wallGeometry = new THREE.BoxGeometry(100, 10, 0.5);

    const walls = {
      front: new THREE.Mesh(wallGeometry, wallMaterial),
      back: new THREE.Mesh(wallGeometry, wallMaterial),
      left: new THREE.Mesh(wallGeometry, wallMaterial),
      right: new THREE.Mesh(wallGeometry, wallMaterial),
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
  } else {
    // Create walls with doorways
    // parallel walls along X-axis (split for doorway)
    const xWallGeometry = new THREE.BoxGeometry(0.5, 10, 45); // Half the length of original wall
    const xWalls = {
      leftX1: new THREE.Mesh(xWallGeometry, wallMaterial),
      leftX2: new THREE.Mesh(xWallGeometry, wallMaterial),
      rightX1: new THREE.Mesh(xWallGeometry, wallMaterial),
      rightX2: new THREE.Mesh(xWallGeometry, wallMaterial),
    };

    xWalls.leftX1.position.set(-25, 4, -25); // Left-side wall (part 1)
    xWalls.leftX2.position.set(-25, 4, 25); // Left-side wall (part 2)
    xWalls.rightX1.position.set(25, 4, -25); // Right-side wall (part 1)
    xWalls.rightX2.position.set(25, 4, 25); // Right-side wall (part 2)

    // parallel walls along Z-axis (split for doorway)
    const zWallGeometry = new THREE.BoxGeometry(45, 10, 0.5); // Half the length of original wall
    const zWalls = {
      frontZ1: new THREE.Mesh(zWallGeometry, wallMaterial),
      frontZ2: new THREE.Mesh(zWallGeometry, wallMaterial),
      backZ1: new THREE.Mesh(zWallGeometry, wallMaterial),
      backZ2: new THREE.Mesh(zWallGeometry, wallMaterial),
    };

    //corner walls
    zWalls.frontZ1.position.set(-25, 4, -25); // Front wall (part 1)
    zWalls.frontZ2.position.set(25, 4, -25); // Front wall (part 2)
    zWalls.backZ1.position.set(-25, 4, 25); // Back wall (part 1)
    zWalls.backZ2.position.set(25, 4, 25); // Back wall (part 2)

    scene.add(xWalls.leftX1);
    scene.add(xWalls.leftX2);
    scene.add(xWalls.rightX1);
    scene.add(xWalls.rightX2);
    scene.add(zWalls.frontZ1);
    scene.add(zWalls.frontZ2);
    scene.add(zWalls.backZ1);
    scene.add(zWalls.backZ2);
  }
}
