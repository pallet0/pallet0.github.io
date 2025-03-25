#version 300 es
layout(location = 0) in vec4 aPos;
uniform vec2 uTranslation;

void main() {
    gl_Position = vec4(aPos.xy+uTranslation, aPos.z ,1.0);
}