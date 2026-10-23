import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvases = [...document.querySelectorAll('canvas.ico3d')];
if (!canvases.length) throw new Error('no icon canvases');

const mat = new THREE.MeshPhysicalMaterial({
  color: 0x2c2c2e, metalness: 0.35, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2
});

// ---------- geometry helpers ----------
function rounded(pts, r) {
  const s = new THREE.Shape(), n = pts.length;
  const P = pts.map(p => new THREE.Vector2(p[0], p[1]));
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n];
    const a = p1.clone().add(p0.clone().sub(p1).setLength(r));
    const b = p1.clone().add(p2.clone().sub(p1).setLength(r));
    if (i === 0) s.moveTo(a.x, a.y); else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
  }
  s.closePath();
  return s;
}
function solid(shape, depth, bevel) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 10, curveSegments: 24
  });
  g.center();
  return new THREE.Mesh(g, mat);
}
const place = (m, x, y, z, s = 1) => { m.position.set(x, y, z); m.scale.setScalar(s); return m; };

function house(s = 1) {
  return solid(rounded([[-0.5, -0.5], [0.5, -0.5], [0.5, 0.18], [0, 0.72], [-0.5, 0.18]], 0.1), 0.32, 0.07);
}


// ---------- glossy cream social badges ----------
const cream = new THREE.MeshPhysicalMaterial({ color: 0xfdf3e7, metalness: 0.05, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1 });
const ink = new THREE.MeshPhysicalMaterial({ color: 0x141414, metalness: 0.3, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3 });
const ZF = 0.36;
function seg(a, b, r, m = ink) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24), m);
  c.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, ZF); c.rotation.z = Math.atan2(-dx, dy); g.add(c);
  for (const p of [a, b]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m); s.position.set(p[0], p[1], ZF); g.add(s); }
  return g;
}
function ringShape(ro, ri) { const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2); const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); return s; }
function social(kind) {
  const g = new THREE.Group();
  const d = new THREE.Shape(); d.absarc(0, 0, 0.95, 0, Math.PI * 2);
  const disc = solid(d, 0.22, 0.12); disc.material = cream; g.add(disc);
  const on = m => { m.position.z = ZF; m.material = ink; g.add(m); return m; };
  if (kind === 'instagram') {
    const o = rounded([[-0.58, -0.58], [0.58, -0.58], [0.58, 0.58], [-0.58, 0.58]], 0.2);
    const hole = new THREE.Path(); const r = 0.14, q = 0.46;
    [[-q, -q + r], [-q, q - r]].length;
    hole.moveTo(-q + r, -q); hole.lineTo(q - r, -q); hole.quadraticCurveTo(q, -q, q, -q + r); hole.lineTo(q, q - r); hole.quadraticCurveTo(q, q, q - r, q);
    hole.lineTo(-q + r, q); hole.quadraticCurveTo(-q, q, -q, q - r); hole.lineTo(-q, -q + r); hole.quadraticCurveTo(-q, -q, -q + r, -q);
    o.holes.push(hole);
    on(solid(o, 0.06, 0.03));
    on(solid(ringShape(0.27, 0.17), 0.06, 0.03));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 24, 16), ink); dot.position.set(0.32, 0.32, ZF); g.add(dot);
  } else if (kind === 'pinterest') {
    const bowl = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.085, 24, 56), ink); bowl.position.set(0.06, 0.2, ZF); g.add(bowl);
    g.add(seg([-0.18, 0.5], [-0.18, -0.62], 0.085));
    g.add(seg([-0.18, -0.1], [-0.3, -0.62], 0.085));
  } else if (kind === 'vk') {
    g.add(seg([-0.66, 0.36], [-0.32, -0.36], 0.075)); g.add(seg([-0.32, -0.36], [0.02, 0.36], 0.075));
    g.add(seg([0.22, 0.36], [0.22, -0.36], 0.075)); g.add(seg([0.22, 0.0], [0.6, 0.36], 0.075)); g.add(seg([0.22, 0.0], [0.6, -0.36], 0.075));
  } else {
    on(solid(rounded([[-0.72, -0.5], [0.72, -0.5], [0.72, 0.5], [-0.72, 0.5]], 0.22), 0.1, 0.05));
    const t = solid(rounded([[-0.2, -0.28], [0.3, 0], [-0.2, 0.28]], 0.06), 0.06, 0.03); t.material = cream; t.position.set(0.02, 0, ZF + 0.1); g.add(t);
  }
  return g;
}

// ---------- the four icons ----------
const builders = {
  houses() {
    const g = new THREE.Group();
    g.add(place(house(), 0.3, 0.12, -0.1, 1.15));
    g.add(place(house(), -0.62, -0.1, 0.2, 0.7));
    return g;
  },
  trophy() {
    const g = new THREE.Group();
    const prof = [[0.001, -0.55], [0.08, -0.52], [0.13, -0.42], [0.3, -0.25], [0.46, 0.0], [0.52, 0.3], [0.52, 0.55], [0.001, 0.55]]
      .map(p => new THREE.Vector2(p[0], p[1]));
    g.add(place(new THREE.Mesh(new THREE.LatheGeometry(prof, 64), mat), 0, 0.35, 0));
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.32, 32), mat); stem.position.y = -0.38; g.add(stem);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.13, 48), mat); base.position.y = -0.6; g.add(base);
    for (const sx of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 20, 40, Math.PI), mat);
      h.rotation.z = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
      h.position.set(sx * 0.54, 0.45, 0);
      g.add(h);
    }
    const medal = solid(rounded([[-0.3, -0.12], [-0.12, -0.3], [0.12, -0.3], [0.3, -0.12], [0.3, 0.12], [0.12, 0.3], [-0.12, 0.3], [-0.3, 0.12]], 0.07), 0.2, 0.07);
    medal.position.set(0.62, -0.38, 0.35); medal.rotation.y = -0.2; g.add(medal);
    return g;
  },
  chair() {
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), mat);
    back.scale.set(1, 1.05, 0.28); back.position.set(-0.5, 0.45, -0.1); back.rotation.x = -0.1; g.add(back);
    const seat = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 24), mat);
    seat.scale.set(1, 0.2, 0.9); seat.position.set(-0.5, -0.1, 0.12); g.add(seat);
    for (const [x, z, tx, tz] of [[-0.78, -0.05, -0.12, 0.05], [-0.28, -0.1, 0.1, 0.05], [-0.8, 0.3, -0.1, -0.1], [-0.3, 0.32, 0.1, -0.1]]) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.9, 16), mat);
      l.position.set(x, -0.58, z); l.rotation.z = tx; l.rotation.x = tz; g.add(l);
    }
    g.add(place(house(), 0.55, -0.15, 0, 0.9));
    return g;
  },
  gem() {
    const oct = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; oct.push([Math.cos(a) * 0.85, Math.sin(a) * 0.85]); }
    const g = new THREE.Group();
    g.add(solid(rounded(oct, 0.16), 0.55, 0.16));
    const top = solid(rounded(oct.map(p => [p[0] * 0.62, p[1] * 0.62]), 0.1), 0.2, 0.1); top.position.z = 0.4; g.add(top);
    g.rotation.set(-0.5, 0.2, 0.3);
    const w = new THREE.Group(); w.add(g); return w;
  },
  expert() {
    const g = new THREE.Group();
    const st = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.46 : 1; st.push([Math.cos(a) * r, Math.sin(a) * r]); }
    g.add(place(solid(rounded(st, 0.1), 0.34, 0.12), -0.55, -0.3, 0.2, 0.62));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 40, 32), mat); head.position.set(0.45, 0.55, 0); g.add(head);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.5, 12, 32), mat); body.scale.set(1, 1, 0.7); body.position.set(0.45, -0.25, 0); g.add(body);
    return g;
  },
  lock() {
    const g = new THREE.Group();
    g.add(place(solid(rounded([[-0.6, -0.5], [0.6, -0.5], [0.6, 0.4], [-0.6, 0.4]], 0.18), 0.55, 0.1), 0, -0.2, 0));
    const sh = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 24, 48, Math.PI), mat); sh.position.set(0, 0.32, 0); g.add(sh);
    for (const x of [-0.36, 0.36]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 24), mat); l.position.set(x, 0.24, 0); g.add(l); }
    const hole = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), new THREE.MeshStandardMaterial({ color: 0xff9a30, emissive: 0xff7a10, emissiveIntensity: 1.2 }));
    hole.position.set(0, -0.12, 0.42); g.add(hole);
    return g;
  },
  pins() {
    const g = new THREE.Group();
    const pin = (x, y, z, s) => {
      const p = new THREE.Group();
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 32), mat); b.position.y = 0.4; p.add(b);
      const t = new THREE.Mesh(new THREE.ConeGeometry(0.39, 0.85, 40), mat); t.rotation.x = Math.PI; t.position.y = -0.1; p.add(t);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.4 })); e.position.set(0, 0.4, 0.34); p.add(e);
      p.position.set(x, y, z); p.scale.setScalar(s); return p;
    };
    g.add(pin(-0.4, 0.05, 0.1, 1.05)); g.add(pin(0.55, 0.25, -0.2, 0.8));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.07, 56), new THREE.MeshPhysicalMaterial({ color: 0x2a1708, metalness: 0.4, roughness: 0.3, emissive: 0xff7a10, emissiveIntensity: 0.35 }));
    base.position.set(0.05, -0.62, 0); base.scale.set(1.2, 1, 0.7); g.add(base);
    return g;
  },
  camera() {
    const g = new THREE.Group();
    g.add(place(solid(rounded([[-0.75, -0.5], [0.75, -0.5], [0.75, 0.5], [-0.75, 0.5]], 0.2), 0.5, 0.1), -0.1, 0, 0));
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.28, 48), mat); lens.rotation.x = Math.PI / 2; lens.position.set(-0.1, 0, 0.42); g.add(lens);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 40), new THREE.MeshStandardMaterial({ color: 0xff9a30, emissive: 0xff6a00, emissiveIntensity: 0.9 }));
    glass.rotation.x = Math.PI / 2; glass.position.set(-0.1, 0, 0.58); g.add(glass);
    g.add(place(solid(rounded([[-0.45, -0.35], [0.45, -0.35], [0.45, 0.35], [-0.45, 0.35]], 0.14), 0.3, 0.08), 0.62, -0.28, -0.45, 0.8));
    return g;
  },
  chart() {
    const g = new THREE.Group();
    g.add(place(solid(rounded([[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]], 0.22), 0.3, 0.1), 0, 0, -0.1));
    [[-0.42, -0.3, 0.35], [0, -0.1, 0.75], [0.42, 0.12, 1.2]].forEach(([x, y, h], i) => {
      const b = solid(rounded([[-0.14, 0], [0.14, 0], [0.14, h * 0.7], [-0.14, h * 0.7]], 0.07), 0.22, 0.05);
      b.position.set(x, -0.52 + h * 0.35 - 0.1, 0.25); g.add(b);
    });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), new THREE.MeshStandardMaterial({ color: 0xff9a30, emissive: 0xff7a10, emissiveIntensity: 1 }));
    dot.position.set(0.42, 0.72, 0.3); g.add(dot);
    return g;
  },
  instagram() { return social('instagram'); },
  pinterest() { return social('pinterest'); },
  vk() { return social('vk'); },
  youtube() { return social('youtube'); },
  star() {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.46 : 1;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return solid(rounded(pts, 0.1), 0.34, 0.12);
  }
};

// ---------- one renderer per canvas ----------
const items = canvases.map(canvas => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff9a30, 5); rim.position.set(4, -1.5, -3); scene.add(rim);
  const glow = new THREE.PointLight(0xff9a30, 14, 8); glow.position.set(2.2, -1.6, 2); scene.add(glow);
  const top = new THREE.DirectionalLight(0xffc27a, 1.2); top.position.set(2, 3, -2); scene.add(top);

  const group = builders[canvas.dataset.icon]();
  const holder = new THREE.Group(); holder.add(group); scene.add(holder);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  const it = { canvas, renderer, scene, camera, holder, visible: false, phase: Math.random() * 6 };

  const fit = () => {
    const w = canvas.clientWidth || 170, h = canvas.clientHeight || 130;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const box = new THREE.Box3().setFromObject(holder), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const t = Math.tan(camera.fov * Math.PI / 360);
    const dist = Math.max(size.y / (2 * t), size.x / (2 * t * camera.aspect)) * 1.18 + size.z / 2;
    camera.position.set(c.x, c.y, c.z + dist);
    camera.lookAt(c);
  };
  it.fit = fit;
  new IntersectionObserver(([e]) => { it.visible = e.isIntersecting; }).observe(canvas);
  return it;
});

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rotBase = { houses: -0.5, trophy: -0.4, chair: -0.45, star: -0.4, instagram: -0.25, pinterest: -0.25, vk: -0.25, youtube: -0.25 };
function resizeAll() { items.forEach(i => { holderBase(i); i.fit(); }); }
function holderBase(i) { i.holder.rotation.set(0.2, rotBase[i.canvas.dataset.icon] ?? -0.4, 0); }
addEventListener('resize', resizeAll);
resizeAll();
// fit once the page has laid out
requestAnimationFrame(resizeAll);

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  for (const i of items) {
    if (!i.visible) continue;
    if (!reduce) {
      const base = rotBase[i.canvas.dataset.icon] ?? -0.4;
      i.holder.rotation.y = base + Math.sin(t * 0.7 + i.phase) * 0.22;
      i.holder.position.y = Math.sin(t * 0.9 + i.phase) * 0.02;
    }
    i.renderer.render(i.scene, i.camera);
  }
  requestAnimationFrame(frame);
}
frame();
