/* Final Project shader: open this file to show the real-time Vertex Shader. */
window.GARAGE_SHADERS = {
  // uTime advances every frame; uAmplitude comes from the wind slider.
  vertex: `
    uniform float uTime;
    uniform float uAmplitude;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 p = position;

      // Keep the mounted top edge still; move the free edge more.
      float anchor = pow(1.0 - uv.y, 1.5);
      float wave = sin(p.x * 7.0 - uTime * 2.2)
                 + 0.45 * sin(p.y * 10.0 + uTime * 1.7);
      p.z += wave * uAmplitude * anchor;
      p.x += sin(uTime * 1.3 + p.y * 5.0)
           * uAmplitude * 0.2 * anchor;

      vWave = wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragment: `
    varying vec2 vUv;
    varying float vWave;

    void main() {
      float edge = step(0.035, vUv.x) * step(vUv.x, 0.965)
                 * step(0.045, vUv.y) * step(vUv.y, 0.955);
      float stripe = step(0.12, mod(vUv.x * 7.0 + vUv.y * 3.0, 1.0));
      vec3 dark = vec3(0.06, 0.10, 0.15);
      vec3 cyan = vec3(0.27, 0.7, 0.78);
      vec3 color = mix(cyan, mix(dark, cyan * 0.8, stripe * 0.22), edge);
      color *= 0.88 + 0.12 * vWave;
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
