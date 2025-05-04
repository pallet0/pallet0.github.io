#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec4 aColor;

uniform mat4 u_model, u_view, u_projection;
uniform vec3 u_viewPos;
struct Material { vec3 diffuse; vec3 specular; float shininess; };
uniform Material material;
struct Light { vec3 position, ambient, diffuse, specular; };
uniform Light light;

out vec4 vColor;          // 최종 조명색 전달

void main(){
    vec3 fragPos = vec3(u_model * vec4(aPos,1.0));
    vec3 norm    = normalize(mat3(u_model)*aNormal);

    vec3 ambient  = light.ambient * material.diffuse;

    vec3 lightDir = normalize(light.position - fragPos);
    float diff    = max(dot(norm, lightDir), 0.0);
    vec3 diffuse  = light.diffuse * diff * material.diffuse;

    vec3 viewDir  = normalize(u_viewPos - fragPos);
    vec3 halfway  = normalize(lightDir + viewDir);
    float spec    = pow(max(dot(norm, halfway), 0.0), material.shininess);
    vec3 specular = light.specular * spec * material.specular;

    vColor = vec4(ambient + diffuse + specular, 1.0);
    gl_Position = u_projection * u_view * vec4(fragPos,1.0);
}