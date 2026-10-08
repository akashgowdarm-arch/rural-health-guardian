export type UserRole = 'patient' | 'worker' | 'admin';

export type HealthStatus = 'normal' | 'attention' | 'emergency';

export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'new' | 'acknowledged' | 'responding' | 'resolved';

export type LanguageCode = 'en' | 'hi' | 'kn';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  village: string;
  district: string;
  state: string;
  role: UserRole;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  blood_group?: string;
  known_conditions?: string[];
  asha_worker_id?: string;
  created_at: string;
}

export interface HealthReading {
  id: string;
  user_id: string;
  heart_rate: number; // bpm
  systolic_bp: number; // mmHg
  diastolic_bp: number; // mmHg
  temperature: number; // °C
  spo2: number; // %
  blood_sugar: number; // mg/dL
  meal_status?: 'fasting' | 'post_prandial' | 'random';
  symptoms?: string[];
  recorded_at: string;
  is_synced?: boolean;
  notes?: string;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  source: 'gps' | 'village_fallback';
  address?: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'phc' | 'chc' | 'district_hospital' | 'asha_subcenter' | 'ambulance_base';
  category: 'government_hospital' | 'phc' | 'chc' | 'clinic' | 'ambulance';
  distanceKm: number;
  estimatedTimeMins: number;
  phone: string;
  address: string;
  doctorOnDuty?: string;
  availableBeds?: number;
  ambulanceAvailable?: boolean;
  is24x7?: boolean;
  specialties?: string[];
  suitableFor?: ('cardiac' | 'breathing' | 'fall_injury' | 'fever_convulsion' | 'sos_button' | 'critical_vital')[];
  latitude: number;
  longitude: number;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  user_name: string;
  village: string;
  district: string;
  phone: string;
  emergency_contact_phone: string;
  alert_type: 'cardiac' | 'breathing' | 'fall_injury' | 'fever_convulsion' | 'sos_button' | 'critical_vital';
  priority: AlertPriority;
  status: AlertStatus;
  latest_vitals?: Partial<HealthReading>;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
    maps_url?: string;
  };
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  responder_notes?: string;
}

export interface HealthcareNote {
  id: string;
  healthcare_worker_id: string;
  healthcare_worker_name: string;
  patient_id: string;
  note: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  prescription_advice?: string;
  created_at: string;
}

export interface VillageStats {
  village: string;
  district: string;
  total_citizens: number;
  active_patients: number;
  needing_attention: number;
  active_emergencies: number;
  asha_worker_name: string;
  phc_distance_km: number;
  nearest_hospital: string;
}

export interface AIRiskAnalysisResult {
  risk_level: RiskLevel;
  health_status: HealthStatus;
  summary: {
    en: string;
    hi: string;
    kn: string;
  };
  critical_findings: {
    en: string[];
    hi: string[];
    kn: string[];
  };
  recommendations: {
    en: string[];
    hi: string[];
    kn: string[];
  };
  comparison_with_baseline: {
    en: string;
    hi: string;
    kn: string;
  };
  suggested_action: 'routine_monitoring' | 'consult_asha' | 'visit_phc' | 'emergency_dispatch';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language: LanguageCode;
  suggestedQuestions?: string[];
  isWarning?: boolean;
}

