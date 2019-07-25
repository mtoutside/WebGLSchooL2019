#define GLSLIFY 1
attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 resolution;

varying vec3 vPosition;
varying vec2 vUv;

void main(void) {
  vec3 updatePosition = position * vec3(resolution / 2.0, 1.0);

  vPosition = updatePosition;
  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(updatePosition, 1.0);
}
