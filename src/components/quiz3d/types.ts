import * as THREE from 'three';

export type EnvironmentTheme =
  | 'chakra'       // Special Q1 introduction with 24-spoke Ashoka Chakra
  | 'harappan'     // Ancient India / Harappan excavation site & brick ruins
  | 'cultural'     // Indian temple courtyard, pillars, flickering diyas, festive garlands
  | 'historical'   // Medieval Indian hill fort, stone ramparts, waving flags, sunset canyon
  | 'scientific'   // Jantar Mantar ancient astronomical observatory, sundial, rotating armillary, stars
  | 'geographical' // Himalayan river valley, flowing water, trees, mountains, sunlight
  | 'freedom';     // Historic Indian monumental architecture, rally grounds, tricolor banners

export interface SceneBuildResult {
  rootGroup: THREE.Group;
  update?: (time: number, delta: number) => void;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures?: THREE.Texture[];
}

export interface ThemeConfig {
  id: EnvironmentTheme;
  title: string;
  subtitle: string;
  skyTopColor: number;
  skyBottomColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ambientColor: number;
  ambientIntensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  initialCamera: [number, number, number];
  cameraTarget: [number, number, number];
  zoomLimits: [number, number]; // [min, max]
  polarLimits: [number, number]; // [min, max]
  azimuthLimits: [number, number]; // [min, max]
  buildScene: () => SceneBuildResult;
}
