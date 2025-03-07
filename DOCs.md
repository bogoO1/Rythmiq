To be able to reliably connect the audio to the

Player movement and collision detection allows players to move in the xz-plane. If they hit a wall, then they will slide along the wall depending on the angle.

Quaternions were used for the orientation of the camera to prevent gimbal lock. Camera orientation is implemented in a first person perspective.

The bounding box is dynamic, so as you change directions, so does the bounding box.

If a player orients their camera in a way that their camera bounding box is in a mesh, when they move next, they will be pushed out while moving in their desired direction.

The wall looks really cool from the back.
