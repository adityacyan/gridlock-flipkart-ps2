export interface PredictRequest {
  latitude: number
  longitude: number
  event_type: string
  event_cause: string
  start_hour: number
  day_of_week: number
  month: number
  day: number
  corridor?: string
  police_station?: string
  zone?: string
  veh_type?: string
  duration_mins?: number
  junction?: string
}

export interface Recommendations {
  priority_flag: string
  manpower_min: number
  manpower_max: number
  barricading: string
  diversion: string
  impact_minutes: number
  pre_deploy?: string
  peak_note?: string
  special_action?: string
}

export interface PredictResponse {
  severity_level: number
  severity_label: string
  confidence: number
  class_probabilities: Record<string, number>
  recommendations: Recommendations
  location_cluster: number
}

export interface MetaResponse {
  corridors: string[]
  police_stations: string[]
  zones: string[]
}

export interface HistoryEntry extends PredictResponse {
  id: string
  timestamp: string
  input: PredictRequest
}
