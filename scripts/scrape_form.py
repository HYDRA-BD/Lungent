#!/usr/bin/env python3
"""
Lungent — Full Multi-Tab Form Scraper (Playwright)
1. Launches persistent browser session and waits for user login.
2. Clears previously typed inputs via page.evaluate() for a clean DOM schema.
3. Iterates through all navigation tabs (Overview, Story, Proof, AI-Native Build,
   Data Lifecycle, Prompt Library, Team, Audit, Build Provenance, Basics).
4. Expands all closed accordions and nested collapsible cards.
5. Scrapes all controls: native inputs, sr-only hidden checkboxes, ARIA/Radix
   checkboxes (role="checkbox"), custom switches (role="switch"), radios,
   native selects, and Radix comboboxes.
6. Outputs the complete schema to form_schema.json.
"""

import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

DEFAULT_SUBMISSION_URL = "https://cloudcampbd.com/submissions/8dee8cdb-0cda-49c6-8c84-4429d2cc0177"
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_session")
OUTPUT_SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "form_schema.json")

# Target tab keywords in navigation
TAB_KEYWORDS = [
    "Overview",
    "Story",
    "Proof",
    "AI-Native Build",
    "AI Detail",
    "Data Lifecycle",
    "Prompt Library",
    "Team",
    "Audit",
    "Build Provenance",
    "Basics"
]

def scrape_full_form(url=DEFAULT_SUBMISSION_URL):
    print("\n========================================================")
    print("  Lungent Full Multi-Tab Form Scraper")
    print("========================================================")
    print(f"Target URL:  {url}")
    print(f"Session Dir: {SESSION_DIR}\n")

    os.makedirs(SESSION_DIR, exist_ok=True)

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=SESSION_DIR,
            headless=False,
            viewport={"width": 1440, "height": 950},
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = context.pages[0] if context.pages else context.new_page()

        print(f"[*] Navigating to {url}...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
        except Exception as e:
            print(f"[!] Note on initial load: {e}")

        print("\n--------------------------------------------------------")
        print("ACTION REQUIRED IN BROWSER:")
        print("1. If prompted to Sign In, please complete login now.")
        print("2. Make sure you are viewing the submission form on screen.")
        print("--------------------------------------------------------")
        input(">> When you see the form in the browser, press ENTER in this terminal: ")

        print("\n[*] Initializing DOM scanner and clearing existing values...")
        page.wait_for_timeout(1500)

        # TASK 1: Clear existing input values across the page for a clean schema
        clear_inputs_js = """
        () => {
            document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="hidden"]), textarea').forEach(el => {
                el.value = '';
                el.defaultValue = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
            return true;
        }
        """
        page.evaluate(clear_inputs_js)
        print("    [✓] Existing text inputs and textareas cleared.")

        # JavaScript extraction function executed in browser context for each tab
        extract_tab_dom_js = """
        (currentTabName) => {
            const data = {
                tab: currentTabName,
                inputs: [],
                textareas: [],
                selects: [],
                checkboxes: [],
                radios: []
            };

            function cleanText(str) {
                return (str || '').replace(/\\s+/g, ' ').trim();
            }

            function findLabel(el) {
                // 1. Label with 'for' attribute
                if (el.id) {
                    const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
                    if (l) return cleanText(l.innerText);
                }
                // 2. Parent or ancestor label
                const parentLabel = el.closest('label');
                if (parentLabel) return cleanText(parentLabel.innerText);

                // 3. ARIA attributes
                if (el.getAttribute('aria-label')) return cleanText(el.getAttribute('aria-label'));
                if (el.getAttribute('aria-labelledby')) {
                    const ref = document.getElementById(el.getAttribute('aria-labelledby'));
                    if (ref) return cleanText(ref.innerText);
                }

                // 4. Sibling label or text container
                const parent = el.parentElement;
                if (parent) {
                    const siblingLabel = parent.querySelector('label, span.text-sm, span.font-medium, span, p');
                    if (siblingLabel && siblingLabel !== el) return cleanText(siblingLabel.innerText);
                }

                // 5. Container row heading
                const row = el.closest('.space-y-2, .space-y-1, .form-group, .flex, .grid, fieldset');
                if (row) {
                    const heading = row.querySelector('label, legend, h4, h5, p.font-medium, span.font-medium');
                    if (heading && heading !== el) return cleanText(heading.innerText);
                }

                return cleanText(el.placeholder || el.name || el.id || '');
            }

            // A. Native Inputs (includes both visible and visually-hidden sr-only inputs)
            document.querySelectorAll('input').forEach((inp, idx) => {
                const type = (inp.type || 'text').toLowerCase();
                const label = findLabel(inp);
                const item = {
                    tab: currentTabName,
                    id: inp.id || '',
                    name: inp.name || '',
                    type: type,
                    placeholder: inp.placeholder || '',
                    value: inp.value || '',
                    checked: inp.checked || false,
                    label: label,
                    selector: inp.id ? `#${CSS.escape(inp.id)}` : (inp.name ? `input[name="${CSS.escape(inp.name)}"]` : `input[type="${type}"]:nth-of-type(${idx + 1})`)
                };

                if (type === 'checkbox') {
                    data.checkboxes.push(item);
                } else if (type === 'radio') {
                    data.radios.push(item);
                } else if (type !== 'hidden' && type !== 'submit') {
                    data.inputs.push(item);
                }
            });

            // B. ARIA / Radix / Shadcn Checkboxes & Switches (button[role="checkbox"], [role="switch"])
            document.querySelectorAll('[role="checkbox"], button[role="switch"], [role="switch"]').forEach((cb, idx) => {
                const label = findLabel(cb);
                const isChecked = cb.getAttribute('aria-checked') === 'true' || 
                                  cb.getAttribute('data-state') === 'checked' || 
                                  cb.getAttribute('data-state') === 'on';
                data.checkboxes.push({
                    tab: currentTabName,
                    id: cb.id || '',
                    name: cb.getAttribute('name') || '',
                    type: 'aria_checkbox',
                    ariaRole: cb.getAttribute('role') || 'checkbox',
                    dataState: cb.getAttribute('data-state') || '',
                    checked: isChecked,
                    label: label,
                    selector: cb.id ? `#${CSS.escape(cb.id)}` : `[role="${cb.getAttribute('role') || 'checkbox'}"]:nth-of-type(${idx + 1})`
                });
            });

            // C. Textareas
            document.querySelectorAll('textarea').forEach((ta, idx) => {
                data.textareas.push({
                    tab: currentTabName,
                    id: ta.id || '',
                    name: ta.name || '',
                    placeholder: ta.placeholder || '',
                    value: ta.value || '',
                    label: findLabel(ta),
                    selector: ta.id ? `#${CSS.escape(ta.id)}` : (ta.name ? `textarea[name="${CSS.escape(ta.name)}"]` : `textarea:nth-of-type(${idx + 1})`)
                });
            });

            // D. Selects (Native + Radix comboboxes)
            document.querySelectorAll('select').forEach((sel, idx) => {
                const options = Array.from(sel.options).map(o => ({ value: o.value, text: cleanText(o.text), selected: o.selected }));
                data.selects.push({
                    tab: currentTabName,
                    type: 'native_select',
                    id: sel.id || '',
                    name: sel.name || '',
                    label: findLabel(sel),
                    options: options,
                    selector: sel.id ? `#${CSS.escape(sel.id)}` : `select:nth-of-type(${idx + 1})`
                });
            });

            document.querySelectorAll('[role="combobox"]').forEach((cb, idx) => {
                data.selects.push({
                    tab: currentTabName,
                    type: 'custom_combobox',
                    id: cb.id || '',
                    label: findLabel(cb),
                    text: cleanText(cb.innerText),
                    selector: cb.id ? `#${CSS.escape(cb.id)}` : `[role="combobox"]:nth-of-type(${idx + 1})`
                });
            });

            // E. Radios
            document.querySelectorAll('[role="radio"]').forEach((r, idx) => {
                const isChecked = r.getAttribute('aria-checked') === 'true' || r.getAttribute('data-state') === 'checked';
                data.radios.push({
                    tab: currentTabName,
                    type: 'custom_radio',
                    id: r.id || '',
                    label: findLabel(r),
                    checked: isChecked,
                    selector: r.id ? `#${CSS.escape(r.id)}` : `[role="radio"]:nth-of-type(${idx + 1})`
                });
            });

            return data;
        }
        """

        master_schema = {
            "title": page.title(),
            "url": page.url,
            "tabs_scraped": [],
            "inputs": [],
            "textareas": [],
            "selects": [],
            "checkboxes": [],
            "radios": []
        }

        # Step 1: Detect all tabs available in the DOM
        find_tabs_js = """
        () => {
            const tabs = [];
            // Strategy A: role="tab"
            document.querySelectorAll('[role="tab"]').forEach(el => {
                const t = (el.innerText || '').trim().split('\\n')[0].trim();
                if (t && !tabs.includes(t)) tabs.push(t);
            });
            // Strategy B: nav buttons / tablist buttons
            document.querySelectorAll('nav button, [role="tablist"] button, div[data-tabs] button').forEach(el => {
                const t = (el.innerText || '').trim().split('\\n')[0].trim();
                if (t && !tabs.includes(t) && t.length < 35) tabs.push(t);
            });
            // Strategy C: buttons matching known keywords
            const keywords = ['Overview', 'Story', 'Proof', 'AI-Native', 'Data Lifecycle', 'Prompt', 'Team', 'Audit', 'Provenance', 'Basics', 'AI Detail'];
            document.querySelectorAll('button, a, div[role="button"]').forEach(el => {
                const t = (el.innerText || '').trim();
                for (const kw of keywords) {
                    if (t.includes(kw)) {
                        const firstLine = t.split('\\n')[0].trim();
                        if (firstLine && !tabs.includes(firstLine) && firstLine.length < 35) {
                            tabs.push(firstLine);
                        }
                    }
                }
            });
            return tabs;
        }
        """
        detected = page.evaluate(find_tabs_js)
        print(f"[*] Detected {len(detected)} navigation tabs in page: {detected}")

        # Merge detected with fallback keywords
        tabs_to_cycle = []
        for t in detected + TAB_KEYWORDS:
            first = t.split('\n')[0].strip()
            if first and first not in tabs_to_cycle and len(first) < 35:
                tabs_to_cycle.append(first)

        seen_keys = set()

        # Step 2: Loop through each tab, click it, expand accordions, and extract elements
        for tab_name in tabs_to_cycle:
            print(f"\n---> [Tab] Navigating to: '{tab_name}'...")
            try:
                # Find tab button using fuzzy text
                tab_btn = page.locator(f'[role="tab"]:has-text("{tab_name}"), button:has-text("{tab_name}")').first
                if tab_btn.count() > 0:
                    tab_btn.scroll_into_view_if_needed()
                    tab_btn.click(force=True)
                    page.wait_for_timeout(1000) # Wait for React tab panel to mount
                else:
                    print(f"     [!] Tab trigger for '{tab_name}' not directly clickable, skipping...")
                    continue
            except Exception as e:
                print(f"     [!] Could not switch to '{tab_name}': {e}")
                continue

            # Clear inputs in newly mounted tab as well
            page.evaluate(clear_inputs_js)

            # Expand all collapsed accordions/drawers inside this tab
            try:
                closed = page.locator('button[data-state="closed"], [aria-expanded="false"], summary')
                count = closed.count()
                if count > 0:
                    print(f"     Expanding {count} collapsed sections in '{tab_name}'...")
                    for idx in range(min(count, 15)):
                        try:
                            closed.nth(idx).click(force=True)
                            page.wait_for_timeout(200)
                        except Exception:
                            pass
            except Exception:
                pass

            # Extract data from currently visible tab DOM
            tab_data = page.evaluate(extract_tab_dom_js, tab_name)
            master_schema["tabs_scraped"].append(tab_name)

            # Append unique inputs
            for inp in tab_data.get("inputs", []):
                key = (inp["tab"], inp["type"], inp["placeholder"], inp["label"], inp["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["inputs"].append(inp)

            # Append unique textareas
            for ta in tab_data.get("textareas", []):
                key = (ta["tab"], ta["placeholder"], ta["label"], ta["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["textareas"].append(ta)

            # Append unique checkboxes
            for cb in tab_data.get("checkboxes", []):
                key = (cb["tab"], cb.get("label", ""), cb["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["checkboxes"].append(cb)

            # Append unique selects
            for sel in tab_data.get("selects", []):
                key = (sel["tab"], sel.get("label", ""), sel["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["selects"].append(sel)

            # Append unique radios
            for r in tab_data.get("radios", []):
                key = (r["tab"], r.get("label", ""), r["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["radios"].append(r)

            print(f"     [+] Scraped from '{tab_name}': {len(tab_data.get('inputs', []))} inputs, {len(tab_data.get('textareas', []))} textareas, {len(tab_data.get('checkboxes', []))} checkboxes, {len(tab_data.get('selects', []))} selects")

        # Step 3: Write master schema file
        with open(OUTPUT_SCHEMA_FILE, "w", encoding="utf-8") as f:
            json.dump(master_schema, f, indent=2, ensure_ascii=False)

        print("\n========================================================")
        print("  ✓ MULTI-TAB SCRAPING COMPLETE!")
        print("========================================================")
        print(f"Tabs Scraped:           {len(master_schema['tabs_scraped'])}")
        print(f"Total Text Inputs:      {len(master_schema['inputs'])}")
        print(f"Total Textareas:        {len(master_schema['textareas'])}")
        print(f"Total Checkboxes:       {len(master_schema['checkboxes'])}")
        print(f"Total Radios:           {len(master_schema['radios'])}")
        print(f"Total Dropdowns:        {len(master_schema['selects'])}")
        print(f"\n[✓] Master schema written to: {OUTPUT_SCHEMA_FILE}\n")

        context.close()

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUBMISSION_URL
    scrape_full_form(url_arg)
