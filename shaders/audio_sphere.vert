precision mediump float;

void main() {
	gl_Position = projection_camera_model_transform*vec4(position, 1.0);
}
