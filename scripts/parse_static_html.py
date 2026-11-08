#!/usr/bin/env python3
"""
Lungent — Static HTML Parser (BeautifulSoup)
Parses full_form.html to extract all interactive form elements:
- Inputs (text, hidden, checkbox, radio, email, url, number)
- Textareas
- Native Selects
- Custom ARIA controls (button[role="checkbox"], [role="switch"], [role="combobox"], [role="radio"])
- Surrounding labels, placeholders, and card headers.
Outputs full_form_schema.json.
"""

import json
import os
import re
from bs4 import BeautifulSoup

INPUT_HTML_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "full_form.html")
OUTPUT_SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "full_form_schema.json")

def clean_text(s):
    if not s:
        return ""
    return re.sub(r"\s+", " ", str(s)).strip()

def find_label_for_tag(soup, tag):
    # 1. Label with for="id"
    tag_id = tag.get("id")
    if tag_id:
        lbl = soup.find("label", attrs={"for": tag_id})
        if lbl:
            return clean_text(lbl.get_text())

    # 2. Parent label
    parent_lbl = tag.find_parent("label")
    if parent_lbl:
        return clean_text(parent_lbl.get_text())

    # 3. ARIA attributes
    if tag.get("aria-label"):
        return clean_text(tag.get("aria-label"))
    if tag.get("aria-labelledby"):
        ref = soup.find(id=tag.get("aria-labelledby"))
        if ref:
            return clean_text(ref.get_text())

    # 4. Sibling or parent row text
    parent = tag.parent
    if parent:
        # Check adjacent span or label
        sib = parent.find(["label", "span", "p"])
        if sib and sib != tag and len(sib.get_text().strip()) > 1:
            return clean_text(sib.get_text())

    # 5. Row container heading
    container = tag.find_parent(class_=re.compile(r"space-y|form-group|flex|grid|border|card|rounded", re.I))
    if container:
        heading = container.find(["label", "legend", "h4", "h5", "p", "span"], class_=re.compile(r"font-medium|font-semibold|text-sm|text-xs", re.I))
        if heading and heading != tag and len(heading.get_text().strip()) > 1:
            return clean_text(heading.get_text())

    return clean_text(tag.get("placeholder") or tag.get("name") or tag.get("id") or "")

def parse_html(html_file=INPUT_HTML_FILE):
    if not os.path.exists(html_file):
        print(f"[!] Error: {html_file} does not exist.")
        print("    Please run `python dump_full_html.py` first.")
        return

    print("\n========================================================")
    print("  Lungent Static HTML Parser (BeautifulSoup)")
    print("========================================================")
    print(f"Reading: {html_file}")

    with open(html_file, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    soup = BeautifulSoup(content, "html.parser")

    schema = {
        "title": clean_text(soup.title.string) if soup.title else "",
        "inputs": [],
        "textareas": [],
        "selects": [],
        "checkboxes": [],
        "radios": [],
        "detected_sections": []
    }

    # Extract visible section headings / tabs
    for h in soup.find_all(["h1", "h2", "h3", "h4", "button"], attrs={"role": "tab"}):
        txt = clean_text(h.get_text())
        if txt and len(txt) < 50 and txt not in schema["detected_sections"]:
            schema["detected_sections"].append(txt)

    # 1. Inputs
    for idx, inp in enumerate(soup.find_all("input")):
        inp_type = clean_text(inp.get("type", "text")).lower()
        label = find_label_for_tag(soup, inp)
        inp_id = inp.get("id", "")
        inp_name = inp.get("name", "")

        selector = f"#{inp_id}" if inp_id else (f"input[name=\"{inp_name}\"]" if inp_name else f"input[type=\"{inp_type}\"]:nth-of-type({idx+1})")

        item = {
            "index": idx,
            "id": inp_id,
            "name": inp_name,
            "type": inp_type,
            "placeholder": clean_text(inp.get("placeholder", "")),
            "value": clean_text(inp.get("value", "")),
            "checked": inp.has_attr("checked"),
            "label": label,
            "selector": selector
        }

        if inp_type == "checkbox":
            schema["checkboxes"].append(item)
        elif inp_type == "radio":
            schema["radios"].append(item)
        elif inp_type != "hidden" and inp_type != "submit":
            schema["inputs"].append(item)

    # 2. Custom ARIA Checkboxes & Switches (button[role="checkbox"], [role="switch"])
    for idx, cb in enumerate(soup.find_all(attrs={"role": re.compile(r"checkbox|switch", re.I)})):
        label = find_label_for_tag(soup, cb)
        cb_id = cb.get("id", "")
        cb_name = cb.get("name", "")
        role = cb.get("role", "checkbox")
        data_state = cb.get("data-state", "")
        aria_checked = cb.get("aria-checked", "")
        is_checked = (data_state in ["checked", "on"]) or (aria_checked == "true")

        selector = f"#{cb_id}" if cb_id else f"[role=\"{role}\"]:nth-of-type({idx+1})"

        schema["checkboxes"].append({
            "index": idx,
            "id": cb_id,
            "name": cb_name,
            "type": f"aria_{role}",
            "data_state": data_state,
            "checked": is_checked,
            "label": label,
            "selector": selector
        })

    # 3. Textareas
    for idx, ta in enumerate(soup.find_all("textarea")):
        ta_id = ta.get("id", "")
        ta_name = ta.get("name", "")
        label = find_label_for_tag(soup, ta)
        selector = f"#{ta_id}" if ta_id else (f"textarea[name=\"{ta_name}\"]" if ta_name else f"textarea:nth-of-type({idx+1})")

        schema["textareas"].append({
            "index": idx,
            "id": ta_id,
            "name": ta_name,
            "placeholder": clean_text(ta.get("placeholder", "")),
            "value": clean_text(ta.get_text()),
            "label": label,
            "selector": selector
        })

    # 4. Native Selects
    for idx, sel in enumerate(soup.find_all("select")):
        sel_id = sel.get("id", "")
        sel_name = sel.get("name", "")
        label = find_label_for_tag(soup, sel)
        options = []
        for opt in sel.find_all("option"):
            options.append({
                "value": opt.get("value", ""),
                "text": clean_text(opt.get_text()),
                "selected": opt.has_attr("selected")
            })

        selector = f"#{sel_id}" if sel_id else (f"select[name=\"{sel_name}\"]" if sel_name else f"select:nth-of-type({idx+1})")

        schema["selects"].append({
            "index": idx,
            "id": sel_id,
            "name": sel_name,
            "type": "native_select",
            "label": label,
            "options": options,
            "selector": selector
        })

    # 5. Custom Comboboxes (button[role="combobox"])
    for idx, cb in enumerate(soup.find_all(attrs={"role": "combobox"})):
        cb_id = cb.get("id", "")
        label = find_label_for_tag(soup, cb)
        selector = f"#{cb_id}" if cb_id else f"[role=\"combobox\"]:nth-of-type({idx+1})"

        schema["selects"].append({
            "index": idx,
            "id": cb_id,
            "type": "custom_combobox",
            "label": label,
            "current_text": clean_text(cb.get_text()),
            "selector": selector
        })

    # 6. Custom Radios (button[role="radio"])
    for idx, r in enumerate(soup.find_all(attrs={"role": "radio"})):
        r_id = r.get("id", "")
        label = find_label_for_tag(soup, r)
        selector = f"#{r_id}" if r_id else f"[role=\"radio\"]:nth-of-type({idx+1})"

        schema["radios"].append({
            "index": idx,
            "id": r_id,
            "type": "custom_radio",
            "label": label,
            "checked": r.get("data-state") == "checked" or r.get("aria-checked") == "true",
            "selector": selector
        })

    # Write output to JSON
    with open(OUTPUT_SCHEMA_FILE, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2, ensure_ascii=False)

    print(f"\n[✓] STATIC PARSING COMPLETE!")
    print(f"    - Text Inputs found:    {len(schema['inputs'])}")
    print(f"    - Textarea fields:      {len(schema['textareas'])}")
    print(f"    - Checkboxes found:     {len(schema['checkboxes'])}")
    print(f"    - Selects / Comboboxes: {len(schema['selects'])}")
    print(f"    - Radios found:         {len(schema['radios'])}")
    print(f"    - Detected Sections:    {len(schema['detected_sections'])}")
    print(f"\n[✓] Saved parsed schema to: {OUTPUT_SCHEMA_FILE}\n")

if __name__ == "__main__":
    parse_html()
