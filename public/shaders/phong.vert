precision mediump float;
// const int N_LIGHTS = numLights;
uniform float ambient, diffusivity, specularity, smoothness;
uniform vec4 light_positions_or_vectors[N_LIGHTS];
uniform vec4 light_colors[N_LIGHTS];
uniform float light_attenuation_factors[N_LIGHTS];
uniform vec4 shape_color;
uniform vec3 squared_scale;
uniform vec3 camera_center;
varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
        vec3 E = normalize(camera_center-vertex_worldspace); // View direction
        vec3 result = vec3(0.0); // Initialize the output color
        for (int i = 0; i<N_LIGHTS; i++) {
                // Calculate the vector from the surface to the light source
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz-light_positions_or_vectors[i].w*vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector); // Light distance
                vec3 L = normalize(surface_to_light_vector); // Light direction

                // Phong uses the reflection vector R
                vec3 R = reflect(-L, N); // Reflect L around the normal N

                float diffuse = max(dot(N, L), 0.0); // Diffuse term
                float specular = pow(max(dot(R, E), 0.0), smoothness); // Specular term

                // Light attenuation
                float attenuation = 1.0/(1.0+light_attenuation_factors[i]*distance_to_light*distance_to_light);

                // Calculate the contribution of this light source
                vec3 light_contribution = shape_color.xyz*light_colors[i].xyz*diffusivity*diffuse+light_colors[i].xyz*specularity*specular;
                result += attenuation*light_contribution;
        }
        return result;
}

uniform mat4 model_transform;
uniform mat4 projection_camera_model_transform;

void main() {
        gl_Position = projection_camera_model_transform*vec4(position, 1.0);
        N = normalize(mat3(model_transform)*normal/squared_scale);
        vertex_worldspace = (model_transform*vec4(position, 1.0)).xyz;
}