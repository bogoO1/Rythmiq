export class Texture_Rotate {
  vertexShader() {
    return `
          precision mediump float;
          precision mediump int;
  
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
  
          attribute vec3 position;
          attribute vec2 uv;
  
          varying vec2 vUv;
  
          void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `;
  }

  fragmentShader() {
    return `
          precision mediump float;
          precision mediump int;
  
          uniform float animation_time;
          uniform float light_intensity;
          uniform sampler2D textureLayer01;
          uniform sampler2D textureLayer02;
  
          uniform vec2 flowDirection01;
          uniform vec2 flowDirection02;
          uniform float flowSpeed01;
          uniform float flowSpeed02;
          uniform vec2 repeat01;
          uniform vec2 repeat02;
  
          varying vec2 vUv;
  
          // Function to calculate texture UV offset based on time and direction
          vec2 offsetUV(vec2 uv, vec2 direction, float flowSpeed, vec2 repeat) {
              vec2 flowDir = normalize(direction);
              return vec2(
                  uv.x + flowDir.x * flowSpeed * animation_time * repeat.x,
                  uv.y + flowDir.y * flowSpeed * animation_time * repeat.y
              );
          }
  
          void main() {
              // Compute flowing texture coordinates
              vec2 flow01 = offsetUV(vUv, flowDirection01, flowSpeed01, repeat01);
              vec2 flow02 = offsetUV(vUv, flowDirection02, flowSpeed02, repeat02);
  
              // Sample textures at calculated coordinates
              vec4 layer01 = texture2D(textureLayer01, flow01);
              vec4 layer02 = texture2D(textureLayer02, flow02);
  
              // Blend the two textures dynamically
              vec4 finalColor = mix(layer01, layer02, 0.5);
  
              // Apply light absorption effect in response to other objects
              float absorb_factor = clamp(light_intensity, 0.0, 1.0);
              finalColor.rgb *= mix(vec3(0.2, 0.2, 0.2), vec3(1.0, 1.0, 1.0), absorb_factor);
  
              gl_FragColor = finalColor;
          }
      `;
  }
}
