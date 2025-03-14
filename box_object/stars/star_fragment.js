export const StarFragmentShader = `

  uniform float animation_time;
  varying vec2 vUv;

  void main() {

    float pulse = sin(animation_time * 3.0) * 0.5 + 0.5; // Pulsing effect

    vec4 tex_color = vec4(1.0, 0.84, 0.0, 1.0) * pulse;

    gl_FragColor = tex_color;
    
  }
`;
