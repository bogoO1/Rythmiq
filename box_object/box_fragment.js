
export class Texture_Rotate {
  vertexShader() {
    return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
  }

  fragmentShader() {
    return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {    
            float angle = animation_time * (4.0 * 3.14159 / 15.0);

            vec2 center = vec2(0.5, 0.5);
            vec2 translatedUV = vUv - center;

            vec2 rotatedUV = vec2(cos(angle) * translatedUV.x - sin(angle) * translatedUV.y,
            sin(angle) * translatedUV.x + cos(angle) * translatedUV.y);

            rotatedUV += center;

            vec4 tex_color = texture2D(uTexture, rotatedUV);
            
            float square_size = 0.3;
            float outline_thickness = 0.07;
            float inner_size = square_size - outline_thickness;
            if (abs(rotatedUV.x - 0.5) < square_size && abs(rotatedUV.y - 0.5) < square_size) {
                if (abs(rotatedUV.x - 0.5) > inner_size || abs(rotatedUV.y - 0.5) > inner_size) {
                    tex_color = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            gl_FragColor = tex_color;
        }
        `;
  }
}

export class Texture_Scroll_X {
  vertexShader() {
    return `
          uniform sampler2D uTexture;
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
          `;
  }

  fragmentShader() {
    return `
          uniform sampler2D uTexture;
          uniform float animation_time;
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
              vec2 scaledUV = vUv * 2.0;
              float scroll_speed = 4.0;
              vec2 scroll_offset = vec2(scaledUV.x + scroll_speed * animation_time, scaledUV.y);
              vec4 tex_color = texture2D(uTexture, scroll_offset);
              float square_size = 0.3;
              float outline_thickness = 0.07;
              float inner_size = square_size - outline_thickness;
              vec2 repeatedUV = vec2(mod(scroll_offset.x, 1.0), mod(scroll_offset.y, 1.0));
              if (abs(repeatedUV.x - 0.5) < square_size && abs(repeatedUV.y - 0.5) < square_size) {
                  if (abs(repeatedUV.x - 0.5) > inner_size || abs(repeatedUV.y - 0.5) > inner_size) {
                      tex_color = vec4(0.0, 0.0, 0.0, 1.0);
                  }
              }
              gl_FragColor = tex_color;
          }
          `;
  }
}
