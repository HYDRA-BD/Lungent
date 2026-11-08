/**
 * Lungent — In-Browser Autofiller (Paste into F12 DevTools Console)
 * 1. Switches between tabs to mount all form sections.
 * 2. Uses native React prototype setters to bypass React synthetic state traps.
 * 3. Fills all text inputs, textareas, selects, and checks all high-scoring AI/Data checkboxes.
 */
(async function autofillCloudCampForm() {
  console.clear();
  console.log('%c🚀 Starting Lungent In-Browser Autofiller...', 'color: #0ea5e9; font-weight: bold; font-size: 15px;');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ============================================================================
  // LUNGENT SUBMISSION KNOWLEDGE BASE
  // ============================================================================
  const LUNGENT = {
    projectName: "Lungent",
    elevatorPitch: "Accessible AI clinical pre-screening and risk stratification portal detecting lung cancer risk before the CT scan.",
    publicSummary: "Lungent is an AI-powered preliminary lung cancer risk assessment platform. Built on research using non-imaging clinical and behavioral data (CDC BRFSS), it aims to assist underserved populations who face barriers to traditional LDCT screening. Lungent integrates a multi-disciplinary ecosystem with dedicated portals for patients, community health workers, clinicians, and administrators.",
    problemStatement: "Lung cancer is a leading cause of cancer death, yet approximately 70% of rural and underserved patients never receive LDCT screening. This is rarely because they are low-risk, but because the required medical infrastructure is geographically or financially inaccessible. This leads to late-stage diagnoses and significantly worse survival rates.",
    solutionDescription: "Lungent flips the screening funnel. Instead of relying on expensive imaging first, Lungent uses an interpretable, non-imaging ML model to stratify risk from accessible demographic and clinical data. It translates complex probabilities into a 3-tier clinical decision (RULE-OUT, REVIEW, REFER), fast-tracking only high-risk patients for imaging while empowering patients and community health workers with actionable risk awareness.",
    techStackInfra: "Vercel (Frontend), Render (FastAPI Backend), Supabase (PostgreSQL & Auth), Docker",
    techStackLibraries: "Next.js 15, React 19, Tailwind CSS v4, Framer Motion, Lucide React, FastAPI, XGBoost, LightGBM, CatBoost, Scikit-learn, SHAP, ChromaDB, ReportLab",
    githubRepo: "https://github.com/HYDRA-BD/LungCancer.NET",
    liveDemoUrl: "https://lungentaibc.vercel.app/",
    docsUrl: "https://lungentaibc.vercel.app/docs",
    apiUrl: "https://lungcancer-net.onrender.com/docs",
    youtubeUrl: "https://youtu.be/placeholder", // Replace with your YouTube video link
    credentialsEmail: "smjarifhaidera@gmail.com",
    credentialsPassword: "qwertyuiop",
    credentialsRole: "Clinician",
    mcpServerName: "Lungent-MCP-Server",
    mcpTransport: "stdio / Streamable HTTP",
    mcpTools: "predict_lung_cancer_risk, search_uspstf_guidelines, get_clinical_summary",
    mcpPermissions: "Read-only access to model inference, semantic vector search, and clinical report generation (zero disk write permissions)",
    mcpDescription: "Clinical decision support Model Context Protocol (MCP) server enabling hospital EHRs and autonomous clinical agents to perform pre-screening, guideline RAG, and clinical summarization.",
    promptTitle: "Multi-Model Risk Stratification & Clinical Report Engine",
    promptContent: "Design an interpretable clinical risk triage architecture that ingests patient survey data (age, smoking pack-years, BMI, symptoms, and 5-year ambient AQI) and computes calibrated posterior probability of lung cancer risk, mapping the output to a 3-tier policy (REFER, REVIEW, RULE-OUT) with TreeSHAP factor attributions and USPSTF 2021 recommendation retrieval.",
    promptOutput: "Produced the FastAPI prediction endpoint, Platt-calibrated ensemble pipeline, ChromaDB guideline retriever, and SHA-256 sealed hospital PDF generator.",
    cursorrulesContent: "Strict adherence to WCAG 2.1 AA accessibility, ephemeral in-memory PHI processing (zero disk writes), modular Next.js app router architecture, and typed REST API integration.",
    dataSources: "CDC Behavioral Risk Factor Surveillance System (BRFSS, >400,000 records), Open-Meteo & EPA 5-year longitudinal PM2.5/AQI datasets, USPSTF 2021 Clinical Recommendations.",
    aiModels: "Stacked Gradient-Boosted Ensemble (XGBoost, LightGBM, CatBoost) combined with an Out-of-Fold Platt-calibrated Logistic Regression meta-model and TreeSHAP explainability.",
    responsibleAi: "Enforces an Equity-Aware Sensitivity Floor (>=85% across all demographic subgroups), transient in-memory processing (zero patient biometrics stored to disk), and SHA-256 digital seals on clinical PDF reports."
  };

  // Helper: React native setter to ensure controlled components update state
  function setReactInputValue(input, value) {
    if (!input) return;
    const isTextarea = input.tagName.toLowerCase() === 'textarea';
    const setter = Object.getOwnPropertyDescriptor(
      isTextarea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (setter) {
      setter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function getCombinedLabel(el) {
    let text = (el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || '') + ' ' + (el.getAttribute('aria-label') || '');
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) text += ' ' + lbl.innerText;
    }
    const parentLabel = el.closest('label');
    if (parentLabel) text += ' ' + parentLabel.innerText;
    const row = el.closest('.space-y-2, .space-y-1, .form-group, .flex, .grid, fieldset, div[class*="border"]');
    if (row) {
      const heading = row.querySelector('label, legend, h4, h5, p.font-medium, span.font-medium');
      if (heading && heading !== el) text += ' ' + heading.innerText;
    }
    return text.toLowerCase();
  }

  // Step 1: Cycle through all tabs and expand accordions
  console.log('%c[*] Mounting all tabs & expanding accordions...', 'color: #f59e0b;');
  const tabKeywords = ['Overview', 'Story', 'Proof', 'AI-Native', 'AI Detail', 'Data Lifecycle', 'Prompt Library', 'Team', 'Audit', 'Build Provenance', 'Basics'];
  const tabButtons = [];
  document.querySelectorAll('[role="tab"], [role="tablist"] button, nav button').forEach(b => {
    if (!tabButtons.includes(b)) tabButtons.push(b);
  });
  document.querySelectorAll('button').forEach(b => {
    const text = b.innerText || '';
    if (tabKeywords.some(kw => text.includes(kw)) && !tabButtons.includes(b)) {
      tabButtons.push(b);
    }
  });

  for (const btn of tabButtons) {
    try {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.click();
      await sleep(400);
    } catch (e) {}
  }

  document.querySelectorAll('button[data-state="closed"], [aria-expanded="false"], summary').forEach(acc => {
    try { acc.click(); } catch (e) {}
  });
  await sleep(600);

  let filledCount = 0;
  let checkedCount = 0;

  // Step 2: Fill text inputs and textareas
  console.log('%c[*] Filling inputs & textareas...', 'color: #3b82f6;');
  const textElements = Array.from(document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'));

  for (const el of textElements) {
    const context = getCombinedLabel(el);
    let valueToSet = null;

    if (context.includes('untitled project') || context.includes('project name') || context.includes('title of project')) {
      valueToSet = LUNGENT.projectName;
    } else if (context.includes('pitch') || context.includes('tagline') || context.includes('one-liner') || context.includes('short description')) {
      valueToSet = LUNGENT.elevatorPitch;
    } else if (context.includes('vercel') || context.includes('docker') || context.includes('aws') || context.includes('deploy') || context.includes('hosting')) {
      valueToSet = LUNGENT.techStackInfra;
    } else if (context.includes('react') || context.includes('tensorflow') || context.includes('langchain') || context.includes('libraries') || context.includes('framework')) {
      valueToSet = LUNGENT.techStackLibraries;
    } else if (context.includes('mcp server') || context.includes('mcp servers used') || context.includes('server name')) {
      valueToSet = LUNGENT.mcpServerName;
    } else if (context.includes('permission') || context.includes('permissions granted to mcp')) {
      valueToSet = LUNGENT.mcpPermissions;
    } else if (context.includes('tools exposed via mcp') || context.includes('mcp tools')) {
      valueToSet = LUNGENT.mcpTools;
    } else if (context.includes('auth flow generator') || context.includes('prompt title')) {
      valueToSet = LUNGENT.promptTitle;
    } else if (context.includes('paste your prompt') || context.includes('system prompt')) {
      valueToSet = LUNGENT.promptContent;
    } else if (context.includes('what the prompt produced') || context.includes('prompt output')) {
      valueToSet = LUNGENT.promptOutput;
    } else if (context.includes('.cursorrules') || context.includes('claude.md')) {
      valueToSet = LUNGENT.cursorrulesContent;
    } else if (context.includes('list data sources') || context.includes('datasets')) {
      valueToSet = LUNGENT.dataSources;
    } else if (context.includes('ai models used') || context.includes('gpt-4, gemini')) {
      valueToSet = LUNGENT.aiModels;
    } else if (context.includes('responsible ai') || context.includes('bias mitigation')) {
      valueToSet = LUNGENT.responsibleAi;
    } else if (context.includes('problem') || context.includes('pain point')) {
      valueToSet = LUNGENT.problemStatement;
    } else if (context.includes('solution') || context.includes('approach')) {
      valueToSet = LUNGENT.solutionDescription;
    } else if (context.includes('public summary') || context.includes('overview') || context.includes('abstract')) {
      valueToSet = LUNGENT.publicSummary;
    } else if (context.includes('github') || context.includes('repo') || context.includes('repository')) {
      valueToSet = LUNGENT.githubRepo;
    } else if (context.includes('live demo') || context.includes('demo url') || context.includes('production url')) {
      valueToSet = LUNGENT.liveDemoUrl;
    } else if (context.includes('documentation') || context.includes('whitepaper') || context.includes('docs')) {
      valueToSet = LUNGENT.docsUrl;
    } else if (context.includes('swagger') || context.includes('api url')) {
      valueToSet = LUNGENT.apiUrl;
    } else if (context.includes('video') || context.includes('youtube') || context.includes('loom')) {
      valueToSet = LUNGENT.youtubeUrl;
    } else if (context.includes('test email') || context.includes('login email')) {
      valueToSet = LUNGENT.credentialsEmail;
    } else if (context.includes('test pass') || context.includes('password')) {
      valueToSet = LUNGENT.credentialsPassword;
    }

    if (valueToSet) {
      setReactInputValue(el, valueToSet);
      filledCount++;
      console.log(`%c[✓] Filled: "${context.slice(0, 30)}..." -> "${valueToSet.slice(0, 25)}..."`, 'color: #10b981;');
    }
  }

  // Step 3: Checkboxes (Native + Radix/Shadcn)
  console.log('%c[*] Checking high-scoring AI & Data checkboxes...', 'color: #8b5cf6;');
  const checkboxKeywords = [
    'mcp', 'model context protocol', 'server', 'rag', 'naive rag', 'vector', 'vector db', 'vectordb',
    'hybrid search', 'chromadb', 'claude', 'chatgpt', 'gemini', 'xgboost', 'lightgbm', 'catboost',
    'cursor', 'agent', 'composer', 'pii', 'redaction', 'schema', 'validation', 'pydantic', 'zod',
    'open data', 'kaggle', 'hugging face', 'government', 'gov', 'brfss', 'bulk upload', 'api pull',
    'csv', 'json', 'pdf', 'postgres', 'postgresql', 'supabase', 'cache', 'kv', 'classical ml',
    'rule engine', 'heuristics', 'statistical', 'recharts'
  ];

  const allCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"], [role="checkbox"], button[role="switch"], [role="switch"]'));

  for (const cb of allCheckboxes) {
    const context = getCombinedLabel(cb);
    const shouldCheck = checkboxKeywords.some(kw => context.includes(kw));

    if (shouldCheck) {
      const isChecked = cb.checked || cb.getAttribute('aria-checked') === 'true' || cb.getAttribute('data-state') === 'checked' || cb.getAttribute('data-state') === 'on';
      if (!isChecked) {
        try {
          cb.scrollIntoView({ behavior: 'instant', block: 'center' });
          cb.click();
          checkedCount++;
          console.log(`%c[☑] Checked: "${context.slice(0, 40)}..."`, 'color: #a855f7;');
          await sleep(100);
        } catch (e) {}
      }
    }
  }

  console.log('%c========================================================', 'color: #10b981;');
  console.log(`%c🎉 AUTOFILL COMPLETE!`, 'color: #10b981; font-weight: bold; font-size: 16px;');
  console.log(`%c   - Inputs/Textareas filled: ${filledCount}`, 'color: #10b981; font-weight: bold;');
  console.log(`%c   - Checkboxes activated:    ${checkedCount}`, 'color: #10b981; font-weight: bold;');
  console.log('%c========================================================', 'color: #10b981;');
  console.log('👉 Review your tabs and check your score. If you have a YouTube video link, remember to paste it in.');
})();
