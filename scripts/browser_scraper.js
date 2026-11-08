/**
 * Lungent — In-Browser Form Scraper (Paste into F12 DevTools Console)
 * 1. Automatically clicks through all tabs & expands all accordions.
 * 2. Extracts all inputs, textareas, checkboxes (native & Radix), and dropdowns.
 * 3. Copies the complete JSON schema to your clipboard & logs it to console.
 */
(async function scrapeCloudCampForm() {
  console.clear();
  console.log('%c🚀 Starting Lungent In-Browser Form Scraper...', 'color: #0ea5e9; font-weight: bold; font-size: 14px;');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function cleanText(str) {
    return (str || '').replace(/\s+/g, ' ').trim();
  }

  function getLabelText(el) {
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) return cleanText(lbl.innerText);
    }
    const parentLabel = el.closest('label');
    if (parentLabel) return cleanText(parentLabel.innerText);

    if (el.getAttribute('aria-label')) return cleanText(el.getAttribute('aria-label'));
    if (el.getAttribute('aria-labelledby')) {
      const ref = document.getElementById(el.getAttribute('aria-labelledby'));
      if (ref) return cleanText(ref.innerText);
    }

    const parent = el.parentElement;
    if (parent) {
      const sib = parent.querySelector('label, span.text-sm, span.font-medium, span, p');
      if (sib && sib !== el && sib.innerText.trim()) return cleanText(sib.innerText);
    }

    const row = el.closest('.space-y-2, .space-y-1, .form-group, .flex, .grid, fieldset, div[class*="border"], div[class*="rounded"]');
    if (row) {
      const heading = row.querySelector('label, legend, h4, h5, p.font-medium, span.font-medium');
      if (heading && heading !== el && heading.innerText.trim()) return cleanText(heading.innerText);
    }

    return cleanText(el.placeholder || el.name || el.id || '');
  }

  // Step 1: Detect and click all tabs/accordions
  console.log('%c[*] Expanding all tabs and accordions...', 'color: #f59e0b;');
  const tabKeywords = ['Overview', 'Story', 'Proof', 'AI-Native', 'AI Detail', 'Data Lifecycle', 'Prompt Library', 'Team', 'Audit', 'Build Provenance', 'Basics'];

  // Find tab buttons
  const tabButtons = [];
  document.querySelectorAll('[role="tab"], [role="tablist"] button, nav button').forEach((b) => {
    if (!tabButtons.includes(b)) tabButtons.push(b);
  });

  document.querySelectorAll('button').forEach((b) => {
    const text = b.innerText || '';
    if (tabKeywords.some((kw) => text.includes(kw)) && !tabButtons.includes(b)) {
      tabButtons.push(b);
    }
  });

  console.log(`[*] Found ${tabButtons.length} tab/navigation elements. Cycling through...`);
  for (const btn of tabButtons) {
    try {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.click();
      await sleep(500); // Allow React state to mount tab panel
    } catch (e) {}
  }

  // Expand closed accordions
  document.querySelectorAll('button[data-state="closed"], [aria-expanded="false"], summary').forEach((acc) => {
    try { acc.click(); } catch (e) {}
  });
  await sleep(800);

  // Step 2: Extract all elements
  console.log('%c[*] Scanning DOM for inputs, textareas, checkboxes, and selects...', 'color: #3b82f6;');
  const schema = [];
  const seenSelectors = new Set();

  // A. Native Inputs
  document.querySelectorAll('input').forEach((inp, idx) => {
    const type = (inp.type || 'text').toLowerCase();
    const selector = inp.id ? `#${CSS.escape(inp.id)}` : (inp.name ? `input[name="${CSS.escape(inp.name)}"]` : `input[type="${type}"]:nth-of-type(${idx + 1})`);
    if (seenSelectors.has(selector)) return;
    seenSelectors.add(selector);

    schema.push({
      id: inp.id || '',
      name: inp.name || '',
      type: type,
      placeholder: inp.placeholder || '',
      currentValue: type === 'checkbox' || type === 'radio' ? inp.checked : inp.value,
      labelText: getLabelText(inp),
      selector: selector
    });
  });

  // B. Radix / Shadcn ARIA Checkboxes and Switches
  document.querySelectorAll('[role="checkbox"], button[role="switch"], [role="switch"]').forEach((cb, idx) => {
    const role = cb.getAttribute('role') || 'checkbox';
    const selector = cb.id ? `#${CSS.escape(cb.id)}` : `[role="${role}"]:nth-of-type(${idx + 1})`;
    if (seenSelectors.has(selector)) return;
    seenSelectors.add(selector);

    const isChecked = cb.getAttribute('aria-checked') === 'true' || cb.getAttribute('data-state') === 'checked' || cb.getAttribute('data-state') === 'on';
    schema.push({
      id: cb.id || '',
      name: cb.getAttribute('name') || '',
      type: 'checkbox',
      isAria: true,
      currentValue: isChecked,
      labelText: getLabelText(cb),
      selector: selector
    });
  });

  // C. Textareas
  document.querySelectorAll('textarea').forEach((ta, idx) => {
    const selector = ta.id ? `#${CSS.escape(ta.id)}` : (ta.name ? `textarea[name="${CSS.escape(ta.name)}"]` : `textarea:nth-of-type(${idx + 1})`);
    if (seenSelectors.has(selector)) return;
    seenSelectors.add(selector);

    schema.push({
      id: ta.id || '',
      name: ta.name || '',
      type: 'textarea',
      placeholder: ta.placeholder || '',
      currentValue: ta.value || '',
      labelText: getLabelText(ta),
      selector: selector
    });
  });

  // D. Selects & Comboboxes
  document.querySelectorAll('select').forEach((sel, idx) => {
    const selector = sel.id ? `#${CSS.escape(sel.id)}` : (sel.name ? `select[name="${CSS.escape(sel.name)}"]` : `select:nth-of-type(${idx + 1})`);
    if (seenSelectors.has(selector)) return;
    seenSelectors.add(selector);

    const options = Array.from(sel.options).map((o) => cleanText(o.text));
    schema.push({
      id: sel.id || '',
      name: sel.name || '',
      type: 'select',
      labelText: getLabelText(sel),
      options: options,
      selector: selector
    });
  });

  document.querySelectorAll('[role="combobox"]').forEach((cb, idx) => {
    const selector = cb.id ? `#${CSS.escape(cb.id)}` : `[role="combobox"]:nth-of-type(${idx + 1})`;
    if (seenSelectors.has(selector)) return;
    seenSelectors.add(selector);

    schema.push({
      id: cb.id || '',
      type: 'combobox',
      labelText: getLabelText(cb),
      currentText: cleanText(cb.innerText),
      selector: selector
    });
  });

  console.log('%c========================================================', 'color: #10b981;');
  console.log(`%c🎉 SCRAPE COMPLETE! Total fields detected: ${schema.length}`, 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log(`   - Text/Input fields: ${schema.filter(x => x.type === 'text' || x.type === 'url' || x.type === 'email').length}`);
  console.log(`   - Textareas:         ${schema.filter(x => x.type === 'textarea').length}`);
  console.log(`   - Checkboxes:        ${schema.filter(x => x.type === 'checkbox').length}`);
  console.log(`   - Selects/Combos:    ${schema.filter(x => x.type === 'select' || x.type === 'combobox').length}`);
  console.log('%c========================================================', 'color: #10b981;');

  const jsonString = JSON.stringify(schema, null, 2);

  try {
    await navigator.clipboard.writeText(jsonString);
    console.log('%c[📋] Form schema has been COPIED to your clipboard!', 'color: #0ea5e9; font-weight: bold;');
    console.log('You can now paste it directly into `form_schema.json` in your project.');
  } catch (err) {
    console.log('%c[!] Could not auto-copy to clipboard. Outputting below:', 'color: #ef4444;');
  }

  console.log(schema);
  window._lungentFormSchema = schema;
  return schema;
})();
