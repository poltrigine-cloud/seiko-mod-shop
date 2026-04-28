import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

const EASE = [0.22, 1, 0.36, 1]

function buildScene() {
  // ── Scene ────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.04)

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0.4, 2.2, 4.3)
  camera.lookAt(0, 1.0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9

  // ── Textures ─────────────────────────────────────────────────────────────
  function noiseCanvas(w, h, r, g, b, v) {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d'), d = ctx.createImageData(w, h)
    for (let i = 0; i < d.data.length; i += 4) {
      const n = (Math.random() - 0.5) * v
      d.data[i] = Math.max(0, Math.min(255, r + n))
      d.data[i+1] = Math.max(0, Math.min(255, g + n))
      d.data[i+2] = Math.max(0, Math.min(255, b + n))
      d.data[i+3] = 255
    }
    ctx.putImageData(d, 0, 0)
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }

  function woodCanvas(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 80; i++) {
      const y = Math.random() * h
      ctx.strokeStyle = `rgba(30,15,5,${0.03 + Math.random() * 0.08})`
      ctx.lineWidth = 1 + Math.random() * 3; ctx.beginPath(); ctx.moveTo(0, y)
      let cx = 0
      while (cx < w) { cx += 10 + Math.random() * 30; ctx.lineTo(cx, y + (Math.random() - 0.5) * 4) }
      ctx.stroke()
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }

  function concreteCanvas(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * w, y = Math.random() * h, g = 40 + Math.random() * 30
      ctx.fillStyle = `rgba(${g},${g},${g},${Math.random() * 0.3})`
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }

  function metalCanvas(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#888'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 200; i++) {
      const y = Math.random() * h
      ctx.strokeStyle = `rgba(${120 + Math.random()*60},${120 + Math.random()*60},${120 + Math.random()*60},${0.1 + Math.random()*0.15})`
      ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random()-0.5)*2); ctx.stroke()
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }

  const woodTex      = woodCanvas(512, 512)
  const concreteTex  = concreteCanvas(512, 512)
  const floorTex     = concreteCanvas(1024, 1024); floorTex.repeat.set(3, 3)
  const metalTex     = metalCanvas(256, 256)

  // ── Materials ─────────────────────────────────────────────────────────────
  const woodMat      = new THREE.MeshStandardMaterial({ map: woodTex,     roughness: 0.75, metalness: 0,    color: 0x6b4226 })
  const darkWoodMat  = new THREE.MeshStandardMaterial({ map: woodTex,     roughness: 0.8,  metalness: 0,    color: 0x3d2010 })
  const concreteMat  = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.95, metalness: 0,    color: 0x555555 })
  const floorMat     = new THREE.MeshStandardMaterial({ map: floorTex,    roughness: 0.92, metalness: 0,    color: 0x444444 })
  const metalMat     = new THREE.MeshStandardMaterial({ map: metalTex,    roughness: 0.35, metalness: 0.85, color: 0x999999 })
  const darkMetalMat = new THREE.MeshStandardMaterial({                   roughness: 0.4,  metalness: 0.9,  color: 0x333333 })
  const brassMat     = new THREE.MeshStandardMaterial({                   roughness: 0.3,  metalness: 0.9,  color: 0xc49a3c })
  const silverMat    = new THREE.MeshStandardMaterial({                   roughness: 0.2,  metalness: 0.95, color: 0xcccccc })
  const blackMat     = new THREE.MeshStandardMaterial({                   roughness: 0.6,  metalness: 0.1,  color: 0x111111 })
  const redHandMat   = new THREE.MeshStandardMaterial({                   roughness: 0.3,  metalness: 0.7,  color: 0xcc2222, emissive: 0x330000 })
  const blueMat      = new THREE.MeshStandardMaterial({                   roughness: 0.25, metalness: 0.85, color: 0x1a3a6a })
  const crystalMat   = new THREE.MeshStandardMaterial({                   roughness: 0.05, metalness: 0.1,  color: 0xddeeff, transparent: true, opacity: 0.3 })
  const rubberMat    = new THREE.MeshStandardMaterial({                   roughness: 0.9,  metalness: 0,    color: 0x1a1a1a })
  const pegboardMat  = new THREE.MeshStandardMaterial({                   roughness: 0.85, metalness: 0,    color: 0x8a7a6a })
  const warmLightMat = new THREE.MeshStandardMaterial({ color: 0xffd080, emissive: 0xffa040, emissiveIntensity: 3.0 })

  // ── Floor & Walls ─────────────────────────────────────────────────────────
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat)
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)

  const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.2), concreteMat)
  wall.position.set(0, 2, -1.5); wall.receiveShadow = true; scene.add(wall)

  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 5), concreteMat)
  sideL.position.set(-3, 2, 1); sideL.receiveShadow = true; scene.add(sideL)

  const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 5), concreteMat)
  sideR.position.set(3, 2, 1); sideR.receiveShadow = true; scene.add(sideR)

  // ── Workbench ─────────────────────────────────────────────────────────────
  const bench = new THREE.Group()
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.9), woodMat)
  benchTop.position.set(0, 0.85, 0); benchTop.castShadow = true; benchTop.receiveShadow = true; bench.add(benchTop)

  const edge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.03, 0.04), darkWoodMat)
  edge.position.set(0, 0.84, 0.45); bench.add(edge)

  const legGeo = new THREE.BoxGeometry(0.06, 0.85, 0.06)
  ;[[-1.1,0.425,0.38],[1.1,0.425,0.38],[-1.1,0.425,-0.38],[1.1,0.425,-0.38]].forEach(p => {
    const leg = new THREE.Mesh(legGeo, darkWoodMat); leg.position.set(...p); leg.castShadow = true; bench.add(leg)
  })

  const braceGeo = new THREE.BoxGeometry(2.1, 0.04, 0.04)
  const b1 = new THREE.Mesh(braceGeo, darkWoodMat); b1.position.set(0, 0.25, 0.38); bench.add(b1)
  const b2 = new THREE.Mesh(braceGeo, darkWoodMat); b2.position.set(0, 0.25,-0.38); bench.add(b2)

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.7), darkWoodMat)
  shelf.position.set(0, 0.27, 0); shelf.receiveShadow = true; bench.add(shelf)

  bench.position.set(0, 0, -0.9); scene.add(bench)

  // ── Watch on holder ───────────────────────────────────────────────────────
  const watchGroup = new THREE.Group()

  const holderBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 32), darkMetalMat)
  holderBase.castShadow = true; watchGroup.add(holderBase)

  const holderPost = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16), metalMat)
  holderPost.position.set(0, 0.035, 0); watchGroup.add(holderPost)

  const watchCase = new THREE.Group()
  const caseBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.038, 0.018, 32), silverMat)
  caseBody.castShadow = true; watchCase.add(caseBody)

  const bezelRing = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.004, 8, 32), darkMetalMat)
  bezelRing.rotation.x = Math.PI / 2; bezelRing.position.y = 0.008; watchCase.add(bezelRing)

  const caseBack = new THREE.Mesh(new THREE.RingGeometry(0.01, 0.037, 32), silverMat)
  caseBack.rotation.x = Math.PI / 2; caseBack.position.y = -0.009; watchCase.add(caseBack)

  const movBase = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.006, 32),
    new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.8, color: 0xc4a44c }))
  movBase.position.y = -0.003; watchCase.add(movBase)

  const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.002, 16, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.9, color: 0xb8b8b8 }))
  rotor.position.y = 0.001; rotor.rotation.y = 0.5; watchCase.add(rotor)

  for (let i = 0; i < 5; i++) {
    const j = new THREE.Mesh(new THREE.SphereGeometry(0.0015, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xcc1111, emissive: 0x440000, roughness: 0.2, metalness: 0.3 }))
    const a = (i / 5) * Math.PI * 2
    j.position.set(Math.cos(a) * 0.015, 0.004, Math.sin(a) * 0.015); watchCase.add(j)
  }

  for (let i = 0; i < 3; i++) {
    const g = new THREE.Mesh(new THREE.TorusGeometry(0.005 + i * 0.003, 0.001, 6, 16), brassMat)
    g.rotation.x = Math.PI / 2; g.position.set((i-1)*0.01, 0.003, (i-1)*0.005); watchCase.add(g)
  }

  const crownTube = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.006, 8), silverMat)
  crownTube.rotation.z = Math.PI / 2; crownTube.position.set(0.042, 0, 0); watchCase.add(crownTube)

  ;[[-0.02,0,0.04],[0.02,0,0.04],[-0.02,0,-0.04],[0.02,0,-0.04]].forEach(p => {
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.006, 0.025), silverMat)
    lug.position.set(...p); lug.castShadow = true; watchCase.add(lug)
  })

  watchCase.position.set(0, 0.065, 0); watchCase.rotation.x = Math.PI * 0.05
  watchGroup.add(watchCase)
  watchGroup.position.set(-0.15, 0.88, -0.85); scene.add(watchGroup)

  // ── Screwdriver set ───────────────────────────────────────────────────────
  const sdSet = new THREE.Group()
  const sdBlock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), darkWoodMat)
  sdBlock.castShadow = true; sdSet.add(sdBlock)

  const sdColors = [0xcc2222, 0x2266cc, 0x22aa44, 0xccaa22, 0xaa22aa, 0x22aaaa]
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group()
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.06, 8),
      new THREE.MeshStandardMaterial({ color: sdColors[i], roughness: 0.5, metalness: 0.1 }))
    h.position.y = 0.05; g.add(h)
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.001, 0.04, 6), silverMat)
    s.position.y = 0.02; g.add(s)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.004, 0.005, 8), metalMat)
    cap.position.y = 0.08; g.add(cap)
    g.position.set(-0.05 + i * 0.02, 0.015, 0); sdSet.add(g)
  }
  sdSet.position.set(0.25, 0.88, -0.78); scene.add(sdSet)

  // ── Loupe ─────────────────────────────────────────────────────────────────
  const loupeG = new THREE.Group()
  loupeG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.035, 16), blackMat))
  const loupeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 16), crystalMat)
  loupeLens.position.y = -0.017; loupeG.add(loupeLens)
  const loupeRim = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.002, 8, 16), metalMat)
  loupeRim.rotation.x = Math.PI / 2; loupeRim.position.y = -0.017; loupeG.add(loupeRim)
  loupeG.position.set(0.08, 0.90, -0.72); loupeG.rotation.x = Math.PI / 2; loupeG.rotation.z = 0.3
  scene.add(loupeG)

  // ── Parts tray ────────────────────────────────────────────────────────────
  const tray = new THREE.Group()
  const trayBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.008, 32), metalMat)
  trayBase.castShadow = true; tray.add(trayBase)
  const trayRim = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.003, 8, 32), metalMat)
  trayRim.rotation.x = Math.PI / 2; trayRim.position.y = 0.004; tray.add(trayRim)

  const handMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3, metalness: 0.8 })
  const hh = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.001, 0.015), handMat)
  hh.position.set(-0.02, 0.006, 0.01); hh.rotation.y = 0.3; tray.add(hh)
  const mh = new THREE.Mesh(new THREE.BoxGeometry(0.0015, 0.001, 0.02), handMat)
  mh.position.set(0.01, 0.006, -0.01); mh.rotation.y = -0.5; tray.add(mh)
  const sh = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.001, 0.022), redHandMat)
  sh.position.set(0.015, 0.006, 0.015); sh.rotation.y = 0.8; tray.add(sh)
  const bi = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.035, 32), blueMat)
  bi.rotation.x = -Math.PI / 2; bi.position.set(-0.01, 0.005, -0.01); tray.add(bi)

  tray.position.set(-0.5, 0.885, -0.82); scene.add(tray)

  // ── Tweezers ──────────────────────────────────────────────────────────────
  const tweezG = new THREE.Group()
  const twPath = new THREE.Shape()
  twPath.moveTo(0,0); twPath.lineTo(0.003,0.08); twPath.lineTo(0.001,0.08); twPath.lineTo(-0.001,0); twPath.closePath()
  const twGeo = new THREE.ExtrudeGeometry(twPath, { depth: 0.001, bevelEnabled: false })
  tweezG.add(new THREE.Mesh(twGeo, silverMat))
  const tw2 = new THREE.Mesh(twGeo, silverMat); tw2.position.x = 0.005; tweezG.add(tw2)
  tweezG.position.set(0.55, 0.885, -0.78); tweezG.rotation.x = -Math.PI / 2; tweezG.rotation.z = -0.3
  scene.add(tweezG)

  // ── Movement cushion ──────────────────────────────────────────────────────
  const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 32),
    new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, color: 0xe8d8c8 }))
  cushion.position.set(0.15, 0.885, -0.92); cushion.castShadow = true; scene.add(cushion)
  const ci = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.004, 32),
    new THREE.MeshStandardMaterial({ color: 0xd0c0b0, roughness: 0.9, metalness: 0 }))
  ci.position.set(0.15, 0.889, -0.92); scene.add(ci)

  // ── Stool ─────────────────────────────────────────────────────────────────
  const stool = new THREE.Group()
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.03, 24), darkMetalMat)
  seat.position.set(0, 0.65, 0); seat.castShadow = true; stool.add(seat)
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 12), metalMat)
  post.position.set(0, 0.43, 0); stool.add(post)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2; const lg = new THREE.Group()
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), metalMat)
    sl.position.set(0, 0.18, 0); sl.rotation.z = 0.15; lg.add(sl)
    const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.01, 8), rubberMat)
    ft.position.set(0.06, 0.005, 0); lg.add(ft)
    lg.rotation.y = a; stool.add(lg)
  }
  stool.position.set(0.6, 0, 0.3); scene.add(stool)

  // ── Pegboard ─────────────────────────────────────────────────────────────
  const pbG = new THREE.Group()
  pbG.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.02), pegboardMat))
  for (let x = -8; x <= 8; x++) for (let y = -6; y <= 6; y++) {
    if (Math.random() > 0.4) continue
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.025, 6),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 1 }))
    h.rotation.x = Math.PI / 2; h.position.set(x * 0.04, y * 0.04, 0); pbG.add(h)
  }
  pbG.position.set(-1.2, 1.8, -1.38); scene.add(pbG)

  // ── Display shelf with completed mods ─────────────────────────────────────
  const shelfG = new THREE.Group()
  const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.025, 0.15), woodMat)
  shelfBoard.castShadow = true; shelfBoard.receiveShadow = true; shelfG.add(shelfBoard)
  for (let i = 0; i < 2; i++) {
    const bv = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.1, 0.015), metalMat)
    bv.position.set(-0.25 + i * 0.5, -0.06, 0.06); shelfG.add(bv)
    const bh = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.015, 0.12), metalMat)
    bh.position.set(-0.25 + i * 0.5, -0.005, 0.01); shelfG.add(bh)
  }

  function completedWatch(dialCol, bezelCol, strapCol) {
    const wg = new THREE.Group()
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.03), blackMat); wg.add(standBase)
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 0.008), blackMat)
    neck.position.set(0, 0.027, -0.005); wg.add(neck)
    const cradle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.008, 16, 1, false, 0, Math.PI), blackMat)
    cradle.position.set(0, 0.055, 0); cradle.rotation.z = Math.PI; wg.add(cradle)
    const wb = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.021, 0.01, 24), silverMat)
    wb.position.set(0, 0.06, 0.005); wb.castShadow = true; wg.add(wb)
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.002, 24),
      new THREE.MeshStandardMaterial({ color: dialCol, roughness: 0.3, metalness: 0.5 }))
    dial.position.set(0, 0.066, 0.005); wg.add(dial)
    const bz = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.003, 6, 24),
      new THREE.MeshStandardMaterial({ color: bezelCol, roughness: 0.25, metalness: 0.85 }))
    bz.rotation.x = Math.PI / 2; bz.position.set(0, 0.065, 0.005); wg.add(bz)
    const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.003, 24), crystalMat)
    cr.position.set(0, 0.068, 0.005); wg.add(cr)
    const sm = new THREE.MeshStandardMaterial({ color: strapCol, roughness: 0.85, metalness: 0 })
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.003), sm)
    s1.position.set(0, 0.04, 0.022); s1.rotation.x = 0.3; wg.add(s1)
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.003), sm)
    s2.position.set(0, 0.04, -0.012); s2.rotation.x = -0.3; wg.add(s2)
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.006, 8), silverMat)
    crown.rotation.z = Math.PI / 2; crown.position.set(0.025, 0.06, 0.005); wg.add(crown)
    return wg
  }

  const w1 = completedWatch(0x0a1a3a, 0x111111, 0x1a1a1a); w1.position.set(-0.22, 0.015, 0.01); shelfG.add(w1)
  const w2 = completedWatch(0x1a4a2a, 0x1a3a1a, 0x3a2210); w2.position.set(0, 0.015, 0.01); shelfG.add(w2)
  const w3 = completedWatch(0x4a1515, 0xaa8833, 0x111111); w3.position.set(0.22, 0.015, 0.01); shelfG.add(w3)
  shelfG.position.set(0.8, 1.95, -1.38); scene.add(shelfG)

  // ── Pendant lamp ──────────────────────────────────────────────────────────
  const lampG = new THREE.Group()
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.5, 8), blackMat)
  cord.position.set(0, 0.75, 0); lampG.add(cord)
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 0.14, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.8, side: THREE.DoubleSide }))
  shade.castShadow = true; lampG.add(shade)
  const innerShade = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.175, 0.135, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xffa040, roughness: 0.9, metalness: 0, side: THREE.BackSide, emissive: 0x331100, emissiveIntensity: 0.3 }))
  lampG.add(innerShade)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), warmLightMat)
  bulb.position.y = 0.02; lampG.add(bulb)
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), darkMetalMat)
  canopy.position.set(0, 1.5, 0); lampG.add(canopy)
  lampG.position.set(0, 2.5, -0.85); scene.add(lampG)

  // ── Atmosphere props ──────────────────────────────────────────────────────
  const toolBox = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.1), darkMetalMat)
  toolBox.position.set(-0.3, 0.315, -0.85); toolBox.castShadow = true; scene.add(toolBox)

  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }))
  cloth.position.set(0.45, 0.886, -0.95); cloth.rotation.x = -Math.PI / 2; cloth.rotation.z = 0.15; scene.add(cloth)

  const bottleG = new THREE.Group()
  bottleG.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.035, 12),
    new THREE.MeshStandardMaterial({ color: 0xaa8833, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.8 }))))
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.008, 8), metalMat)
  cap.position.y = 0.021; bottleG.add(cap)
  bottleG.position.set(-0.7, 0.9, -0.8); scene.add(bottleG)

  // ── Dust particles ────────────────────────────────────────────────────────
  const dustCount = 200
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i*3]   = (Math.random() - 0.5) * 1.5
    dustPos[i*3+1] = 0.9 + Math.random() * 1.8
    dustPos[i*3+2] = -0.85 + (Math.random() - 0.5) * 1.2
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffd890, size: 0.006, transparent: true, opacity: 0.25,
    blending: THREE.AdditiveBlending, depthWrite: false
  }))
  scene.add(dust)

  // ── Lighting ──────────────────────────────────────────────────────────────
  const pendant = new THREE.SpotLight(0xffd090, 22, 6, Math.PI / 4, 0.5, 1.1)
  pendant.position.set(0, 2.5, -0.85)
  pendant.target.position.set(0, 0.88, -0.85)
  pendant.castShadow = true
  pendant.shadow.mapSize.width = 2048; pendant.shadow.mapSize.height = 2048
  pendant.shadow.camera.near = 0.3; pendant.shadow.camera.far = 5
  pendant.shadow.bias = -0.001; pendant.shadow.normalBias = 0.02
  scene.add(pendant); scene.add(pendant.target)

  const fill = new THREE.PointLight(0xffc070, 5, 5, 1.4)
  fill.position.set(0, 2.2, -0.85); scene.add(fill)

  // Luz de relleno frontal suave para iluminar lo que la lámpara no alcanza
  const frontFill = new THREE.PointLight(0xfff0d0, 1.8, 7, 2)
  frontFill.position.set(0.5, 2.0, 3.5); scene.add(frontFill)

  const ambient = new THREE.AmbientLight(0x201a14, 0.75); scene.add(ambient)

  const rim = new THREE.PointLight(0x334466, 0.6, 6, 2)
  rim.position.set(-2, 2.5, 2); scene.add(rim)

  const bounce = new THREE.PointLight(0x664422, 0.3, 3, 2)
  bounce.position.set(0, 0.1, 0); scene.add(bounce)

  // ── Post-processing ───────────────────────────────────────────────────────
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.6, 0.85))
  composer.addPass(new SMAAPass(window.innerWidth, window.innerHeight))
  composer.addPass(new OutputPass())

  // ── Cámara mouse-driven ───────────────────────────────────────────────────
  // Calculamos las coordenadas esféricas base desde la posición inicial
  // para poder orbitar respecto al mismo punto de enfoque.
  const TARGET     = new THREE.Vector3(0, 1.0, 0)
  const camOffset  = camera.position.clone().sub(TARGET)
  const baseRadius = camOffset.length()                          // ~4.7
  const baseAz     = Math.atan2(camOffset.x, camOffset.z)       // azimut base ~38°
  const baseEl     = Math.asin(camOffset.y / baseRadius)        // elevación base ~17°

  const MAX_AZ     = Math.PI / 4.5  // ±40° horizontal
  const MAX_EL     = 0.38          // ±22° vertical
  const LERP       = 0.048         // más respuesta, sigue siendo suave

  let targetAz = baseAz,  targetEl = baseEl
  let currentAz = baseAz, currentEl = baseEl

  const onMouseMove = (e) => {
    const r  = renderer.domElement.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width  * 2 - 1   // -1 → 1
    const ny = (e.clientY - r.top)  / r.height * 2 - 1   // -1 → 1
    targetAz = baseAz + nx * MAX_AZ
    targetEl = baseEl - ny * MAX_EL                        // Y invertida = natural
  }

  const onMouseLeave = () => {
    targetAz = baseAz
    targetEl = baseEl
  }

  renderer.domElement.addEventListener('mousemove',  onMouseMove)
  renderer.domElement.addEventListener('mouseleave', onMouseLeave)

  // ── Animation loop ────────────────────────────────────────────────────────
  const clock = new THREE.Clock()

  function animate() {
    const t = clock.getElapsedTime()

    // Dust motes
    const pos = dustGeo.attributes.position.array
    for (let i = 0; i < dustCount; i++) {
      pos[i*3]   += Math.sin(t * 0.3 + i)      * 0.00003
      pos[i*3+1] += Math.sin(t * 0.2 + i * 0.5)* 0.00005
      pos[i*3+2] += Math.cos(t * 0.25 + i * 0.7)*0.00003
    }
    dustGeo.attributes.position.needsUpdate = true

    // Lamp flicker
    pendant.intensity = 22 + Math.sin(t * 3) * 0.2 + Math.sin(t * 7.3) * 0.1
    fill.intensity    = 5  + Math.sin(t * 2.5 + 1) * 0.15

    // Rotor glint
    rotor.rotation.y = Math.sin(t * 0.5) * 0.3 + 0.5

    // Smooth camera follow — lerp ángulos hacia el target del ratón
    currentAz += (targetAz - currentAz) * LERP
    currentEl += (targetEl - currentEl) * LERP

    camera.position.set(
      TARGET.x + baseRadius * Math.cos(currentEl) * Math.sin(currentAz),
      TARGET.y + baseRadius * Math.sin(currentEl),
      TARGET.z + baseRadius * Math.cos(currentEl) * Math.cos(currentAz)
    )
    camera.lookAt(TARGET)

    composer.render()
  }

  renderer.setAnimationLoop(animate)

  // ── Resize handler ────────────────────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  return { renderer, composer, onResize, onMouseMove, onMouseLeave }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function HeroWorkshop() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const { renderer, composer, onResize, onMouseMove, onMouseLeave } = buildScene()
    mount.appendChild(renderer.domElement)

    return () => {
      renderer.setAnimationLoop(null)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('mousemove',  onMouseMove)
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave)
      composer.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <section className="hero-workshop" aria-label="Taller MODWATCH">
      {/* Three.js canvas mounts here */}
      <div ref={mountRef} className="hw-canvas" aria-hidden="true" />

      {/* Vignette */}
      <div className="hw-vignette" aria-hidden="true" />

      {/* Overlay — pointer-events: none por defecto, solo el CTA recupera eventos */}
      <div className="hw-overlay">
        <div className="hw-bottom">
          <motion.p
            className="hw-tagline"
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.8, ease: EASE }}
          >
            Relojería artesanal · Sant Cugat del Vallès
          </motion.p>

          <motion.h1
            className="hw-title"
            initial={{ opacity: 0, y: 20, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            aria-label="MODWATCH"
          >
            MODWATCH
          </motion.h1>

          <motion.button
            className="btn btn-gold hw-cta"
            onClick={() => window.dispatchEvent(new CustomEvent('modwatch:enter-store'))}
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
          >
            Entrar a la tienda
          </motion.button>
        </div>
      </div>
    </section>
  )
}
