import { HealthReading, AIRiskAnalysisResult, HealthStatus, RiskLevel } from '../types';

export function analyzeHealthRisk(
  currentReading: HealthReading | null,
  pastReadings: HealthReading[] = []
): AIRiskAnalysisResult {
  if (!currentReading) {
    return {
      risk_level: 'Low Risk',
      health_status: 'normal',
      summary: {
        en: 'No recent health readings recorded. Please enter a reading to get an AI risk assessment.',
        hi: 'कोई हालिया स्वास्थ्य माप दर्ज नहीं है। कृपया एआई विश्लेषण के लिए माप दर्ज करें।',
        kn: 'ಯಾವುದೇ ಇತ್ತೀಚಿನ ಆರೋಗ್ಯ ಮಾಹಿತಿ ದಾಖಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
      },
      critical_findings: {
        en: ['No recent readings logged.'],
        hi: ['कोई हालिया स्वास्थ्य माप दर्ज नहीं है।'],
        kn: ['ಯಾವುದೇ ಇತ್ತೀಚಿನ ರೀಡಿಂಗ್ ದಾಖಲಾಗಿಲ್ಲ.'],
      },
      recommendations: {
        en: ['Log your daily vitals to track your health trends.'],
        hi: ['अपने स्वास्थ्य के रुझानों को समझने के लिए नियमित रूप से माप दर्ज करें।'],
        kn: ['ನಿಮ್ಮ ಆರೋಗ್ಯದ ಸ್ಥಿತಿಯನ್ನು ತಿಳಿಯಲು ನಿಯಮಿತವಾಗಿ ದಾಖಲಿಸಿ.'],
      },
      comparison_with_baseline: {
        en: 'No prior readings available for baseline comparison.',
        hi: 'तुलना के लिए पिछला कोई स्वास्थ्य माप उपलब्ध नहीं है।',
        kn: 'ಹೋಲಿಕೆ ಮಾಡಲು ಯಾವುದೇ ಹಿಂದಿನ ರೀಡಿಂಗ್ ಲಭ್ಯವಿಲ್ಲ.',
      },
      suggested_action: 'routine_monitoring',
    };
  }

  const { heart_rate, systolic_bp, diastolic_bp, temperature, spo2, blood_sugar, meal_status } = currentReading;

  const findingsEn: string[] = [];
  const findingsHi: string[] = [];
  const findingsKn: string[] = [];

  let riskScore = 0;
  let isEmergency = false;
  let isAttention = false;

  // 1. Oxygen Saturation (SpO2)
  if (spo2 < 90) {
    findingsEn.push(`Critically low Oxygen (SpO2: ${spo2}%) below safe threshold (<90%)`);
    findingsHi.push(`गंभीर रूप से कम ऑक्सीजन (SpO2: ${spo2}%) सुरक्षित सीमा (<90%) से नीचे`);
    findingsKn.push(`ಅಪಾಯಕಾರಿ ಕಡಿಮೆ ಆಕ್ಸಿಜನ್ (SpO2: ${spo2}%) ಸುರಕ್ಷಿತ ಮಟ್ಟಕ್ಕಿಂತ (<90%) ಕೆಳಗಿದೆ`);
    riskScore += 5;
    isEmergency = true;
  } else if (spo2 <= 94) {
    findingsEn.push(`Mildly low Oxygen (SpO2: ${spo2}%) indicating respiratory strain`);
    findingsHi.push(`कम ऑक्सीजन स्तर (SpO2: ${spo2}%) सांस में खिंचाव का संकेत`);
    findingsKn.push(`ಸ್ವಲ್ಪ ಕಡಿಮೆ ಆಕ್ಸಿಜನ್ ಮಟ್ಟ (SpO2: ${spo2}%) ಉಸಿರಾಟದ ತೊಂದರೆ ಸೂಚಿಸುತ್ತದೆ`);
    riskScore += 2;
    isAttention = true;
  }

  // 2. Blood Pressure (Systolic / Diastolic)
  if (systolic_bp >= 180 || diastolic_bp >= 120) {
    findingsEn.push(`Hypertensive crisis range BP (${systolic_bp}/${diastolic_bp} mmHg)`);
    findingsHi.push(`अत्यधिक उच्च रक्तचाप आपातकालीन स्तर (${systolic_bp}/${diastolic_bp} mmHg)`);
    findingsKn.push(`ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಮಟ್ಟದ ರಕ್ತದೊತ್ತಡ (${systolic_bp}/${diastolic_bp} mmHg)`);
    riskScore += 5;
    isEmergency = true;
  } else if (systolic_bp >= 140 || diastolic_bp >= 90) {
    findingsEn.push(`Elevated Blood Pressure Stage 2 (${systolic_bp}/${diastolic_bp} mmHg)`);
    findingsHi.push(`बढ़ा हुआ रक्तचाप स्टेज 2 (${systolic_bp}/${diastolic_bp} mmHg)`);
    findingsKn.push(`ಹೆಚ್ಚಿದ ರಕ್ತದೊತ್ತಡ ಹಂತ 2 (${systolic_bp}/${diastolic_bp} mmHg)`);
    riskScore += 3;
    isAttention = true;
  } else if (systolic_bp >= 130 || diastolic_bp >= 85) {
    findingsEn.push(`Pre-hypertension reading (${systolic_bp}/${diastolic_bp} mmHg)`);
    findingsHi.push(`प्री-हाइपरटेंशन रक्तचाप (${systolic_bp}/${diastolic_bp} mmHg)`);
    findingsKn.push(`ರಕ್ತದೊತ್ತಡ ಏರಿಕೆಯ ಆರಂಭಿಕ ಹಂತ (${systolic_bp}/${diastolic_bp} mmHg)`);
    riskScore += 1;
  } else if (systolic_bp < 90 || diastolic_bp < 60) {
    findingsEn.push(`Low blood pressure (${systolic_bp}/${diastolic_bp} mmHg) - risk of fainting`);
    findingsHi.push(`कम रक्तचाप (${systolic_bp}/${diastolic_bp} mmHg) - चक्कर आने का जोखिम`);
    findingsKn.push(`ಕಡಿಮೆ ರಕ್ತದೊತ್ತಡ (${systolic_bp}/${diastolic_bp} mmHg) - ತಲೆತಿರುಗುವ ಸಾಧ್ಯತೆ`);
    riskScore += 2;
    isAttention = true;
  }

  // 3. Heart Rate (Pulse)
  if (heart_rate > 120 || heart_rate < 45) {
    findingsEn.push(`Significant pulse irregularity (${heart_rate} BPM)`);
    findingsHi.push(`अनियमित हृदय गति (${heart_rate} BPM)`);
    findingsKn.push(`ಅಸಹಜ ಹೃದಯ ಬಡಿತ (${heart_rate} BPM)`);
    riskScore += 4;
    isAttention = true;
  } else if (heart_rate > 100) {
    findingsEn.push(`Fast heart rate / Tachycardia (${heart_rate} BPM)`);
    findingsHi.push(`तेज हृदय गति (${heart_rate} BPM)`);
    findingsKn.push(`ವೇಗದ ಹೃದಯ ಬಡಿತ (${heart_rate} BPM)`);
    riskScore += 2;
  } else if (heart_rate < 55) {
    findingsEn.push(`Slow pulse rate / Bradycardia (${heart_rate} BPM)`);
    findingsHi.push(`धीमी हृदय गति (${heart_rate} BPM)`);
    findingsKn.push(`ನಿಧಾನಗತಿಯ ನಾಡಿ ಬಡಿತ (${heart_rate} BPM)`);
    riskScore += 1;
  }

  // 4. Body Temperature
  if (temperature >= 39.0) {
    findingsEn.push(`High fever (${temperature}°C / ${(temperature * 1.8 + 32).toFixed(1)}°F)`);
    findingsHi.push(`तेज बुखार (${temperature}°C)`);
    findingsKn.push(`ತೀವ್ರ ಜ್ವರ (${temperature}°C)`);
    riskScore += 3;
    isAttention = true;
  } else if (temperature >= 37.8) {
    findingsEn.push(`Mild fever (${temperature}°C)`);
    findingsHi.push(`हल्का बुखार (${temperature}°C)`);
    findingsKn.push(`ಸಾಧಾರಣ ಜ್ವರ (${temperature}°C)`);
    riskScore += 1;
  } else if (temperature < 35.0) {
    findingsEn.push(`Hypothermia danger (${temperature}°C)`);
    findingsHi.push(`शरीर का अत्यधिक ठंडा होना (${temperature}°C)`);
    findingsKn.push(`ದೇಹದ ತೀವ್ರ ತಂಪಾಗುವಿಕೆ (${temperature}°C)`);
    riskScore += 3;
    isAttention = true;
  }

  // 5. Blood Sugar
  const isFasting = meal_status === 'fasting';
  if (isFasting) {
    if (blood_sugar > 180) {
      findingsEn.push(`High fasting blood sugar (${blood_sugar} mg/dL)`);
      findingsHi.push(`खाली पेट उच्च रक्त शर्करा (${blood_sugar} mg/dL)`);
      findingsKn.push(`ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಸಕ್ಕರೆ ಅಂಶ (${blood_sugar} mg/dL)`);
      riskScore += 3;
      isAttention = true;
    } else if (blood_sugar < 65) {
      findingsEn.push(`Hypoglycemia danger (${blood_sugar} mg/dL) - low blood glucose`);
      findingsHi.push(`अत्यधिक कम शुगर स्तर (${blood_sugar} mg/dL) - हाइपोग्लाइसीमिया`);
      findingsKn.push(`ಅಪಾಯಕಾರಿ ಕಡಿಮೆ ಸಕ್ಕರೆ ಅಂಶ (${blood_sugar} mg/dL)`);
      riskScore += 4;
      isAttention = true;
    }
  } else {
    if (blood_sugar > 250) {
      findingsEn.push(`Severely high blood glucose (${blood_sugar} mg/dL)`);
      findingsHi.push(`अत्यधिक उच्च रक्त शर्करा (${blood_sugar} mg/dL)`);
      findingsKn.push(`ಅತ್ಯಧಿಕ ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟ (${blood_sugar} mg/dL)`);
      riskScore += 4;
      isAttention = true;
    }
  }

  // 6. Longitudinal baseline comparison
  let baselineDiffEn = 'Vitals align steadily with historical baseline.';
  let baselineDiffHi = 'स्वास्थ्य माप पिछले सामान्य रिकॉर्ड के अनुरूप हैं।';
  let baselineDiffKn = 'ಆರೋಗ್ಯ ವಿವರಗಳು ಹಿಂದಿನ ಸಾಮಾನ್ಯ ದಾಖಲೆಗಳೊಂದಿಗೆ ಸ್ಥಿರವಾಗಿವೆ.';

  if (pastReadings.length > 0) {
    const priorReadings = pastReadings.slice(0, 5);
    const avgPastSys = priorReadings.reduce((acc, r) => acc + r.systolic_bp, 0) / priorReadings.length;
    const avgPastHR = priorReadings.reduce((acc, r) => acc + r.heart_rate, 0) / priorReadings.length;

    const bpDelta = systolic_bp - avgPastSys;
    const hrDelta = heart_rate - avgPastHR;

    if (Math.abs(bpDelta) >= 20 || Math.abs(hrDelta) >= 18) {
      const bpStr = `${bpDelta > 0 ? '+' : ''}${Math.round(bpDelta)} mmHg`;
      const hrStr = `${hrDelta > 0 ? '+' : ''}${Math.round(hrDelta)} BPM`;
      baselineDiffEn = `Noticeable shift detected: Systolic BP changed by ${bpStr} and Heart Rate by ${hrStr} compared to your 7-day average.`;
      baselineDiffHi = `महत्वपूर्ण बदलाव: पिछले 7 दिनों के औसत की तुलना में सिस्टोलिक बीपी में ${bpStr} और हृदय गति में ${hrStr} का अंतर है।`;
      baselineDiffKn = `ಗಮನಾರ್ಹ ಬದಲಾವಣೆ: ನಿಮ್ಮ 7 ದಿನಗಳ ಸರಾಸರಿಗೆ ಹೋಲಿಸಿದರೆ ಸಿಸ್ಟೊಲಿಕ್ ಬಿಪಿಯಲ್ಲಿ ${bpStr} ಮತ್ತು ಹೃದಯ ಬಡಿತದಲ್ಲಿ ${hrStr} ವ್ಯತ್ಯಾಸ ಕಂಡುಬಂದಿದೆ.`;
      riskScore += 2;
    }
  }

  // Calculate Risk Level & Health Status
  let healthStatus: HealthStatus = 'normal';
  let risk_level: RiskLevel = 'Low Risk';
  let suggested_action: 'routine_monitoring' | 'consult_asha' | 'visit_phc' | 'emergency_dispatch' = 'routine_monitoring';

  if (isEmergency || riskScore >= 7) {
    healthStatus = 'emergency';
    risk_level = 'High Risk';
    suggested_action = 'emergency_dispatch';
  } else if (isAttention || riskScore >= 3) {
    healthStatus = 'attention';
    risk_level = 'Medium Risk';
    suggested_action = 'consult_asha';
  } else {
    healthStatus = 'normal';
    risk_level = 'Low Risk';
    suggested_action = 'routine_monitoring';
  }

  // Dynamic Multi-lingual Summaries and Recommendations
  let summaryEn = '';
  let summaryHi = '';
  let summaryKn = '';
  const recEn: string[] = [];
  const recHi: string[] = [];
  const recKn: string[] = [];

  if (risk_level === 'High Risk') {
    summaryEn = 'Your recent readings show severe deviations from healthy parameters requiring urgent attention. Please consider contacting a qualified healthcare professional or triggering SOS.';
    summaryHi = 'आपके हालिया स्वास्थ्य माप सामान्य स्तर से काफी अलग हैं। कृपया तुरंत अपनी आशा कार्यकर्ता या स्थानीय 108 एम्बुलेंस से संपर्क करें।';
    summaryKn = 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಆರೋಗ್ಯ ವಿವರಗಳು ತುರ್ತು ಗಮನ ಅಗತ್ಯವಿರುವ ಮಟ್ಟದಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಅಥವಾ ತುರ್ತು ಚಿಕಿತ್ಸಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.';

    recEn.push('Rest in a comfortable, well-ventilated position.');
    recEn.push('Use the SOS Emergency button if you experience severe shortness of breath or chest discomfort.');
    recEn.push('Notify your nearest Primary Health Center (PHC) immediately.');

    recHi.push('आरामदायक और हवादार जगह पर बैठें या लेटें।');
    recHi.push('यदि सीने में दर्द या सांस लेने में परेशानी हो तो तुरंत SOS बटन दबाएं।');
    recHi.push('निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) या 108 पर संपर्क करें।');

    recKn.push('ಆರಾಮದಾಯಕ ಮತ್ತು ಗಾಳಿಯಾಡುವ ಸ್ಥಳದಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.');
    recKn.push('ಉಸಿರಾಟ ಅಥವಾ ಎದೆನೋವು ಇದ್ದರೆ ತಕ್ಷಣ ತುರ್ತು SOS ಬಟನ್ ಬಳಸಿ.');
    recKn.push('ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ ಅಥವಾ 108 ಸಂಪರ್ಕಿಸಿ.');
  } else if (risk_level === 'Medium Risk') {
    summaryEn = 'Your recent readings show a noticeable change from your previous measurements. Please consider contacting a qualified healthcare professional or your village ASHA worker for further assessment.';
    summaryHi = 'आपके हालिया स्वास्थ्य मापों में पिछले दिनों की तुलना में बदलाव देखा गया है। कृपया सलाह के लिए अपनी ग्राम आशा कार्यकर्ता या डॉक्टर से परामर्श लें।';
    summaryKn = 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ರೀಡಿಂಗ್‌ಗಳಲ್ಲಿ ಬದಲಾವಣೆ ಕಂಡುಬಂದಿದೆ. ಹೆಚ್ಚಿನ ತಪಾಸಣೆಗಾಗಿ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಅಥವಾ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.';

    recEn.push('Check that you have taken your prescribed daily medications (e.g. BP or diabetes tablets).');
    recEn.push('Drink adequate clean water and avoid heavy physical exertion for a few hours.');
    recEn.push('Re-check your readings in 2-4 hours and share results with your ASHA worker.');

    recHi.push('जाँचें कि आपने डॉक्टर द्वारा दी गई नियमित दवाएं (उदा. बीपी या शुगर की गोली) ली हैं।');
    recHi.push('पर्याप्त स्वच्छ पानी पिएं और कुछ घंटों तक भारी शारीरिक काम से बचें।');
    recHi.push('2-4 घंटे बाद दोबारा स्वास्थ्य माप लें और अपनी आशा कार्यकर्ता को बताएं।');

    recKn.push('ನಿಮ್ಮ ನಿಗದಿತ ಔಷಧಿಗಳನ್ನು (ಬಿಪಿ ಅಥವಾ ಸಕ್ಕರೆ ಮಾತ್ರೆ) ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಾ ಪರಿಶೀಲಿಸಿ.');
    recKn.push('ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಕೆಲ ಗಂಟೆಗಳ ಕಾಲ ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ದೂರವಿರಿ.');
    recKn.push('2-4 ಗಂಟೆಗಳ ನಂತರ ಮತ್ತೆ ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯ ಗಮನಕ್ಕೆ ತನ್ನಿ.');
  } else {
    summaryEn = 'All recorded vital signs are within standard healthy reference ranges. Continue maintaining your balanced diet and regular physical activity.';
    summaryHi = 'आपके सभी स्वास्थ्य माप सामान्य और स्वस्थ सीमा में हैं। संतुलित आहार और नियमित व्यायाम जारी रखें।';
    summaryKn = 'ದಾಖಲಾದ ಎಲ್ಲಾ ಆರೋಗ್ಯ ವಿವರಗಳು ಸಾಮಾನ್ಯ ಮತ್ತು ಆರೋಗ್ಯಕರ ಮಟ್ಟದಲ್ಲಿವೆ. ಸಮತೋಲಿತ ಆಹಾರ ಮತ್ತು ನಡಿಗೆಯನ್ನು ಮುಂದುವರಿಸಿ.';

    recEn.push('Keep up your daily physical activity and hydration.');
    recEn.push('Continue balanced traditional meals with low salt and sugar.');
    recEn.push('Record your vitals at least once weekly for ongoing preventive tracking.');

    recHi.push('प्रतिदिन सुबह की सैर और पर्याप्त पानी पीने की आदत बनाए रखें।');
    recHi.push('कम नमक और कम चीनी वाला पौष्टिक घर का खाना खाएं।');
    recHi.push('नियमित स्वास्थ्य निगरानी के लिए सप्ताह में कम से कम एक बार माप दर्ज करें।');

    recKn.push('ಪ್ರತಿದಿನ ವಾಕಿಂಗ್ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯುವುದನ್ನು ಮುಂದುವರಿಸಿ.');
    recKn.push('ಕಡಿಮೆ ಉಪ್ಪು ಮತ್ತು ಸಕ್ಕರೆ ಇರುವ ಪೌಷ್ಟಿಕ ಊಟ ಸೇವಿಸಿ.');
    recKn.push('ವಾರಕ್ಕೊಮ್ಮೆಯಾದರೂ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ದಾಖಲಿಸುತ್ತಿರಿ.');
  }

  return {
    risk_level,
    health_status: healthStatus,
    summary: {
      en: summaryEn,
      hi: summaryHi,
      kn: summaryKn,
    },
    critical_findings: {
      en: findingsEn.length > 0 ? findingsEn : ['All recorded parameters within healthy range.'],
      hi: findingsHi.length > 0 ? findingsHi : ['सभी स्वास्थ्य माप सामान्य सीमा में हैं।'],
      kn: findingsKn.length > 0 ? findingsKn : ['ಎಲ್ಲಾ ಆರೋಗ್ಯ ವಿವರಗಳು ಸಾಮಾನ್ಯ ಮಟ್ಟದಲ್ಲಿವೆ.'],
    },
    recommendations: {
      en: recEn,
      hi: recHi,
      kn: recKn,
    },
    comparison_with_baseline: {
      en: baselineDiffEn,
      hi: baselineDiffHi,
      kn: baselineDiffKn,
    },
    suggested_action,
  };
}
