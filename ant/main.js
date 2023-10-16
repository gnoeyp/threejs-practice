import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

const canvas = document.querySelector("#canvas");

const camera = new THREE.OrthographicCamera(
  10 / -2,
  10 / 2,
  10 / 2,
  10 / -2,
  1,
  1000,
);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.PlaneGeometry(5, 5);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

camera.position.z = 2;

window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false,
);

let direction = new THREE.Vector3(1, 0, 0);
const wanderStrength = 0.1;

const move = (mesh) => {
  const angle = Math.random() * Math.PI * 2;
  direction = direction
    .add(
      new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(
        wanderStrength,
      ),
    )
    .normalize();
  mesh.position.x += direction.x * 0.001;
  mesh.position.y += direction.y * 0.001;
};

const tick = function () {
  requestAnimationFrame(tick);
  move(cube);

  renderer.render(scene, camera);
};

tick();
