import React, { createContext, useContext, useState, useEffect } from 'react';
import { HealthReading, EmergencyAlert, HealthcareNote, VillageStats, AIRiskAnalysisResult } from '../types';
import { MOCK_HEALTH_READINGS, MOCK_EMERGENCY_ALERTS, MOCK_HEALTHCARE_NOTES, MOCK_VILLAGE_STATS } from '../services/mockData';
import { analyzeHealthRisk } from '../services/aiAnalysisService';
import { SpeechService } from '../services/speechService';
import { useAuth } from './AuthContext';
import { useNetwork } from './NetworkContext';

interface HealthContextType {
  readings: HealthReading[];
  patientReadings: HealthReading[];
  latestReading: HealthReading | null;
  currentRiskAnalysis: AIRiskAnalysisResult;
  emergencyAlerts: EmergencyAlert[];
  activeEmergencyCount: number;
  healthcareNotes: HealthcareNote[];
  villageStats: VillageStats[];
  addHealthReading: (data: Omit<HealthReading, 'id' | 'user_id' | 'recorded_at' | 'is_synced'>) => Promise<HealthReading>;
  triggerEmergencySOS: (
    alertType: EmergencyAlert['alert_type'],
    notes?: string,
    gpsCoords?: { latitude: number; longitude: number; maps_url?: string }
  ) => Promise<EmergencyAlert>;
  acknowledgeAlert: (alertId: string, responderName: string) => void;
  updateAlertStatus: (alertId: string, status: EmergencyAlert['status'], notes?: string) => void;
  addHealthcareNote: (patientId: string, note: string, followUpRequired: boolean, followUpDate?: string, prescription?: string) => void;
  getUserReadings: (userId: string) => HealthReading[];
  getUserNotes: (userId: string) => HealthcareNote[];
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { isOnline, incrementPendingSync, isSyncing } = useNetwork();

  const [readings, setReadings] = useState<HealthReading[]>(MOCK_HEALTH_READINGS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(MOCK_EMERGENCY_ALERTS);
  const [healthcareNotes, setHealthcareNotes] = useState<HealthcareNote[]>(MOCK_HEALTHCARE_NOTES);
  const [villageStats, setVillageStats] = useState<VillageStats[]>(MOCK_VILLAGE_STATS);

  // When syncing completes, mark all readings as synced
  useEffect(() => {
    if (isSyncing) {
      setReadings(prev => prev.map(r => ({ ...r, is_synced: true })));
    }
  }, [isSyncing]);

  // Filter current active patient's readings (sorted newest first)
  const patientReadings = readings
    .filter(r => r.user_id === currentUser.id)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

  const latestReading = patientReadings[0] || null;

  // Real-time AI Risk Analysis for active user
  const currentRiskAnalysis = analyzeHealthRisk(latestReading, patientReadings.slice(1));

  const activeEmergencyCount = emergencyAlerts.filter(a => a.status !== 'resolved').length;

  const addHealthReading = async (
    data: Omit<HealthReading, 'id' | 'user_id' | 'recorded_at' | 'is_synced'>
  ): Promise<HealthReading> => {
    const newReading: HealthReading = {
      ...data,
      id: `hr_${Date.now()}`,
      user_id: currentUser.id,
      recorded_at: new Date().toISOString(),
      is_synced: isOnline,
    };

    if (!isOnline) {
      incrementPendingSync();
    }

    setReadings(prev => [newReading, ...prev]);

    // Check if the reading itself triggers an automatic emergency threshold
    if (newReading.spo2 < 88 || newReading.systolic_bp >= 180 || newReading.diastolic_bp >= 120 || newReading.heart_rate > 130) {
      await triggerEmergencySOS('critical_vital', `Auto-detected Critical Vital Signs: SpO2 ${newReading.spo2}%, BP ${newReading.systolic_bp}/${newReading.diastolic_bp} mmHg, HR ${newReading.heart_rate} BPM`);
    }

    return newReading;
  };

  const triggerEmergencySOS = async (
    alertType: EmergencyAlert['alert_type'],
    notes?: string,
    gpsCoords?: { latitude: number; longitude: number; maps_url?: string }
  ): Promise<EmergencyAlert> => {
    // Play emergency auditory cue
    SpeechService.playEmergencyTone();

    const newAlert: EmergencyAlert = {
      id: `alert_${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      village: currentUser.village,
      district: currentUser.district,
      phone: currentUser.phone,
      emergency_contact_phone: `${currentUser.emergency_contact.phone} (${currentUser.emergency_contact.name})`,
      alert_type: alertType,
      priority: alertType === 'cardiac' || alertType === 'critical_vital' ? 'critical' : 'high',
      status: 'new',
      latest_vitals: latestReading ? {
        heart_rate: latestReading.heart_rate,
        systolic_bp: latestReading.systolic_bp,
        diastolic_bp: latestReading.diastolic_bp,
        spo2: latestReading.spo2,
        temperature: latestReading.temperature,
        blood_sugar: latestReading.blood_sugar,
      } : undefined,
      gps_coordinates: gpsCoords,
      created_at: new Date().toISOString(),
      responder_notes: notes,
    };

    setEmergencyAlerts(prev => [newAlert, ...prev]);

    // Update village stats
    setVillageStats(prev =>
      prev.map(v =>
        v.village.toLowerCase() === currentUser.village.toLowerCase()
          ? { ...v, active_emergencies: v.active_emergencies + 1 }
          : v
      )
    );

    return newAlert;
  };

  const acknowledgeAlert = (alertId: string, responderName: string) => {
    setEmergencyAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged',
              acknowledged_at: new Date().toISOString(),
              acknowledged_by: responderName,
            }
          : a
      )
    );
  };

  const updateAlertStatus = (alertId: string, status: EmergencyAlert['status'], notes?: string) => {
    setEmergencyAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        const updated: EmergencyAlert = {
          ...a,
          status,
          responder_notes: notes || a.responder_notes,
        };
        if (status === 'resolved' && !a.resolved_at) {
          updated.resolved_at = new Date().toISOString();
        }
        return updated;
      })
    );
  };

  const addHealthcareNote = (
    patientId: string,
    note: string,
    followUpRequired: boolean,
    followUpDate?: string,
    prescription?: string
  ) => {
    const newNote: HealthcareNote = {
      id: `note_${Date.now()}`,
      healthcare_worker_id: currentUser.id,
      healthcare_worker_name: currentUser.name,
      patient_id: patientId,
      note,
      follow_up_required: followUpRequired,
      follow_up_date: followUpDate,
      prescription_advice: prescription,
      created_at: new Date().toISOString(),
    };

    setHealthcareNotes(prev => [newNote, ...prev]);
  };

  const getUserReadings = (userId: string) => {
    return readings
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  };

  const getUserNotes = (userId: string) => {
    return healthcareNotes
      .filter(n => n.patient_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  return (
    <HealthContext.Provider
      value={{
        readings,
        patientReadings,
        latestReading,
        currentRiskAnalysis,
        emergencyAlerts,
        activeEmergencyCount,
        healthcareNotes,
        villageStats,
        addHealthReading,
        triggerEmergencySOS,
        acknowledgeAlert,
        updateAlertStatus,
        addHealthcareNote,
        getUserReadings,
        getUserNotes,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
