// ============================================================
// PEAK COMMANDO — Base de Datos de Items
// Define todas las armas, herramientas y consumibles por era
// ============================================================

export type ItemCategory = 'equipo' | 'consumible';

export type ItemType = 
  // Prehistoria - Equipo
  | 'garrote_femur'
  | 'lanza_colmillo'
  | 'antorcha_resina'
  | 'hueso_boomerang'
  | 'trampa_pozo_portatil'
  | 'cuerno_estampida'
  | 'caparazon_escudo'
  | 'cebo_carne'
  // Prehistoria - Consumibles
  | 'platano_ancestral'
  | 'huevo_raptor'
  | 'resba_musgo'
  | 'colmena_primitiva'
  | 'baya_picante'
  | 'trampa_liana'
  // Medieval - Equipo
  | 'espada_oxidada'
  | 'escudo_torre'
  | 'martillo_campana'
  | 'ballesta_clavos'
  | 'gancho_andamio'
  | 'estandarte_maldito'
  | 'fuego_griego'
  | 'ganzua_runica'
  // Medieval - Consumibles
  | 'aceite_hirviendo'
  | 'queso_apestoso'
  | 'polvos_estornudo'
  | 'ratonera_bendita'
  | 'hidromiel_caotica'
  | 'confeti_torneo'
  // Oeste - Equipo
  | 'culata_revolver'
  | 'cuchillo_bufalo'
  | 'hierro_marcar'
  | 'tronco_escopeta'
  | 'lazo_cowboy'
  | 'dinamita'
  | 'espolones'
  | 'placa_sheriff'
  // Oeste - Consumibles
  | 'whisky_fuerte'
  | 'tabaco_picado'
  | 'herradura_suerte'
  | 'sopa_cactus'
  | 'puro_explosivo'
  | 'mapa_tesoro'
  // Moderna - Equipo
  | 'cuchillo_tactico'
  | 'culata_fusil'
  | 'pala_trinchera'
  | 'machete_selva'
  | 'granada_humo'
  | 'chaleco_balas'
  | 'radio_tactica'
  | 'binoculares'
  // Moderna - Consumibles
  | 'venda_combate'
  | 'cafe_fuerte'
  | 'mina_terrestre'
  | 'senuelo_calor'
  | 'pildoras_adrenalina'
  | 'paquete_raciones'
  // Futuro - Equipo
  | 'bat_chatarra'
  | 'pistola_pernos_magnetica'
  | 'escudo_holografico'
  | 'gancho_magnetico'
  | 'mina_confeti_emp'
  | 'sobrecargador_neon'
  | 'dron_mascota'
  | 'cortador_laser'
  // Futuro - Consumibles
  | 'nanoglue'
  | 'bebida_energetica'
  | 'granada_anuncios'
  | 'senuelo_neon'
  | 'bateria_portatil'
  | 'cubo_chatarra_explosivo';

export interface ItemDef {
  id: ItemType;
  name: string;
  description: string;
  category: ItemCategory;
  era: 'prehistoria' | 'medieval' | 'oeste' | 'moderna' | 'futuro';
  
  // Para equipo
  damage?: number;
  range?: number;
  attackRate?: number;
  utility?: string;
  
  // Para consumibles
  effect?: string;
  duration?: number;
  
  color: number;
}

export const ITEMS: Record<ItemType, ItemDef> = {
  // ==================== PREHISTORIA ====================
  garrote_femur: {
    id: 'garrote_femur',
    name: 'Garrote de Fémur',
    description: 'Golpe contundente con buen empuje. Ideal para negociar con dinosaurios.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 18,
    range: 2.3,
    attackRate: 0.55,
    utility: 'empuje',
    color: 0x8a5a33,
  },
  lanza_colmillo: {
    id: 'lanza_colmillo',
    name: 'Lanza de Colmillo',
    description: 'Larga reach para pinchar enemigos y activar interruptores distantes.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 14,
    range: 3.5,
    attackRate: 0.65,
    utility: 'alcance',
    color: 0xe8e0c8,
  },
  antorcha_resina: {
    id: 'antorcha_resina',
    name: 'Antorcha de Resina',
    description: 'Proporciona luz, quema plantas y asusta bestias sensibles al fuego.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 12,
    range: 2.5,
    attackRate: 0.45,
    utility: 'luego_fuego',
    color: 0xff7a1a,
  },
  hueso_boomerang: {
    id: 'hueso_boomerang',
    name: 'Hueso Boomerang',
    description: 'Ataque a distancia torpe que aturde y vuelve (a veces).',
    category: 'equipo',
    era: 'prehistoria',
    damage: 10,
    range: 8,
    attackRate: 0.8,
    utility: 'aturdir',
    color: 0xd4c8a8,
  },
  trampa_pozo_portatil: {
    id: 'trampa_pozo_portatil',
    name: 'Trampa de Pozo Portátil',
    description: 'Coloca un hoyo sorpresa. Enemigos y aliados caen por igual.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 0,
    range: 1,
    attackRate: 0,
    utility: 'trampa',
    color: 0x5a4a3a,
  },
  cuerno_estampida: {
    id: 'cuerno_estampida',
    name: 'Cuerno de Estampida',
    description: 'Atrae y activa manadas. Úsalo contra enemigos... o amigos.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 0,
    range: 15,
    attackRate: 2,
    utility: 'atraer_enemigos',
    color: 0x8a6a4a,
  },
  caparazon_escudo: {
    id: 'caparazon_escudo',
    name: 'Caparazón Escudo',
    description: 'Bloqueo básico. También sirve para surfear pendientes.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 5,
    range: 1.5,
    attackRate: 0.7,
    utility: 'bloqueo',
    color: 0x4a5a3a,
  },
  cebo_carne: {
    id: 'cebo_carne',
    name: 'Cebo de Carne',
    description: 'Atrae criaturas hambrientas hacia donde lo lances.',
    category: 'equipo',
    era: 'prehistoria',
    damage: 0,
    range: 12,
    attackRate: 1.5,
    utility: 'atraer_enemigos',
    color: 0xa33b2a,
  },
  
  platano_ancestral: {
    id: 'platano_ancestral',
    name: 'Plátano Ancestral',
    description: 'La cáscara resbaladiza clásica. Funciona en enemigos, aliados y uno mismo.',
    category: 'consumible',
    era: 'prehistoria',
    effect: 'zona_resbaladiza',
    duration: 8,
    color: 0xffd400,
  },
  huevo_raptor: {
    id: 'huevo_raptor',
    name: 'Huevo de Raptor',
    description: 'Al romperse, atrae raptores cercanos. ¿Amigos o problema?',
    category: 'consumible',
    era: 'prehistoria',
    effect: 'atraer_raptores',
    duration: 10,
    color: 0xc8d4a8,
  },
  resba_musgo: {
    id: 'resba_musgo',
    name: 'Musgo Resbaloso',
    description: 'Crea una zona deslizante. Cuidado con las curvas.',
    category: 'consumible',
    era: 'prehistoria',
    effect: 'zona_resbaladiza',
    duration: 6,
    color: 0x4a7a3a,
  },
  colmena_primitiva: {
    id: 'colmena_primitiva',
    name: 'Colmena Primitiva',
    description: 'Libera abejas prehistóricas. Pican a todos por igual.',
    category: 'consumible',
    era: 'prehistoria',
    effect: 'enjambre',
    duration: 8,
    color: 0xd4a83a,
  },
  baya_picante: {
    id: 'baya_picante',
    name: 'Baya Picante',
    description: '+30% velocidad durante 5s, pero pierdes control direccional.',
    category: 'consumible',
    era: 'prehistoria',
    effect: 'velocidad_caotica',
    duration: 5,
    color: 0xff3b3b,
  },
  trampa_liana: {
    id: 'trampa_liana',
    name: 'Trampa de Liana',
    description: 'Enreda temporalmente a quien la pise.',
    category: 'consumible',
    era: 'prehistoria',
    effect: 'inmovilizar',
    duration: 4,
    color: 0x3a5a2a,
  },

  // ==================== MEDIEVAL ====================
  espada_oxidada: {
    id: 'espada_oxidada',
    name: 'Espada Oxidada',
    description: 'Golpe básico medieval. No es Excalibur, pero corta.',
    category: 'equipo',
    era: 'medieval',
    damage: 18,
    range: 2.7,
    attackRate: 0.55,
    utility: 'golpe',
    color: 0xc9ced6,
  },
  escudo_torre: {
    id: 'escudo_torre',
    name: 'Escudo de Torre',
    description: 'Bloqueo pesado. Empuja y permite surfear colinas.',
    category: 'equipo',
    era: 'medieval',
    damage: 6,
    range: 1.8,
    attackRate: 0.8,
    utility: 'bloqueo_empuje',
    color: 0x8a7a6a,
  },
  martillo_campana: {
    id: 'martillo_campana',
    name: 'Martillo de Campana',
    description: 'Rompe puertas y aturde. El sonido hace reír a los enemigos.',
    category: 'equipo',
    era: 'medieval',
    damage: 24,
    range: 2.2,
    attackRate: 0.85,
    utility: 'aturdir_sonido',
    color: 0xb8a898,
  },
  ballesta_clavos: {
    id: 'ballesta_clavos',
    name: 'Ballesta de Clavos',
    description: 'Disparo torpe que fija enemigos a paredes.',
    category: 'equipo',
    era: 'medieval',
    damage: 16,
    range: 10,
    attackRate: 1.2,
    utility: 'fijar',
    color: 0x6a5a4a,
  },
  gancho_andamio: {
    id: 'gancho_andamio',
    name: 'Gancho de Andamio',
    description: 'Escala puntos específicos. Útil para rutas altas.',
    category: 'equipo',
    era: 'medieval',
    damage: 8,
    range: 12,
    attackRate: 1,
    utility: 'grapple',
    color: 0x7a6a5a,
  },
  estandarte_maldito: {
    id: 'estandarte_maldito',
    name: 'Estandarte Maldito',
    description: 'Atrae todos los enemigos hacia el portador. Ideal para bromas.',
    category: 'equipo',
    era: 'medieval',
    damage: 4,
    range: 1.5,
    attackRate: 0.6,
    utility: 'atraer_enemigos',
    color: 0x8b1a1a,
  },
  fuego_griego: {
    id: 'fuego_griego',
    name: 'Fuego Griego',
    description: 'Área incendiaria persistente. Arde incluso bajo el agua.',
    category: 'equipo',
    era: 'medieval',
    damage: 8,
    range: 6,
    attackRate: 1.5,
    utility: 'zona_fuego',
    color: 0xff6a1a,
  },
  ganzua_runica: {
    id: 'ganzua_runica',
    name: 'Ganzúa Rúnica',
    description: 'Abre cofres y puertas sin combate. Silenciosa pero lenta.',
    category: 'equipo',
    era: 'medieval',
    damage: 3,
    range: 1,
    attackRate: 0.4,
    utility: 'abrir_puertas',
    color: 0x9a8ad4,
  },
  
  aceite_hirviendo: {
    id: 'aceite_hirviendo',
    name: 'Aceite Hirviendo',
    description: 'Zona de daño y lentitud. Duele pisar Descalzo.',
    category: 'consumible',
    era: 'medieval',
    effect: 'zona_daño_lentitud',
    duration: 6,
    color: 0x8a5a2a,
  },
  queso_apestoso: {
    id: 'queso_apestoso',
    name: 'Queso Apestoso',
    description: 'Atrae enemigos con su aroma... particular.',
    category: 'consumible',
    era: 'medieval',
    effect: 'atraer_enemigos',
    duration: 8,
    color: 0xd4c45a,
  },
  polvos_estornudo: {
    id: 'polvos_estornudo',
    name: 'Polvos de Estornudo',
    description: 'Delata posición y aturde levemente. ¡Achís!',
    category: 'consumible',
    era: 'medieval',
    effect: 'delatar_aturdir',
    duration: 3,
    color: 0xf4e4d4,
  },
  ratonera_bendita: {
    id: 'ratonera_bendita',
    name: 'Ratonera Bendita',
    description: 'Trampa cómica que inmoviliza pies.',
    category: 'consumible',
    era: 'medieval',
    effect: 'trampa_inmovilizar',
    duration: 4,
    color: 0xc4b4a4,
  },
  hidromiel_caotica: {
    id: 'hidromiel_caotica',
    name: 'Hidromiel Caótica',
    description: '+25% fuerza pero pantalla tambaleante durante 6s.',
    category: 'consumible',
    era: 'medieval',
    effect: 'buff_caotico',
    duration: 6,
    color: 0xd4a45a,
  },
  confeti_torneo: {
    id: 'confeti_torneo',
    name: 'Confeti de Torneo',
    description: 'Ceguera temporal festiva. Todos celebran... sin ver.',
    category: 'consumible',
    era: 'medieval',
    effect: 'ceguera_festiva',
    duration: 4,
    color: 0xff69b4,
  },

  // ==================== OESTE ====================
  culata_revolver: {
    id: 'culata_revolver',
    name: 'Culata de Revólver',
    description: 'Golpe rápido y corto. Menos dramático que disparar.',
    category: 'equipo',
    era: 'oeste',
    damage: 15,
    range: 2.2,
    attackRate: 0.4,
    utility: 'golpe_rapido',
    color: 0x7a5230,
  },
  cuchillo_bufalo: {
    id: 'cuchillo_bufalo',
    name: 'Cuchillo Búfalo',
    description: 'Cuchillo grande para近距离. Corta como si no hubiera mañana.',
    category: 'equipo',
    era: 'oeste',
    damage: 20,
    range: 2.1,
    attackRate: 0.5,
    utility: 'golpe',
    color: 0xc9ced6,
  },
  hierro_marcar: {
    id: 'hierro_marcar',
    name: 'Hierro de Marcar',
    description: 'Quemadura táctica. Deja marca visible en enemigos.',
    category: 'equipo',
    era: 'oeste',
    damage: 18,
    range: 2.4,
    attackRate: 0.6,
    utility: 'quemar_marcar',
    color: 0xff7a1a,
  },
  tronco_escopeta: {
    id: 'tronco_escopeta',
    name: 'Tronco de Escopeta',
    description: 'Porra improvisada. Sorprendentemente efectiva.',
    category: 'equipo',
    era: 'oeste',
    damage: 24,
    range: 2.5,
    attackRate: 0.72,
    utility: 'empuje',
    color: 0x8a5a33,
  },
  lazo_cowboy: {
    id: 'lazo_cowboy',
    name: 'Lazo de Cowboy',
    description: 'Inmoviliza enemigos a distancia. Estilo vaquero.',
    category: 'equipo',
    era: 'oeste',
    damage: 5,
    range: 8,
    attackRate: 1.5,
    utility: 'inmovilizar',
    color: 0x9a7a5a,
  },
  dinamita: {
    id: 'dinamita',
    name: 'Dinamita',
    description: 'Explosivo clásico. Cuenta atrás audible incluida.',
    category: 'equipo',
    era: 'oeste',
    damage: 50,
    range: 6,
    attackRate: 3,
    utility: 'explosion',
    color: 0xc43a2a,
  },
  espolones: {
    id: 'espolones',
    name: 'Espolones',
    description: '+20% velocidad. El sonido delata tu posición.',
    category: 'equipo',
    era: 'oeste',
    damage: 3,
    range: 1.5,
    attackRate: 0.3,
    utility: 'velocidad_ruido',
    color: 0xc4c4c4,
  },
  placa_sheriff: {
    id: 'placa_sheriff',
    name: 'Placa de Sheriff',
    description: 'Los enemigos te priorizan. Liderazgo obligatorio.',
    category: 'equipo',
    era: 'oeste',
    damage: 6,
    range: 1.8,
    attackRate: 0.6,
    utility: 'tanque',
    color: 0xffd400,
  },
  
  whisky_fuerte: {
    id: 'whisky_fuerte',
    name: 'Whisky Fuerte',
    description: 'Recupera vida pero emborracha la cámara.',
    category: 'consumible',
    era: 'oeste',
    effect: 'curacion_borrachera',
    duration: 5,
    color: 0x8a5a2a,
  },
  tabaco_picado: {
    id: 'tabaco_picado',
    name: 'Tabaco Picado',
    description: 'Nube de humo que oculta. Tos garantizada.',
    category: 'consumible',
    era: 'oeste',
    effect: 'humo_ocultacion',
    duration: 6,
    color: 0x6a5a4a,
  },
  herradura_suerte: {
    id: 'herradura_suerte',
    name: 'Herradura de la Suerte',
    description: '+15% suerte durante 30s. ¿Funciona? Quién sabe.',
    category: 'consumible',
    era: 'oeste',
    effect: 'buff_suerte',
    duration: 30,
    color: 0xc4a45a,
  },
  sopa_cactus: {
    id: 'sopa_cactus',
    name: 'Sopa de Cactus',
    description: 'Regeneración lenta pero constante. Sabe a desierto.',
    category: 'consumible',
    era: 'oeste',
    effect: 'regeneracion',
    duration: 10,
    color: 0x3a7a4a,
  },
  puro_explosivo: {
    id: 'puro_explosivo',
    name: 'Puro Explosivo',
    description: 'Se lanza y explota. Humo aromático incluido.',
    category: 'consumible',
    era: 'oeste',
    effect: 'explosion_humo',
    duration: 2,
    color: 0x5a4a3a,
  },
  mapa_tesoro: {
    id: 'mapa_tesoro',
    name: 'Mapa del Tesoro',
    description: 'Revela ubicación de loot cercano. X marca el punto.',
    category: 'consumible',
    era: 'oeste',
    effect: 'revelar_loot',
    duration: 1,
    color: 0xd4c4a4,
  },

  // ==================== MODERNA ====================
  cuchillo_tactico: {
    id: 'cuchillo_tactico',
    name: 'Cuchillo Táctico',
    description: 'Silencioso y letal. Para cuando el sigilo falla.',
    category: 'equipo',
    era: 'moderna',
    damage: 16,
    range: 2.0,
    attackRate: 0.35,
    utility: 'sigilo',
    color: 0x3a3f3a,
  },
  culata_fusil: {
    id: 'culata_fusil',
    name: 'Culata de Fusil',
    description: 'Golpe contundente con alcance decente.',
    category: 'equipo',
    era: 'moderna',
    damage: 20,
    range: 2.6,
    attackRate: 0.6,
    utility: 'golpe',
    color: 0x4a4f45,
  },
  pala_trinchera: {
    id: 'pala_trinchera',
    name: 'Pala de Trinchera',
    description: 'Cava trincheras y cabezas con igual eficiencia.',
    category: 'equipo',
    era: 'moderna',
    damage: 25,
    range: 2.2,
    attackRate: 0.7,
    utility: 'golpe_excavar',
    color: 0x6a705c,
  },
  machete_selva: {
    id: 'machete_selva',
    name: 'Machete de Selva',
    description: 'Corta vegetación y enemigos. Filo garantizado.',
    category: 'equipo',
    era: 'moderna',
    damage: 18,
    range: 2.4,
    attackRate: 0.48,
    utility: 'cortar',
    color: 0x9aa08a,
  },
  granada_humo: {
    id: 'granada_humo',
    name: 'Granada de Humo',
    description: 'Corta visión enemiga. Perfecta para escapes o bromas.',
    category: 'equipo',
    era: 'moderna',
    damage: 0,
    range: 8,
    attackRate: 2,
    utility: 'cobertura_humo',
    color: 0x7a7a7a,
  },
  chaleco_balas: {
    id: 'chaleco_balas',
    name: 'Chaleco Antibalas',
    description: '-30% daño recibido. Pesado pero vale la pena.',
    category: 'equipo',
    era: 'moderna',
    damage: 4,
    range: 1.5,
    attackRate: 0.5,
    utility: 'reduccion_dano',
    color: 0x3a4a3a,
  },
  radio_tactica: {
    id: 'radio_tactica',
    name: 'Radio Táctica',
    description: 'Coordina con el equipo. Los bots obedecen mejor.',
    category: 'equipo',
    era: 'moderna',
    damage: 2,
    range: 1,
    attackRate: 0.3,
    utility: 'mejorar_bots',
    color: 0x4a5a6a,
  },
  binoculares: {
    id: 'binoculares',
    name: 'Binoculares',
    description: 'Marca enemigos a distancia. Información es poder.',
    category: 'equipo',
    era: 'moderna',
    damage: 0,
    range: 20,
    attackRate: 1,
    utility: 'marcar_enemigos',
    color: 0x5a4a3a,
  },
  
  venda_combate: {
    id: 'venda_combate',
    name: 'Venda de Combate',
    description: 'Detiene sangrado. Recupera 25 HP instantáneo.',
    category: 'consumible',
    era: 'moderna',
    effect: 'curacion',
    duration: 1,
    color: 0xffffff,
  },
  cafe_fuerte: {
    id: 'cafe_fuerte',
    name: 'Café Fuerte',
    description: '+25% velocidad y regeneración de stamina durante 8s.',
    category: 'consumible',
    era: 'moderna',
    effect: 'buff_velocidad_stamina',
    duration: 8,
    color: 0x6a4a3a,
  },
  mina_terrestre: {
    id: 'mina_terrestre',
    name: 'Mina Terrestre',
    description: 'Trampa explosiva invisible. Amigos y enemigos explotan.',
    category: 'consumible',
    era: 'moderna',
    effect: 'trampa_explosiva',
    duration: 30,
    color: 0x4a5a3a,
  },
  senuelo_calor: {
    id: 'senuelo_calor',
    name: 'Señuelo de Calor',
    description: 'Atrae enemigos sensibles al calor. Drones incluidos.',
    category: 'consumible',
    era: 'moderna',
    effect: 'atraer_enemigos',
    duration: 8,
    color: 0xff4a3a,
  },
  pildoras_adrenalina: {
    id: 'pildoras_adrenalina',
    name: 'Píldoras de Adrenalina',
    description: '+40% velocidad de movimiento y ataque durante 6s.',
    category: 'consumible',
    era: 'moderna',
    effect: 'buff_combate',
    duration: 6,
    color: 0xff3a3a,
  },
  paquete_raciones: {
    id: 'paquete_raciones',
    name: 'Paquete de Raciones',
    description: 'Comida militar. Recupera 50 HP lentamente.',
    category: 'consumible',
    era: 'moderna',
    effect: 'regeneracion_hp',
    duration: 8,
    color: 0x6a5a4a,
  },

  // ==================== FUTURO ====================
  bat_chatarra: {
    id: 'bat_chatarra',
    name: 'Bat de Chatarra',
    description: 'Bate eléctrico hecho de restos tecnológicos. ¡Zap!',
    category: 'equipo',
    era: 'futuro',
    damage: 22,
    range: 2.4,
    attackRate: 0.5,
    utility: 'electrico',
    color: 0x6a7a8a,
  },
  pistola_pernos_magnetica: {
    id: 'pistola_pernos_magnetica',
    name: 'Pistola de Pernos Magnética',
    description: 'Fija enemigos a superficies metálicas. Muy útil.',
    category: 'equipo',
    era: 'futuro',
    damage: 14,
    range: 12,
    attackRate: 0.8,
    utility: 'fijar_magnetico',
    color: 0x4a5a7a,
  },
  escudo_holografico: {
    id: 'escudo_holografico',
    name: 'Escudo Holográfico',
    description: 'Cobertura desplegable. Dura poco pero salva vidas.',
    category: 'equipo',
    era: 'futuro',
    damage: 5,
    range: 2,
    attackRate: 0.6,
    utility: 'cobertura',
    color: 0x35e0ff,
  },
  gancho_magnetico: {
    id: 'gancho_magnetico',
    name: 'Gancho Magnético',
    description: 'Grapple a superficies metálicas. Movilidad vertical.',
    category: 'equipo',
    era: 'futuro',
    damage: 8,
    range: 15,
    attackRate: 1,
    utility: 'grapple',
    color: 0x5a6a8a,
  },
  mina_confeti_emp: {
    id: 'mina_confeti_emp',
    name: 'Mina de Confeti EMP',
    description: 'Desactiva robots y llena todo de confeti. Festivo y útil.',
    category: 'equipo',
    era: 'futuro',
    damage: 10,
    range: 8,
    attackRate: 2,
    utility: 'emp_confeti',
    color: 0xff69b4,
  },
  sobrecargador_neon: {
    id: 'sobrecargador_neon',
    name: 'Sobrecargador de Neón',
    description: 'Buffa herramientas cercanas. +20% efectividad.',
    category: 'equipo',
    era: 'futuro',
    damage: 6,
    range: 3,
    attackRate: 0.5,
    utility: 'buff_herramientas',
    color: 0xff3bd4,
  },
  dron_mascota: {
    id: 'dron_mascota',
    name: 'Dron Mascota',
    description: 'Sigue al jugador, distrae enemigos y recoge loot pequeño.',
    category: 'equipo',
    era: 'futuro',
    damage: 3,
    range: 1,
    attackRate: 0.4,
    utility: 'distraer_recoger',
    color: 0x7dffb0,
  },
  cortador_laser: {
    id: 'cortador_laser',
    name: 'Cortador Láser',
    description: 'Corta rejas y puertas finas. También corta dedos.',
    category: 'equipo',
    era: 'futuro',
    damage: 28,
    range: 2.8,
    attackRate: 0.65,
    utility: 'cortar',
    color: 0xff3b3b,
  },
  
  nanoglue: {
    id: 'nanoglue',
    name: 'Nano-Pegamento',
    description: 'Zona pegajosa. Enemigos y jugadores se atascan.',
    category: 'consumible',
    era: 'futuro',
    effect: 'zona_pegajosa',
    duration: 6,
    color: 0x3bd4ff,
  },
  bebida_energetica: {
    id: 'bebida_energetica',
    name: 'Bebida Energética',
    description: 'Adrenalina pura. +35% velocidad durante 7s.',
    category: 'consumible',
    era: 'futuro',
    effect: 'buff_velocidad',
    duration: 7,
    color: 0x3bff7d,
  },
  granada_anuncios: {
    id: 'granada_anuncios',
    name: 'Granada de Anuncios',
    description: 'Proyecta hologramas distractores. Publicidad invasiva.',
    category: 'consumible',
    era: 'futuro',
    effect: 'distraccion_holografica',
    duration: 8,
    color: 0xff69b4,
  },
  senuelo_neon: {
    id: 'senuelo_neon',
    name: 'Señuelo de Neón',
    description: 'Atrae drones y robots. Brilla mucho.',
    category: 'consumible',
    era: 'futuro',
    effect: 'atraer_robots',
    duration: 10,
    color: 0xff3bd4,
  },
  bateria_portatil: {
    id: 'bateria_portatil',
    name: 'Batería Portátil',
    description: 'Añade +15 segundos al cronómetro. Energía verde.',
    category: 'consumible',
    era: 'futuro',
    effect: 'tiempo',
    duration: 1,
    color: 0x3bd4ff,
  },
  cubo_chatarra_explosivo: {
    id: 'cubo_chatarra_explosivo',
    name: 'Cubo de Chatarra Explosivo',
    description: 'TNT tecnológico. Explosión grande y ruidosa.',
    category: 'consumible',
    era: 'futuro',
    effect: 'explosion_grande',
    duration: 3,
    color: 0xff6a3b,
  },
};

/**
 * Obtiene todos los items de una era específica.
 */
export function getItemsByEra(era: 'prehistoria' | 'medieval' | 'oeste' | 'moderna' | 'futuro'): ItemDef[] {
  return Object.values(ITEMS).filter(item => item.era === era);
}

/**
 * Obtiene items por categoría y era.
 */
export function getItemsByCategoryAndEra(
  category: ItemCategory,
  era: 'prehistoria' | 'medieval' | 'oeste' | 'moderna' | 'futuro'
): ItemDef[] {
  return Object.values(ITEMS).filter(item => item.category === category && item.era === era);
}

/**
 * Obtiene un item por su ID.
 */
export function getItemById(id: ItemType): ItemDef | undefined {
  return ITEMS[id];
}

/**
 * Selecciona un item aleatorio de una era.
 */
export function getRandomItemFromEra(
  era: 'prehistoria' | 'medieval' | 'oeste' | 'moderna' | 'futuro',
  category?: ItemCategory
): ItemDef {
  const items = category 
    ? getItemsByCategoryAndEra(category, era)
    : getItemsByEra(era);
  
  if (items.length === 0) {
    // Fallback a cualquier item
    return Object.values(ITEMS)[0];
  }
  
  return items[Math.floor(Math.random() * items.length)];
}
