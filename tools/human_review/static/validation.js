"use strict";
const $ = id => document.getElementById(id);
const selected = new Set();
let data, busy = false;
let stageQueue=Promise.resolve();
const languageNames = {en: "English", cs: "Czech", other: "Other", und: "Undetermined"};
function node(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
function visible() { return data.records.filter(r => ($("label").value === "all" || r.source_label === $("label").value) &&
  ($("scope").value === "all" || $("scope").value === "changed" && r.changed_from_source || $("scope").value === "not-rechecked" && !r.label_rechecked || $("scope").value === "high" && r.hints.attention === "high"))
  .sort((a,b) => a.source_label.localeCompare(b.source_label) || a.row_id.localeCompare(b.row_id)); }
function message(text) { const d=node("details"); d.append(node("summary", text.length > 130 ? text.slice(0,130)+"…" : text), node("div",text,"full-message")); return d; }
function countsText(counts) { return ["ham","spam","smishing"].map(k=>`${counts[k] || 0} ${k.toUpperCase()}`).join(" / "); }
function renderGroups(container, groups, affected) {
  container.replaceChildren();
  const shownReasons=new Set();
  for (const group of groups) {
    const d=node("details"), heading=`${group.group_id} · ${group.rows.length} rows · ${countsText(group.counts_by_original_label)}${affected ? group.draft_conflict ? " · unresolved draft conflict" : " · consistent draft labels" : ""}`;
    d.append(node("summary",heading)); d.append(node("p", group.reason));
    if(!affected && !shownReasons.has(group.reason)) {d.open=true;shownReasons.add(group.reason);}
    const table=node("table");
    for (const r of group.rows) { const tr=node("tr"), text=node("td"); text.append(message(r.text)); tr.append(node("td",r.row_id),node("td",r.original_label.toUpperCase()),node("td",r.draft_label.toUpperCase()),text); table.append(tr); }
    const wrap=node("div",undefined,"table-wrap");wrap.append(table);d.append(wrap);
    if (affected) {
      const actions=node("div",undefined,"toolbar");
      for (const label of ["ham","spam","smishing"]) {
        const b=node("button",`Stage all family members as ${label.toUpperCase()}`);
        b.addEventListener("click",()=>act({group_id:group.group_id,group_label:label},"Confirm reviewed family label",`${group.rows.length} rows in ${group.group_id}. Confirm that you inspected all family members and choose ${label.toUpperCase()} for each. This stages explicit human decisions; it does not modify the dataset.`)); actions.append(b);
      }
      d.append(actions);
    }
    container.append(d);
  }
}
function render() {
  const savedCounts={};for(const r of data.records)savedCounts[r.saved_label]=(savedCounts[r.saved_label]||0)+1;
  $("saved-distribution").textContent=`Saved human labels: ${countsText(savedCounts)}. These are decisions to verify, not automatically accepted ground truth.`;
  $("counters").replaceChildren();
  const values = [[data.records.length,"Total entries"],[data.records.filter(r=>r.changed_from_source).length,"Changed labels"],[data.records.filter(r=>!r.label_rechecked).length,"Labels to recheck"],[data.records.filter(r=>!r.language_confirmed).length,"Languages to confirm"],[data.records.filter(r=>!r.reviewer_id || !r.reviewed_date).length,"Missing metadata"]];
  for (const [count,title] of values) {const box=node("div",undefined,"counter");box.append(node("strong",count),node("span",title));$("counters").append(box);}
  $("selection").textContent=`${selected.size} selected · ${visible().length} visible`;
  $("rows").replaceChildren();let group;
  for(const r of visible()) {
    if(group!==r.source_label) {group=r.source_label;const tr=node("tr",undefined,"group-row"),th=node("th",group.toUpperCase());th.colSpan=6;tr.append(th);$("rows").append(tr);}
    const tr=node("tr",undefined,r.changed_from_source?"changed":"");tr.dataset.rowId=r.row_id;
    const pick=node("td"),check=node("input");check.type="checkbox";check.checked=selected.has(r.row_id);check.setAttribute("aria-label",`Select ${r.row_id}`);check.onchange=()=>{check.checked?selected.add(r.row_id):selected.delete(r.row_id);$("selection").textContent=`${selected.size} selected · ${visible().length} visible`;};pick.append(check);
    const text=node("td");text.append(message(r.text),node("p",r.hints.observation,"metadata"));
    if(r.hints.suggested_label)text.append(node("p",`Textual suggestion: ${r.hints.suggested_label.toUpperCase()} · requires your decision`,"metadata"));
    const choice=node("td");choice.append(node("strong",`${r.final_label?.toUpperCase() || "UNRESOLVED"} · ${r.changed_from_source?"changed":"unchanged"} · ${r.label_rechecked?"rechecked":"not rechecked"}`));
    const actions=node("div",undefined,"decision-buttons");
    for(const label of ["current","original","ham","spam","smishing"]) {
      const b=node("button",label==="current"?"Confirm draft":label==="original"?"Use original":label.toUpperCase());b.setAttribute("aria-label",`${label} ${r.row_id}`);
      b.onclick=()=>stage({ids:[r.row_id],label,attested:true});actions.append(b);
    }
    choice.append(actions);
    const language=node("select");language.setAttribute("aria-label",`Confirm language ${r.row_id}`);const blank=node("option","Language unconfirmed");blank.value="";language.append(blank);
    for(const [key,name] of Object.entries(languageNames)) {const option=node("option",name);option.value=key;language.append(option);}
    language.value=r.language_confirmed?r.language:"";language.onchange=()=>language.value&&stage({ids:[r.row_id],language:language.value,attested:true});choice.append(language);
    tr.append(pick,node("td",r.row_id),text,node("td",r.source_label.toUpperCase()),node("td",r.saved_label?.toUpperCase() || "UNRESOLVED"),choice);$("rows").append(tr);
  }
  const shown=visible(),picked=shown.filter(r=>selected.has(r.row_id)).length;
  $("select-visible").checked=shown.length>0&&picked===shown.length;
  $("select-visible").indeterminate=picked>0&&picked<shown.length;
  $("language-basis").textContent=data.language_hint_basis;$("languages").replaceChildren();
  for(const lang of [...new Set(data.records.map(r=>r.hints.language))]) {
    const rows=data.records.filter(r=>r.hints.language===lang),box=node("div",undefined,"toolbar");
    box.append(node("span",`${languageNames[lang]} suggested: ${rows.length} entries; ${rows.filter(r=>r.language_confirmed).length} explicitly confirmed.`));
    for(const target of [lang,...Object.keys(languageNames).filter(k=>k!==lang)]) {
      const b=node("button",`Confirm this group as ${languageNames[target]}`);
      b.onclick=()=>act({ids:rows.map(r=>r.row_id),language:target},"Confirm language group",`Confirm ${languageNames[target]} for ${rows.length} entries after inspecting their texts. This is your human language confirmation, not a model accuracy claim.`);box.append(b);
    }
    $("languages").append(box);
  }
  const missing=data.records.filter(r=>!r.reviewer_id || !r.reviewed_date);$("metadata-ids").textContent=missing.length?`Missing: ${missing.map(r=>r.row_id).join(", ")}`:"Missing metadata resolved in this draft; historical records preserved.";$("metadata").disabled=!missing.length;
  const ef=data.effect;$("conflict-summary").textContent=`${ef.quarantined_rows} rows in ${ef.quarantined_groups} groups: ${countsText(ef.quarantined_counts)}. Groups have multiple original labels. ${Object.entries(ef.conflict_reason_counts).map(([reason,count])=>`${count}: ${reason}`).join("; ")}.`;
  $("quarantine").textContent=data.quarantine_proposed?"Quarantine proposed in draft; final approval still required":`Propose keeping ${ef.quarantined_rows} conflicting rows quarantined`;
  renderGroups($("conflicts"),data.conflicts,false);renderGroups($("affected"),data.affected_review_groups,true);
  $("effect").textContent=`Original: ${ef.original_rows} (${countsText(ef.original_counts)}). Quarantine: ${ef.quarantined_rows}. Eligible: ${ef.eligible_rows} (${countsText(ef.eligible_original_counts)}). Draft after label corrections: ${countsText(ef.draft_counts_after_corrections)}. Additional unresolved families: ${ef.additional_conflict_groups.length} / ${ef.additional_conflict_rows} rows. ${ef.retraining_required_if_approved?"Approved label changes would require Goal 02 retraining.":"No label changes currently require retraining."} Existing split assignments are preserved in the proposed revision; no freeze or training has run.`;
  $("blockers").replaceChildren();for(const b of data.blockers)$("blockers").append(node("li",`${b.code.replaceAll("_"," ")}: ${b.ids?.length ?? b.group_ids?.length ?? b.count}`));
  $("submit").disabled=busy||data.blockers.length>0;$("apply").disabled=busy;
}
function confirm(title, description) {return new Promise(resolve=>{const d=$("confirm");$("confirm-title").textContent=title;$("confirm-description").textContent=description;let done=false;const finish=v=>{if(done)return;done=true;d.close();resolve(v);};$("accept-confirm").onclick=()=>finish(true);$("cancel-confirm").onclick=()=>finish(false);d.oncancel=e=>{e.preventDefault();finish(false);};d.showModal();$("cancel-confirm").focus();});}
async function api(url,body) {const response=await fetch(url,{cache:"no-store",...(body?{method:"POST",headers:{"Content-Type":"application/json","X-Review-Token":data.csrf_token},body:JSON.stringify(body)}:{})});const result=await response.json();if(!response.ok)throw Error(result.error||"local_operation_failed");return result;}
function stage(body) {stageQueue=stageQueue.then(async()=>{busy=true;$("apply").disabled=true;$("submit").disabled=true;try{data=await api("/api/validation/stage",body);if(body.label||body.group_label)selected.clear();$("status").textContent="Human choices staged in memory. Canonical review and split unchanged.";}catch(e){$("status").textContent=e.message;}finally{busy=false;render();}});return stageQueue;}
async function act(body,title,description) {if(!busy&&await confirm(title,description))await stage({...body,attested:true});}
for(const id of ["scope","label"])$(id).onchange=()=>{selected.clear();if(data)render();};
$("select-visible").onchange=e=>{for(const r of visible())e.target.checked?selected.add(r.row_id):selected.delete(r.row_id);render();};
$("apply").onclick=()=>selected.size&&act({ids:[...selected],label:$("batch").value},"Confirm selected label decisions",`Entries: ${[...selected].join(", ")}. Confirm that you inspected these messages and deliberately choose the selected label action. This stages a draft only.`);
$("metadata").onclick=()=>act({ids:data.records.filter(r=>!r.reviewer_id||!r.reviewed_date).map(r=>r.row_id),metadata_mode:$("metadata-mode").value,reviewer_id:$("reviewer").value.trim(),historical_date:$("historical-date").value||null},"Confirm actual review metadata",$("metadata-mode").value==="reconfirm_now"?"Re-confirm the listed old decisions now under the entered reviewer ID. Their historical timestamp remains unknown; the actual current confirmation time will be recorded.":"Confirm that the supplied reviewer ID and historical date are known true facts. They must not be guessed or backdated.");
$("quarantine").onclick=()=>act({propose_quarantine:true},"Propose reversible quarantine",`${data.effect.quarantined_rows} rows / ${data.effect.quarantined_groups} conflicting groups would remain out of the approved split; all original files are retained. This is a proposal for separate final approval, not an exclusion now.`);
$("submit").onclick=async()=>{if(!$("reviewer").value.trim()){ $("status").textContent="Enter your reviewer ID before submitting the draft.";return; }if(!await confirm("Submit complete draft for approval","Create a text-free draft of these deliberate decisions for separate final approval in chat. This does not modify the canonical review, exclude rows, freeze the split or train."))return;try{const result=await api("/api/validation/submit",{reviewer_id:$("reviewer").value.trim(),submit_draft_confirmed:true});data=result.view;$("status").textContent=`${result.message} Draft: ${result.draft_file}`;render();}catch(e){$("status").textContent=e.message;}};
api("/api/validation").then(value=>{data=value;$("status").textContent="Loaded all 45 decisions. No choices or confirmations were inferred. Draft choices live in server memory until submitted; a server restart clears them.";render();}).catch(e=>$("status").textContent=e.message);
