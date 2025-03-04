import * as THREE from "three";

/*
 * create a character to be able to test and have him move
 * will be implemented later based on our setup style
 * as of now we should most likely create the controls
 * and make the layout of our board
 * then implement the player
 */

/*
 * getting the camera and scene from main.js
 * set a basic run time for the player to move
 * storing the movement direction and keys
 */
export class PlayerController {
  //initialzing a class with a camera and a scene
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    //movement controls
    this.moveSpeed = 0.1;
    this.mouseSensitivity = 0.002;

    // W, A, S, D keys and are switched to true when they are pressed
    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    //rotation of an object in 3D space using three angles
    this.euler = new THREE.Euler(0, 0, 0, "YXZ");

    // possible collision detection in a 3D field
    this.boundingBox = new THREE.Box3();

    // vector that defines the size of the players collision box
    // width of 1, height of 2, depth of 1
    this.playerDimensions = new THREE.Vector3(1, 2, 1);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    //this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);

    this.initializeControls();
  }

  // handles keyboard and mouse input
  initializeControls() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("mousemove", this.handleMouseMove);
    //document.addEventListener("mousedown", this.onDocumentMouseDown);

    // pointer lock on click, test for necessity
    document.addEventListener("click", function () {
      document.body.requestPointerLock();
    });
  }

  // handler designed to respond to keyboard
  // event parameter explains the object with what key was pressed
  handleKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        this.movement.forward = true;
        break;
      case "KeyS":
        this.movement.backward = true;
        break;
      case "KeyA":
        this.movement.left = true;
        break;
      case "KeyD":
        this.movement.right = true;
        break;
    }
  }

  // handles when the keys are not pressed
  handleKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.movement.forward = false;
        break;
      case "KeyS":
        this.movement.backward = false;
        break;
      case "KeyA":
        this.movement.left = false;
        break;
      case "KeyD":
        this.movement.right = false;
        break;
    }
  }

  // handles mouse movement for camera control
  handleMouseMove(event) {
    // Only handle mouse movement when pointer is locked
    if (document.pointerLockElement === document.body) {
      // Get current rotation
      this.euler.setFromQuaternion(this.camera.quaternion);

      // Update rotation based on mouse movement
      this.euler.y -= event.movementX * this.mouseSensitivity;
      this.euler.x -= event.movementY * this.mouseSensitivity;

      // Limit vertical rotation (prevent over-rotation)
      this.euler.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, this.euler.x)
      );

      // Apply rotation to camera
      this.camera.quaternion.setFromEuler(this.euler);
    }
  }

  // Update method to handle player movement
  update() {
    // Only update movement when pointer is locked
    if (document.pointerLockElement === document.body) {
      // Calculate movement direction
      const moveDirection = new THREE.Vector3();

      // Add movement based on key states
      if (this.movement.forward) moveDirection.z -= 1;
      if (this.movement.backward) moveDirection.z += 1;
      if (this.movement.left) moveDirection.x -= 1;
      if (this.movement.right) moveDirection.x += 1;

      // Normalize movement vector and apply speed
      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        moveDirection.multiplyScalar(this.moveSpeed);
      }

      // Apply camera rotation to movement
      moveDirection.applyQuaternion(this.camera.quaternion);

      // Calculate new position
      const nextPosition = this.camera.position.clone().add(moveDirection);

      // Move only if no collision
      if (!this.checkCollisions(nextPosition)) {
        this.camera.position.copy(nextPosition);
      }
    }
  }

  // Check for collisions
  checkCollisions(nextPosition) {
    // Update bounding box at the next position
    this.boundingBox.setFromCenterAndSize(nextPosition, this.playerDimensions);

    // Check collisions with walls
    const walls = this.scene.children.filter((child) => child.userData.isWall);

    for (const wall of walls) {
      const wallBox = new THREE.Box3().setFromObject(wall);
      if (this.boundingBox.intersectsBox(wallBox)) {
        return true; // Collision detected
      }
    }

    return false; // No collision
  }

  dispose() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    document.removeEventListener("mousemove", this.handleMouseMove);
  }
}
