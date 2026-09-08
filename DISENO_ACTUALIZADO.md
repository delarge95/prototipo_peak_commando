# 🎮 PEAK COMMANDO - DOCUMENTO DE DISEÑO ACTUALIZADO

## 📋 RESUMEN EJECUTIVO

Peak Commando es un **party game cooperativo** de supervivencia temporal donde hasta 9 jugadores atraviesan eras históricas/fantásticas en mapas semiabiertos, explorando rutas, limpiando mazmorras multi-habitación, consiguiendo herramientas y consumibles, y tratando de no matarse entre ellos mientras completan objetivos contrarreloj.

---

## 🎯 ESTADO DEL PROTOTIPO

✅ **COMPLETADO:**
- Cámara en tercera persona con Pointer Lock
- Movimiento completo (WASD + Shift + Space + C)
- Sistema de stamina mejorado (200 puntos, regeneración rápida)
- Velocidades aumentadas (caminar: 5.5 m/s, correr: 11 m/s)
- Mazmorras multi-habitación (2-6 habitaciones)
- 6 slots de consumibles (teclas 1-6)
- Cambio de arma con Q
- Stamina dura ~14 segundos corriendo continuamente

🔄 **EN PROGRESO:**
- Modelos 3D detallados de armas
- Renderizado de mazmorras con techos/muros
- Interacciones con loot

---

## ⚙️ CONFIGURACIÓN ACTUALIZADA

### Movimiento (`src/game/config.ts`)
```typescript
walkSpeed: 5.5 m/s      // Antes: 4.5
runSpeed: 11.0 m/s      // Antes: 8.0
crouchSpeed: 2.8 m/s    // Antes: 2.2
staminaMax: 200         // Antes: 100 (AHORA DURA EL DOBLE)
sprintStaminaPerSec: 14 // Antes: 9
staminaRegenPerSec: 28  // Antes: 18 (REGENERACIÓN RÁPIDA)
jumpStaminaCost: 20     // Antes: 16
```

**Tiempo de sprint continuo:** ~14 segundos (antes ~11s)
**Recuperación completa:** ~7 segundos sin acciones

---

## 🎮 CONTROLES

| Tecla | Acción | Descripción |
|-------|--------|-------------|
| **W/A/S/D** | Movimiento | Caminar/correr en 4 direcciones |
| **Shift** | Correr | Sprint que consume stamina (11 m/s) |
| **Space** | Saltar | Salto vertical (coste: 20 stamina) |
| **C / Ctrl** | Agacharse | Reduce velocidad a 2.8 m/s |
| **Ratón** | Cámara | Controla yaw/pitch en tercera persona |
| **Click Izq** | Atacar | Usa arma actual o golpe básico |
| **E** | Interactuar | Recoger items, activar puntos |
| **F** | Empujar | Empuja enemigos y compañeros |
| **Q** | Cambiar Arma | Cicla entre armas disponibles |
| **1-6** | Consumibles | Usa item del slot correspondiente |
| **V** | Cambiar Cámara | Alterna 1ª/3ª persona (si implementado) |
| **Escape** | Pausa | Abre menú de pausa |

---

## 🎒 SISTEMA DE CONSUMIBLES (6 SLOTS)

| Slot | Tecla | Efecto | Descripción |
|------|-------|--------|-------------|
| **0** | `1` | 🍌 Cáscara | Plátano que hace resbalar |
| **1** | `2` | 💨 Granada fétida | Nube de gas que atrae enemigos |
| **2** | `3` | ⚡ Adrenalina | +50% velocidad por 6s |
| **3** | `4` | 🩹 Vendaje | Cura 40 HP instantáneos |
| **4** | `5` | 🥤 Bebida energética | +80 stamina |
| **5** | `6` | 💣 Explosivo | Proyectil explosivo |

---

## ⚔️ SISTEMA DE ARMAS

### Controles de Armas
- **Q**: Cambiar entre armas disponibles en la era actual
- **Click Izquierdo**: Atacar con arma equipada
- Las armas tienen diferentes arcos de swing, velocidades y daños

### Armas por Era (ejemplos)

#### Prehistoria
- Garrote de fémur (daño alto, lento)
- Lanza de colmillo (alcance largo)
- Antorcha de resina (luz + fuego)
- Hueso boomerang (proyectil)

#### Medieval
- Espada oxidada (balanceada)
- Martillo de campana (lento, aturde)
- Ballesta de clavos (proyectil)
- Fuego griego (área, amigo-hostil)

#### Futuro
- Bate de chatarra (rápido, neón)
- Pistola de pernos (proyectil magnético)
- Cortador láser (daño continuo)
- Mina EMP (área, stun)

---

## 🏰 MAZMORRAS MULTI-HABITACIÓN

### Sistema de Generación (`src/world/dungeonGenerator.ts`)

#### Número de Habitaciones por Dificultad
| Dificultad | Habitaciones | Tamaño Total Aproximado |
|------------|--------------|------------------------|
| **Fácil** | 2-3 | 800-2,500 m² |
| **Media** | 3-4 | 2,000-4,500 m² |
| **Difícil** | 4-5 | 3,500-7,000 m² |
| **Legendaria** | 5-7 | 6,000-12,000 m² |

#### Tipos de Habitación
- `entrance`: Entrada principal (medium, 28-40 unidades)
- `corridor`: Pasillo de conexión (small, 18-26 unidades)
- `main`: Sala principal (large, 42-60 unidades)
- `treasure`: Cámara del tesoro (huge/massive, 65-130 unidades)
- `tower`: Torre defensiva (altura: 18-35 unidades)
- `courtyard`: Patio abierto (sin techo)
- `crypt`: Cripta oculta (techada, walls completas)

#### Características por Arquetipo

**Fortaleza:**
- Torres defensivas laterales (1-2)
- Conexiones tipo arco/puente
- Habitaciones con muros completos
- Torre final alta (20-35 unidades)

**Sigilo:**
- Ramificaciones ocultas (criptas)
- Todas las habitaciones techadas
- Muros en todas las salas
- Cámara final secreta

**Exterminio:**
- Patios de arena adicionales
- Pocas o ninguna cubierta
- Arena final enorme (huge)
- Muros parciales

**Legendaria:**
- 1-2 habitaciones extra
- Multiplicador de tamaño ×1.8
- Cámaras de tesoro bonus (1-2)
- Todo techado y amurallado

#### Tipos de Conexión
- `door`: Puerta estándar
- `arch`: Arco decorativo
- `bridge`: Puente entre alturas diferentes
- `ramp`: Rampa para desniveles >3 unidades

---

## 📊 MÉTRICAS DE TAMAÑO DE MAZMORRAS

### Comparativa vs Prototipo Original

| Tipo Mazmorra | Original | Actual | Multiplicador |
|---------------|----------|--------|---------------|
| Easy (2 rooms) | ~100 m² | 1,200 m² | **12×** |
| Medium (3 rooms) | ~150 m² | 2,800 m² | **18×** |
| Hard (4 rooms) | ~200 m² | 5,200 m² | **26×** |
| Fortress (5 rooms + torres) | - | 7,500 m² | **NUEVO** |
| Legendaria (6-7 rooms) | - | 11,000 m² | **NUEVO** |

### Ejemplo: Mazmorra Fortaleza Difícil
```
Entrada: 35×35 = 1,225 m² (h: 10, walls: sí, roof: sí)
├─ Corredor 1: 22×22 = 484 m² (h: 7, walls: sí, roof: sí)
│  └─ Torre lateral: 14×14 = 196 m² (h: 25, bridge)
├─ Sala Principal: 48×48 = 2,304 m² (h: 9, walls: sí, roof: sí)
├─ Corredor 2: 24×24 = 576 m² (h: 8, walls: sí, roof: sí)
└─ Torre Final: 32×32 = 1,024 m² (h: 28, walls: sí, roof: parcial)
   └─ Cámara Tesoro: 18×18 = 324 m² (h: 14, door)

TOTAL: ~6,133 m² + torres defensivas
```

---

## 🕹️ CHEATS DISPONIBLES

| Tecla | Efecto |
|-------|--------|
| **N** | Completar era / Teletransportar a jefe |
| **T** | +120 segundos al cronómetro |
| **H** | Curar jugador y compañero al máximo |
| **P** | (Pendiente: +120s alternativo) |
| **M** | (Pendiente: Ir a mazmorra cercana) |
| **B** | (Pendiente: Ir al jefe/salida) |
| **L** | (Pendiente: Vuelo/no-clip debug) |
| **K** | (Pendiente: Matar jugador) |
| **O** | (Pendiente: Añadir bot) |
| **U** | (Pendiente: Quitar bot) |

---

## 🎨 ARQUITECTURA DE ARCHIVOS

```
src/
├── game/
│   ├── config.ts          # Configuración global (velocidades, stamina, etc.)
│   ├── engine.ts          # Motor principal del juego
│   ├── weapons.ts         # Sistema de armas 3D
│   ├── items.ts           # Base de datos de items
│   ├── eras.ts            # Definición de eras
│   ├── TimeDirector.ts    # Sistema de tiempo
│   └── audio.ts           # Efectos de sonido
└── world/
    ├── eraLayout.ts       # Layout base de cada era
    ├── dungeonPlacer.ts   # Colocación de mazmorras en el mapa
    └── dungeonGenerator.ts # Generador multi-habitación (NUEVO)
```

---

## 🔧 PRÓXIMOS PASOS

### Prioridad Alta
1. **Renderizar mazmorras** - Usar RoomDef para construir geometría 3D con techos/muros
2. **Integrar armas visuales** - Conectar weapons.ts con el sistema de ataque
3. **Sistema de loot** - Recoger/soltar armas del suelo
4. **Enemigos en mazmorras** - Spawneear según RoomDef.type

### Prioridad Media
5. **Animaciones de ataque** - Swing visual con el arma
6. **Proyectiles** - Boomerang, ballesta, dinamita
7. **Sonidos** - SFX por arma/golpe/explosión
8. **Más consumibles** - Implementar efectos únicos

### Prioridad Baja
9. **Encantamientos** - Variantes elementales de armas
10. **Crafting** - Mejorar armas con materiales
11. **Más armas** - Completar las 40+ del diseño original

---

## 📈 RENDIMIENTO OBJETIVO

| Métrica | Objetivo | Notas |
|---------|----------|-------|
| FPS | 60+ | En hardware medio |
| Mazmorras activas | 8 por era | Con 2-6 rooms cada una |
| Enemigos simultáneos | 30-50 | Instanciados si es posible |
| Jugadores + bots | 1 + 3 | Máximo teórico: 9 |

---

## 🎯 VALIDACIÓN ACTUAL

✅ El ratón queda capturado (Pointer Lock)
✅ La cámara gira correctamente
✅ El jugador corre más rápido (11 m/s vs 8 m/s)
✅ La stamina dura más (200 puntos, ~14s sprint)
✅ Existen 6 slots de consumibles funcionales
✅ Se puede cambiar de arma con Q
✅ Las mazmorras generan 2-6 habitaciones
✅ Las mazmorras son 12-60× más grandes
✅ Build exitosa sin errores

⏳ Pendiente validar:
- Renderizado visual de mazmorras
- Combate con armas específicas
- Loot y recogida de items
- Enemigos dentro de mazmorras

---

**Última actualización:** 2025
**Estado:** Prototipo jugable funcional
**Próximo hito:** Renderizado completo de mazmorras y combate
