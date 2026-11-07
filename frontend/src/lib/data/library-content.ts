export interface LibraryArticle {
  id: string
  category: 'basics' | 'risks' | 'symptoms' | 'screening' | 'prevention'
  titleEn: string
  titleBn: string
  summaryEn: string
  summaryBn: string
  contentEn: string[]
  contentBn: string[]
  keyTakeawayEn: string
  keyTakeawayBn: string
  tags: string[]
}

export const LIBRARY_ARTICLES: LibraryArticle[] = [
  {
    id: 'understanding-lung-cancer',
    category: 'basics',
    titleEn: 'Understanding Lung Cancer: Types and Progression',
    titleBn: 'ফুসফুসের ক্যান্সার পরিচিতি: ধরন ও বিস্তৃতি',
    summaryEn: 'An accessible overview of how lung cancer develops, the distinction between Non-Small Cell and Small Cell lung cancers, and why early detection is vital.',
    summaryBn: 'ফুসফুসে কীভাবে ক্যান্সার কোষ বৃদ্ধি পায়, নন-স্মল সেল ও স্মল সেল ক্যান্সারের পার্থক্য এবং কেন দ্রুত শনাক্তকরণ জীবন বাঁচায়।',
    contentEn: [
      'Lung cancer occurs when abnormal cells in the lungs multiply uncontrollably, forming tumors that impair breathing and the body oxygen supply. Unlike benign nodules, malignant lung tumors can invade surrounding tissues and spread to other organs (metastasis).',
      'The two primary classifications of lung cancer are Non-Small Cell Lung Cancer (NSCLC)—which represents roughly 80% to 85% of cases—and Small Cell Lung Cancer (SCLC), which is more aggressive and strongly correlated with heavy tobacco smoking.',
      'In early stages (Stage I and II), lung cancer often produces subtle or no symptoms. This is why risk stratification and screening for eligible high-risk individuals before severe symptoms arise is the single most effective way to improve long-term survival.',
    ],
    contentBn: [
      'ফুসফুসের ক্যান্সার তখন ঘটে যখন ফুসফুসের কোষগুলো অস্বাভাবিকভাবে অনিয়ন্ত্রিত হারে বৃদ্ধি পেয়ে টিউমার তৈরি করে, যা শ্বাসপ্রশ্বাস এবং রক্তে অক্সিজেন সরবরাহ ব্যাহত করে। এটি পার্শ্ববর্তী টিস্যু এবং রক্তপ্রবাহের মাধ্যমে শরীরের অন্যান্য অঙ্গেও ছড়িয়ে পড়তে পারে।',
      'ফুসফুসের ক্যান্সারের প্রধান দুটি ধরন রয়েছে: নন-স্মল সেল লাং ক্যান্সার (যা প্রায় ৮০-৮৫% ক্ষেত্রে দেখা যায়) এবং স্মল সেল লাং ক্যান্সার (যা সাধারণত খুব দ্রুত বিস্তার লাভ করে এবং তীব্র ধূমপানের সাথে গভীরভাবে সম্পর্কিত)।',
      'প্রাথমিক পর্যায়ে (স্টেজ ১ ও ২) ফুসফুসের ক্যান্সারে অনেক সময় কোনো স্পষ্ট লক্ষণ থাকে না। এ কারণেই উচ্চ ঝুঁকিপূর্ণ ব্যক্তিদের ক্ষেত্রে লক্ষণ প্রকাশের আগেই নিয়মিত স্ক্রীনিং ও ঝুঁকি মূল্যায়ন অত্যন্ত জরুরি।',
    ],
    keyTakeawayEn: 'Early-stage lung cancer rarely causes severe pain or dramatic symptoms; proactive risk evaluation saves lives.',
    keyTakeawayBn: 'প্রাথমিক পর্যায়ে কোনো তীব্র ব্যথা বা নাটকীয় লক্ষণ থাকে না; তাই সচেতনতা ও সঠিক সময়ে ঝুঁকি মূল্যায়ন সবচেয়ে কার্যকর।',
    tags: ['NSCLC', 'SCLC', 'Oncology Basics', 'Pulmonology'],
  },
  {
    id: 'tobacco-and-bidi-smoking',
    category: 'risks',
    titleEn: 'Tobacco, Cigarettes & Bidi Smoking in South Asia',
    titleBn: 'তামাক, সিগারেট ও বিড়ি ধূমপানের স্বাস্থ্যঝুঁকি',
    summaryEn: 'Detailed evidence on cigarette and traditional bidi smoking, pack-year calculation, and the compounding risk of secondhand smoke.',
    summaryBn: 'সিগারেট ও গ্রামীণ বিড়ির ক্ষতিকর প্রভাব, প্যাক-বছর হিসাবের নিয়ম এবং পরোক্ষ ধূমপানের মারাত্মক ঝুঁকি।',
    contentEn: [
      'Tobacco smoking remains the leading established cause of lung cancer worldwide. Cigarette and bidi smoke contain over 7,000 chemicals, including at least 70 known human carcinogens such as polycyclic aromatic hydrocarbons (PAHs), benzene, and nitrosamines.',
      'In Bangladesh and South Asia, bidi smoking is widespread in rural and lower-income communities. Bidis contain unprocessed tobacco wrapped in tendu leaves and deliver higher concentrations of carbon monoxide, nicotine, and tar per puff compared to standard filtered cigarettes.',
      'Smoking risk is clinically quantified using "Pack-Years" (number of packs smoked per day multiplied by the number of years smoked). A person smoking 1 pack per day for 20 years, or 2 packs per day for 10 years, has a 20 pack-year history.',
    ],
    contentBn: [
      'তামাক ধূমপান ফুসফুস ক্যান্সারের সবচেয়ে বড় প্রমাণিত কারণ। সিগারেট ও বিড়ির ধোঁয়ায় ৭,০০০ এর বেশি রাসায়নিক পদার্থ থাকে, যার মধ্যে কমপক্ষে ৭০টি সরাসরি ক্যান্সার সৃষ্টিকারী হিসেবে প্রমাণিত।',
      'বাংলাদেশে গ্রামীণ ও সুবিধাবঞ্চিত জনগোষ্ঠীর মধ্যে বিড়ি খাওয়ার প্রচলন অত্যন্ত বেশি। প্রক্রিয়াজাতহীন তামাক পাতায় মোড়ানো বিড়ি সাধারণ ফিল্টার সিগারেটের চেয়ে বেশি কার্বন মনোক্সাইড এবং ক্ষতিকারক আলকাতরা ফুসফুসে প্রবেশ করায়।',
      'চিকিৎসাবিজ্ঞানে ধূমপানের তীব্রতা "প্যাক-বছর" (Pack-Years) দিয়ে হিসাব করা হয়। প্রতিদিন ১ প্যাকেট হিসেবে ২০ বছর ধূমপান করলে তা ২০ প্যাক-বছর হিসেবে গণ্য হয়।',
    ],
    keyTakeawayEn: 'Bidis are not safer than filtered cigarettes. Quitting at any age immediately halts further accumulated damage.',
    keyTakeawayBn: 'বিড়ি কোনোভাবেই সিগারেটের চেয়ে কম ক্ষতিকর নয়। যেকোনো বয়সে ধূমপান ত্যাগ করলে ফুসফুসের ক্ষতি বৃদ্ধি রোধ হয়।',
    tags: ['Tobacco', 'Bidi', 'Pack-Years', 'Carcinogens'],
  },
  {
    id: 'biomass-and-indoor-air-pollution',
    category: 'risks',
    titleEn: 'Biomass Cooking Fuel Smoke & Indoor Air Pollution',
    titleBn: 'রান্নার লাকড়ি-ঘুটের ধোঁয়া ও ঘরোয়া বায়ুদূষণ',
    summaryEn: 'Why domestic biomass fuel exposure (chula stoves) is a major contributor to lung diseases among non-smoking women in rural Bangladesh.',
    summaryBn: 'গ্রামীণ বাংলায় মাটির চুলায় লাকড়ির ধোঁয়া কীভাবে অধূমপায়ী নারীদের ফুসফুসের ক্যান্সারের অন্যতম প্রধান ঝুঁকি তৈরি করে।',
    contentEn: [
      'In developing regions including rural Bangladesh, millions of households rely on traditional solid biomass fuels—firewood, cow dung cakes, and agricultural crop residues—burned in unventilated indoor traditional stoves (chulas).',
      'Inhaling biomass combustion smoke exposes women and children to high concentrations of particulate matter, carbon monoxide, sulfur oxides, and carcinogenic polycyclic organic matter. Daily exposure over 20 to 30 years causes chronic airway inflammation and DNA damage comparable to active smoking.',
      'Epidemiological studies confirm that heavy long-term biomass fuel exposure is a major independent risk factor for lung cancer and chronic obstructive pulmonary disease (COPD) in non-smoking South Asian women.',
    ],
    contentBn: [
      'বাংলাদেশের গ্রাম এবং উপশহরাঞ্চলে কোটি কোটি পরিবার এখনও রান্নার কাজে কাঠ, শুকনো পাতা ও ঘুঁটের চুলা ব্যবহার করেন, যা বেশিরভাগ ক্ষেত্রে অপর্যাপ্ত বাতাস চলাচলযুক্ত রান্নাঘরে জ্বলে।',
      'এই ধোঁয়া প্রতিদিন নিঃশ্বাসের সাথে ফুসফুসে প্রবেশের ফলে ফুসফুসের কোষে স্থায়ী ক্ষতি এবং জিনগত পরিবর্তন হয়। ২০-৩০ বছর ধরে এই ধোঁয়ায় কাটানো সময় পরোক্ষ ধূমপানের চেয়েও মারাত্মক হতে পারে।',
      'চিকিৎসা গবেষণায় প্রমাণিত যে, দক্ষিণ এশিয়ার অধূমপায়ী নারীদের ফুসফুসের ক্যান্সারের প্রধানতম কারণগুলোর একটি হলো দীর্ঘদিনের এই রান্নার বায়োমাস ধোঁয়া।',
    ],
    keyTakeawayEn: 'Biomass smoke is a critical environmental carcinogen in Bangladesh; indoor kitchen ventilation is essential.',
    keyTakeawayBn: 'রান্নার ধোঁয়া একটি গুরুতর পরিবেশগত ঝুঁকি; রান্নাঘরে চিমনি ও বাতাস চলাচলের সুব্যবস্থা নিশ্চিত করা জরুরি।',
    tags: ['Biomass', 'Indoor Air Quality', 'Women Health', 'Chula'],
  },
  {
    id: 'ambient-pm25-air-pollution',
    category: 'risks',
    titleEn: 'Ambient Air Pollution & Fine Particulate Matter (PM2.5)',
    titleBn: 'পরিবেশের বায়ুদূষণ ও সূক্ষ্ম কণা (PM2.5)',
    summaryEn: 'Understanding how toxic particulate pollution in urban centers like Dhaka penetrates deep into alveoli and contributes to pulmonary carcinogenesis.',
    summaryBn: 'ঢাকা সহ প্রধান নগরীর বিষাক্ত ধূলিকণা ও ধোঁয়া কীভাবে ফুসফুসের গভীরে পৌঁছে ক্যান্সার ঝুঁকি তৈরি করে।',
    contentEn: [
      'Major urban centers in Bangladesh frequently experience Air Quality Index (AQI) values in the "Unhealthy" or "Hazardous" categories during dry winter months. The primary pollutant of clinical concern is fine particulate matter with a diameter under 2.5 microns (PM2.5).',
      'Because of their microscopic size, PM2.5 particles bypass upper airway defenses (nasal cilia and mucus) and penetrate deep into alveolar spaces. Many particles carry heavy metals, sulfates, and polycyclic hydrocarbons on their surface.',
      'The World Health Organization (WHO) and International Agency for Research on Cancer (IARC) classify outdoor air pollution as a Group 1 human carcinogen. Long-term exposure increases lung cancer incidence and accelerates pulmonary fibrosis.',
    ],
    contentBn: [
      'শীতকালে ঢাকা এবং অন্যান্য শিল্পাঞ্চলে বাতাসের গুণমান সূচক (AQI) প্রায়শই বিপজ্জনক মাত্রায় পৌঁছে যায়। এর মধ্যে সবচেয়ে ক্ষতিকর হলো ২.৫ মাইক্রনের চেয়ে ছোট কণা (PM2.5)।',
      'এই কণাগুলো এতোটাই সূক্ষ্ম যে তা নাকের লোম ও ফিল্টার ভেদ করে সরাসরি ফুসফুসের গভীরে অ্যালভিওলাই পর্যন্ত পৌঁছে যায়। এই কণার গায়ে বিভিন্ন ক্ষতিকর রাসায়নিক ও ভারী ধাতু লেগে থাকে।',
      'বিশ্ব স্বাস্থ্য সংস্থা (WHO) বাইরের বায়ুদূষণকে সরাসরি ক্যান্সার সৃষ্টিকারী হিসেবে তালিকাভুক্ত করেছে। বছরের পর বছর এই বাতাসে শ্বাস নেওয়া ফুসফুসের ক্যান্সারের ঝুঁকি বাড়িয়ে দেয়।',
    ],
    keyTakeawayEn: 'High PM2.5 exposure damages lung tissue over decades; protective N95 masks and air quality awareness are vital.',
    keyTakeawayBn: 'উচ্চমাত্রার PM2.5 ফুসফুসকে ক্ষতিগ্রস্ত করে; দূষণের দিনে মাস্ক ব্যবহার ও সতর্কতা প্রয়োজনীয়।',
    tags: ['Air Pollution', 'PM2.5', 'AQI', 'Urban Health'],
  },
  {
    id: 'warning-signs-and-symptoms',
    category: 'symptoms',
    titleEn: 'Recognizing Warning Signs: Red-Flag Symptoms',
    titleBn: 'ফুসফুসের ক্যান্সারের লক্ষণ ও সতর্কবার্তা',
    summaryEn: 'Clinical red flags that warrant urgent medical evaluation: persistent cough >3 weeks, hemoptysis, unexplained weight loss, and dyspnea.',
    summaryBn: 'কোন কোন লক্ষণ দেখা দিলে অবিলম্বে ডাক্তারের কাছে যেতে হবে: ৩ সপ্তাহের বেশি কাশি, কফে রক্ত, ওজন হ্রাস এবং শ্বাসকষ্ট।',
    contentEn: [
      'Early lung cancer often causes no specific symptoms. However, as localized tumors enlarge or affect bronchial structures, specific red-flag symptoms emerge and should never be dismissed.',
      'Cardinal Warning Signs Include:\n• Persistent Cough: A new cough that lingers beyond 3 weeks, or a chronic smoker cough that changes in character or intensity.\n• Coughing Blood (Hemoptysis): Even small flecks of bright red or rust-colored blood in sputum are an absolute red flag requiring urgent medical investigation.\n• Unexplained Weight Loss: Losing 5% or more of body weight without dieting within 6 months.\n• Progressive Shortness of Breath (Dyspnea) or unexplained hoarseness of voice.\n• Constant Chest or Shoulder Pain that worsens with deep breathing or coughing.',
      'In Bangladesh, persistent cough and fever are frequently mistaken for pulmonary tuberculosis (TB) alone. While TB is common, patients with persistent symptoms despite anti-TB therapy must be evaluated for underlying malignancies.',
    ],
    contentBn: [
      'ফুসফুসের ক্যান্সারের লক্ষণগুলো অনেক সময় সাধারণ ব্রঙ্কাইটিস বা ফ্লুর সাথে মিলে যায়, ফলে রোগীরা চিকিৎসায় অবহেলা করেন। কিন্তু কিছু সুনির্দিষ্ট "রেড-ফ্ল্যাগ" লক্ষণ রয়েছে যা কোনোভাবেই উপেক্ষা করা উচিত নয়।',
      'জরুরি সতর্কতামূলক লক্ষণসমূহ:\n• ৩ সপ্তাহের বেশি স্থায়ী কাশি বা কাশির ধরনে হঠাৎ পরিবর্তন।\n• কাশির সাথে রক্ত যাওয়া (হেমোপটিসিস): সামান্য রক্তের দাগও অবিলম্বে ডাক্তার দেখানোর স্পষ্ট কারণ।\n• অকারণে দ্রুত ওজন হ্রাস এবং দুর্বলতা।\n• অল্প পরিশ্রমে শ্বাসকষ্ট বা শ্বাস নেওয়ার সময় বাঁশির মতো শব্দ।\n• বুকে বা কাঁধে স্থায়ী ব্যথা যা গভীর শ্বাস নেওয়ার সময় বাড়ে।',
      'আমাদের দেশে দীর্ঘদিনের কাশিকে অনেক সময় শুধু যক্ষ্মা (টিবি) বা সাধারণ ঠান্ডা ভেবে ভুল করা হয়। চিকিৎসায় কাশি ভালো না হলে ফুসফুসের অন্যান্য পরীক্ষার জন্য বিশেষজ্ঞের শরণাপন্ন হওয়া জরুরি।',
    ],
    keyTakeawayEn: 'Coughing up blood is never normal. Consult a doctor immediately if respiratory symptoms persist past 3 weeks.',
    keyTakeawayBn: 'কাশির সাথে রক্ত যাওয়া কোনোভাবেই স্বাভাবিক নয়; ৩ সপ্তাহের বেশি কাশি থাকলে অবিলম্বে চিকিৎসকের পরামর্শ নিন।',
    tags: ['Symptoms', 'Hemoptysis', 'Red Flags', 'Tuberculosis Mimic'],
  },
  {
    id: 'low-dose-ct-screening',
    category: 'screening',
    titleEn: 'Screening & Early Detection: What is Low-Dose CT (LDCT)?',
    titleBn: 'স্ক্রীনিং ও দ্রুত শনাক্তকরণ: লো-ডোজ সিটি (LDCT) কী?',
    summaryEn: 'How low-dose computed tomography detects small asymptomatic nodules and dramatically improves survival compared to standard chest X-rays.',
    summaryBn: 'কীভাবে লো-ডোজ সিটি স্ক্যান লক্ষণ প্রকাশের আগেই ছোট টিউমার শনাক্ত করে এবং সাধারণ এক্স-রে এর চেয়ে কার্যকর ভূমিকা রাখে।',
    contentEn: [
      'Low-Dose Computed Tomography (LDCT) is the gold standard clinical screening tool for lung cancer. It uses up to 75% less radiation than conventional diagnostic CT scans while capturing detailed cross-sectional images of pulmonary tissue.',
      'Standard two-dimensional chest X-rays frequently miss small, localized nodules hidden behind the heart or ribs. Landmark clinical trials (such as the National Lung Screening Trial / NLST and NELSON study) proved that annual LDCT screening reduces lung cancer mortality by 20% to 24% in high-risk individuals.',
      'Screening is intended specifically for asymptomatic people who meet high-risk criteria (e.g., adults aged 50–80 with a 20+ pack-year smoking history). It is not recommended for low-risk individuals due to the potential for false-positive findings and unnecessary invasive biopsies.',
    ],
    contentBn: [
      'লো-ডোজ কম্পিউটেড টমোগ্রাফি (LDCT) হলো ফুসফুসের ক্যান্সার প্রাথমিক পর্যায়ে শনাক্ত করার জন্য বিশ্বজুড়ে স্বীকৃত সবচেয়ে আধুনিক স্ক্রীনিং পরীক্ষা। এতে সাধারণ সিটি স্ক্যানের চেয়ে প্রায় ৭৫% কম রেডিয়েশন ব্যবহৃত হয়।',
      'সাধারণ বুকের এক্স-রে দিয়ে ফুসফুসের গভীরে থাকা ছোট টিউমার বা নোডিউল শনাক্ত করা অনেক সময় সম্ভব হয় না। আন্তর্জাতিক গবেষণায় দেখা গেছে, ঝুঁকিপূর্ণ ব্যক্তিদের নিয়মিত LDCT স্ক্রীনিং ফুসফুসের ক্যান্সারে মৃত্যুর হার ২০-২৪% পর্যন্ত কমিয়ে আনে।',
      'স্ক্রীনিং কেবল তাদের জন্যই প্রযোজ্য যাদের লক্ষণ নেই কিন্তু ঝুঁকি অত্যন্ত বেশি (যেমন: ৫০-৮০ বছর বয়সী ব্যক্তি যাদের ২০ প্যাক-বছর বা তার বেশি ধূমপানের ইতিহাস রয়েছে)। কম ঝুঁকিপূর্ণ ব্যক্তির জন্য অপ্রয়োজনীয় পরীক্ষা সুপারিশ করা হয় না।',
    ],
    keyTakeawayEn: 'LDCT can spot cancer when it is small and curable. Screening is for high-risk individuals before symptoms appear.',
    keyTakeawayBn: 'LDCT টিউমার ছোট থাকা অবস্থাতেই শনাক্ত করতে পারে যখন এটি নিরাময়যোগ্য। এটি লক্ষণ প্রকাশের পূর্বেই উচ্চ ঝুঁকিপূর্ণ ব্যক্তিদের জন্য কার্যকর।',
    tags: ['LDCT', 'Screening', 'NLST', 'Radiology'],
  },
  {
    id: 'prevention-and-lung-health',
    category: 'prevention',
    titleEn: 'Prevention & Pulmonary Wellness: Protecting Your Lungs',
    titleBn: 'প্রতিরোধ ও ফুসফুসের সুরক্ষা: সুস্থ ফুসফুসের নিয়মাবলী',
    summaryEn: 'Actionable steps to safeguard pulmonary health: smoking cessation strategies, kitchen ventilation modifications, and indoor air filtration.',
    summaryBn: 'ফুসফুস ভালো রাখার ব্যবহারিক পরামর্শ: ধূমপান ত্যাগের কৌশল, রান্নাঘরের বায়ু চলাচলের ব্যবস্থা এবং দূষণ থেকে সুরক্ষা।',
    contentEn: [
      'While some genetic factors cannot be modified, up to 80% of all lung cancer cases are preventable through targeted risk reduction and lifestyle modifications.',
      'Key Prevention Priorities:\n1. Smoking Cessation: Quitting smoking drops lung cancer risk substantially within 5 years. By 10 years, risk is approximately half that of a continuing smoker.\n2. Improving Kitchen Ventilation: Raising kitchen ceilings, opening cross-ventilation windows, or installing chimney exhausts significantly cuts biomass smoke accumulation.\n3. Occupational Safety: Workers in stone-crushing, construction, ship-breaking, or garment dyeing must wear certified respirators (N95 or higher) to protect against silica and toxic particulates.\n4. Nutrition & Physical Activity: A diet rich in natural antioxidants (fresh vegetables, fruits) supports cell repair mechanisms.',
    ],
    contentBn: [
      'বংশগত কিছু কারণ পরিবর্তন করা না গেলেও, প্রায় ৮০% ক্ষেত্রে জীবনযাত্রার সচেতন পরিবর্তন এবং ঝুঁকি পরিহারের মাধ্যমে ফুসফুসের ক্যান্সার প্রতিরোধ করা সম্ভব।',
      'ফুসফুস সুরক্ষার মূল পদক্ষেপসমূহ:\n১. ধূমপান সম্পূর্ণ বর্জন: ধূমপান বন্ধ করার ৫ বছরের মধ্যে ক্যান্সারের ঝুঁকি উল্লেখযোগ্যভাবে কমে যায় এবং ১০ বছরের মধ্যে তা প্রায় অর্ধেকে নেমে আসে।\n২. রান্নাঘরের পরিবেশ উন্নয়ন: মাটির চুলার রান্নাঘরে ধোঁয়া বের হওয়ার জন্য চিমনি বা পর্যাপ্ত জানালা নিশ্চিত করুন।\n৩. কর্মক্ষেত্রে সুরক্ষা: যারা জাহাজভাঙা শিল্প, পাথর ভাঙা, কনস্ট্রাকশন বা টেক্সটাইল কারখানায় কাজ করেন, তাদের অবশ্যই মানসম্মত ডাস্ট মাস্ক বা রেসপিরেটর ব্যবহার করতে হবে।\n৪. পুষ্টিকর খাদ্য ও ব্যায়াম: তাজা শাকসবজি, ফলমূল এবং নিয়মিত হাঁটার অভ্যাস ফুসফুসের রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে।',
    ],
    keyTakeawayEn: 'Prevention is always better than cure. Protecting airways from smoke and industrial dust is an everyday necessity.',
    keyTakeawayBn: 'প্রতিরোধ সর্বদা চিকিৎসার চেয়ে উত্তম। ধোঁয়া এবং ক্ষতিকর ধুলোবালি থেকে ফুসফুসকে সুরক্ষিত রাখুন।',
    tags: ['Prevention', 'Cessation', 'Ventilation', 'Wellness'],
  },
]
