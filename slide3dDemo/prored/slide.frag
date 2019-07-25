precision highp float;
#define GLSLIFY 1

uniform float timeShown;
uniform float timeInterval;
uniform float durationShown;
uniform float durationInterval;
uniform vec2 resolution;
uniform vec2 imageResolution;
uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec3 vPosition;
varying vec2 vUv;

float circularOut(float t) {
  return sqrt((2.0 - t) * t);
}

void main(void) {
  // for Shown preload.
  float stepShown = clamp(timeShown / durationShown, 0.0, 1.0);
  float stepShownEase = circularOut(stepShown);
  float stepInterval = clamp(timeInterval / durationInterval, 0.0, 1.0);
  float stepIntervalEase = circularOut(stepInterval);

  // for Interval Images
  vec2 ratio = vec2(
      min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
      min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
    );
  vec2 uv1 = vec2(
      (vUv.x - (((vUv.x * 2.0) - 1.0) * stepShown * 0.0333) - (((vUv.x * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.x + (1.0 - ratio.x) * 0.5,
      (vUv.y - (((vUv.y * 2.0) - 1.0) * stepShown * 0.0333) - (((vUv.y * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.y + (1.0 - ratio.y) * 0.5
    );
  vec2 uv2 = vec2(
      (vUv.x - (((vUv.x * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.x + (1.0 - ratio.x) * 0.5,
      (vUv.y - (((vUv.y * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.y + (1.0 - ratio.y) * 0.5
    );
  vec4 texColor1 = texture2D(texture1, uv1);
  vec4 texColor2 = texture2D(texture2, uv2);

  // calcurate mask
  float maskBase =
    ((
      sin(vPosition.y / 616.3) * 2.0
      + cos(vPosition.x / 489.2 - 200.0) * 2.0
      + sin(vPosition.x / 128.3) * 0.5
      + cos(vPosition.y / 214.2) * 0.5
    ) / 5.0 + 1.0) / 2.0;
  float maskShown = clamp(maskBase + (stepShownEase * 2.0 - 1.0), 0.0, 1.0);
  maskShown = smoothstep(0.2, 0.8, maskShown);
  float maskInterval = clamp(maskBase + (stepIntervalEase * 2.0 - 1.0), 0.0, 1.0);
  float maskInterval1 = 1.0 - smoothstep(0.4, 1.0, maskInterval);
  float maskInterval2 = smoothstep(0.0, 0.6, maskInterval);

  // add color
  vec4 color = vec4(vec3(1.0), 1.0) * (1.0 - maskShown) + texColor1 * maskShown * maskInterval1 + texColor2 * maskInterval2;

  gl_FragColor = color;
}
