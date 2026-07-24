import * as THREE from 'three';

const FUR_MAIN = 0xefdcb8;
const FUR_ACCENT = 0xc9a06b;
const FUR_WHITE = 0xfff8ec;
const DARK = 0x2a1f17;
const COLLAR = 0xd1495b;

/** Deterministic hash-based noise so the same seed always yields the same fluffy silhouette. */
function pseudoNoise(x, y, z) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

/** A sphere with per-vertex noise displacement along its normal, to fake a fluffy silhouette without textures. */
function fluffSphere(radius, widthSegments, heightSegments, bumpAmount, seed) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    normal.copy(vertex).normalize();
    const noise = pseudoNoise(normal.x * seed, normal.y * seed, normal.z * seed);
    vertex.addScaledVector(normal, noise * bumpAmount);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeMaterial(color, roughness = 0.92) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
}

export class Puppy3D {
  constructor(canvas, width, height) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    this.camera.position.set(0, 1.55, 4.6);
    this.camera.lookAt(0, 0.7, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);

    this.addLights();
    this.buildPuppy();
    this.addGroundShadow();
  }

  addLights() {
    const key = new THREE.DirectionalLight(0xfff2e0, 1.15);
    key.position.set(2.2, 4, 3);
    this.scene.add(key);

    const fill = new THREE.AmbientLight(0xfff0dd, 0.6);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xbcd4ff, 0.55);
    rim.position.set(-3, 2.2, -2.5);
    this.scene.add(rim);
  }

  buildPuppy() {
    const furMat = makeMaterial(FUR_MAIN);
    const accentMat = makeMaterial(FUR_ACCENT);
    const whiteMat = makeMaterial(FUR_WHITE, 0.85);
    const darkMat = new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.35 });
    const collarMat = new THREE.MeshStandardMaterial({ color: COLLAR, roughness: 0.5 });

    this.root = new THREE.Group();

    this.body = new THREE.Mesh(fluffSphere(0.5, 22, 16, 0.028, 11), furMat);
    this.body.scale.set(1.05, 0.82, 1.38);
    this.body.position.set(0, 0.72, -0.08);
    this.bodyBaseY = this.body.position.y;
    this.root.add(this.body);

    const belly = new THREE.Mesh(fluffSphere(0.4, 16, 12, 0.02, 5), whiteMat);
    belly.scale.set(0.78, 0.55, 0.85);
    belly.position.set(0, 0.5, 0.32);
    this.root.add(belly);

    this.head = new THREE.Group();
    this.head.position.set(0, 1.18, 0.58);
    this.headBaseY = this.head.position.y;
    this.root.add(this.head);

    const skull = new THREE.Mesh(fluffSphere(0.4, 20, 16, 0.032, 23), furMat);
    skull.scale.set(0.98, 0.94, 0.98);
    this.head.add(skull);

    const snout = new THREE.Mesh(fluffSphere(0.24, 14, 10, 0.015, 31), whiteMat);
    snout.scale.set(0.82, 0.6, 1.55);
    snout.position.set(0, -0.16, 0.42);
    this.head.add(snout);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.062, 8, 8), darkMat);
    nose.position.set(0, -0.11, 0.76);
    this.head.add(nose);

    this.eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), darkMat);
    this.eyeL.position.set(-0.19, 0.05, 0.4);
    this.head.add(this.eyeL);
    this.eyeR = this.eyeL.clone();
    this.eyeR.position.x = 0.19;
    this.head.add(this.eyeR);

    this.earL = this.makeEar(accentMat, -1);
    this.earR = this.makeEar(accentMat, 1);
    this.head.add(this.earL, this.earR);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 20), collarMat);
    collar.rotation.x = Math.PI / 2.3;
    collar.position.set(0, 0.86, 0.32);
    this.root.add(collar);

    this.legs = {};
    const legLayout = {
      fl: [-0.28, 0.4],
      fr: [0.28, 0.4],
      bl: [-0.28, -0.44],
      br: [0.28, -0.44],
    };
    Object.entries(legLayout).forEach(([key, [lx, lz]]) => {
      const pivot = new THREE.Group();
      pivot.position.set(lx, 0.42, lz);
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.34, 4, 8), furMat);
      leg.position.set(0, -0.22, 0);
      pivot.add(leg);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), whiteMat);
      paw.position.set(0, -0.4, 0);
      pivot.add(paw);
      this.root.add(pivot);
      this.legs[key] = pivot;
    });

    this.tail = new THREE.Group();
    this.tail.position.set(0, 0.92, -0.68);
    const tailMesh = new THREE.Mesh(fluffSphere(0.14, 12, 10, 0.02, 41), accentMat);
    tailMesh.scale.set(1, 1.7, 1);
    tailMesh.position.set(0, 0.22, -0.1);
    tailMesh.rotation.x = -0.7;
    this.tail.add(tailMesh);
    this.root.add(this.tail);

    this.scene.add(this.root);
  }

  makeEar(material, side) {
    const ear = new THREE.Mesh(fluffSphere(0.24, 14, 12, 0.018, 17 + side), material);
    ear.scale.set(0.4, 1.55, 0.3);
    ear.position.set(side * 0.38, -0.06, -0.02);
    ear.rotation.z = side * 0.62;
    ear.rotation.x = 0.4;
    return ear;
  }

  addGroundShadow() {
    const geometry = new THREE.CircleGeometry(0.85, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 });
    this.shadow = new THREE.Mesh(geometry, material);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.01;
    this.scene.add(this.shadow);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
