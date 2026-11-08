#!/usr/bin/env python3
"""
Lungent — Upgraded Multi-Tab Form Scraper (Playwright)
Iterates through all navigation tabs (Overview, Story, Proof, AI-Native Build,
Data Lifecycle, Prompt Library, Team, Audit, Build Provenance) and extracts
both native HTML inputs and dynamic React/Radix/Shadcn custom controls:
- inputs, textareas
- native and ARIA checkboxes (button[role="checkbox"], input[type="checkbox"])
- native and ARIA dropdowns (select, button[role="combobox"])
- native and ARIA radio buttons (button[role="radio"], input[type="radio"])
- custom switch toggles (button[role="switch"])
"""

import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

DEFAULT_SUBMISSION_URL = "https://cloudcampbd.com/submissions/8dee8cdb-0cda-49c6-8c84-4429d2cc0177"
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_session")
OUTPUT_SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "form_schema.json")

# Known tabs from CloudCamp submission form
TARGET_TABS = [
    "Overview",
    "Story",
    "Proof",
    "AI-Native Build",
    "Data Lifecycle",
    "Prompt Library",
    "Team",
    "Audit",
    "Build Provenance"
]

def scrape_multi_tab_form(url=DEFAULT_SUBMISSION_URL):
    print("\n========================================================")
    print("  Lungent Multi-Tab Form Scraper (Playwright)")
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
        print("2. Ensure the submission page with its tabs is visible.")
        print("--------------------------------------------------------")
        input(">> When you see the form in the browser, press ENTER to start multi-tab scraping: ")

        print("\n[*] Initializing DOM scanner...")
        page.wait_for_timeout(2000)

        # Extraction function executed inside the browser context for each tab
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
                // 1. Direct label with 'for' attribute
                if (el.id) {
                    const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
                    if (l) return cleanText(l.innerText);
                }
                // 2. Parent or ancestor label
                const parentLabel = el.closest('label');
                if (parentLabel) return cleanText(parentLabel.innerText);

                // 3. Aria attributes
                if (el.getAttribute('aria-label')) return cleanText(el.getAttribute('aria-label'));
                if (el.getAttribute('aria-labelledby')) {
                    const ref = document.getElementById(el.getAttribute('aria-labelledby'));
                    if (ref) return cleanText(ref.innerText);
                }

                // 4. Sibling label or text container
                const parent = el.parentElement;
                if (parent) {
                    const siblingLabel = parent.querySelector('label, span.text-sm, span.font-medium, p');
                    if (siblingLabel && siblingLabel !== el) return cleanText(siblingLabel.innerText);
                }

                // 5. Card / Form row heading
                const row = el.closest('.space-y-2, .space-y-1, .form-group, .flex.items-center, .grid, fieldset');
                if (row) {
                    const heading = row.querySelector('label, legend, h4, h5, p.font-medium, span.font-medium');
                    if (heading && heading !== el) return cleanText(heading.innerText);
                }

                return cleanText(el.placeholder || el.name || el.id || '');
            }

            // A. Native Inputs
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

            // B. ARIA / Radix / Shadcn Checkboxes (button[role="checkbox"], [role="switch"])
            document.querySelectorAll('[role="checkbox"], button[role="switch"], [role="switch"]').forEach((cb, idx) => {
                const label = findLabel(cb);
                const isChecked = cb.getAttribute('aria-checked') === 'true' || 
                                  cb.getAttribute('data-state') === 'checked' || 
                                  cb.getAttribute('data-state') === 'on';
                data.checkboxes.push({
                    tab: currentTabName,
                    id: cb.id || '',
                    name: cb.getAttribute('name') || '',
                    type: 'custom_checkbox',
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

            // E. Radios (Radix/Shadcn)
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

        # Step 1: Detect all tab buttons currently rendered
        print("\n[*] Detecting navigation tabs on page...")
        tab_buttons = page.locator('[role="tab"], button[data-state], nav button, [role="tablist"] button')
        tab_count = tab_buttons.count()
        print(f"    Found {tab_count} potential tab elements.")

        # Identify unique clickable tab texts
        available_tabs = []
        for i in range(tab_count):
            try:
                txt = tab_buttons.nth(i).inner_text().strip()
                first_line = txt.split('\n')[0].strip()
                if first_line and first_line not in available_tabs and len(first_line) < 40:
                    available_tabs.append(first_line)
            except Exception:
                pass

        print(f"    Tabs detected: {available_tabs}")

        # If detected list is empty or minimal, use TARGET_TABS fallback
        tabs_to_visit = available_tabs if len(available_tabs) >= 3 else TARGET_TABS

        # Step 2: Click through each tab and extract DOM
        seen_keys = set()

        for tab_name in tabs_to_visit:
            print(f"\n---> Switching to tab: [{tab_name}]...")
            try:
                # Find tab by text or role
                tab_locator = page.locator(f'[role="tab"]:has-text("{tab_name}"), button:has-text("{tab_name}")').first
                if tab_locator.count() > 0:
                    tab_locator.scroll_into_view_if_needed()
                    tab_locator.click()
                    page.wait_for_timeout(1200) # Wait for React tab panel to mount
                else:
                    print(f"     [!] Could not locate clickable element for '{tab_name}'")
            except Exception as e:
                print(f"     [!] Click error on '{tab_name}': {e}")

            # Expand any closed accordions in this tab
            try:
                closed_accordions = page.locator('button[data-state="closed"], [aria-expanded="false"]')
                acc_count = closed_accordions.count()
                if acc_count > 0:
                    print(f"     Expanding {acc_count} collapsible sections in '{tab_name}'...")
                    for a_idx in range(acc_count):
                        try:
                            closed_accordions.nth(a_idx).click()
                            page.wait_for_timeout(300)
                        except Exception:
                            pass
            except Exception:
                pass

            # Extract data from this tab
            tab_data = page.evaluate(extract_tab_dom_js, tab_name)
            master_schema["tabs_scraped"].append(tab_name)

            # Deduplicate and append inputs
            for inp in tab_data.get("inputs", []):
                key = (inp["tab"], inp["type"], inp["placeholder"], inp["label"], inp["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["inputs"].append(inp)

            # Deduplicate and append textareas
            for ta in tab_data.get("textareas", []):
                key = (ta["tab"], ta["placeholder"], ta["label"], ta["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["textareas"].append(ta)

            # Deduplicate and append checkboxes
            for cb in tab_data.get("checkboxes", []):
                key = (cb["tab"], cb.get("label", ""), cb["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["checkboxes"].append(cb)

            # Deduplicate and append selects
            for sel in tab_data.get("selects", []):
                key = (sel["tab"], sel.get("label", ""), sel["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["selects"].append(sel)

            # Deduplicate and append radios
            for r in tab_data.get("radios", []):
                key = (r["tab"], r.get("label", ""), r["selector"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    master_schema["radios"].append(r)

            print(f"     Scraped from '{tab_name}': {len(tab_data.get('inputs', []))} inputs, {len(tab_data.get('textareas', []))} textareas, {len(tab_data.get('checkboxes', []))} checkboxes, {len(tab_data.get('selects', []))} selects")

        # Step 3: Write complete master schema to disk
        with open(OUTPUT_SCHEMA_FILE, "w", encoding="utf-8") as f:
            json.dump(master_schema, f, indent=2, ensure_ascii=False)

        print("\n========================================================")
        print("  ✓ MULTI-TAB SCRAPING COMPLETE!")
        print("========================================================")
        print(f"Tabs Scraped:           {len(master_schema['tabs_scraped'])}")
        print(f"Total Text Inputs:      {len(master_schema['inputs'])}")
        print(f"Total Textarea Fields:  {len(master_schema['textareas'])}")
        print(f"Total Checkboxes:       {len(master_schema['checkboxes'])}")
        print(f"Total Radio Buttons:    {len(master_schema['radios'])}")
        print(f"Total Select Dropdowns: {len(master_schema['selects'])}")
        print(f"\n[✓] Master schema saved to: {OUTPUT_SCHEMA_FILE}\n")

        context.close()

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUBMISSION_URL
    scrape_multi_tab_form(url_arg)
