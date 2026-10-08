import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GPSLocation, NearbyFacility, User, EmergencyAlert } from '../types';
import { useAuth } from './AuthContext';

interface LocationContextType {
  gpsLocation: GPSLocation | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'loading';
  showPermissionModal: boolean;
  setShowPermissionModal: (show: boolean) => void;
  requestLocation: () => Promise<boolean>;
  refreshLocation: () => Promise<boolean>;
  setManualLocation: (locationName: string, coords?: { lat: number; lng: number }) => void;
  manualLocationName: string | null;
  nearbyFacilities: NearbyFacility[];
  nearestPHC: NearbyFacility | null;
  nearestASHA: NearbyFacility | null;
  nearestHospital: NearbyFacility | null;
  nearestAmbulance: NearbyFacility | null;
  getRecommendedFacilitiesForRisk: (condition: EmergencyAlert['alert_type']) => NearbyFacility[];
  getGoogleMapsUrl: (destLat?: number, destLng?: number) => string;
  getShareLocationText: () => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Rich Database of Rural & District Healthcare Facilities
const FACILITY_DATABASE: Omit<NearbyFacility, 'distanceKm' | 'estimatedTimeMins'>[] = [
  {
    id: 'phc_rampur',
    name: 'Rampur 24x7 Primary Health Centre (PHC)',
    type: 'phc',
    category: 'phc',
    phone: '+91 542 223344',
    address: 'Main Road, PHC Health Sector 2, Rampur',
    doctorOnDuty: 'Dr. S. Sharma (MBBS, DHO)',
    availableBeds: 12,
    ambulanceAvailable: true,
    is24x7: true,
    specialties: ['24x7 Emergency Triage', 'Oxygen Beds', 'Maternity Care', 'General Medicine'],
    suitableFor: ['breathing', 'fever_convulsion', 'sos_button', 'critical_vital', 'cardiac'],
    latitude: 25.3176,
    longitude: 82.9739,
  },
  {
    id: 'hosp_varanasi_dist',
    name: 'District Government Hospital & Emergency Trauma Centre',
    type: 'district_hospital',
    category: 'government_hospital',
    phone: '+91 542 288990',
    address: 'Civil Lines, District Headquarters, Varanasi',
    doctorOnDuty: 'Emergency Trauma Specialist on Duty',
    availableBeds: 150,
    ambulanceAvailable: true,
    is24x7: true,
    specialties: ['Advanced Cardiac ICU', 'Trauma Surgery', 'Blood Bank', 'Ventilators', '24x7 Emergency'],
    suitableFor: ['cardiac', 'fall_injury', 'critical_vital', 'breathing', 'sos_button'],
    latitude: 25.342,
    longitude: 83.008,
  },
  {
    id: 'amb_108_rampur',
    name: 'National 108 Emergency Ambulance Dispatch Base',
    type: 'ambulance_base',
    category: 'ambulance',
    phone: '108',
    address: 'Highway Junction Emergency Station 3',
    doctorOnDuty: 'Paramedic Emergency Team Alpha',
    ambulanceAvailable: true,
    is24x7: true,
    specialties: ['Mobile Oxygen Support', 'Defibrillator (AED)', 'Rapid Emergency Transport'],
    suitableFor: ['cardiac', 'breathing', 'fall_injury', 'fever_convulsion', 'sos_button', 'critical_vital'],
    latitude: 25.312,
    longitude: 82.968,
  },
  {
    id: 'chc_kashi',
    name: 'Kashi Community Health Centre (CHC)',
    type: 'chc',
    category: 'chc',
    phone: '+91 542 255667',
    address: 'Rural Bypass Road, Kashi Sector',
    doctorOnDuty: 'Dr. P. Verma (MD Medicine)',
    availableBeds: 30,
    ambulanceAvailable: true,
    is24x7: true,
    specialties: ['Inpatient Care', 'Minor Surgery', 'Pediatrics', 'X-Ray & Pathology'],
    suitableFor: ['fever_convulsion', 'fall_injury', 'critical_vital', 'sos_button'],
    latitude: 25.335,
    longitude: 82.992,
  },
  {
    id: 'asha_sunita',
    name: 'ASHA Health Sub-Center & First Aid Post',
    type: 'asha_subcenter',
    category: 'clinic',
    phone: '+91 97110 55443',
    address: 'Anganwadi Community Center 4, North Sector',
    doctorOnDuty: 'Sunita Devi (Lead ASHA Worker)',
    availableBeds: 2,
    ambulanceAvailable: false,
    is24x7: false,
    specialties: ['First Aid & Wound Dressing', 'Basic Vitals Monitoring', 'Oral Rehydration & Antipyretics'],
    suitableFor: ['fever_convulsion', 'sos_button'],
    latitude: 25.322,
    longitude: 82.981,
  },
  {
    id: 'clinic_ayush_wellness',
    name: 'Ayushman Arogya Mandir (Health & Wellness Clinic)',
    type: 'phc',
    category: 'clinic',
    phone: '+91 542 244112',
    address: 'Village Panchayat Bhavan Complex',
    doctorOnDuty: 'Community Health Officer (CHO) Priya',
    availableBeds: 4,
    ambulanceAvailable: false,
    is24x7: false,
    specialties: ['NCD Screening (BP & Sugar)', 'Tele-consultation', 'Essential Drugs Dispensary'],
    suitableFor: ['critical_vital', 'fever_convulsion'],
    latitude: 25.325,
    longitude: 82.977,
  },
];

// Preset Village Coordinates
export const KNOWN_VILLAGES: Record<string, { lat: number; lng: number; district: string; state: string }> = {
  Rampur: { lat: 25.3188, lng: 82.9789, district: 'Varanasi', state: 'Uttar Pradesh' },
  Belur: { lat: 12.986, lng: 77.584, district: 'Mandya', state: 'Karnataka' },
  'Shivamogga Hamlet 3': { lat: 13.9299, lng: 75.5681, district: 'Shivamogga', state: 'Karnataka' },
  'Holalkere Cross': { lat: 14.0325, lng: 76.1852, district: 'Chitradurga', state: 'Karnataka' },
  Varanasi: { lat: 25.3176, lng: 82.9739, district: 'Varanasi', state: 'Uttar Pradesh' },
  Mandya: { lat: 12.524, lng: 76.896, district: 'Mandya', state: 'Karnataka' },
  Bengaluru: { lat: 12.9716, lng: 77.5946, district: 'Bengaluru Urban', state: 'Karnataka' },
};

// Calculate Haversine distance in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('prompt');
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [manualLocationName, setManualLocationName] = useState<string | null>(null);

  // Initialize or fallback to user's registered village
  const initializeFallbackLocation = (user?: User) => {
    const villageName = manualLocationName || user?.village || 'Rampur';
    const coords = KNOWN_VILLAGES[villageName] || { lat: 25.3188, lng: 82.9789, district: 'Varanasi', state: 'Uttar Pradesh' };
    
    setGpsLocation({
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: 50,
      timestamp: new Date().toISOString(),
      source: 'village_fallback',
      address: `${villageName}, ${coords.district || user?.district || 'Varanasi'}, ${coords.state || user?.state || 'Uttar Pradesh'}`,
    });
  };

  // Reverse geocoding helper to get real address
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (res.ok) {
        const data = await res.json();
        const suburb = data.address?.suburb || data.address?.village || data.address?.town || data.address?.city || data.address?.county;
        const state = data.address?.state;
        if (suburb) {
          return `${suburb}${state ? `, ${state}` : ''} (Live GPS Fix)`;
        }
      }
    } catch {
      // Ignore network errors
    }
    return `${currentUser.village || 'Rampur'}, ${currentUser.district || 'Varanasi'} (Live GPS Fix)`;
  };

  // IP Geolocation fallback
  const fetchIPLocation = async (): Promise<boolean> => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const newLocation: GPSLocation = {
            latitude: Number(data.latitude.toFixed(5)),
            longitude: Number(data.longitude.toFixed(5)),
            accuracy: 500,
            timestamp: new Date().toISOString(),
            source: 'gps',
            address: `${data.city || currentUser.village}, ${data.region || currentUser.district} (Auto Network Location)`,
          };
          setGpsLocation(newLocation);
          setPermissionStatus('granted');
          setShowPermissionModal(false);
          return true;
        }
      }
    } catch {
      // Ignore
    }
    return false;
  };

  // Request high-accuracy GPS Coordinates
  const requestLocation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setPermissionStatus('loading');

      if (!navigator.geolocation) {
        fetchIPLocation().then((success) => {
          if (!success) {
            setPermissionStatus('denied');
            initializeFallbackLocation(currentUser);
          }
          resolve(success);
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const lat = Number(latitude.toFixed(5));
          const lng = Number(longitude.toFixed(5));
          const address = await fetchAddress(lat, lng);

          const newLocation: GPSLocation = {
            latitude: lat,
            longitude: lng,
            accuracy: Math.round(accuracy),
            timestamp: new Date().toISOString(),
            source: 'gps',
            address,
          };

          setGpsLocation(newLocation);
          setPermissionStatus('granted');
          setManualLocationName(null);
          localStorage.setItem('rhg_gps_permission', 'granted');
          setShowPermissionModal(false);
          resolve(true);
        },
        async (error) => {
          console.warn('Browser GPS permission not granted:', error.message);
          const ipSuccess = await fetchIPLocation();
          if (!ipSuccess) {
            setPermissionStatus('denied');
            initializeFallbackLocation(currentUser);
          }
          resolve(ipSuccess);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  };

  // Refresh current location
  const refreshLocation = async (): Promise<boolean> => {
    return await requestLocation();
  };

  // Allow manual village / town location selection when GPS is denied or restricted
  const setManualLocation = (locationName: string, customCoords?: { lat: number; lng: number }) => {
    setManualLocationName(locationName);
    const coords = customCoords || KNOWN_VILLAGES[locationName] || { lat: 25.3188, lng: 82.9789, district: 'Varanasi', state: 'Uttar Pradesh' };
    
    setGpsLocation({
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: 100,
      timestamp: new Date().toISOString(),
      source: 'village_fallback',
      address: `${locationName} (Manual Location Selected)`,
    });
    setPermissionStatus('granted');
    setShowPermissionModal(false);
  };

  // Initialize on mount
  useEffect(() => {
    initializeFallbackLocation(currentUser);
    const savedPermission = localStorage.getItem('rhg_gps_permission');
    if (savedPermission === 'granted') {
      requestLocation();
    }
  }, [currentUser.village]);

  // Dynamically compute distance and ETA to each healthcare facility based on current user coordinates
  const currentLat = gpsLocation?.latitude || 25.3188;
  const currentLng = gpsLocation?.longitude || 82.9789;

  const nearbyFacilities: NearbyFacility[] = FACILITY_DATABASE.map((fac) => {
    const distanceKm = calculateDistanceKm(currentLat, currentLng, fac.latitude, fac.longitude);
    const estimatedTimeMins = Math.max(3, Math.round((distanceKm / 30) * 60) + 2);

    return {
      ...fac,
      distanceKm: Math.max(0.4, distanceKm),
      estimatedTimeMins,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestPHC = nearbyFacilities.find((f) => f.type === 'phc') || nearbyFacilities[0];
  const nearestASHA = nearbyFacilities.find((f) => f.type === 'asha_subcenter') || null;
  const nearestHospital = nearbyFacilities.find((f) => f.type === 'district_hospital' || f.type === 'chc') || null;
  const nearestAmbulance = nearbyFacilities.find((f) => f.type === 'ambulance_base') || null;

  // Prioritize nearest appropriate healthcare facilities based on detected health-risk category
  const getRecommendedFacilitiesForRisk = (condition: EmergencyAlert['alert_type']): NearbyFacility[] => {
    return nearbyFacilities.filter((f) => f.suitableFor?.includes(condition)).slice(0, 3);
  };

  const getGoogleMapsUrl = (destLat?: number, destLng?: number): string => {
    if (destLat && destLng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${destLat},${destLng}&travelmode=driving`;
    }
    return `https://www.google.com/maps/?q=${currentLat},${currentLng}`;
  };

  const getShareLocationText = (): string => {
    const locAddress = gpsLocation?.address || `${currentUser.village}, ${currentUser.district}`;
    const mapLink = `https://maps.google.com/?q=${currentLat},${currentLng}`;
    return `🚨 EMERGENCY MEDICAL ALERT - Rural Health Guardian\nPatient: ${currentUser.name} (${currentUser.age} yrs)\nLocation: ${locAddress}\nLive GPS: ${currentLat}, ${currentLng}\nGoogle Maps: ${mapLink}\nEmergency Contact: ${currentUser.emergency_contact.phone}`;
  };

  return (
    <LocationContext.Provider
      value={{
        gpsLocation,
        permissionStatus,
        showPermissionModal,
        setShowPermissionModal,
        requestLocation,
        refreshLocation,
        setManualLocation,
        manualLocationName,
        nearbyFacilities,
        nearestPHC,
        nearestASHA,
        nearestHospital,
        nearestAmbulance,
        getRecommendedFacilitiesForRisk,
        getGoogleMapsUrl,
        getShareLocationText,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
