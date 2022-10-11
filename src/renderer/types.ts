export interface HueSettingsStore {
  bridgeIpAddress: string;
  username: string;
  light?: HueLight;
  group?: string | null;
}

export interface TeamSettingsStore {
  teams: Team[]
}

export interface Hue {
  Bridge: HueBridge
  Light: HueLight
}
export interface HueBridge {
  ipaddress: string
  name: string
}

export interface HueLight {
  data: LightData
  attributes: Record<string, unknown>
  populationData: Record<string, unknown>
  mappedColorGamut: string
}

export interface LightData {
  id: number
  state: LightState
  swupdate: Record<string, unknown>
  type: string
  name: string
  modelid: string
  manufacturername: string
  productname: string
  capabilities: Record<string, unknown>
  config: Record<string, unknown>
  uniqueid: string
  swversion: string
  swconfigid: string
  productid: string
}

export interface LightState {
  on: boolean
  bri: number
  hue: number
  sat: number
  effect: string
  xy: number[]
  ct: number
  alert: string
  colormode: string
  mode: string
  reachable: boolean
}

export interface Team {
  city?: string
  name: string
  short: string
  primaryColor: string
  secondaryColor: string
  id: number
  chant: string
  nextGame?: string
  currentGame?: any
}
