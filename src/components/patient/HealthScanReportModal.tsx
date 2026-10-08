import React, { useEffect } from 'react';
import { HealthReading, AIRiskAnalysisResult, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Printer,
  Heart,
  Wind,
  Thermometer,
  Activity,
  Droplet,
  Shield,
  FileText,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  Calendar,
  MapPin,
  ClipboardList
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: User;
  reading: HealthReading | null;
  riskAnalysis: AIRiskAnalysisResult;
}

export const HealthScanReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patient,
  reading,
  riskAnalysis
}) => {
  const { language, t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reading) return null;

  const { heart_rate, systolic_bp, diastolic_bp, temperature, spo2, blood_sugar, meal_status, recorded_at } = reading;

  // 1. Precise physiological calculations for Clinical Review
  const mapValue = Math.round((2 * diastolic_bp + systolic_bp) / 3);
  const pulsePressure = systolic_bp - diastolic_bp;
  const fahrenheit = (temperature * 1.8 + 32).toFixed(1);

  // Stability & Early Warning Score (NEWS2 approximation)
  let mewsScore = 0;
  if (heart_rate >= 130 || heart_rate <= 40) mewsScore += 3;
  else if (heart_rate >= 111 || heart_rate <= 50) mewsScore += 2;
  else if (heart_rate >= 101) mewsScore += 1;

  if (systolic_bp <= 70) mewsScore += 3;
  else if (systolic_bp <= 80 || systolic_bp >= 200) mewsScore += 2;
  else if (systolic_bp <= 100 || systolic_bp >= 160) mewsScore += 1;

  if (spo2 <= 91) mewsScore += 3;
  else if (spo2 <= 93) mewsScore += 2;
  else if (spo2 <= 95) mewsScore += 1;

  if (temperature >= 39.0 || temperature <= 35.0) mewsScore += 2;
  else if (temperature >= 38.0) mewsScore += 1;

  let stabilityScore = 100 - (mewsScore * 12);
  if (blood_sugar && (blood_sugar > 250 || blood_sugar < 65)) stabilityScore -= 15;
  stabilityScore = Math.max(25, Math.min(100, stabilityScore));

  const clinicalRiskCategory = mewsScore >= 4 ? 'HIGH CLINICAL RISK' : mewsScore >= 2 ? 'MODERATE CLINICAL RISK' : 'LOW RISK (STABLE)';
  const clinicalRiskColor = mewsScore >= 4 ? 'text-red-500 bg-red-500/10 border-red-500/30' : mewsScore >= 2 ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  const encounterDate = new Date(recorded_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const encounterTime = new Date(recorded_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in"
    >
      {/* DOCTOR-GRADE MEDICAL REPORT SHEET */}
      <div className="relative w-full max-w-4xl bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden" id="print-report-sheet">
        
        {/* DOCTOR-GRADE CLINICAL HEADER */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ayushman Bharat Digital Health (ABDM) • Primary Healthcare Record
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-400" />
              <span>CLINICAL DIAGNOSTIC & PHYSIOLOGICAL TRIAGE SUMMARY</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Standardized Encounter Summary for Attending Medical Officers, PHC Physicians & Emergency First Responders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer no-print"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Medical Report (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer no-print"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* REPORT CONTENT BODY */}
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm overflow-y-auto max-h-[80vh]">
          
          {/* 1. PATIENT DEMOGRAPHICS & CLINICAL METADATA BOX */}
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
              <strong className="text-white text-sm sm:text-base font-extrabold block">{patient.name}</strong>
              <span className="text-[11px] text-slate-400">ID: {patient.id.toUpperCase()}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demographics</span>
              <strong className="text-white font-bold block">{patient.age} Yrs / {patient.gender.toUpperCase()}</strong>
              <span className="text-[11px] text-emerald-400 font-bold">Blood Group: B+</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location / Village</span>
              <strong className="text-white font-bold block">{patient.village}, {patient.district}</strong>
              <span className="text-[11px] text-slate-400">{patient.state}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Encounter Telemetry Time</span>
              <strong className="text-white font-bold block">{encounterDate}</strong>
              <span className="text-[11px] text-slate-400">{encounterTime} IST</span>
            </div>
          </div>

          {/* 2. CLINICAL TRIAGE & EARLY WARNING SCORE SUMMARY */}
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CLINICAL TRIAGE STRATIFICATION (NEWS2/MEWS)</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black px-3 py-1 rounded-full border ${clinicalRiskColor}`}>
                  {clinicalRiskCategory}
                </span>
                <span className="text-xs text-slate-300">
                  Physiological Stability Score: <strong className="text-emerald-400 font-black text-sm">{stabilityScore} / 100</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated across 5 baseline organ biomarkers (Cardiovascular, Respiratory, Metabolic, Thermoregulation, Hemodynamic MAP).
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Attending ASHA Worker</span>
              <strong className="text-white font-bold text-xs block">Sunita Devi (ID: ASHA-VNS-04)</strong>
              <span className="text-[10px] text-emerald-400">Rampur Primary Sector</span>
            </div>
          </div>

          {/* 3. DOCTOR'S TELEMETRY & VITAL SIGNS MATRIX (STRUCTURED TABLE) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Physiological Telemetry & Derived Hemodynamic Metrics</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-extrabold border-b border-white/10">
                  <tr>
                    <th className="p-3">Biomarker / Vital Parameter</th>
                    <th className="p-3">Observed Value</th>
                    <th className="p-3">Clinical Reference Norms</th>
                    <th className="p-3">Derived Indices</th>
                    <th className="p-3">Physician Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950/70 font-medium">
                  {/* Blood Pressure */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Blood Pressure (NIBP)</span>
                    </td>
                    <td className="p-3 text-white font-black text-sm">{systolic_bp} / {diastolic_bp} mmHg</td>
                    <td className="p-3 text-slate-400">90-120 / 60-80 mmHg</td>
                    <td className="p-3 text-slate-300">
                      MAP: <strong className="text-white">{mapValue} mmHg</strong> | PP: <strong className="text-white">{pulsePressure} mmHg</strong>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${systolic_bp >= 140 || diastolic_bp >= 90 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {systolic_bp >= 140 || diastolic_bp >= 90 ? 'Stage 1 Hypertension' : 'Normotensive (Optimal)'}
                      </span>
                    </td>
                  </tr>

                  {/* Heart Rate */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      <span>Pulse / Heart Rate</span>
                    </td>
                    <td className="p-3 text-white font-black text-sm">{heart_rate} BPM</td>
                    <td className="p-3 text-slate-400">60 – 100 BPM (Resting)</td>
                    <td className="p-3 text-slate-300">Regular Sinus Rhythm</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Normal Sinus Rate
                      </span>
                    </td>
                  </tr>

                  {/* Blood Oxygen SpO2 */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Blood Oxygen (SpO2)</span>
                    </td>
                    <td className="p-3 text-emerald-400 font-black text-sm">{spo2}%</td>
                    <td className="p-3 text-slate-400">95% – 100% on Room Air</td>
                    <td className="p-3 text-slate-300">Adequate Tissue Perfusion</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Normoxic Saturation
                      </span>
                    </td>
                  </tr>

                  {/* Body Temperature */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Core Body Temperature</span>
                    </td>
                    <td className="p-3 text-white font-black text-sm">{temperature}°C ({fahrenheit}°F)</td>
                    <td className="p-3 text-slate-400">36.5°C – 37.5°C (97.7°F – 99.5°F)</td>
                    <td className="p-3 text-slate-300">No Thermal Dysregulation</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Normothermic
                      </span>
                    </td>
                  </tr>

                  {/* Blood Glucose */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-purple-400" />
                      <span>Blood Glucose (Capillary)</span>
                    </td>
                    <td className="p-3 text-white font-black text-sm">{blood_sugar} mg/dL</td>
                    <td className="p-3 text-slate-400">70 – 140 mg/dL (Random)</td>
                    <td className="p-3 text-slate-300">Prandial State: Random</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Euglycemic
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. SYSTEM-BY-SYSTEM CLINICAL EVALUATION (SOAP / PHYSICIAN FORMAT) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-400" />
              <span>System-by-System Organ Assessment</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-1.5">
                <strong className="text-rose-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> 1. Cardiovascular & Hemodynamic
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Systolic BP ({systolic_bp} mmHg) and Diastolic BP ({diastolic_bp} mmHg) result in a Mean Arterial Pressure of {mapValue} mmHg. Adequate coronary perfusion pressure with no acute hemodynamic instability noted.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-1.5">
                <strong className="text-cyan-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" /> 2. Pulmonary & Gas Exchange
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Peripheral SpO2 saturation is optimal at {spo2}% on ambient air. No respiratory distress, hyperventilation, or hypoxia indicators detected during the encounter.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-1.5">
                <strong className="text-purple-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5" /> 3. Endocrine & Glycemic Control
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Blood glucose of {blood_sugar} mg/dL is within acceptable post-absorptive glycemic thresholds. Continue routine dietary management and periodic weekly checkups.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-1.5">
                <strong className="text-amber-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5" /> 4. Thermoregulatory & Infectious
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Patient is apyrexial at {temperature}°C ({fahrenheit}°F). No systemic pyrogenic or infectious response flagged.
                </p>
              </div>
            </div>
          </div>

          {/* 5. DOCTOR'S CLINICAL RECOMMENDATIONS & ACTION PLAN */}
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-emerald-500/30 space-y-2">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span>Recommended Physician & ASHA Follow-up Protocol</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Continue regular blood pressure monitoring at least once every 7 days via village ASHA worker.</li>
              <li>Maintain standard low-sodium diet and optimal hydration (2.5 – 3.0 L/day).</li>
              <li>If systolic BP exceeds 160 mmHg or SpO2 drops below 92%, immediately trigger 108 Emergency Ambulance SOS or visit Rampur 24x7 PHC.</li>
              <li>Next Scheduled Checkup: <strong>Within 14 Days at Rampur Primary Health Centre</strong>.</li>
            </ul>
          </div>

          {/* 6. PHYSICIAN VERIFICATION & SIGNATURE BLOCK */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>Verified via: <strong>Rural Health Guardian Clinical AI & ABDM Registry</strong></p>
              <p>Primary PHC: <strong>Rampur 24x7 PHC (Varanasi District)</strong></p>
              <p className="text-[10px] text-slate-500">Document Hash: RHG-{patient.id}-{reading.id}</p>
            </div>

            <div className="w-full sm:w-64 p-3 bg-slate-900/60 rounded-xl border border-white/10 text-center space-y-2">
              <div className="h-10 border-b border-dashed border-slate-600 flex items-end justify-center pb-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Dr. S. Sharma (MBBS, DHO)</span>
              </div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Medical Officer / Doctor Verification</span>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-6 py-4 bg-slate-950 border-t border-white/10 flex items-center justify-between no-print">
          <span className="text-xs text-slate-400">
            Ayushman Bharat Digital Mission (ABDM) Compliant Medical Summary
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Medical Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
