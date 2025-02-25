import * as THREE from "three";

export class WalkingSound {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    this.walkingSound = new THREE.Audio(this.listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("./sounds/walking-sound-effect.mp3", (buffer) => {
      this.walkingSound.setBuffer(buffer);
      this.walkingSound.setLoop(true);
      this.walkingSound.setVolume(0.5); // Adjust volume
    });
  }
  //playing the walking sound when the user moves
  play() {
    if (!this.walkingSound.isPlaying) {
      this.walkingSound.play();
    }
  }

  stop() {
    if (this.walkingSound.isPlaying) {
      this.walkingSound.stop();
    }
  }
}
