import * as THREE             from 'three';
import { OrbitControls }       from 'three/addons/controls/OrbitControls.js';
import { GUI }                 from 'three/addons/libs/lil-gui.module.min.js';
import Stats                   from 'three/addons/libs/stats.module.js';

let scene, renderer;
let perspCam, orthoCam, activeCam, controls;
let stats;
const textureLoader = new THREE.TextureLoader();

const planets = [
    { name: 'Sun',     radius: 10,  dist: 0,  color: '#ffff00',
      rotationSpeed: 0.004, orbitSpeed: 0,    texture: 'Sun.jpg' },
    { name: 'Mercury', radius: 1.5, dist: 20, color: '#a6a6a6',
      rotationSpeed: 0.02, orbitSpeed: 0.02,  texture: 'Mercury.jpg' },
    { name: 'Venus',   radius: 3,   dist: 35, color: '#e39e1c',
      rotationSpeed: 0.015, orbitSpeed: 0.015, texture: 'Venus.jpg' },
    { name: 'Earth',   radius: 3.5, dist: 50, color: '#3498db',
      rotationSpeed: 0.01, orbitSpeed: 0.01,  texture: 'Earth.jpg' },
    { name: 'Mars',    radius: 2.5, dist: 65, color: '#c0392b',
      rotationSpeed: 0.008, orbitSpeed: 0.008, texture: 'Mars.jpg' },
];

const pivots = [];

scene    = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

perspCam = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000);
perspCam.position.set(100, 60, 120);

const orthoSize = window.innerHeight / 20;
orthoCam = new THREE.OrthographicCamera(
    window.innerWidth / -20, window.innerWidth / 20,
    orthoSize, -orthoSize, 0.1, 1000);
orthoCam.position.copy(perspCam.position);

activeCam = perspCam;

controls = new OrbitControls(activeCam, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const sunLight = new THREE.PointLight(0xffffff, 2);
scene.add(sunLight);

stats = new Stats();
document.body.appendChild(stats.dom);

planets.forEach((p) => {
    const mat = p.texture
        ? new THREE.MeshStandardMaterial({ map: textureLoader.load(p.texture) })
        : new THREE.MeshStandardMaterial({ color: p.color });

    if (p.name === 'Sun') {
        mat.emissive = new THREE.Color(0xffff00);
        mat.emissiveIntensity = 1.5;
    }

    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 32, 32), mat);

    const pivot = new THREE.Object3D();
    pivot.rotationSpeed = p.orbitSpeed;
    scene.add(pivot);

    mesh.position.x = p.dist;
    pivot.add(mesh);

    pivots.push({ pivot, mesh, data: p });
});

/*gui*/
const gui = new GUI();

const camFolder = gui.addFolder('Camera');
camFolder.add({ type: 'Perspective' }, 'type',
    ['Perspective', 'Orthographic']).name('mode').onChange((v) => {
    swapCamera(v === 'Perspective' ? perspCam : orthoCam);
});

planets.slice(1).forEach((p) => {          
    const folder = gui.addFolder(p.name);
    folder.add(p, 'rotationSpeed', 0, 0.05, 0.001);
    folder.add(p, 'orbitSpeed',    0, 0.05, 0.001);
});

render();
function render() {
    requestAnimationFrame(render);

    /*자전, 공전*/
    pivots.forEach(({ pivot, mesh, data }) => {
        mesh.rotation.y  += data.rotationSpeed;
        pivot.rotation.y += data.orbitSpeed;
    });

    controls.update();
    renderer.render(scene, activeCam);
    stats.update();
}


function swapCamera (cam) {
    const pos    = activeCam.position.clone();
    const target = controls.target.clone();

    activeCam = cam;
    activeCam.position.copy(pos);

    controls.object = activeCam;
    controls.target.copy(target);
    controls.update();
}

