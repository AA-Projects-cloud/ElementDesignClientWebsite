/* Element Design — scroll-driven 3D residence.
   A procedural model (no external assets) that is taken apart layer by layer as the page scrolls:
   Full view → Foundation → Structure → Floors → Walls → Stairs → Windows & Doors.
   Exposes window.createHouse(canvas) → { setProgress(p), resize(), render() }  (p runs 0 … 6). */
(() => {
  'use strict';
  const T = window.THREE;
  if (!T) return;

  // ---- appearance per layer & step: fill (0..1), line (0..1), and "tone" (0 = blueprint tint, 1 = realistic colour)
  const S = [1, .22], H = [.9, 1], G = [0, .5], N = [0, 0];          // [fill, line]
  const STEPS = {
    site:       [S, N, N, N, N, N, N],
    foundation: [S, H, G, G, G, G, G],
    structure:  [N, N, H, G, G, G, N],
    slabs:      [S, N, N, H, G, G, G],
    walls:      [S, N, N, N, H, G, G],
    stairs:     [N, N, N, N, N, H, G],
    windows:    [S, N, N, N, N, G, H],
    doors:      [S, N, N, N, N, G, H]
  };
  // [realistic colour, blueprint colour, highlight colour (blueprint mode)]
  const COLORS = {
    site:       [0x5c8a4a, 0x9fc3ee, 0x9fc3ee],
    foundation: [0x7d7a74, 0x8db6ea, 0xc9dcf7],
    structure:  [0xb9b4aa, 0x8db6ea, 0xdce8fa],
    slabs:      [0xe9e4d8, 0x8db6ea, 0xcfe0f8],
    walls:      [0xeeeae0, 0x8db6ea, 0xe3edfb],
    stairs:     [0xb98a5a, 0xf2a653, 0xffb35c],
    windows:    [0x20303c, 0x8db6ea, 0x9fd2ff],
    doors:      [0x8a5a34, 0xf2a653, 0xffb35c]
  };
  // camera keyframes: [position], [target]
  const CAM = [
    [[15, 5.5, 15], [0, 2.6, 0]],
    [[17, 11, 11], [0, 0, 0]],
    [[-14, 9, 14], [0, 3.2, 0]],
    [[2, 17, 13], [0, 3, 0]],
    [[13, 7, -14], [0, 3, 0]],
    [[-8, 6.5, 9], [-3, 1.6, -2.4]],
    [[4, 3.4, 14.5], [0, 2.7, 3]]
  ];

  CAM.forEach(c => { c[0] = c[0].map(v => v * 1.4); });                           // pull the camera back a little

  window.createHouse = function (canvas) {
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, 1, .1, 200);
    scene.add(new T.HemisphereLight(0xdfeaff, 0x5a6a4a, .95));
    const sun = new T.DirectionalLight(0xfff1d6, 1.35); sun.position.set(12, 20, 10); scene.add(sun);

    const layers = {};
    const add = (layer, geo, x, y, z, opts = {}) => {
      const L = layers[layer] || (layers[layer] = { group: new T.Group(), items: [] });
      const fillMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: .85, metalness: 0, transparent: true, opacity: 1, depthWrite: true });
      const mesh = new T.Mesh(geo, fillMat);
      mesh.position.set(x, y, z);
      if (opts.rx) mesh.rotation.x = opts.rx;
      const lineMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
      const edges = new T.LineSegments(new T.EdgesGeometry(geo, 25), lineMat);
      edges.position.copy(mesh.position); edges.rotation.copy(mesh.rotation);
      L.group.add(mesh, edges);
      L.items.push({ mesh, edges, fillMat, lineMat, override: opts.color });
      return mesh;
    };
    const box = (layer, w, h, d, x, y, z, opts) => add(layer, new T.BoxGeometry(w, h, d), x, y, z, opts);

    /* ---------- model (units ≈ metres, house centred on the origin, front faces +z) ---------- */
    const W = 14, D = 8, FH = 3;                                              // plan 14 × 8, two storeys
    box('foundation', W + 1.2, .6, D + 1.2, 0, -.3, 0);
    [[-6.5, -3.5], [-2.2, -3.5], [2.2, -3.5], [6.5, -3.5], [-6.5, 3.5], [-2.2, 3.5], [2.2, 3.5], [6.5, 3.5]].forEach(([x, z]) => box('foundation', 1.5, .5, 1.5, x, -.85, z));
    // frame
    const cx = [-6.7, -2.2, 2.2, 6.7], cz = [-3.7, 3.7];
    cx.forEach(x => cz.forEach(z => box('structure', .36, 6.1, .36, x, 3.05, z)));
    [FH, 2 * FH].forEach(y => { cz.forEach(z => box('structure', W, .3, .3, 0, y - .15, z)); cx.forEach(x => box('structure', .3, .3, D, x, y - .15, 0)); });
    // floors / roof
    box('slabs', W, .22, D, 0, .11, 0);
    box('slabs', W, .3, D, 0, FH - .15, 0);
    box('slabs', W + 1.2, .34, D + 1.2, 0, 2 * FH + .17, 0);
    box('slabs', 4.2, .1, D - .4, 5, 2 * FH + .4, 0, { color: 0x9a968c });            // roof-terrace deck
    // walls: ground floor full perimeter, first floor set back over the left 10 m (terrace on the right)
    const wt = .24;
    box('walls', W, FH - .3, wt, 0, FH / 2 + .11, D / 2 - wt / 2);
    box('walls', W, FH - .3, wt, 0, FH / 2 + .11, -D / 2 + wt / 2);
    box('walls', wt, FH - .3, D - 2 * wt, -W / 2 + wt / 2, FH / 2 + .11, 0);
    box('walls', wt, FH - .3, D - 2 * wt, W / 2 - wt / 2, FH / 2 + .11, 0);
    const UW = 10, ux = -2, uy = FH + (FH - .3) / 2 + .0;
    box('walls', UW, FH - .3, wt, ux, uy, D / 2 - wt / 2 - .2);
    box('walls', UW, FH - .3, wt, ux, uy, -D / 2 + wt / 2);
    box('walls', wt, FH - .3, D - .4 - wt, ux - UW / 2 + wt / 2, uy, -.1);
    box('walls', wt, FH - .3, D - .4 - wt, ux + UW / 2 - wt / 2, uy, -.1);
    box('walls', 4.2, 1, .08, 5, 2 * FH + .95, D / 2 + .2, { color: 0xcfd6dc });       // terrace parapet
    box('walls', 4.2, 1, .08, 5, 2 * FH + .95, -D / 2 - .2, { color: 0xcfd6dc });
    box('walls', .08, 1, D + .4, 7.1, 2 * FH + .95, 0, { color: 0xcfd6dc });
    // stairs (rise along +x inside the back of the house)
    for (let i = 0; i < 15; i++) box('stairs', .32, .2, 1.2, -6.2 + i * .33, .2 + i * .2, -2.9);
    box('stairs', 1.4, .12, 1.4, -1.0, FH + .06, -2.9);
    // windows (glass blocks just proud of the walls) – front facade, sides, terrace door
    const win = (x, y, z, w, h, d) => box('windows', w, h, d, x, y, z);
    [-5.2, -1.6, 2.0].forEach(x => win(x, 1.55, D / 2 + .02, 2.3, 1.7, .08));
    win(5.2, 1.55, D / 2 + .02, 2.3, 1.7, .08);
    [-6.0, -2.9, .2, 3.1].forEach(x => win(x, FH + 1.55, D / 2 - .17, 2.2, 1.7, .08));
    win(W / 2 + .01, 1.55, 0, .08, 1.7, 3);
    win(-W / 2 - .01, 1.55, 0, .08, 1.7, 3);
    win(-W / 2 - .01, FH + 1.55, 0, .08, 1.7, 3.2);
    [-5, -1.6, 1.8].forEach(x => win(x, 1.55, -D / 2 - .02, 2.3, 1.7, .08));
    [-6, -2.5, 1, 3.4].forEach(x => win(x, FH + 1.55, -D / 2 - .02, 2.0, 1.7, .08));
    win(4.1, FH + 1.35, D / 2 - .2, 3.0, 2.4, .08);                                    // big glass to the terrace
    // doors
    box('doors', 1.2, 2.3, .1, -3.4 + 0, 1.26, D / 2 + .03);
    box('doors', 3.4, 2.1, .1, 5.2, 1.16, -D / 2 - .03, { color: 0x5b3a22 });
    // site: ground, path, trees, cars (only in the full view)
    box('site', 90, .1, 90, 0, -.62, 0);
    box('site', 3.2, .06, 8, -3.4, -.54, D / 2 + 4.2, { color: 0xc9c2b2 });
    [[-13, 4], [13, 1], [-14, -7], [14, -8], [-9, -12], [9, -13]].forEach(([x, z]) => {
      const t = box('site', .3, 2.2, .3, x, .5, z, { color: 0x6b4a2c }); t.userData.keep = true;
      add('site', new T.SphereGeometry(1.5, 12, 10), x, 2.7, z, { color: 0x3f7a3c });
    });
    box('site', 2, .7, 4.1, 9.2, -.15, 5.8, { color: 0xb02a2a }); box('site', 1.6, .5, 2.2, 9.2, .35, 5.6, { color: 0x20303c });
    box('site', 2, .7, 4.1, 11.6, -.15, 5.8, { color: 0x6e7580 }); box('site', 1.6, .5, 2.2, 11.6, .35, 5.6, { color: 0x20303c });
    // blueprint ground grid (shown once the building is taken apart)
    const grid = new T.GridHelper(60, 60, 0xaecdf5, 0x7aa2dc); grid.position.y = -.62; grid.material.transparent = true; grid.material.opacity = 0;
    scene.add(grid);

    const root = new T.Group(); Object.values(layers).forEach(L => root.add(L.group)); scene.add(root);
    root.position.y = .6;                                                               // sit on the ground plane

    /* ---------- state from scroll progress ---------- */
    const mixv = (a, b, t) => a + (b - a) * t;
    const col = new T.Color(), ca = new T.Color(), cb = new T.Color();
    let prog = 0, dirty = true, t0 = performance.now();
    const ease = t => t * t * (3 - 2 * t);

    function apply() {
      const p = Math.min(6, Math.max(0, prog)), i = Math.min(5, Math.floor(p)), f = p - i;
      const realism = Math.max(0, 1 - p * 1.6);                                          // realistic colours only in the first step
      Object.keys(layers).forEach(key => {
        const a = STEPS[key][i], b = STEPS[key][i + 1], hl = (b[1] === 1 && b[0] > 0) || (a[1] === 1 && a[0] > 0) ? 1 : 0;
        const fill = mixv(a[0], b[0], f), line = mixv(a[1], b[1], f);
        const [real, bp, high] = COLORS[key];
        const isHigh = mixv(a[1] === 1 ? 1 : 0, b[1] === 1 ? 1 : 0, f);
        layers[key].items.forEach(it => {
          it.mesh.visible = fill > .01; it.edges.visible = line > .01;
          it.fillMat.opacity = Math.min(1, fill) * (realism > .02 ? 1 : mixv(.55, .92, isHigh));
          ca.setHex(it.override !== undefined ? it.override : real); cb.setHex(bp); col.copy(cb).lerp(new T.Color(high), isHigh);
          it.fillMat.color.copy(col).lerp(ca, realism);
          it.lineMat.opacity = line * (realism > .5 ? .6 : 1);
          it.lineMat.color.setHex(realism > .5 ? 0x4a4f55 : 0xe9f2ff);
        });
      });
      grid.material.opacity = Math.min(1, Math.max(0, (p - .2) * 1.2)) * .8;
      // camera: hold each viewpoint, glide between them
      const k = Math.min(5, Math.floor(p)), g = ease(Math.min(1, Math.max(0, (p - k - .2) / .6)));
      const A = CAM[k], B = CAM[k + 1], tt = (performance.now() - t0) / 1000;
      const sway = Math.sin(tt * .35) * .9;
      const tx = mixv(A[1][0], B[1][0], g), ty = mixv(A[1][1], B[1][1], g), tz = mixv(A[1][2], B[1][2], g);
      const far = camera.aspect < 1 ? 1 + (1 / camera.aspect - 1) * .5 : 1;                // portrait phones: back off so the whole house fits
      camera.position.set(tx + (mixv(A[0][0], B[0][0], g) + sway - tx) * far, ty + (mixv(A[0][1], B[0][1], g) + Math.sin(tt * .27) * .25 - ty) * far, tz + (mixv(A[0][2], B[0][2], g) - tz) * far);
      camera.lookAt(tx, ty - (camera.aspect < 1 ? 1.2 : 0), tz);
      renderer.render(scene, camera);
    }

    return {
      setProgress(p) { prog = p; dirty = true; },
      resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
        renderer.setSize(w, h, false); camera.aspect = w / h;
        camera.fov = w / h < .8 ? 52 : 34;                                              // wider lens on portrait phones
        camera.updateProjectionMatrix(); dirty = true;
      },
      render() { apply(); }
    };
  };
})();
