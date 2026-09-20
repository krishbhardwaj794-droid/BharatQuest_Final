import * as THREE from 'three';
import { EnvironmentTheme, SceneBuildResult, ThemeConfig } from './types';
import { Question } from '../../types';

// ============================================================================
// 1. QUESTION 1: SPECIAL 3D ASHOKA CHAKRA ENVIRONMENT
// ============================================================================
function buildChakraScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Materials: polished antique bronze & radiant gold
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x9E7344,
    roughness: 0.38,
    metalness: 0.88,
    transparent: true,
    opacity: 0.95
  });
  materials.push(bronzeMat);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xE6A84B,
    roughness: 0.28,
    metalness: 0.92
  });
  materials.push(goldMat);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x3D2E22,
    roughness: 0.85,
    metalness: 0.15
  });
  materials.push(stoneMat);

  const chakraGroup = new THREE.Group();
  chakraGroup.position.set(0, 1.2, -1.0);

  const outerRadius = 3.6;
  const innerRimRadius = 3.35;
  const hubRadius = 0.65;

  // Outer & Inner Rims
  const outerRimGeo = new THREE.TorusGeometry(outerRadius, 0.08, 20, 96);
  geometries.push(outerRimGeo);
  chakraGroup.add(new THREE.Mesh(outerRimGeo, bronzeMat));

  const innerRimGeo = new THREE.TorusGeometry(innerRimRadius, 0.05, 16, 96);
  geometries.push(innerRimGeo);
  chakraGroup.add(new THREE.Mesh(innerRimGeo, goldMat));

  // Central Hub & Boss
  const hubGeo = new THREE.CylinderGeometry(hubRadius, hubRadius, 0.35, 36);
  geometries.push(hubGeo);
  const hubMesh = new THREE.Mesh(hubGeo, goldMat);
  hubMesh.rotation.x = Math.PI / 2;
  chakraGroup.add(hubMesh);

  const bossGeo = new THREE.SphereGeometry(0.38, 24, 24);
  geometries.push(bossGeo);
  chakraGroup.add(new THREE.Mesh(bossGeo, bronzeMat));

  // 24 Spokes with tapered wedge profiles
  const spokeLen = innerRimRadius - hubRadius;
  const spokeGeo = new THREE.CylinderGeometry(0.022, 0.055, spokeLen, 12);
  geometries.push(spokeGeo);

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeo, goldMat);
    spoke.position.set(
      Math.cos(angle) * (hubRadius + spokeLen / 2),
      Math.sin(angle) * (hubRadius + spokeLen / 2),
      0
    );
    spoke.rotation.z = angle - Math.PI / 2;
    chakraGroup.add(spoke);
  }

  rootGroup.add(chakraGroup);

  // Carved Heritage Stone Pedestal beneath the Chakra
  const base1Geo = new THREE.CylinderGeometry(2.2, 2.6, 0.5, 8);
  geometries.push(base1Geo);
  const base1 = new THREE.Mesh(base1Geo, stoneMat);
  base1.position.set(0, -2.6, -1.0);
  rootGroup.add(base1);

  const base2Geo = new THREE.CylinderGeometry(1.6, 2.0, 0.4, 8);
  geometries.push(base2Geo);
  const base2 = new THREE.Mesh(base2Geo, goldMat);
  base2.position.set(0, -2.2, -1.0);
  rootGroup.add(base2);

  // Flanking heritage pillars
  const pillarGeo = new THREE.CylinderGeometry(0.35, 0.45, 6.0, 16);
  geometries.push(pillarGeo);
  const leftPillar = new THREE.Mesh(pillarGeo, stoneMat);
  leftPillar.position.set(-5.5, 0, -3.0);
  rootGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, stoneMat);
  rightPillar.position.set(5.5, 0, -3.0);
  rootGroup.add(rightPillar);

  // Lotus capital on pillars
  const capitalGeo = new THREE.ConeGeometry(0.7, 0.6, 16);
  geometries.push(capitalGeo);
  const leftCap = new THREE.Mesh(capitalGeo, goldMat);
  leftCap.position.set(-5.5, 3.2, -3.0);
  rootGroup.add(leftCap);

  const rightCap = new THREE.Mesh(capitalGeo, goldMat);
  rightCap.position.set(5.5, 3.2, -3.0);
  rootGroup.add(rightCap);

  // Floating Golden Particles
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  geometries.push(particleGeo);
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 14;
    positions[i + 1] = (Math.random() - 0.5) * 10;
    positions[i + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xFFD700,
    size: 0.12,
    transparent: true,
    opacity: 0.75
  });
  materials.push(particleMat);
  const particles = new THREE.Points(particleGeo, particleMat);
  rootGroup.add(particles);

  const update = (_time: number, delta: number) => {
    // Continuous idle rotation of the 3D Chakra
    chakraGroup.rotation.z += delta * 0.12;

    // Gentle particle floating
    const pos = particleGeo.attributes.position.array as Float32Array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] += delta * 0.25;
      if (pos[i] > 6) pos[i] = -4;
    }
    particleGeo.attributes.position.needsUpdate = true;
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// 2. HARAPPAN / ANCIENT INDIA EXCAVATION SITE
// ============================================================================
function buildHarappanScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Materials
  const brickMat = new THREE.MeshStandardMaterial({
    color: 0x9E4B28,
    roughness: 0.85,
    metalness: 0.08
  });
  materials.push(brickMat);

  const lightBrickMat = new THREE.MeshStandardMaterial({
    color: 0xBA6C3A,
    roughness: 0.80,
    metalness: 0.1
  });
  materials.push(lightBrickMat);

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x5C3B24,
    roughness: 0.95,
    metalness: 0.05
  });
  materials.push(terrainMat);

  const potteryMat = new THREE.MeshStandardMaterial({
    color: 0xBD532B,
    roughness: 0.65,
    metalness: 0.15
  });
  materials.push(potteryMat);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2A7E8C,
    roughness: 0.15,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85
  });
  materials.push(waterMat);

  // Sandy Terracotta Ground Plane
  const groundGeo = new THREE.PlaneGeometry(36, 36);
  geometries.push(groundGeo);
  const ground = new THREE.Mesh(groundGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.2;
  rootGroup.add(ground);

  // The Great Bath sunken pool in foreground
  const poolBedGeo = new THREE.PlaneGeometry(7.0, 4.5);
  geometries.push(poolBedGeo);
  const pool = new THREE.Mesh(poolBedGeo, waterMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, -2.15, 0.5);
  rootGroup.add(pool);

  // Surrounding stepped brick colonnade for the bath
  const stepGeo = new THREE.BoxGeometry(7.4, 0.2, 4.9);
  geometries.push(stepGeo);
  const poolBorder = new THREE.Mesh(stepGeo, lightBrickMat);
  poolBorder.position.set(0, -2.1, 0.5);
  rootGroup.add(poolBorder);

  // Harappan Staggered Burnt-Brick Walls & Granary Block Foundations
  const wallGeo1 = new THREE.BoxGeometry(4.2, 1.6, 0.6);
  geometries.push(wallGeo1);
  const wall1 = new THREE.Mesh(wallGeo1, brickMat);
  wall1.position.set(-4.5, -1.4, -2.5);
  rootGroup.add(wall1);

  const wallGeo2 = new THREE.BoxGeometry(0.6, 2.0, 5.0);
  geometries.push(wallGeo2);
  const wall2 = new THREE.Mesh(wallGeo2, lightBrickMat);
  wall2.position.set(4.8, -1.2, -2.0);
  rootGroup.add(wall2);

  // Granary foundation blocks (grid pattern)
  const blockGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
  geometries.push(blockGeo);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const block = new THREE.Mesh(blockGeo, brickMat);
      block.position.set(-3.5 + c * 2.0, -1.8, -5.0 - r * 1.8);
      rootGroup.add(block);
    }
  }

  // Citadel Towers & Defensive Bastions in background
  const towerGeo = new THREE.CylinderGeometry(1.1, 1.4, 4.5, 12);
  geometries.push(towerGeo);
  const leftTower = new THREE.Mesh(towerGeo, brickMat);
  leftTower.position.set(-6.5, 0.0, -8.0);
  rootGroup.add(leftTower);

  const rightTower = new THREE.Mesh(towerGeo, brickMat);
  rightTower.position.set(6.5, 0.0, -8.0);
  rootGroup.add(rightTower);

  // Steatite Monolith / Central Excavated Pillar with Glyph markings
  const steleGeo = new THREE.BoxGeometry(1.4, 3.2, 0.4);
  geometries.push(steleGeo);
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xE6A84B, roughness: 0.35, metalness: 0.8 });
  materials.push(goldTrimMat);
  const stele = new THREE.Mesh(steleGeo, goldTrimMat);
  stele.position.set(0, -0.6, -3.2);
  rootGroup.add(stele);

  // Terracotta storage jars & pottery
  const jarGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.75, 16);
  geometries.push(jarGeo);
  const jar1 = new THREE.Mesh(jarGeo, potteryMat);
  jar1.position.set(-2.2, -1.8, 1.8);
  rootGroup.add(jar1);

  const jar2 = new THREE.Mesh(jarGeo, potteryMat);
  jar2.position.set(2.4, -1.8, 2.0);
  rootGroup.add(jar2);

  // Drifting fine archaeological dust
  const dustCount = 90;
  const dustGeo = new THREE.BufferGeometry();
  geometries.push(dustGeo);
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i += 3) {
    dustPos[i] = (Math.random() - 0.5) * 16;
    dustPos[i + 1] = (Math.random() - 0.5) * 8;
    dustPos[i + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xF2C078, size: 0.09, transparent: true, opacity: 0.65 });
  materials.push(dustMat);
  const dust = new THREE.Points(dustGeo, dustMat);
  rootGroup.add(dust);

  const update = (time: number, _delta: number) => {
    stele.rotation.y = Math.sin(time * 0.4) * 0.08;
    // Water subtle ripple simulation
    pool.position.y = -2.15 + Math.sin(time * 1.5) * 0.015;
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// 3. CULTURE & TRADITIONS: INDIAN TEMPLE COURTYARD
// ============================================================================
function buildCulturalScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xD4A35F, roughness: 0.65, metalness: 0.25 });
  materials.push(stoneMat);

  const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x4A3525, roughness: 0.75, metalness: 0.3 });
  materials.push(darkStoneMat);

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF2C078, roughness: 0.3, metalness: 0.85 });
  materials.push(goldMat);

  const saffronClothMat = new THREE.MeshStandardMaterial({ color: 0xE58A2B, roughness: 0.8, side: THREE.DoubleSide });
  materials.push(saffronClothMat);

  const flameMat = new THREE.MeshBasicMaterial({ color: 0xFF9900 });
  materials.push(flameMat);

  // Courtyard Floor
  const floorGeo = new THREE.PlaneGeometry(32, 32);
  geometries.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, darkStoneMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.2;
  rootGroup.add(floor);

  // Stepped Mandapa Pavilion in Center Background
  const mandapaGeo = new THREE.BoxGeometry(6.0, 0.6, 6.0);
  geometries.push(mandapaGeo);
  const mandapa = new THREE.Mesh(mandapaGeo, stoneMat);
  mandapa.position.set(0, -1.9, -4.5);
  rootGroup.add(mandapa);

  const shikharaGeo = new THREE.ConeGeometry(2.5, 4.0, 4);
  geometries.push(shikharaGeo);
  const shikhara = new THREE.Mesh(shikharaGeo, stoneMat);
  shikhara.position.set(0, 1.8, -4.5);
  shikhara.rotation.y = Math.PI / 4;
  rootGroup.add(shikhara);

  // 6 Carved Temple Pillars with Bracketed Capitals
  const pillarGeo = new THREE.CylinderGeometry(0.32, 0.42, 4.8, 16);
  geometries.push(pillarGeo);
  const capitalGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);
  geometries.push(capitalGeo);

  const pillarX = [-4.0, -4.0, -4.0, 4.0, 4.0, 4.0];
  const pillarZ = [-1.0, -3.5, -6.0, -1.0, -3.5, -6.0];

  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(pillarGeo, stoneMat);
    p.position.set(pillarX[i], 0.2, pillarZ[i]);
    rootGroup.add(p);

    const cap = new THREE.Mesh(capitalGeo, goldMat);
    cap.position.set(pillarX[i], 2.6, pillarZ[i]);
    rootGroup.add(cap);
  }

  // 4 Brass Diya / Oil Lamps with Animated Flames & PointLights
  const diyaBaseGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.2, 16);
  geometries.push(diyaBaseGeo);
  const flameGeo = new THREE.ConeGeometry(0.12, 0.3, 12);
  geometries.push(flameGeo);

  const diyaPositions = [
    [-2.2, -1.6, 0.2],
    [2.2, -1.6, 0.2],
    [-2.2, -1.6, -2.6],
    [2.2, -1.6, -2.6]
  ];

  const flames: THREE.Mesh[] = [];
  const flameLights: THREE.PointLight[] = [];

  diyaPositions.forEach(([x, y, z]) => {
    const dBase = new THREE.Mesh(diyaBaseGeo, goldMat);
    dBase.position.set(x, y, z);
    rootGroup.add(dBase);

    const fl = new THREE.Mesh(flameGeo, flameMat);
    fl.position.set(x, y + 0.75, z);
    rootGroup.add(fl);
    flames.push(fl);

    const pLight = new THREE.PointLight(0xFFB347, 1.2, 6.0);
    pLight.position.set(x, y + 0.8, z);
    rootGroup.add(pLight);
    flameLights.push(pLight);
  });

  // Festive Marigold Garlands (alternating saffron & gold spheres)
  const flowerGeo = new THREE.SphereGeometry(0.1, 8, 8);
  geometries.push(flowerGeo);
  const marigoldOrange = new THREE.MeshBasicMaterial({ color: 0xE58A2B });
  materials.push(marigoldOrange);
  const marigoldYellow = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
  materials.push(marigoldYellow);

  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const x = -4.0 + t * 8.0;
    const y = 2.4 - Math.sin(t * Math.PI) * 0.8;
    const flower = new THREE.Mesh(flowerGeo, i % 2 === 0 ? marigoldOrange : marigoldYellow);
    flower.position.set(x, y, -1.0);
    rootGroup.add(flower);
  }

  // Waving Temple Flags on Pavilion Top
  const flagGeo = new THREE.BufferGeometry();
  geometries.push(flagGeo);
  const flagVertices = new Float32Array([
    0, 0, 0,
    1.4, 0.4, 0,
    0, 0.8, 0
  ]);
  flagGeo.setAttribute('position', new THREE.BufferAttribute(flagVertices, 3));
  const flagMesh = new THREE.Mesh(flagGeo, saffronClothMat);
  flagMesh.position.set(0, 3.8, -4.5);
  rootGroup.add(flagMesh);

  const update = (time: number, _delta: number) => {
    // Flickering diya flames
    flames.forEach((fl, idx) => {
      const scale = 1.0 + Math.sin(time * 8 + idx) * 0.22;
      fl.scale.set(scale, scale * 1.15, scale);
      if (flameLights[idx]) {
        flameLights[idx].intensity = 1.1 + Math.sin(time * 10 + idx * 2) * 0.4;
      }
    });

    // Flag wave
    flagMesh.rotation.y = Math.sin(time * 3) * 0.25;
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// 4. HISTORICAL / MEDIEVAL HILL FORT ENVIRONMENT
// ============================================================================
function buildHistoricalScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const rampartMat = new THREE.MeshStandardMaterial({ color: 0x6E5D4F, roughness: 0.85, metalness: 0.2 });
  materials.push(rampartMat);

  const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xB8860B, roughness: 0.65, metalness: 0.35 });
  materials.push(sandstoneMat);

  const bronzeCannonMat = new THREE.MeshStandardMaterial({ color: 0x4A3B2C, roughness: 0.4, metalness: 0.85 });
  materials.push(bronzeCannonMat);

  const saffronBannerMat = new THREE.MeshStandardMaterial({ color: 0xE58A2B, roughness: 0.7, side: THREE.DoubleSide });
  materials.push(saffronBannerMat);

  // Fort Rampart Wall
  const wallGeo = new THREE.BoxGeometry(16, 3.2, 2.0);
  geometries.push(wallGeo);
  const wall = new THREE.Mesh(wallGeo, rampartMat);
  wall.position.set(0, -1.0, -3.5);
  rootGroup.add(wall);

  // Battlements / Crenellations
  const merlonGeo = new THREE.BoxGeometry(0.9, 0.7, 0.5);
  geometries.push(merlonGeo);
  for (let i = -7; i <= 7; i += 1.6) {
    const merlon = new THREE.Mesh(merlonGeo, sandstoneMat);
    merlon.position.set(i, 0.95, -2.7);
    rootGroup.add(merlon);
  }

  // Circular Bastion Tower
  const towerGeo = new THREE.CylinderGeometry(2.0, 2.4, 6.0, 20);
  geometries.push(towerGeo);
  const bastion = new THREE.Mesh(towerGeo, rampartMat);
  bastion.position.set(-6.5, 0.5, -5.0);
  rootGroup.add(bastion);

  const domeGeo = new THREE.SphereGeometry(2.05, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  geometries.push(domeGeo);
  const bastionDome = new THREE.Mesh(domeGeo, sandstoneMat);
  bastionDome.position.set(-6.5, 3.5, -5.0);
  rootGroup.add(bastionDome);

  // Historical Bronze Cannon mounted on rampart
  const barrelGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.2, 16);
  geometries.push(barrelGeo);
  const barrel = new THREE.Mesh(barrelGeo, bronzeCannonMat);
  barrel.rotation.z = Math.PI / 2;
  barrel.rotation.y = 0.3;
  barrel.position.set(2.5, 0.6, -2.4);
  rootGroup.add(barrel);

  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16);
  geometries.push(wheelGeo);
  const wheel1 = new THREE.Mesh(wheelGeo, sandstoneMat);
  wheel1.rotation.x = Math.PI / 2;
  wheel1.position.set(2.0, 0.45, -2.7);
  rootGroup.add(wheel1);

  // Waving Royal Saffron Flag
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.0, 8);
  geometries.push(poleGeo);
  const pole = new THREE.Mesh(poleGeo, sandstoneMat);
  pole.position.set(-6.5, 5.5, -5.0);
  rootGroup.add(pole);

  const bannerGeo = new THREE.PlaneGeometry(2.2, 1.3, 10, 6);
  geometries.push(bannerGeo);
  const banner = new THREE.Mesh(bannerGeo, saffronBannerMat);
  banner.position.set(-5.3, 6.8, -5.0);
  rootGroup.add(banner);

  // Floating embers / dust particles
  const emberCount = 80;
  const emberGeo = new THREE.BufferGeometry();
  geometries.push(emberGeo);
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount * 3; i += 3) {
    emberPos[i] = (Math.random() - 0.5) * 14;
    emberPos[i + 1] = (Math.random() - 0.5) * 8;
    emberPos[i + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const emberMat = new THREE.PointsMaterial({ color: 0xFFB347, size: 0.14, transparent: true, opacity: 0.8 });
  materials.push(emberMat);
  const embers = new THREE.Points(emberGeo, emberMat);
  rootGroup.add(embers);

  const update = (time: number, delta: number) => {
    // Banner wave
    const bannerPos = bannerGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < bannerPos.length; i += 3) {
      const vx = bannerPos[i];
      bannerPos[i + 2] = Math.sin(time * 4 + vx * 2) * 0.25;
    }
    bannerGeo.attributes.position.needsUpdate = true;

    // Embers drift
    const ePos = emberGeo.attributes.position.array as Float32Array;
    for (let i = 1; i < ePos.length; i += 3) {
      ePos[i] += delta * 0.45;
      if (ePos[i] > 6) ePos[i] = -2;
    }
    emberGeo.attributes.position.needsUpdate = true;
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// 5. SCIENTIFIC: ANCIENT OBSERVATORY (JANTAR MANTAR)
// ============================================================================
function buildScientificScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xFFF4DC, roughness: 0.35, metalness: 0.2 });
  materials.push(marbleMat);

  const terracottaRedMat = new THREE.MeshStandardMaterial({ color: 0xA8422B, roughness: 0.75, metalness: 0.15 });
  materials.push(terracottaRedMat);

  const brassMat = new THREE.MeshStandardMaterial({ color: 0xE6A84B, roughness: 0.25, metalness: 0.95 });
  materials.push(brassMat);

  // Observatory Platform
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  geometries.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, terracottaRedMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.2;
  rootGroup.add(floor);

  // Huge Triangular Samrat Yantra Sundial Gnomon
  const gnomonShape = new THREE.Shape();
  gnomonShape.moveTo(0, 0);
  gnomonShape.lineTo(6.5, 0);
  gnomonShape.lineTo(0, 5.2);
  gnomonShape.closePath();

  const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const gnomonGeo = new THREE.ExtrudeGeometry(gnomonShape, extrudeSettings);
  geometries.push(gnomonGeo);
  const gnomon = new THREE.Mesh(gnomonGeo, terracottaRedMat);
  gnomon.position.set(-2.0, -2.2, -6.0);
  rootGroup.add(gnomon);

  // Curved Quadrant Scale on Sundial
  const quadrantGeo = new THREE.TorusGeometry(3.5, 0.2, 12, 32, Math.PI / 2);
  geometries.push(quadrantGeo);
  const quadrant = new THREE.Mesh(quadrantGeo, marbleMat);
  quadrant.position.set(0.5, -1.0, -5.5);
  quadrant.rotation.z = -Math.PI / 4;
  rootGroup.add(quadrant);

  // Central Brass Armillary Sphere (3 Rotating Rings)
  const armillaryGroup = new THREE.Group();
  armillaryGroup.position.set(0, 0.4, -2.2);

  const ringGeo1 = new THREE.TorusGeometry(1.6, 0.06, 16, 64);
  geometries.push(ringGeo1);
  const ring1 = new THREE.Mesh(ringGeo1, brassMat);
  armillaryGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(1.3, 0.05, 16, 64);
  geometries.push(ringGeo2);
  const ring2 = new THREE.Mesh(ringGeo2, brassMat);
  ring2.rotation.x = Math.PI / 3;
  armillaryGroup.add(ring2);

  const ringGeo3 = new THREE.TorusGeometry(1.0, 0.04, 16, 64);
  geometries.push(ringGeo3);
  const ring3 = new THREE.Mesh(ringGeo3, brassMat);
  ring3.rotation.y = Math.PI / 3;
  armillaryGroup.add(ring3);

  // Central celestial orb
  const celestialOrbGeo = new THREE.SphereGeometry(0.3, 24, 24);
  geometries.push(celestialOrbGeo);
  const orb = new THREE.Mesh(celestialOrbGeo, brassMat);
  armillaryGroup.add(orb);

  rootGroup.add(armillaryGroup);

  // Pedestal for armillary sphere
  const pedGeo = new THREE.CylinderGeometry(0.4, 0.6, 2.0, 16);
  geometries.push(pedGeo);
  const ped = new THREE.Mesh(pedGeo, marbleMat);
  ped.position.set(0, -1.2, -2.2);
  rootGroup.add(ped);

  // Night Celestial Sky Dome: 600 Twinkling Stars
  const starCount = 600;
  const starGeo = new THREE.BufferGeometry();
  geometries.push(starGeo);
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    const r = 18 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    starPos[i] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i + 1] = r * Math.cos(phi);
    starPos[i + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xE8F0FE, size: 0.18, transparent: true, opacity: 0.9 });
  materials.push(starMat);
  const stars = new THREE.Points(starGeo, starMat);
  rootGroup.add(stars);

  const update = (time: number, delta: number) => {
    // Multi-axis rotation of celestial armillary sphere
    ring1.rotation.z += delta * 0.4;
    ring2.rotation.x += delta * 0.3;
    ring3.rotation.y += delta * 0.25;

    // Slow celestial sphere drift
    stars.rotation.y = time * 0.015;
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// 6. GEOGRAPHICAL: HIMALAYAN RIVER VALLEY
// ============================================================================
function buildGeographicalScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const grassMat = new THREE.MeshStandardMaterial({ color: 0x587A4A, roughness: 0.85, metalness: 0.1 });
  materials.push(grassMat);

  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x3D5233, roughness: 0.9, metalness: 0.05 });
  materials.push(mountainMat);

  const snowMat = new THREE.MeshStandardMaterial({ color: 0xFAFCFF, roughness: 0.25, metalness: 0.2 });
  materials.push(snowMat);

  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x4C8DB5,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88
  });
  materials.push(riverMat);

  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4A2E1B, roughness: 0.9 });
  materials.push(treeTrunkMat);

  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2E5424, roughness: 0.7 });
  materials.push(foliageMat);

  // Valley Basin Ground
  const valleyGeo = new THREE.PlaneGeometry(36, 36, 24, 24);
  geometries.push(valleyGeo);
  const valley = new THREE.Mesh(valleyGeo, grassMat);
  valley.rotation.x = -Math.PI / 2;
  valley.position.y = -2.2;
  rootGroup.add(valley);

  // Meandering Flowing River
  const riverGeo = new THREE.PlaneGeometry(5.0, 32, 16, 32);
  geometries.push(riverGeo);
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, -2.15, 0);
  rootGroup.add(river);

  // Distant Mountain Peaks with Snow Caps
  const mountainPeakGeo = new THREE.ConeGeometry(4.5, 7.0, 5);
  geometries.push(mountainPeakGeo);

  const leftMountain = new THREE.Mesh(mountainPeakGeo, mountainMat);
  leftMountain.position.set(-8.0, 1.2, -10.0);
  rootGroup.add(leftMountain);

  const rightMountain = new THREE.Mesh(mountainPeakGeo, mountainMat);
  rightMountain.position.set(8.0, 1.8, -11.0);
  rootGroup.add(rightMountain);

  // Snow caps
  const snowCapGeo = new THREE.ConeGeometry(1.8, 2.8, 5);
  geometries.push(snowCapGeo);
  const leftSnow = new THREE.Mesh(snowCapGeo, snowMat);
  leftSnow.position.set(-8.0, 3.4, -10.0);
  rootGroup.add(leftSnow);

  const rightSnow = new THREE.Mesh(snowCapGeo, snowMat);
  rightSnow.position.set(8.0, 4.0, -11.0);
  rootGroup.add(rightSnow);

  // Procedural Sal / Pine Trees
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.2, 8);
  geometries.push(trunkGeo);
  const foliageConeGeo = new THREE.ConeGeometry(0.7, 1.6, 8);
  geometries.push(foliageConeGeo);

  const treeCoords = [
    [-4.5, -0.5], [-3.8, 1.5], [-5.2, -2.5], [-3.5, -4.5],
    [4.2, -0.8], [3.6, 1.8], [5.0, -2.2], [3.8, -4.8]
  ];

  treeCoords.forEach(([tx, tz]) => {
    const tr = new THREE.Mesh(trunkGeo, treeTrunkMat);
    tr.position.set(tx, -1.6, tz);
    rootGroup.add(tr);

    const fol = new THREE.Mesh(foliageConeGeo, foliageMat);
    fol.position.set(tx, -0.6, tz);
    rootGroup.add(fol);
  });

  // Flock of birds flying overhead
  const birdCount = 6;
  const birdGeo = new THREE.ConeGeometry(0.15, 0.5, 3);
  geometries.push(birdGeo);
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x1A2530 });
  materials.push(birdMat);
  const birdGroup = new THREE.Group();

  for (let i = 0; i < birdCount; i++) {
    const bird = new THREE.Mesh(birdGeo, birdMat);
    bird.rotation.x = Math.PI / 2;
    bird.position.set(i * 0.8 - 2.0, (i % 2) * 0.3, (i % 3) * 0.4);
    birdGroup.add(bird);
  }
  birdGroup.position.set(0, 4.0, -5.0);
  rootGroup.add(birdGroup);

  const update = (time: number, _delta: number) => {
    // Continuous flowing river animation via subtle vertex undulating
    const rPos = riverGeo.attributes.position.array as Float32Array;
    for (let i = 2; i < rPos.length; i += 3) {
      rPos[i] = Math.sin(time * 3 + rPos[i - 1] * 0.5) * 0.05;
    }
    riverGeo.attributes.position.needsUpdate = true;

    // Orbiting birds
    birdGroup.position.x = Math.sin(time * 0.5) * 4.5;
    birdGroup.position.z = -5.0 + Math.cos(time * 0.5) * 2.0;
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// 7. FREEDOM MOVEMENT: MONUMENTAL ARCHITECTURE & SWARAJ GROUNDS
// ============================================================================
function buildFreedomScene(): SceneBuildResult {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xE6A84B, roughness: 0.6, metalness: 0.3 });
  materials.push(stoneMat);

  const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xFFF4DC, roughness: 0.4, metalness: 0.2 });
  materials.push(ivoryMat);

  const saffronMat = new THREE.MeshStandardMaterial({ color: 0xE58A2B, side: THREE.DoubleSide });
  materials.push(saffronMat);
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
  materials.push(whiteMat);
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x2E6B34, side: THREE.DoubleSide });
  materials.push(greenMat);

  // Stepped Assembly Courtyard
  const courtGeo = new THREE.PlaneGeometry(30, 30);
  geometries.push(courtGeo);
  const court = new THREE.Mesh(courtGeo, stoneMat);
  court.rotation.x = -Math.PI / 2;
  court.position.y = -2.2;
  rootGroup.add(court);

  // Monumental Colonnade & Arched Portico in background
  const archWallGeo = new THREE.BoxGeometry(14.0, 4.5, 1.5);
  geometries.push(archWallGeo);
  const archWall = new THREE.Mesh(archWallGeo, ivoryMat);
  archWall.position.set(0, 0.05, -5.0);
  rootGroup.add(archWall);

  // Colonnade Pillars
  const colGeo = new THREE.CylinderGeometry(0.4, 0.5, 4.8, 16);
  geometries.push(colGeo);
  for (let i = -5; i <= 5; i += 2.5) {
    const col = new THREE.Mesh(colGeo, stoneMat);
    col.position.set(i, 0.2, -4.0);
    rootGroup.add(col);
  }

  // Raised Speaker Rostrum / Dais
  const daisGeo = new THREE.BoxGeometry(3.6, 0.6, 2.6);
  geometries.push(daisGeo);
  const dais = new THREE.Mesh(daisGeo, stoneMat);
  dais.position.set(0, -1.9, -1.5);
  rootGroup.add(dais);

  // Grand Flagstaff with Indian Tricolor Banner
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.5, 12);
  geometries.push(poleGeo);
  const pole = new THREE.Mesh(poleGeo, ivoryMat);
  pole.position.set(0, 1.5, -1.5);
  rootGroup.add(pole);

  // Tricolor flag (3 stripes)
  const stripeGeo = new THREE.PlaneGeometry(2.4, 0.45, 8, 2);
  geometries.push(stripeGeo);

  const saffronStripe = new THREE.Mesh(stripeGeo, saffronMat);
  saffronStripe.position.set(1.2, 4.35, -1.5);
  rootGroup.add(saffronStripe);

  const whiteStripe = new THREE.Mesh(stripeGeo, whiteMat);
  whiteStripe.position.set(1.2, 3.9, -1.5);
  rootGroup.add(whiteStripe);

  const greenStripe = new THREE.Mesh(stripeGeo, greenMat);
  greenStripe.position.set(1.2, 3.45, -1.5);
  rootGroup.add(greenStripe);

  const update = (time: number, _delta: number) => {
    // Fluid flag waving
    [saffronStripe, whiteStripe, greenStripe].forEach((stripe) => {
      stripe.rotation.y = Math.sin(time * 3.5) * 0.22;
    });
  };

  return { rootGroup, update, geometries, materials };
}

// ============================================================================
// THEME CONFIGURATIONS REPOSITORY (BRIGHTER CINEMATIC PALETTE)
// ============================================================================
export const THEME_CONFIGS: Record<EnvironmentTheme, ThemeConfig> = {
  chakra: {
    id: 'chakra',
    title: 'Ashoka Chakra — Introduction Sanctum',
    subtitle: 'Question 1 · The 24-Spoke Wheel of Righteousness & Heritage',
    skyTopColor: 0x102033,
    skyBottomColor: 0xE6A84B,
    fogColor: 0x1B283A,
    fogNear: 12,
    fogFar: 38,
    ambientColor: 0xFFEBD2,
    ambientIntensity: 1.25,
    sunColor: 0xFFD280,
    sunIntensity: 1.6,
    sunPosition: [4, 6, 8],
    initialCamera: [0, 0.6, 8.5],
    cameraTarget: [0, 0.4, 0],
    zoomLimits: [5.5, 12.0],
    polarLimits: [Math.PI / 4, Math.PI / 2 + 0.1],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildChakraScene
  },
  harappan: {
    id: 'harappan',
    title: 'Harappan Archaeological Excavation Realm',
    subtitle: 'Indus Valley Civilization · Great Bath, Granary & Steatite Seals',
    skyTopColor: 0x4C8DB5,
    skyBottomColor: 0xFFF4DC,
    fogColor: 0xC4986E,
    fogNear: 14,
    fogFar: 42,
    ambientColor: 0xFFF1DC,
    ambientIntensity: 1.35,
    sunColor: 0xFFE4B5,
    sunIntensity: 1.7,
    sunPosition: [6, 8, 7],
    initialCamera: [0, 1.2, 9.0],
    cameraTarget: [0, -0.4, -1.0],
    zoomLimits: [6.0, 13.0],
    polarLimits: [Math.PI / 4, Math.PI / 2],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildHarappanScene
  },
  cultural: {
    id: 'cultural',
    title: 'Indian Temple Courtyard & Festive Sanctum',
    subtitle: 'Living Heritages · Carved Mandapa Pillars, Flickering Diyas & Marigold Garlands',
    skyTopColor: 0x2A3E59,
    skyBottomColor: 0xF2C078,
    fogColor: 0x3E2D20,
    fogNear: 12,
    fogFar: 36,
    ambientColor: 0xFFE4C4,
    ambientIntensity: 1.3,
    sunColor: 0xFFC266,
    sunIntensity: 1.65,
    sunPosition: [5, 7, 6],
    initialCamera: [0, 0.8, 8.5],
    cameraTarget: [0, 0.0, -1.5],
    zoomLimits: [5.5, 12.0],
    polarLimits: [Math.PI / 4, Math.PI / 2],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildCulturalScene
  },
  historical: {
    id: 'historical',
    title: 'Medieval Hill Fortress & Royal Ramparts',
    subtitle: 'Historic Empires · Stone Bastions, Waving Banners & Mountain Canyon',
    skyTopColor: 0x1A2840,
    skyBottomColor: 0xE58A2B,
    fogColor: 0x483220,
    fogNear: 15,
    fogFar: 45,
    ambientColor: 0xFFDDBB,
    ambientIntensity: 1.3,
    sunColor: 0xFF9944,
    sunIntensity: 1.8,
    sunPosition: [-6, 6, 8],
    initialCamera: [0, 1.0, 9.0],
    cameraTarget: [0, 0.2, -1.0],
    zoomLimits: [6.0, 13.0],
    polarLimits: [Math.PI / 4, Math.PI / 2],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildHistoricalScene
  },
  scientific: {
    id: 'scientific',
    title: 'Jantar Mantar Astronomical Observatory',
    subtitle: 'Ancient Innovations · Samrat Yantra Sundial & Rotating Celestial Sphere',
    skyTopColor: 0x0C1626,
    skyBottomColor: 0x223654,
    fogColor: 0x102033,
    fogNear: 16,
    fogFar: 48,
    ambientColor: 0xC8DCF5,
    ambientIntensity: 1.15,
    sunColor: 0xAAD4FF,
    sunIntensity: 1.4,
    sunPosition: [3, 9, 5],
    initialCamera: [0, 1.0, 8.5],
    cameraTarget: [0, 0.2, -1.0],
    zoomLimits: [5.5, 12.5],
    polarLimits: [Math.PI / 4, Math.PI / 2],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildScientificScene
  },
  geographical: {
    id: 'geographical',
    title: 'Himalayan River Valley & Sacred Confluence',
    subtitle: 'Geography of Bharat · Flowing River, Pine Valleys & Distant Snow Peaks',
    skyTopColor: 0x4C8DB5,
    skyBottomColor: 0xFFF4DC,
    fogColor: 0x6E8A72,
    fogNear: 15,
    fogFar: 46,
    ambientColor: 0xFFFFFF,
    ambientIntensity: 1.45,
    sunColor: 0xFFF5E6,
    sunIntensity: 1.85,
    sunPosition: [5, 9, 7],
    initialCamera: [0, 1.4, 9.2],
    cameraTarget: [0, -0.2, -1.0],
    zoomLimits: [6.0, 13.5],
    polarLimits: [Math.PI / 4, Math.PI / 2],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildGeographicalScene
  },
  freedom: {
    id: 'freedom',
    title: 'Swaraj Rally Grounds & Monumental Architecture',
    subtitle: 'Freedom Movement · Historic Colonnade & Waving National Tiranga',
    skyTopColor: 0x2A3E59,
    skyBottomColor: 0xFFE0B2,
    fogColor: 0x3E3224,
    fogNear: 14,
    fogFar: 42,
    ambientColor: 0xFFEBD2,
    ambientIntensity: 1.35,
    sunColor: 0xFFC870,
    sunIntensity: 1.7,
    sunPosition: [4, 7, 7],
    initialCamera: [0, 1.0, 8.5],
    cameraTarget: [0, 0.2, -1.0],
    zoomLimits: [5.5, 12.0],
    polarLimits: [Math.PI / 4, Math.PI / 2],
    azimuthLimits: [-Math.PI / 2.5, Math.PI / 2.5],
    buildScene: buildFreedomScene
  }
};

// ============================================================================
// DYNAMIC THEME DETERMINATION (QUESTION 1 = CHAKRA; QUESTION 2+ = QUEST SPECIFIC)
// ============================================================================
export function getEnvironmentTheme(
  missionId: string,
  questionIndex: number,
  question?: Question
): EnvironmentTheme {
  // CRITICAL SPECIAL RULE: Ashoka Chakra ONLY on Question 1 (index 0)
  if (questionIndex === 0) {
    return 'chakra';
  }

  // Question 2 onward: dynamically load environment based on quest and question topic
  if (missionId === 'ancient-india-01') {
    // Dynamic journey through Harappa, Culture, Science, Geography
    const sequence: EnvironmentTheme[] = ['chakra', 'harappan', 'cultural', 'scientific', 'geographical'];
    return sequence[questionIndex % sequence.length] || 'harappan';
  }

  if (missionId === 'explore-india-02') {
    const sequence: EnvironmentTheme[] = ['chakra', 'geographical', 'historical', 'cultural'];
    return sequence[questionIndex % sequence.length] || 'geographical';
  }

  if (missionId === 'culture-traditions-03') {
    const sequence: EnvironmentTheme[] = ['chakra', 'cultural', 'historical', 'cultural', 'scientific'];
    return sequence[questionIndex % sequence.length] || 'cultural';
  }

  if (missionId === 'freedom-movement-04') {
    const sequence: EnvironmentTheme[] = ['chakra', 'freedom', 'historical', 'freedom', 'cultural'];
    return sequence[questionIndex % sequence.length] || 'freedom';
  }

  // Fallback by question topic / keyword
  if (question) {
    const topic = (question.topic || '').toLowerCase();
    const text = (question.question + ' ' + (question.title || '')).toLowerCase();
    if (topic.includes('geography') || text.includes('river') || text.includes('mountain')) {
      return 'geographical';
    }
    if (topic.includes('culture') || text.includes('temple') || text.includes('art') || text.includes('dance')) {
      return 'cultural';
    }
    if (text.includes('sundial') || text.includes('astronomy') || text.includes('science') || text.includes('observatory')) {
      return 'scientific';
    }
    if (text.includes('freedom') || text.includes('swaraj') || text.includes('independence')) {
      return 'freedom';
    }
  }

  return 'historical';
}
