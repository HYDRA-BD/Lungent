export interface FAQItem {
  id: string
  category: 'general' | 'clinical' | 'screening' | 'privacy' | 'account'
  questionEn: string
  questionBn: string
  answerEn: string
  answerBn: string
}

export const FAQS_DATA: FAQItem[] = [
  // General & Purpose
  {
    id: 'what-is-lungent',
    category: 'general',
    questionEn: 'What is Lungent and what is its primary purpose?',
    questionBn: 'লানজেন্ট (Lungent) কী এবং এর মূল উদ্দেশ্য কী?',
    answerEn:
      'Lungent is an intelligent lung health assessment and clinical decision-support web platform. Its primary mission is to identify individuals at elevated risk of lung cancer early, evaluate their eligibility for low-dose CT screening, and assist healthcare workers and clinicians in clinical triage. It is designed specifically for healthcare environments in Bangladesh and international expansion.',
    answerBn:
      'লানজেন্ট হলো একটি আধুনিক ওয়েব প্ল্যাটফর্ম যা ফুসফুসের ক্যান্সারের ঝুঁকি আগেভাগে নিরূপণ করতে এবং স্ক্রীনিং সংক্রান্ত সিদ্ধান্ত নিতে সাহায্য করে। সাধারণ মানুষ যাতে সঠিক সময়ে চিকিৎসকের শরণাপন্ন হতে পারে এবং চিকিৎসকরা যেন কাঠামোগত তথ্য পান—সেই উদ্দেশ্যে এটি তৈরি করা হয়েছে।',
  },
  {
    id: 'who-can-use-lungent',
    category: 'general',
    questionEn: 'Who can use the Lungent platform?',
    questionBn: 'কারা লানজেন্ট প্ল্যাটফর্ম ব্যবহার করতে পারবেন?',
    answerEn:
      'Lungent is built for multiple stakeholders: (1) Individuals & Patients completing personal assessments, (2) Community Healthcare Workers conducting screening camps in regional areas, (3) Healthcare Professionals (general practitioners, pulmonologists, and oncologists) reviewing patient triage data, and (4) System Administrators overseeing clinical facilities and audit governance.',
    answerBn:
      'লানজেন্ট মূলত ৪ ধরনের ব্যবহারকারীর জন্য তৈরি: (১) সাধারণ রোগী বা ব্যক্তি যারা নিজেদের ঝুঁকি মূল্যায়ন করতে চান, (২) তৃণমূল কমিউনিটি স্বাস্থ্যকর্মী যারা মাঠপর্যায়ে স্ক্রীনিং পরিচালনা করেন, (৩) বিশেষজ্ঞ চিকিৎসক যারা রোগীর ইতিহাস ও ট্রায়াজ পর্যালোচনা করেন, এবং (৪) স্বাস্থ্য প্রশাসন যারা সুরক্ষা ও নীতিমালা তত্ত্বাবধান করেন।',
  },

  // Clinical Scope & Diagnosis
  {
    id: 'does-lungent-diagnose-cancer',
    category: 'clinical',
    questionEn: 'Does Lungent diagnose lung cancer?',
    questionBn: 'লানজেন্ট কি ফুসফুসের ক্যান্সার রোগ নির্ণয় (Diagnose) করতে পারে?',
    answerEn:
      'No. Absolutely not. Lungent is a clinical decision-support and risk-stratification system, NOT a diagnostic medical device. It cannot confirm or rule out cancer. A definitive diagnosis requires physical clinical examination, diagnostic chest imaging, bronchoscopy, and histological tissue biopsy performed by qualified medical specialists.',
    answerBn:
      'না, একেবারেই নয়। লানজেন্ট কোনো রোগ নির্ণয় করে না। এটি একটি সিদ্ধান্ত সহায়তা ও ঝুঁকি নিরূপণ ব্যবস্থা। ক্যান্সার নিশ্চিত বা নাকচ করার জন্য বিশেষজ্ঞ চিকিৎসকের শারীরিক পরীক্ষা, বুকের বিশেষ স্ক্যান ও ল্যাবরেটরি বায়োপসি অপরিহার্য।',
  },
  {
    id: 'what-does-low-risk-mean',
    category: 'clinical',
    questionEn: 'What does a "low risk" score mean? Am I guaranteed to be free of cancer?',
    questionBn: '"কম ঝুঁকি" (Low Risk) ফলাফলের অর্থ কী? আমি কি সম্পূর্ণ ঝুঁকিমুক্ত?',
    answerEn:
      'A low estimated risk score indicates that based on the provided inputs (age, smoking history, cooking fuels, and reported symptoms), statistical probability of lung cancer is comparatively low. However, a low risk score is NEVER a guarantee that cancer is absent. If you develop persistent respiratory symptoms (such as a cough lasting >3 weeks or coughing up blood), you must consult a physician immediately regardless of your calculated score.',
    answerBn:
      'কম ঝুঁকি ফলাফলের অর্থ হলো আপনার প্রদত্ত তথ্যের ভিত্তিতে এই মুহূর্তে ক্যান্সারের পরিসংখ্যানগত সম্ভাবনা কম। তবে এটি কোনো রোগমুক্তির গ্যারান্টি নয়। আপনার যদি কাশির সাথে রক্ত যাওয়া বা দীর্ঘদিন কাশি থাকার মতো লক্ষণ থাকে, তবে ঝুঁকি স্কোর যাই হোক না কেন, অবিলম্বে ডাক্তারের পরামর্শ নিতে হবে।',
  },
  {
    id: 'difference-risk-screening-diagnosis',
    category: 'clinical',
    questionEn: 'What is the difference between risk estimation, screening, and diagnosis?',
    questionBn: 'ঝুঁকি পরিমাপ, স্ক্রীনিং এবং রোগ নির্ণয়ের মধ্যে পার্থক্য কী?',
    answerEn:
      '• Risk Estimation: Mathematical evaluation of an individual chance of developing disease based on exposure variables (smoking pack-years, biomass smoke, age).\n• Screening: Testing asymptomatic individuals who meet high-risk thresholds (using Low-Dose CT) to detect hidden disease early.\n• Diagnosis: Investigating active symptoms or suspicious findings with definitive procedures (biopsy, high-resolution CT) to confirm disease presence.',
    answerBn:
      '• ঝুঁকি পরিমাপ: বয়সের সাথে ধূমপান, রান্নার ধোঁয়া ইত্যাদির ওপর ভিত্তি করে ক্যান্সারের সম্ভাব্য ঝুঁকি হিসাব করা।\n• স্ক্রীনিং: আপাতদৃষ্টিতে সুস্থ কিন্তু উচ্চ ঝুঁকিপূর্ণ ব্যক্তির ফুসফুসে কোনো সুপ্ত টিউমার আছে কিনা তা লো-ডোজ সিটি স্ক্যান দিয়ে পরীক্ষা করা।\n• রোগ নির্ণয়: সুনির্দিষ্ট লক্ষণ বা টিউমারের অস্তিত্ব নিশ্চিত করতে বায়োপসি বা হিস্টোপ্যাথলজি পরীক্ষা করা।',
  },

  // Screening & Low-Dose CT
  {
    id: 'what-is-ldct-screening',
    category: 'screening',
    questionEn: 'What is Low-Dose Computed Tomography (LDCT) screening?',
    questionBn: 'লো-ডোজ কম্পিউটেড টমোগ্রাফি (LDCT) স্ক্রীনিং কী?',
    answerEn:
      'LDCT is a specialized computed tomography scan that produces detailed cross-sectional images of the lungs using substantially less radiation than standard diagnostic CT scans. International randomized trials prove that annual LDCT screening in eligible high-risk populations reduces lung cancer mortality by up to 24% by catching tumors when they are small and surgically curable.',
    answerBn:
      'LDCT হলো একটি বিশেষ ধরনের সিটি স্ক্যান যাতে সাধারণ সিটি স্ক্যানের চেয়ে প্রায় ৭৫% কম রেডিয়েশন ব্যবহৃত হয়। আন্তর্জাতিক গবেষণায় প্রমাণিত যে উচ্চ ঝুঁকিপূর্ণ ব্যক্তিদের নিয়মিত এই স্ক্রীনিং করালে ফুসফুসের ক্যান্সারে মৃত্যুর ঝুঁকি প্রায় ২৪% পর্যন্ত হ্রাস পায়।',
  },
  {
    id: 'who-is-eligible-for-ldct',
    category: 'screening',
    questionEn: 'Who is typically eligible for lung cancer screening?',
    questionBn: 'সাধারণত কারা ফুসফুস ক্যান্সার স্ক্রীনিংয়ের যোগ্য হিসেবে বিবেচিত হন?',
    answerEn:
      'According to international clinical guidelines (such as USPSTF and NCCN), candidates for annual LDCT screening generally meet three criteria: (1) Aged 50 to 80 years old, (2) A significant smoking history of 20 or more pack-years, and (3) Currently smoke or have quit within the past 15 years. Lungent evaluates these criteria and local environmental factors to determine eligibility.',
    answerBn:
      'আন্তর্জাতিক মানদণ্ড অনুযায়ী সাধারণত ৩টি শর্ত পূরণকারী ব্যক্তিরা স্ক্রীনিংয়ের যোগ্য হন: (১) বয়স ৫০ থেকে ৮০ বছর, (২) অন্তত ২০ প্যাক-বছর ধূমপানের ইতিহাস রয়েছে, এবং (৩) বর্তমানে ধূমপায়ী অথবা গত ১৫ বছরের মধ্যে ধূমপান ছেড়েছেন। লানজেন্ট এই মানদণ্ডগুলো বিশ্লেষণ করে সুপারিশ প্রদান করে।',
  },
  {
    id: 'ldct-limitations-and-rural-access',
    category: 'screening',
    questionEn: 'Why can’t everyone immediately receive a Low-Dose CT (LDCT) scan?',
    questionBn: 'কেন সবাই সরাসরি লো-ডোজ সিটি (LDCT) স্ক্যান করাতে পারে না?',
    answerEn:
      'While Low-Dose CT (LDCT) is the established gold standard for pulmonary nodule detection, it carries cumulative ionizing radiation risks and is not available in every rural or community hospital due to scanner scarcity and expense. Lungent provides an accessible, non-invasive preliminary risk stratification layer to identify individuals who genuinely require LDCT or specialist referral.',
    answerBn:
      'লো-ডোজ সিটি স্ক্যান ফুসফুস ক্যান্সারের নির্ভরযোগ্য মানদণ্ড হলেও এতে নির্দিষ্ট মাত্রায় রেডিয়েশনের ঝুঁকি থাকে এবং গ্রামীণ বা প্রত্যন্ত অঞ্চলের অধিকাংশ হাসপাতালে এই স্ক্যানার অপ্রতুল। লানজেন্ট একটি প্রাথমিক ডিজিটাল স্তরে ঝুঁকি নিরূপণ করে নিশ্চিত করে যাতে যাদের প্রকৃত প্রয়োজন শুধু তারাই এই স্ক্যানের পরামর্শ পান।',
  },
  {
    id: 'minimizing-false-negatives',
    category: 'clinical',
    questionEn: 'How does Lungent prioritize patient safety regarding False Negatives?',
    questionBn: 'ফলস নেগেটিভ (False Negative) ঝুঁকি এড়াতে লানজেন্ট কীভাবে কাজ করে?',
    answerEn:
      'In early cancer screening, a false negative (failing to identify an individual who actually has disease) has severe clinical consequences. Lungent is specifically calibrated and engineered to minimize false negatives, maintaining a high sensitivity (0.850) and 94.43% case capture so that high-risk individuals are never missed during initial triage.',
    answerBn:
      'প্রাথমিক ট্রায়াজে ফলস নেগেটিভের (রোগী থাকা সত্ত্বেও শনাক্ত না হওয়া) ঝুঁকি সবচেয়ে বিপজ্জনক। লানজেন্ট এমনভাবে ক্যালিব্রেট করা হয়েছে যাতে ফলস নেগেটিভ সর্বনিম্ন পর্যায়ে থাকে এবং উচ্চ ঝুঁকিপূর্ণ রোগীদের প্রাথমিক স্তরেই বিশেষজ্ঞের নজরে আনা যায়।',
  },
  {
    id: 'phase-3-roadmap-false-positives',
    category: 'clinical',
    questionEn: 'How does Lungent plan to address False Positives in future phases?',
    questionBn: 'ভবিষ্যতে ফলস পজিটিভ (False Positive) কমাতে লানজেন্টের পরিকল্পনা কী?',
    answerEn:
      'While Phase 1 & 2 prioritize community accessibility and false negative elimination, our Phase 3 Roadmap integrates future longitudinal Electronic Health Records (EHR) and deep-learning pulmonary imaging models. This multi-modal fusion is engineered to significantly minimize false positives, reduce unnecessary patient anxiety, and optimize diagnostic precision.',
    answerBn:
      'লানজেন্টের ফেজ ৩ রোডম্যাপে মাল্টি-মোডাল ইলেকট্রনিক হেলথ রেকর্ড (EHR) এবং ফুসফুস ইমেজিং এআই মডেল যুক্ত করা হবে। এর ফলে ফলস পজিটিভের হার ব্যাপকভাবে কমে আসবে এবং ডায়াগনস্টিক নির্ভুলতা নিশ্চিত হবে।',
  },

  // Privacy, Consent & Data Security
  {
    id: 'is-my-health-data-safe',
    category: 'privacy',
    questionEn: 'How does Lungent protect my personal and health data?',
    questionBn: 'লানজেন্ট আমার ব্যক্তিগত ও স্বাস্থ্য তথ্যের নিরাপত্তা কীভাবে রক্ষা করে?',
    answerEn:
      'Data security and patient privacy are fundamental to Lungent. All network communications are encrypted with TLS 1.3. Database storage employs PostgreSQL Row Level Security (RLS) policies, ensuring only you and authorized clinicians can view your health records. We never sell or share patient data with commercial advertisers.',
    answerBn:
      'আপনার তথ্যের গোপনীয়তা আমাদের প্রধান অগ্রাধিকার। সকল ডেটা আধুনিক এনক্রিপশনের মাধ্যমে সংরক্ষিত হয় এবং পোস্টগ্রিসকিউএল রো লেভেল সিকিউরিটির (RLS) মাধ্যমে নিশ্চিত করা হয় যাতে অননুমোদিত কেউ আপনার রিপোর্ট দেখতে না পারে। আমরা কখনোই কোনো বাণিজ্যিক প্রতিষ্ঠানের কাছে তথ্য বিক্রি করি না।',
  },
  {
    id: 'do-i-need-account-to-read-library',
    category: 'privacy',
    questionEn: 'Do I need an account to read the Health Library or FAQs?',
    questionBn: 'স্বাস্থ্য তথ্যভাণ্ডার বা প্রশ্নোত্তর পড়তে কি অ্যাকাউন্টের প্রয়োজন আছে?',
    answerEn:
      'No. The entire public portal—including the Lung Health Information Library, platform documentation, FAQs, and educational guides—is completely open and accessible without registering an account or logging in.',
    answerBn:
      'না। পুরো পাবলিক পোর্টাল—যার মধ্যে রয়েছে স্বাস্থ্য তথ্যভাণ্ডার, প্ল্যাটফর্ম পরিচিতি, প্রশ্নোত্তরের পাতা এবং সচেতনতামূলক নির্দেশিকা—যেকোনো ব্যক্তি কোনো নিবন্ধন বা লগইন ছাড়াই অবাধে পড়তে পারবেন।',
  },

  // Accounts & Portals
  {
    id: 'how-do-healthcare-workers-get-access',
    category: 'account',
    questionEn: 'How do Community Health Workers and Clinicians get access?',
    questionBn: 'স্বাস্থ্যকর্মী ও বিশেষজ্ঞ চিকিৎসকরা কীভাবে অ্যাক্সেস পান?',
    answerEn:
      'Public registration grants the baseline "Patient" portal access only. Privileged roles—such as Community Healthcare Worker, Clinician, or Facility Administrator—require identity verification and credential provisioning by an authorized platform administrator or healthcare institution.',
    answerBn:
      'সাধারণ অনলাইন নিবন্ধনের মাধ্যমে শুধুমাত্র "রোগী পোর্টাল" এর সুবিধা পাওয়া যায়। স্বাস্থ্যকর্মী বা বিশেষজ্ঞ চিকিৎসকের মতো বিশেষ অধিকারযুক্ত অ্যাকাউন্টের জন্য প্রাতিষ্ঠানিক যাচাইকরণ ও প্ল্যাটফর্ম প্রশাসকের অনুমোদনের প্রয়োজন হয়।',
  },
]
