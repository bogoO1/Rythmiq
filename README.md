# Mystery Maze

Team

bogoO1
tomashmoshi
adel-taz

Idea

Players will load into a first person perspective in a maze which they will attempt to solve. On their journey they will run into many strange and mysterious phenomena that cause them to question how what they’re seeing could possibly exist, even in a computer.

Non-inclusive list of ideas for the phenomena:

A glass box that when viewed from different slides, a different item is in the box.
A hallway that appears to spiral into infinity.
A room in an earthquake where the camera moves all around, and the FOV is changing constantly.

Here are some sketches of other ideas:

Implementation

We will use shaders to create these effects. Since we don’t know how difficult these effects will be to create, we cannot guarantee that any of them will make it to the final version.

Players will move with the WASD keys, to detect collisions we will use bounding boxes on all walls and the camera. Before we let a player move to their next position, we will check if their next position will collide with a wall, if it does, then we don’t let them move in that direction.

Players will also be able to move their mouse to view the maze at different angles from a first person perspective.

There are 2 main challenges for this project. The first is getting the interaction working (first person perspective player moving through a maze without going through walls). The second is getting the mysterious and cool effects via shaders.

Story

This project is meant to be a demonstration of what otherworldly effects can be created with basic features of computer graphics, with the goal of getting the player thinking about what could be done in our universe and maybe even thinking about all the special things about our world.

Knowledge From Class

The entire pipeline of 3D graphics transformation matrices - we plan to create effects throughout the entire pipeline.
Shaders
