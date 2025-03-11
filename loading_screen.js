import * as THREE from "three";

export class WelcomeScreen {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.userMoved = false; // Track if user has moved
    this.createWelcomeScreen();
    this.setupMovementListener();
  }

  createWelcomeScreen() {
    // Create a plane geometry for the screen
    const geometry = new THREE.PlaneGeometry(5, 3);

    // Create a canvas texture for the welcome text
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 512;

    // Background gradient
    const gradient = context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "grey");
    gradient.addColorStop(1, "grey");
    context.fillStyle = gradient;
    context.fillRect(0.5, 0.5, canvas.width, canvas.height);

    // Add text
    context.fillStyle = "white";
    context.font = "70px Arial";
    context.textAlign = "center";
    context.fillText("Welcome to Mystery Museum", canvas.width / 2, 200);
    context.font = "60px Arial";
    context.fillText("Go to a room to be amazed", canvas.width / 2, 300);

    // Apply texture
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    // Create mesh
    this.welcomePlane = new THREE.Mesh(geometry, material);
    this.welcomePlane.position.set(0, 2, -5); // Position it in front of the camera

    this.scene.add(this.welcomePlane);

    // Automatically remove after 15 seconds (if the user hasn't moved)
    setTimeout(() => {
      if (!this.userMoved) {
        this.removeWelcomeScreen();
      }
    }, 15000);
  }

  setupMovementListener() {
    const removeScreenOnMove = () => {
      if (!this.userMoved) {
        this.userMoved = true;
        this.removeWelcomeScreen();
        window.removeEventListener("keydown", removeScreenOnMove);
      }
    };

    window.addEventListener("keydown", removeScreenOnMove);
  }

  removeWelcomeScreen() {
    if (this.welcomePlane) {
      this.scene.remove(this.welcomePlane);
      this.welcomePlane = null;
    }
  }
}
