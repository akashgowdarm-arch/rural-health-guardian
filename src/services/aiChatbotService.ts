import { LanguageCode } from '../types';

export interface ChatResponse {
  text: string;
  isEmergency?: boolean;
  suggestedQuestions?: string[];
}

export function getChatbotResponse(userMessage: string, language: LanguageCode): ChatResponse {
  const query = userMessage.toLowerCase().trim();

  // 1. Emergency detection
  const emergencyKeywords = [
    'emergency', 'chest pain', 'heart attack', 'cannot breathe', 'stroke', 'unconscious', 'snake bite', 'heavy bleeding',
    'आपातकाल', 'सीने में दर्द', 'दिल का दौरा', 'सांस नहीं', 'बेहोश', 'सांप', 'खून',
    'ತುರ್ತು', 'ಎದೆ ನೋವು', 'ಉಸಿರಾಟ ತೊಂದರೆ', 'ಪ್ರಜ್ಞೆ', 'ಹಾವು', 'ರಕ್ತಸ್ರಾವ'
  ];

  const hasEmergency = emergencyKeywords.some(kw => query.includes(kw));

  if (hasEmergency) {
    if (language === 'hi') {
      return {
        text: `🚨 **आपातकालीन चेतावनी:** आपके द्वारा बताए गए लक्षण गंभीर हो सकते हैं। कृपया तुरंत **108 एम्बुलेंस** को कॉल करें या निकटतम सरकारी अस्पताल / प्राथमिक स्वास्थ्य केंद्र (PHC) जाएँ। आप ऊपर दिए गए लाल **आपातकालीन SOS** बटन को भी दबा सकते हैं जिससे आपकी ग्राम आशा कार्यकर्ता को तुरंत सूचना मिल जाएगी।`,
        isEmergency: true,
        suggestedQuestions: [
          'SOS बटन कैसे काम करता है?',
          'निकटतम PHC तक कैसे पहुंचे?',
          'सांप काटने पर क्या न करें?'
        ]
      };
    } else if (language === 'kn') {
      return {
        text: `🚨 **ತುರ್ತು ಎಚ್ಚರಿಕೆ:** ನೀವು ತಿಳಿಸಿದ ಲಕ್ಷಣಗಳು ಗಂಭೀರ ವೈದ್ಯಕೀಯ ಪರಿಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ **108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ** ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ. ನಿಮ್ಮ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯ ಗಮನಕ್ಕೆ ತರಲು ಮೇಲಿರುವ ಕೆಂಪು **ತುರ್ತು SOS** ಬಟನ್ ಒತ್ತಿರಿ.`,
        isEmergency: true,
        suggestedQuestions: [
          'ತುರ್ತು SOS ಬಟನ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
          'ಹಾವು ಕಚ್ಚಿದರೆ ಏನು ಮಾಡಬೇಕು?',
          '108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಖ್ಯೆ'
        ]
      };
    } else {
      return {
        text: `🚨 **EMERGENCY WARNING:** The symptoms you mentioned may require immediate medical care. Please call **108 Emergency Ambulance** or reach the nearest Primary Health Center (PHC) immediately. You can also press the **SOS Emergency** button to alert your village ASHA worker instantly.`,
        isEmergency: true,
        suggestedQuestions: [
          'How does the SOS button work?',
          'What is the first aid for snake bite?',
          'Where is the nearest PHC?'
        ]
      };
    }
  }

  // 2. PHC / Sub-Center Working Hours & Facilities
  if (query.includes('phc') || query.includes('hospital') || query.includes('doctor') || query.includes('timing') || query.includes('अस्पताल') || query.includes('डॉक्टर') || query.includes('समय') || query.includes('ಆಸ್ಪತ್ರೆ') || query.includes('ಸಮಯ')) {
    if (language === 'hi') {
      return {
        text: `🏥 **प्राथमिक स्वास्थ्य केंद्र (PHC) जानकारी:**
- **ओपीडी समय:** सुबह 9:00 बजे से दोपहर 2:00 बजे तक और शाम 4:00 से 6:00 बजे तक (सोमवार से शनिवार)।
- **आपातकालीन सेवा व प्रसव सेवा:** 24 घंटे उपलब्ध।
- **मुफ्त सेवाएं:** आवश्यक दवाइयाँ, खून/पेशाब जाँच, नियमित टीकाकरण, और मातृत्व देखभाल।
- **सुझाव:** अपनी स्वास्थ्य पर्ची और आधार कार्ड साथ लेकर जाएं।`,
        suggestedQuestions: ['निशुल्क दवाइयां कैसे मिलती हैं?', 'आशा कार्यकर्ता से कैसे संपर्क करें?']
      };
    } else if (language === 'kn') {
      return {
        text: `🏥 **ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC) ಮಾಹಿತಿ:**
- **OPD ಸಮಯ:** ಬೆಳಿಗ್ಗೆ 9:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 2:00 ರವರೆಗೆ ಮತ್ತು ಸಂಜೆ 4:00 ರಿಂದ 6:00 ರವರೆಗೆ (ಸೋಮವಾರದಿಂದ ಶನಿವಾರ).
- **ತುರ್ತು ಮತ್ತು ಹೆರಿಗೆ ಸೇವೆಗಳು:** 24 ಗಂಟೆಗಳು ಲಭ್ಯ.
- **ಉಚಿತ ಸೇವೆಗಳು:** ಅಗತ್ಯ ಔಷಧಿಗಳು, ರಕ್ತ ಪರೀಕ್ಷೆ, ಲಸಿಕೆ ಮತ್ತು ಗರ್ಭಿಣಿಯರ ತಪಾಸಣೆ.`,
        suggestedQuestions: ['ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರನ್ನು ಸಂಪರ್ಕಿಸುವುದು ಹೇಗೆ?', 'ಉಚಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ ವಿವರ']
      };
    } else {
      return {
        text: `🏥 **Primary Health Center (PHC) Guide:**
- **OPD Timing:** 9:00 AM to 2:00 PM and 4:00 PM to 6:00 PM (Monday - Saturday).
- **Emergency & Delivery Services:** Available 24/7.
- **Free Services:** Essential medicines (NLEM), routine lab diagnostics, child immunization, and ANC maternal checkups.
- **Tip:** Carry your Aadhaar card and previous prescription slip when visiting.`,
        suggestedQuestions: ['What medicines are provided free?', 'How to request ASHA home visit?']
      };
    }
  }

  // 3. Snake Bite First Aid
  if (query.includes('snake') || query.includes('सांप') || query.includes('ಹಾವು')) {
    if (language === 'hi') {
      return {
        text: `🐍 **सांप काटने पर जीवन रक्षक प्राथमिक उपचार:**
1. **मरीज को शांत रखें** और बिल्कुल हिलने-डुलने न दें (हिलने से जहर तेजी से फैलता है)।
2. काटे गए अंग को दिल के स्तर से नीचे रखें।
3. **क्या कभी न करें:**
   - चीरा (कट) न लगाएं, मुंह से चूसने की कोशिश न करें।
   - बहुत कसकर रस्सी या कपड़ा न बांधें।
4. **तुरंत PHC या जिला अस्पताल ले जाएं** जहां एंटी-वेनम (ASV) इंजेक्शन उपलब्ध हो। 108 पर कॉल करें।`,
        suggestedQuestions: ['108 एम्बुलेंस कैसे बुलाएं?', 'हॉस्पिटल जाने तक क्या करें?']
      };
    } else if (language === 'kn') {
      return {
        text: `🐍 **ಹಾವು ಕಚ್ಚಿದಾಗ ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು:**
1. **ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿರಿಸಿ**, ಗಾಬರಿಪಡಿಸಬೇಡಿ ಮತ್ತು ನಡೆಯಲು ಬಿಡಬೇಡಿ.
2. ಕಚ್ಚಿದ ಭಾಗವನ್ನು ಹೃದಯದ ಮಟ್ಟಕ್ಕಿಂತ ಕೆಳಗೆ ಇರಿಸಿ.
3. **ಮಾಡಬಾರದ ಕೆಲಸಗಳು:**
   - ಗಾಯದ ಮೇಲೆ ಬ್ಲೇಡ್‌ನಿಂದ ಕತ್ತರಿಸಬೇಡಿ ಅಥವಾ ಬಾಯಿಯಿಂದ ಹೀರುವ ಪ್ರಯತ್ನ ಮಾಡಬೇಡಿ.
   - ತೀರಾ ಬಿಗಿಯಾಗಿ ಹಗ್ಗ ಅಥವಾ ಬಟ್ಟೆ ಕಟ್ಟಬೇಡಿ.
4. **ತಕ್ಷಣ ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ** (ಅಲ್ಲಿ ಉಚಿತ ಆಂಟಿ-ವೆನಮ್ ಇಂಜೆಕ್ಷನ್ ಇರುತ್ತದೆ). 108 ಗೆ ಕರೆ ಮಾಡಿ.`,
        suggestedQuestions: ['108 ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡುವುದು ಹೇಗೆ?', 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ವಿವರ']
      };
    } else {
      return {
        text: `🐍 **Snake Bite First Aid Protocol:**
1. **Keep the patient calm and still** — physical movement accelerates venom circulation.
2. Immobilize the bitten limb and keep it at or slightly below heart level.
3. **DO NOT:**
   - Do NOT cut, burn, or attempt to suck out the venom.
   - Do NOT apply tight tourniquets that stop blood arterial flow.
4. **Transport immediately** to the nearest PHC / Civil Hospital equipped with Anti-Snake Venom (ASV). Dial 108.`,
        suggestedQuestions: ['What to do while waiting for ambulance?', 'How to identify venomous bites?']
      };
    }
  }

  // 4. Fever / Heat Stroke / Hydration
  if (query.includes('fever') || query.includes('temperature') || query.includes('heat') || query.includes('बुखार') || query.includes('तापमान') || query.includes('लू') || query.includes('ಜ್ವರ') || query.includes('ಬಿಸಿಲು')) {
    if (language === 'hi') {
      return {
        text: `🌡️ **बुखार और लू के लिए प्राथमिक देखभाल:**
- माथे पर सामान्य (ताजे) पानी की पट्टी रखें (बर्फ का पानी न लगाएं)।
- मरीज को ओआरएस (ORS) घोल, नींबू पानी या नारियल पानी पिलाकर हाइड्रेटेड रखें।
- हल्के सूती कपड़े पहनाएं और पंखे की हवा में रखें।
- **चेतावनी:** यदि तापमान 102°F (38.9°C) से ऊपर जाए या 48 घंटे से अधिक रहे, तो तुरंत आशा कार्यकर्ता या PHC डॉक्टर को दिखाएं।`,
        suggestedQuestions: ['ओआरएस (ORS) कैसे बनाएं?', 'बुखार में क्या खाना चाहिए?']
      };
    } else if (language === 'kn') {
      return {
        text: `🌡️ **ಜ್ವರ ಮತ್ತು ಬಿಸಿಲಿನ ತಾಪಕ್ಕೆ ಆರೈಕೆ:**
- ಹಣೆಯ ಮೇಲೆ ತಣ್ಣೀರಿನ ಸ್ವಚ್ಛ ಬಟ್ಟೆಯ ಪಟ್ಟಿ ಹಾಕಿ.
- ಓಆರ್‌ಎಸ್ (ORS) ದ್ರಾವಣ, ನಿಂಬೆ ಪಾನಕ ಅಥವಾ ಎಳನೀರು ಕುಡಿಸಿ.
- ಸಡಿಲವಾದ ಹತ್ತಿ ಬಟ್ಟೆ ಧರಿಸಿ.
- **ಎಚ್ಚರಿಕೆ:** ಜ್ವರ 102°F (38.9°C) ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಅಥವಾ 2 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಮುಂದುವರಿದರೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.`,
        suggestedQuestions: ['ಮನೆಯಲ್ಲಿ ORS ಮಾಡುವುದು ಹೇಗೆ?', 'ಜ್ವರ ಬಂದಾಗ ಏನು ತಿನ್ನಬೇಕು?']
      };
    } else {
      return {
        text: `🌡️ **Fever & Heat Management Tips:**
- Apply clean room-temperature water sponging to the forehead and armpits.
- Keep well hydrated with ORS (Oral Rehydration Salts), tender coconut water, or buttermilk.
- Wear loose, light cotton clothing in a well-ventilated room.
- **Warning:** If body temperature exceeds 102°F (38.9°C) or lasts over 48 hours, consult your PHC medical officer.`,
        suggestedQuestions: ['How to prepare homemade ORS?', 'What foods are best during fever?']
      };
    }
  }

  // 5. Blood Pressure / Hypertension
  if (query.includes('blood pressure') || query.includes('bp') || query.includes('रक्तचाप') || query.includes('रक्तदाब') || query.includes('ಬಿಪಿ') || query.includes('ರಕ್ತದೊತ್ತಡ')) {
    if (language === 'hi') {
      return {
        text: `🩸 **रक्तचाप (Blood Pressure) नियंत्रण मार्गदर्शन:**
- **सामान्य स्तर:** 120/80 mmHg के आसपास।
- **खान-पान:** भोजन में नमक और तले-भुने पकवानों की मात्रा कम करें। हरी पत्तेदार सब्जियां और ताजे फल खाएं।
- **दवाइयां:** यदि डॉक्टर ने बीपी की गोली (जैसे Amlodipine/Telmisartan) लिखी है, तो उसे रोज समय पर लें, भले ही आप स्वस्थ महसूस कर रहे हों।
- **लक्षण:** चक्कर आना, सिर के पीछे दर्द, या धुंधला दिखाई देना बीपी बढ़ने के संकेत हो सकते हैं।`,
        suggestedQuestions: ['बीपी की गोली कब खानी चाहिए?', 'कम नमक वाले आहार के विकल्प']
      };
    } else if (language === 'kn') {
      return {
        text: `🩸 **ರಕ್ತದೊತ್ತಡ (Blood Pressure) ನಿರ್ವಹಣೆ:**
- **ಸಾಮಾನ್ಯ ಮಟ್ಟ:** 120/80 mmHg ಆಸುಪಾಸು.
- **ಆಹಾರ ನಿಯಮ:** ಉಪ್ಪು ಮತ್ತು ಎಣ್ಣೆಯುಕ್ತ ಆಹಾರ ಕಡಿಮೆ ಮಾಡಿ. ಹಸಿರು ತರಕಾರಿಗಳನ್ನು ಹೆಚ್ಚಾಗಿ ಸೇವಿಸಿ.
- **ಔಷಧಿ:** ವೈದ್ಯರು ಸೂಚಿಸಿದ ಬಿಪಿ ಮಾತ್ರೆಯನ್ನು ಪ್ರತಿದಿನ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ತಪ್ಪದೇ ತೆಗೆದುಕೊಳ್ಳಿ.
- **ಎಚ್ಚರಿಕೆ:** ತಲೆತಿರುಗುವಿಕೆ ಅಥವಾ ತಲೆಯ ಹಿಂಭಾಗದಲ್ಲಿ ನೋವು ಬಂದರೆ ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಿಕೊಳ್ಳಿ.`,
        suggestedQuestions: ['ಬಿಪಿ ಮಾತ್ರೆ ನಿಲ್ಲಿಸಬಹುದೇ?', 'ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಿಸಲು ಸಲಹೆಗಳು']
      };
    } else {
      return {
        text: `🩸 **Blood Pressure Management Guide:**
- **Normal Range:** Around 120/80 mmHg (Systolic/Diastolic).
- **Dietary Advice:** Reduce daily salt intake (under 1 teaspoon/day) and avoid heavily fried foods. Increase dietary potassium via greens and bananas.
- **Medication:** Never skip prescribed anti-hypertensive tablets, even if you feel fine.
- **Red Flags:** Severe headache at the back of the head, blurred vision, or chest tightness.`,
        suggestedQuestions: ['Should BP medicine be taken lifelong?', 'What to eat for high BP?']
      };
    }
  }

  // 6. Maternal & Child Health
  if (query.includes('pregnant') || query.includes('mother') || query.includes('baby') || query.includes('child') || query.includes('गर्भवती') || query.includes('माता') || query.includes('बच्चे') || query.includes('ಗರ್ಭಿಣಿ') || query.includes('ಮಗು')) {
    if (language === 'hi') {
      return {
        text: `🤰 **मातृत्व एवं शिशु स्वास्थ्य सहायता:**
- **गर्भावस्था में पोषण:** दाल, हरी सब्जियां, दूध, गुड़, और चना भरपूर खाएं।
- **आयरन व फोलिक एसिड:** आशा कार्यकर्ता से मुफ्त आयरन-फोलिक एसिड और कैल्शियम की गोलियां प्राप्त करें।
- **जाँच:** गर्भावस्था में कम से कम 4 प्रसव पूर्व जाँच (ANC) अवश्य कराएं।
- **टीकाकरण:** टिटनेस (Td) का टीका और बच्चे के जन्म के बाद सभी नियमित टीके सरकारी अस्पताल में मुफ्त लगवाएं।`,
        suggestedQuestions: ['गर्भावस्था में खतरे के लक्षण क्या हैं?', 'जननी सुरक्षा योजना (JSY) क्या है?']
      };
    } else if (language === 'kn') {
      return {
        text: `🤰 **ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ಆರೋಗ್ಯ ರಕ್ಷಣೆ:**
- **ಪೌಷ್ಟಿಕ ಆಹಾರ:** ಬೇಳೆಕಾಳುಗಳು, ಹಸಿರು ಸೊಪ್ಪು, ಹಾಲು, ಬೆಲ್ಲ ಮತ್ತು ಮೊಟ್ಟೆ ಸೇವಿಸಿ.
- **ಕಬ್ಬಿಣಾಂಶ (Iron) ಮಾತ್ರೆಗಳು:** ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯಿಂದ ಉಚಿತವಾಗಿ ಐರನ್ ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ ಮಾತ್ರೆಗಳನ್ನು ಪಡೆಯಿರಿ.
- **ತಪಾಸಣೆ:** ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಕನಿಷ್ಠ 4 ಬಾರಿ ಆಸ್ಪತ್ರೆ ತಪಾಸಣೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.
- **ಲಸಿಕೆ:** ಹುಟ್ಟಿದ ಮಗುವಿಗೆ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಲಸಿಕೆಗಳನ್ನು ತಪ್ಪದೇ ಹಾಕಿಸಿ.`,
        suggestedQuestions: ['ಗರ್ಭಿಣಿಯರಿಗೆ ಸರ್ಕಾರಿ ಸೌಲಭ್ಯಗಳು', 'ಮಗುವಿನ ಲಸಿಕಾ ವೇಳಾಪಟ್ಟಿ']
      };
    } else {
      return {
        text: `🤰 **Maternal & Child Healthcare Guide:**
- **Nutrition:** High protein lentils, iron-rich green leaves, jaggery, eggs, and dairy.
- **Free Supplements:** Collect free Iron & Folic Acid (IFA) and Calcium tablets from your village ASHA worker.
- **Antenatal Checkups (ANC):** Complete at least 4 registered ANC visits during pregnancy.
- **Institutional Delivery:** Avail Janani Suraksha Yojana (JSY) benefits for safe hospital delivery.`,
        suggestedQuestions: ['What are danger signs in pregnancy?', 'Childhood vaccination calendar']
      };
    }
  }

  // General fallback
  if (language === 'hi') {
    return {
      text: `नमस्ते! मैं आपका ग्रामीण स्वास्थ्य सहायक हूँ।
मैं सामान्य स्वास्थ्य आदतों, प्राथमिक उपचार, प्राथमिक स्वास्थ्य केंद्र (PHC) की जानकारी, और प्राथमिक देखभाल के बारे में सरल भाषा में मदद कर सकता हूँ।

⚠️ **महत्वपूर्ण सूचना:** यह एप्लिकेशन केवल सामान्य जानकारी के लिए है और डॉक्टर के उपचार का विकल्प नहीं है। किसी भी बीमारी या आपातकाल में कृपया नजदीकी स्वास्थ्य केंद्र या 108 पर संपर्क करें।`,
      suggestedQuestions: [
        'प्राथमिक स्वास्थ्य केंद्र (PHC) का समय क्या है?',
        'सांप काटने पर प्राथमिक उपचार क्या है?',
        'उच्च रक्तचाप को कैसे नियंत्रित करें?'
      ]
    };
  } else if (language === 'kn') {
    return {
      text: `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಸಹಾಯಕ.
ನಾನು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ, ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ, ಆಹಾರ ಪದ್ಧತಿ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಸೇವೆಗಳ ಬಗ್ಗೆ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ.

⚠️ **ಗಮನಿಸಿ:** ಇದು ಕೇವಲ ಸಾಮಾನ್ಯ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ ಮತ್ತು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗೆ ಪರ್ಯಾಯವಲ್ಲ. ತೀವ್ರ ಅನಾರೋಗ್ಯವಿದ್ದರೆ ದಯವಿಟ್ಟು ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಅಥವಾ 108 ಸಂಪರ್ಕಿಸಿ.`,
      suggestedQuestions: [
        'ಸ್ಥಳೀಯ PHC ಸಮಯ ಯಾವಾಗ?',
        'ಹಾವು ಕಚ್ಚಿದಾಗ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಏನು?',
        'ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ ಹೇಗೆ?'
      ]
    };
  } else {
    return {
      text: `Hello! I am your Rural Health Assistant.
I can help guide you on general wellness, nutrition, first-aid measures, maternal care, and navigating government healthcare facilities (PHC/CHCs) in simple words.

⚠️ **Important:** This assistant provides informational health monitoring and guidance only. It is not a replacement for a qualified doctor or emergency services.`,
      suggestedQuestions: [
        'What are the working hours of our local PHC?',
        'What is first aid for snake bite in fields?',
        'How to keep blood pressure in normal range?'
      ]
    };
  }
}
