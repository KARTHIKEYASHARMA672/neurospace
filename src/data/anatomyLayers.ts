export interface SystemLayerVisibility {
  brain: boolean;
  centralNervous: boolean;
  peripheralNerves: boolean;
  autonomicOrgans: boolean;
  skinIntegumentary: boolean;
  nerveImpulses: boolean;
  dermatomeBands: boolean;
}

export const DEFAULT_LAYERS: SystemLayerVisibility = {
  brain: true,
  centralNervous: true,
  peripheralNerves: true,
  autonomicOrgans: true,
  skinIntegumentary: true,
  nerveImpulses: true,
  dermatomeBands: false,
};
