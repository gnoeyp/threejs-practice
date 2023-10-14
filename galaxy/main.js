import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gaussianRandom } from "./utils";
import "./style.css";

const gui = new GUI();

const controlObject = {
  count: 50000,
  branches: 5,
  spin: 0.5,
};

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/particles/4.png");

const canvas = document.querySelector("#canvas");

const scene = new THREE.Scene();

let particles = null;
let particlesGeometry = null;
let particlesMaterial = null;

const generateGalaxy = () => {
  if (particles) {
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    scene.remove(particles);
  }
  particlesGeometry = new THREE.BufferGeometry();

  const positions = new Float32Array(controlObject.count * 3);
  const colors = new Float32Array(controlObject.count * 3);
  const { branches, spin } = controlObject;

  for (let i = 0; i < controlObject.count * 3; i++) {
    const i3 = i * 3;
    const radius = Math.abs(gaussianRandom(0, 0.8)) * 10;
    const branchAngle = ((Math.PI * 2) / branches) * (i % branches);
    const spinAngle = radius * spin;

    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = Math.abs(gaussianRandom(0, 1));
    const randomX = Math.cos(randomAngle) * randomRadius;
    const randomZ = Math.sin(randomAngle) * randomRadius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = gaussianRandom(0, 1);
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    if (Math.random() > 0.2) {
      colors[i3] = 136 / 256;
      colors[i3 + 1] = 201 / 256;
      colors[i3 + 2] = 232 / 256;
    } else {
      colors[i3] = 187 / 256;
      colors[i3 + 1] = 133 / 256;
      colors[i3 + 2] = 105 / 256;
    }
  }

  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );

  particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    alphaMap: particleTexture,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

generateGalaxy();

gui.add(controlObject, "count").onFinishChange(generateGalaxy);
gui.add(controlObject, "branches").onFinishChange(generateGalaxy);
gui
  .add(controlObject, "spin")
  .min(0)
  .max(10)
  .step(0.1)
  .onFinishChange(generateGalaxy);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.y = 30;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  const cos = Math.cos(deltaTime * 0.02);
  const sin = Math.sin(deltaTime * 0.02);

  // Update particles
  for (let i = 0; i < controlObject.count; i++) {
    const i3 = i * 3;
    const x = particlesGeometry.attributes.position.array[i3];
    const z = particlesGeometry.attributes.position.array[i3 + 2];

    particlesGeometry.attributes.position.array[i3] = x * cos - z * sin;
    particlesGeometry.attributes.position.array[i3 + 2] = x * sin + z * cos;
  }

  particlesGeometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
