// ============================================================
// PEAK COMMANDO — Sistema de Armas y Herramientas Detallado
// Modelos 3D procedurales, mecánicas únicas y efectos visuales
// ============================================================

import * as THREE from 'three';

export type WeaponType = 
  | 'garrote_femur' | 'lanza_colmillo' | 'antorcha_resina' | 'hueso_boomerang'
  | 'espada_oxidada' | 'martillo_campana' | 'ballesta_clavos' | 'gancho_andamio'
  | 'culata_revolver' | 'cuchillo_bufalo' | 'dinamita' | 'lazo_cowboy'
  | 'cuchillo_tactico' | 'pala_trinchera' | 'granada_humo' | 'machete_selva'
  | 'bat_chatarra' | 'pistola_pernos' | 'escudo_holografico' | 'cortador_laser';

export interface WeaponModel {
  mesh: THREE.Group;
  swingAxis: 'x' | 'y' | 'z';
  swingArc: number;
  swingSpeed: number;
  light?: THREE.PointLight;
  particleEmitter?: THREE.Mesh;
}

export interface WeaponStats {
  damage: number;
  range: number;
  attackRate: number;
  knockback: number;
  staminaCost: number;
  specialEffect?: 'fire' | 'stun' | 'pull' | 'push' | 'explosion';
}

/**
 * Construye el modelo 3D detallado de un arma según su tipo
 */
export function buildWeaponModel(weaponType: WeaponType, eraAccent: number): WeaponModel {
  const group = new THREE.Group();
  let swingAxis: 'x' | 'y' | 'z' = 'x';
  let swingArc = 1.2;
  let swingSpeed = 1.0;
  let light: THREE.PointLight | undefined;
  
  switch (weaponType) {
    // ==================== PREHISTORIA ====================
    case 'garrote_femur': {
      // Garrote huesudo con textura irregular
      const boneMat = new THREE.MeshLambertMaterial({ color: 0xe8dcc8 });
      const marrowMat = new THREE.MeshLambertMaterial({ color: 0x8a5a33 });
      
      // Eje principal del fémur
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 1.4, 7),
        boneMat
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = -0.3;
      
      // Cabeza del fémur (bola articular)
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 7, 7),
        boneMat
      );
      head.position.z = -1.0;
      
      // Condilos (protuberancias)
      const condyle1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 6, 6),
        marrowMat
      );
      condyle1.position.set(0.09, 0, -1.05);
      
      const condyle2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 6, 6),
        marrowMat
      );
      condyle2.position.set(-0.09, 0, -1.05);
      
      // Grietas y detalles
      for (let i = 0; i < 5; i++) {
        const crack = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.08, 0.15 + Math.random() * 0.2),
          new THREE.MeshLambertMaterial({ color: 0x5a4a3a })
        );
        crack.position.set(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.1,
          -0.2 - Math.random() * 0.8
        );
        crack.rotation.z = Math.random() * Math.PI;
        group.add(crack);
      }
      
      group.add(shaft, head, condyle1, condyle2);
      swingAxis = 'x';
      swingArc = 1.4;
      break;
    }
    
    case 'lanza_colmillo': {
      // Lanza con punta de colmillo
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x8a5a33 });
      const ivoryMat = new THREE.MeshStandardMaterial({ 
        color: 0xf5ebe0,
        roughness: 0.4
      });
      const sinewMat = new THREE.MeshLambertMaterial({ color: 0x6a5a4a });
      
      // Asta de madera
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 2.2, 6),
        woodMat
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = -0.7;
      
      // Punta de colmillo curvada
      const tipGeom = new THREE.ConeGeometry(0.08, 0.6, 7);
      const tip = new THREE.Mesh(tipGeom, ivoryMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.z = -1.85;
      
      // Curvatura del colmillo
      const curve = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.05, 5, 12, Math.PI / 3),
        ivoryMat
      );
      curve.rotation.y = Math.PI / 2;
      curve.position.z = -1.6;
      
      // Ataduras de tendón
      const binding1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.065, 0.025, 6, 8),
        sinewMat
      );
      binding1.rotation.x = Math.PI / 2;
      binding1.position.z = -1.5;
      
      const binding2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.025, 6, 8),
        sinewMat
      );
      binding2.rotation.x = Math.PI / 2;
      binding2.position.z = -1.3;
      
      group.add(shaft, tip, curve, binding1, binding2);
      swingAxis = 'z';
      swingArc = 0.8;
      swingSpeed = 0.7;
      break;
    }
    
    case 'antorcha_resina': {
      // Antorcha con fuego dinámico
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a3a });
      const resinMat = new THREE.MeshLambertMaterial({ 
        color: 0xff6a1a,
        emissive: 0xff3300,
        emissiveIntensity: 0.3
      });
      
      // Mango
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, 1.0, 7),
        woodMat
      );
      handle.rotation.x = Math.PI / 2;
      handle.position.z = -0.3;
      
      // Cabeza con resina
      const head = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.15, 1),
        resinMat
      );
      head.position.z = -0.85;
      
      // Fuego dinámico (mesh translúcido)
      const fireGeom = new THREE.ConeGeometry(0.12, 0.5, 7);
      const fireMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const fire = new THREE.Mesh(fireGeom, fireMat);
      fire.rotation.x = Math.PI / 2;
      fire.position.z = -1.15;
      fire.name = 'fire';
      group.add(fire);
      
      // Luz dinámica del fuego
      light = new THREE.PointLight(0xff6600, 1.5, 8);
      light.position.set(0, 0, -1.2);
      group.add(light);
      
      // Partículas de chispas (placeholder)
      const sparks = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.03, 0),
        new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.6 })
      );
      sparks.position.z = -1.4;
      sparks.name = 'sparks';
      group.add(sparks);
      
      group.add(handle, head);
      swingAxis = 'x';
      swingArc = 1.1;
      break;
    }
    
    // ==================== MEDIEVAL ====================
    case 'espada_oxidada': {
      const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0xb8c0c8,
        roughness: 0.7
      });
      const rustMat = new THREE.MeshStandardMaterial({ 
        color: 0x8a5a4a,
        roughness: 0.9
      });
      const leatherMat = new THREE.MeshLambertMaterial({ color: 0x5a4a3a });
      
      // Hoja con óxido
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.03, 1.4),
        steelMat
      );
      blade.position.z = -0.9;
      
      // Bordes oxidados
      const rustEdge1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.025, 1.3),
        rustMat
      );
      rustEdge1.position.set(0.06, 0, -0.9);
      
      const rustEdge2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.025, 1.3),
        rustMat
      );
      rustEdge2.position.set(-0.06, 0, -0.9);
      
      // Guarda cruzada
      const crossguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.08),
        steelMat
      );
      crossguard.position.z = -0.2;
      
      // Empuñadura de cuero
      const grip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.35, 7),
        leatherMat
      );
      grip.rotation.x = Math.PI / 2;
      grip.position.z = 0.15;
      
      // Pomel
      const pommel = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 7, 7),
        steelMat
      );
      pommel.position.z = 0.35;
      
      group.add(blade, rustEdge1, rustEdge2, crossguard, grip, pommel);
      swingAxis = 'x';
      swingArc = 1.3;
      break;
    }
    
    case 'martillo_campana': {
      const metalMat = new THREE.MeshLambertMaterial({ color: 0xa89888 });
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a3a });
      
      // Mango
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, 1.2, 7),
        woodMat
      );
      handle.rotation.x = Math.PI / 2;
      handle.position.z = -0.4;
      
      // Cabeza del martillo (forma de campana)
      const bellHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.18, 0.35, 8),
        metalMat
      );
      bellHead.rotation.x = Math.PI / 2;
      bellHead.position.z = -0.95;
      
      // Detalle de campana (ahuecado)
      const bellCavity = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.12, 0.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x5a4a3a })
      );
      bellCavity.rotation.x = Math.PI / 2;
      bellCavity.position.z = -1.05;
      
      // Anillo decorativo
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.02, 6, 10),
        metalMat
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.z = -0.85;
      
      group.add(handle, bellHead, bellCavity, ring);
      swingAxis = 'x';
      swingArc = 1.5;
      swingSpeed = 0.6;
      break;
    }
    
    // ==================== OESTE ====================
    case 'culata_revolver': {
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a3a });
      const metalMat = new THREE.MeshLambertMaterial({ color: 0x4a4f5a });
      
      // Culata de madera
      const stock = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.12, 0.6),
        woodMat
      );
      stock.position.z = -0.2;
      
      // Cañón metálico
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.5, 7),
        metalMat
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = -0.65;
      
      // Gatillo
      const trigger = new THREE.Mesh(
        new THREE.TorusGeometry(0.03, 0.015, 5, 8, Math.PI),
        metalMat
      );
      trigger.rotation.x = Math.PI / 2;
      trigger.position.set(0, -0.05, -0.15);
      
      // Mira delantera
      const sight = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.05, 0.03),
        metalMat
      );
      sight.position.set(0, 0.06, -0.88);
      
      group.add(stock, barrel, trigger, sight);
      swingAxis = 'x';
      swingArc = 0.7;
      swingSpeed = 1.4;
      break;
    }
    
    case 'dinamita': {
      const paperMat = new THREE.MeshLambertMaterial({ color: 0xc4a484 });
      const fuseMat = new THREE.MeshLambertMaterial({ color: 0x8a6a4a });
      
      // Palos de dinamita agrupados
      const bundle = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const stick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.5, 7),
          paperMat
        );
        stick.rotation.x = Math.PI / 2;
        stick.position.set((i - 1) * 0.09, 0, 0);
        bundle.add(stick);
      }
      
      // Cinta que une los palos
      const tape = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.025, 6, 10),
        new THREE.MeshLambertMaterial({ color: 0x8a3a3a })
      );
      tape.rotation.y = Math.PI / 2;
      bundle.add(tape);
      
      // Mecha
      const fuse = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5),
        fuseMat
      );
      fuse.rotation.x = Math.PI / 2;
      fuse.position.set(0, 0.05, 0.28);
      bundle.add(fuse);
      
      group.add(bundle);
      swingAxis = 'y';
      swingArc = 0.9;
      break;
    }
    
    // ==================== FUTURO ====================
    case 'bat_chatarra': {
      const scrapMat = new THREE.MeshStandardMaterial({ 
        color: 0x6a7080,
        roughness: 0.8
      });
      const neonMat = new THREE.MeshBasicMaterial({ 
        color: 0xff3bd4,
        transparent: true,
        opacity: 0.7
      });
      
      // Base del bate (tubo principal)
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 1.3, 7),
        scrapMat
      );
      tube.rotation.x = Math.PI / 2;
      tube.position.z = -0.35;
      
      // Chatarra soldada (placas irregulares)
      for (let i = 0; i < 6; i++) {
        const plate = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.02, 0.2 + Math.random() * 0.3),
          scrapMat
        );
        plate.position.set(
          (Math.random() - 0.5) * 0.1,
          0.1 + Math.random() * 0.05,
          -0.1 - Math.random() * 1.0
        );
        plate.rotation.z = (Math.random() - 0.5) * 0.5;
        group.add(plate);
      }
      
      // Tiras de neón incrustadas
      const neonStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.8),
        neonMat
      );
      neonStrip.position.set(0.09, 0, -0.5);
      group.add(neonStrip);
      
      const neonStrip2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.6),
        neonMat
      );
      neonStrip2.position.set(-0.09, 0, -0.4);
      group.add(neonStrip2);
      
      group.add(tube);
      swingAxis = 'x';
      swingArc = 1.4;
      break;
    }
    
    case 'cortador_laser': {
      const techMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a3040,
        roughness: 0.4
      });
      const laserMat = new THREE.MeshBasicMaterial({ 
        color: 0x35e0ff,
        transparent: true,
        opacity: 0.9
      });
      
      // Cuerpo principal
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.12, 0.6),
        techMat
      );
      body.position.z = -0.2;
      
      // Empuñadura ergonómica
      const grip = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.18, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x3a4050 })
      );
      grip.position.set(0, -0.12, 0.1);
      group.add(grip);
      
      // Emisor láser
      const emitter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8),
        techMat
      );
      emitter.rotation.x = Math.PI / 2;
      emitter.position.z = -0.65;
      
      // Hoja láser (cuando está activo)
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.03, 1.2),
        laserMat
      );
      blade.position.z = -1.3;
      blade.name = 'laserBlade';
      group.add(blade);
      
      // Luz del láser
      light = new THREE.PointLight(0x35e0ff, 1.0, 6);
      light.position.set(0, 0, -1.0);
      group.add(light);
      
      group.add(body, emitter);
      swingAxis = 'x';
      swingArc = 1.0;
      swingSpeed = 1.2;
      break;
    }
    
    default: {
      // Arma genérica (fallback)
      const generic = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.8),
        new THREE.MeshLambertMaterial({ color: 0x888888 })
      );
      generic.position.z = -0.3;
      group.add(generic);
      swingAxis = 'x';
      break;
    }
  }
  
  return {
    mesh: group,
    swingAxis,
    swingArc,
    swingSpeed,
    light
  };
}

/**
 * Actualiza efectos dinámicos del arma (fuego, láser, partículas)
 */
export function updateWeaponEffects(weapon: WeaponModel, time: number, active: boolean) {
  const mesh = weapon.mesh;
  
  // Actualizar fuego de antorcha
  const fire = mesh.getObjectByName('fire') as THREE.Mesh | undefined;
  if (fire) {
    const flicker = 1 + Math.sin(time * 15) * 0.15 + Math.cos(time * 23) * 0.1;
    fire.scale.setScalar(flicker);
    fire.material = fire.material as THREE.MeshBasicMaterial;
    (fire.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(time * 20) * 0.2;
    
    if (weapon.light) {
      weapon.light.intensity = 1.2 + Math.sin(time * 18) * 0.4;
    }
  }
  
  // Actualizar chispas
  const sparks = mesh.getObjectByName('sparks') as THREE.Mesh | undefined;
  if (sparks) {
    sparks.position.y = Math.sin(time * 25) * 0.05;
    sparks.rotation.z += 0.1;
  }
  
  // Actualizar hoja láser
  const laserBlade = mesh.getObjectByName('laserBlade') as THREE.Mesh | undefined;
  if (laserBlade && active) {
    laserBlade.material = laserBlade.material as THREE.MeshBasicMaterial;
    (laserBlade.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(time * 12) * 0.2;
    
    if (weapon.light) {
      weapon.light.intensity = 0.8 + Math.sin(time * 15) * 0.3;
    }
  } else if (laserBlade) {
    (laserBlade.material as THREE.MeshBasicMaterial).opacity = 0.3;
  }
}

/**
 * Obtiene estadísticas de combate para un arma
 */
export function getWeaponStats(weaponType: WeaponType): WeaponStats {
  const baseStats: Record<WeaponType, WeaponStats> = {
    // Prehistoria
    garrote_femur: { damage: 18, range: 2.3, attackRate: 0.55, knockback: 8, staminaCost: 12 },
    lanza_colmillo: { damage: 14, range: 3.5, attackRate: 0.65, knockback: 5, staminaCost: 14 },
    antorcha_resina: { damage: 12, range: 2.5, attackRate: 0.45, knockback: 4, staminaCost: 10, specialEffect: 'fire' },
    hueso_boomerang: { damage: 10, range: 8, attackRate: 0.8, knockback: 3, staminaCost: 16, specialEffect: 'stun' },
    
    // Medieval
    espada_oxidada: { damage: 18, range: 2.7, attackRate: 0.55, knockback: 6, staminaCost: 13 },
    martillo_campana: { damage: 24, range: 2.2, attackRate: 0.85, knockback: 10, staminaCost: 18, specialEffect: 'stun' },
    ballesta_clavos: { damage: 16, range: 10, attackRate: 1.2, knockback: 7, staminaCost: 15, specialEffect: 'pull' },
    gancho_andamio: { damage: 8, range: 12, attackRate: 1.0, knockback: 2, staminaCost: 20, specialEffect: 'pull' },
    
    // Oeste
    culata_revolver: { damage: 15, range: 2.2, attackRate: 0.4, knockback: 5, staminaCost: 8 },
    cuchillo_bufalo: { damage: 20, range: 2.1, attackRate: 0.5, knockback: 4, staminaCost: 10 },
    dinamita: { damage: 50, range: 6, attackRate: 3.0, knockback: 25, staminaCost: 30, specialEffect: 'explosion' },
    lazo_cowboy: { damage: 5, range: 8, attackRate: 1.5, knockback: 1, staminaCost: 18, specialEffect: 'pull' },
    
    // Moderna
    cuchillo_tactico: { damage: 16, range: 2.0, attackRate: 0.35, knockback: 3, staminaCost: 8 },
    pala_trinchera: { damage: 25, range: 2.2, attackRate: 0.7, knockback: 9, staminaCost: 16 },
    granada_humo: { damage: 0, range: 8, attackRate: 2.0, knockback: 0, staminaCost: 15, specialEffect: 'stun' },
    machete_selva: { damage: 18, range: 2.4, attackRate: 0.48, knockback: 5, staminaCost: 11 },
    
    // Futuro
    bat_chatarra: { damage: 22, range: 2.5, attackRate: 0.6, knockback: 12, staminaCost: 14 },
    pistola_pernos: { damage: 14, range: 12, attackRate: 0.8, knockback: 8, staminaCost: 12, specialEffect: 'pull' },
    escudo_holografico: { damage: 6, range: 1.8, attackRate: 0.7, knockback: 15, staminaCost: 20 },
    cortador_laser: { damage: 28, range: 2.8, attackRate: 0.5, knockback: 7, staminaCost: 16, specialEffect: 'fire' },
  };
  
  return baseStats[weaponType] || { damage: 10, range: 2, attackRate: 0.5, knockback: 5, staminaCost: 10 };
}
