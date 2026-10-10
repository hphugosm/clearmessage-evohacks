"use strict";
const $ = (id) => document.getElementById(id);
let data, initialPending;
let busy = false;
const staged = new Map(), selected = new Set(), reviewed = new Set(), bulkIds = new Set();
let bulkConfirmed = false, exclusionsConfirmed = false;
const names = {accept: "Accept original label", ham: "Change to HAM", spam: "Change to SPAM", smishing: "Change to SMISHING", propose_exclusion: "Propose exclusion", unsure: "Unsure"};
const states = {approved: "Approved as labeled", corrected: "Correction requested", pending: "Pending", unsure: "Unsure · still pending", proposed_exclusion: "Exclusion proposed", exclusion_approved: "Exclusion approved · reconciliation needed"};
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function effective(row) {
  const change = staged.get(row.row_id);
  if (!change) return row;
  const target = change.action === "accept" ? row.source_label : change.action;
  let state = target === row.source_label ? "approved" : "corrected";
  if (change.action === "unsure") state = "unsure";
  if (change.action === "propose_exclusion") state = "proposed_exclusion";
  if (change.action === "approve_exclusion") state = "exclusion_approved";
  return {...row, state, requested_label: ["ham", "spam", "smishing"].includes(target) ? target : null};
}
function isPending(row) { return ["pending", "unsure"].includes(effective(row).state); }
function problematic(row) {
  const item = effective(row);
  return (item.state.includes("exclusion") ? 8 : 0) + (item.state === "unsure" ? 4 : 0) +
    (row.suggested_label && row.suggested_label !== row.source_label ? 2 : 0) + (item.state === "corrected" ? 1 : 0);
}
function visibleRows() {
  return data.records.filter(row => {
    if ($("label").value !== "all" && row.source_label !== $("label").value) return false;
    const scope = $("scope").value;
    return scope === "all" || (scope === "initial-pending" && initialPending.has(row.row_id)) ||
      (scope === "pending" && isPending(row)) || (scope === "disagreements" && row.suggested_label && row.suggested_label !== row.source_label) ||
      (scope === "exclusions" && effective(row).state.includes("exclusion"));
  }).sort((a, b) => {
    if ($("group").checked && a.source_label !== b.source_label) return a.source_label.localeCompare(b.source_label);
    return ($("sort").value === "problematic" ? problematic(b) - problematic(a) : 0) || a.row_id.localeCompare(b.row_id);
  });
}
function updateControls() {
  $("save").disabled = busy || !staged.size;
  $("apply").disabled = busy || !selected.size;
  $("bulk").disabled = busy || !data.records.some(row => reviewed.has(row.row_id) && isPending(row));
  $("exclusions").disabled = busy || !data.records.some(row => selected.has(row.row_id) && row.state === "proposed_exclusion" && !staged.has(row.row_id));
  $("selection").textContent = `${selected.size} selected · ${staged.size} unsaved changes`;
}
function render() {
  const counts = {total: data.records.length, approved: 0, corrected: 0, pending: 0, proposed_exclusions: 0, approved_exclusions: 0};
  for (const item of data.records.map(effective)) {
    const key = {approved: "approved", corrected: "corrected", pending: "pending", unsure: "pending", proposed_exclusion: "proposed_exclusions", exclusion_approved: "approved_exclusions"}[item.state];
    counts[key]++;
  }
  $("counters").replaceChildren();
  for (const [key, title] of Object.entries({total: "Total entries", approved: "Approved", corrected: "Corrected", pending: "Pending", proposed_exclusions: "Proposed exclusions", approved_exclusions: "Approved exclusions"})) {
    const box = node("div", undefined, "counter"); box.append(node("strong", counts[key]), node("span", title)); $("counters").append(box);
  }
  const visible = visibleRows();
  $("visible").textContent = `${visible.length} entries shown · ${initialPending.size} pending at page load. Counters include unsaved decisions.`;
  $("rows").replaceChildren();
  let group;
  for (const row of visible) {
    if ($("group").checked && group !== row.source_label) {
      group = row.source_label;
      const tr = node("tr", undefined, "group-row"), th = node("th", group.toUpperCase()); th.colSpan = 6; $("rows").append(tr); tr.append(th);
    }
    const value = effective(row), tr = node("tr"); tr.dataset.rowId = row.row_id;
    if (row.suggested_label && row.suggested_label !== row.source_label) tr.classList.add("disagreement");
    if (staged.has(row.row_id)) tr.classList.add("changed");
    const selectCell = node("td"), check = node("input"); check.type = "checkbox"; check.checked = selected.has(row.row_id); check.setAttribute("aria-label", `Select ${row.row_id}`);
    check.addEventListener("change", () => { check.checked ? selected.add(row.row_id) : selected.delete(row.row_id); updateControls(); }); selectCell.append(check);
    const message = node("td"), details = node("details");
    // textContent is the only message-rendering sink. Never create anchors or HTML.
    const preview = row.text.length > 150 ? `${row.text.slice(0, 150)}…` : row.text;
    details.append(node("summary", preview || "Empty message"), node("div", row.text, "full-message")); message.append(details);
    const suggestion = node("td", row.suggested_label ? row.suggested_label.toUpperCase() : "Unavailable");
    if (row.suggested_label && row.suggested_label !== row.source_label) suggestion.append(node("div", "Disagrees with source label"));
    const decision = node("td");
    decision.append(node("div", states[value.state] + (value.state === "corrected" ? ` → ${value.requested_label.toUpperCase()}` : ""), "decision-state"));
    const buttons = node("div", undefined, "decision-buttons");
    for (const [action, title] of Object.entries(names)) {
      const button = node("button", action === "accept" ? "Accept original" : action === "propose_exclusion" ? "Exclude?" : action === "unsure" ? title : action.toUpperCase());
      button.title = title; button.setAttribute("aria-label", `${title}: ${row.row_id}`); button.disabled = busy;
      button.addEventListener("click", () => choose([row.row_id], action)); buttons.append(button);
    }
    decision.append(buttons);
    const options = node("div", undefined, "row-options"), reviewLabel = node("label", undefined, "check"), reviewCheck = node("input");
    reviewCheck.type = "checkbox"; reviewCheck.checked = reviewed.has(row.row_id); reviewCheck.setAttribute("aria-label", `Reviewed ${row.row_id}`);
    reviewCheck.addEventListener("change", () => {
      reviewCheck.checked ? reviewed.add(row.row_id) : reviewed.delete(row.row_id);
      if (!reviewCheck.checked && bulkIds.has(row.row_id)) { bulkIds.delete(row.row_id); staged.delete(row.row_id); render(); }
      updateControls();
    });
    reviewLabel.append(reviewCheck, node("span", "Reviewed")); options.append(reviewLabel);
    const langLabel = node("label", "Language"), lang = node("select"); lang.setAttribute("aria-label", `Language ${row.row_id}`);
    for (const [key, title] of Object.entries({pending: "Unconfirmed", en: "English", cs: "Czech", other: "Other", und: "Undetermined"})) {
      const option = node("option", title); option.value = key; lang.append(option);
    }
    lang.value = staged.get(row.row_id)?.language ?? row.language;
    lang.addEventListener("change", () => {
      const change = staged.get(row.row_id);
      if (!change) { lang.value = row.language; $("status").textContent = "Choose an explicit human decision before confirming language for this row."; return; }
      change.language = lang.value;
    }); langLabel.append(lang); options.append(langLabel); decision.append(options);
    if (row.notes) { const notes = node("details"); notes.append(node("summary", "Existing review notes"), node("div", row.notes, "full-message")); decision.append(notes); }
    tr.append(selectCell, node("td", row.row_id), message, node("td", row.source_label.toUpperCase(), "badge"), suggestion, decision); $("rows").append(tr);
  }
  $("select-visible").checked = visible.length > 0 && visible.every(row => selected.has(row.row_id));
  updateControls();
}
function confirmation(title, description, reasonNeeded = false) {
  return new Promise(resolve => {
    $("confirm-title").textContent = title; $("confirm-description").textContent = description;
    $("reason-wrap").hidden = !reasonNeeded; $("reason").value = ""; $("reason").setCustomValidity("");
    $("accept-confirm").textContent = title.startsWith("Approve exclusion") ? "Approve exclusions explicitly" : "Confirm reviewed decisions";
    const dialog = $("confirm"); let finished = false;
    const finish = result => { if (finished) return; finished = true; dialog.close(); resolve(result); };
    $("accept-confirm").onclick = () => {
      if (reasonNeeded && !$("reason").value.trim()) { $("reason").setCustomValidity("Enter a reason for exclusion."); $("reason").reportValidity(); return; }
      finish({reason: $("reason").value.trim()});
    };
    $("reason").oninput = () => $("reason").setCustomValidity("");
    $("cancel-confirm").onclick = () => finish(null);
    dialog.oncancel = event => { event.preventDefault(); finish(null); };
    dialog.showModal(); $("cancel-confirm").focus();
  });
}
async function choose(ids, action, bulk = false) {
  if (busy || !ids.length) return;
  let answer = {reason: ""};
  if (bulk || ids.length > 1 || action === "propose_exclusion") {
    answer = await confirmation(bulk ? "Approve reviewed original labels" : `Apply ${names[action]} to ${ids.length} entries`,
      `${ids.length} entries: ${ids.join(", ")}. ${action === "accept" ? "Confirm that you personally reviewed these messages and accept their original labels." : "Confirm this human decision for the listed entries."} Decisions will be staged; Save writes the file.`, action === "propose_exclusion");
    if (!answer) return;
  }
  for (const id of ids) {
    const previous = staged.get(id);
    staged.set(id, {row_id: id, action, reason: answer.reason, ...(previous?.language ? {language: previous.language} : {})});
    bulkIds.delete(id);
    if (action === "accept" && (bulk || ids.length > 1)) reviewed.add(id);
    if (bulk) { bulkIds.add(id); bulkConfirmed = true; }
  }
  $("status").textContent = `${ids.length} human decision(s) staged. Click Save decisions to write a backup and update the review file.`;
  render();
}
async function api(path, options) {
  const response = await fetch(path, {cache: "no-store", ...options});
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || "local_request_failed");
  return value;
}
$("save").addEventListener("click", async () => {
  if (busy || !staged.size) return;
  if (!$("reviewer").value.trim() || !$("date").value) { $("status").textContent = "Enter your reviewer ID and review date before saving."; $("reviewer").focus(); return; }
  busy = true; render();
  try {
    const result = await api("/api/save", {method: "POST", headers: {"Content-Type": "application/json", "X-Review-Token": data.csrf_token}, body: JSON.stringify({
      revision: data.revision, reviewer_id: $("reviewer").value.trim(), reviewed_date: $("date").value,
      changes: [...staged.values()], reviewed_ids: [...reviewed], bulk_ids: [...bulkIds], bulk_confirmed: bulkConfirmed, exclusions_confirmed: exclusionsConfirmed
    })});
    data = result.view; staged.clear(); bulkIds.clear(); bulkConfirmed = false; exclusionsConfirmed = false;
    $("status").textContent = `Saved. Backup: ${result.backup_file}`;
    showReport(result.report);
  } catch (error) { $("status").textContent = `Save did not complete: ${error.message}. Your staged decisions remain. For a file conflict, reload only after noting your staged decisions.`; }
  finally { busy = false; render(); }
});
function showReport(report) {
  $("validation").hidden = false;
  $("report-summary").textContent = `${report.counters.pending} pending or unsure; ${report.counters.proposed_exclusions} exclusions awaiting separate approval; ${report.counters.corrected} corrections requested. ${report.missing_language_ids.length} languages and ${report.missing_attribution_ids.length} reviewer attributions remain incomplete. Goal 01 is not finalized.`;
  $("report-limits").textContent = report.limitations;
  $("report-details").textContent = JSON.stringify(report, null, 2);
}
$("report").addEventListener("click", async () => { try { showReport(await api("/api/report")); $("validation").scrollIntoView({block: "start"}); } catch (error) { $("status").textContent = `Report unavailable: ${error.message}`; } });
for (const id of ["label", "scope", "sort", "group"]) $(id).addEventListener("change", () => data && render());
$("select-visible").addEventListener("change", event => { for (const row of visibleRows()) event.target.checked ? selected.add(row.row_id) : selected.delete(row.row_id); render(); });
$("apply").addEventListener("click", () => choose([...selected], $("batch").value));
$("bulk").addEventListener("click", () => choose(data.records.filter(row => reviewed.has(row.row_id) && isPending(row)).map(row => row.row_id), "accept", true));
$("exclusions").addEventListener("click", async () => {
  const ids = data.records.filter(row => selected.has(row.row_id) && row.state === "proposed_exclusion" && !staged.has(row.row_id)).map(row => row.row_id);
  if (!ids.length || busy) return;
  const answer = await confirmation("Approve exclusion proposals separately", `${ids.length} saved proposals: ${ids.join(", ")}. This records your explicit approval of these exclusions. It does not remove dataset rows or approve the existing dataset conflict exclusions.`);
  if (!answer) return;
  for (const id of ids) staged.set(id, {row_id: id, action: "approve_exclusion"});
  exclusionsConfirmed = true; $("status").textContent = "Exclusion approvals staged. Save decisions to record them."; render();
});
const dateParts = Object.fromEntries(new Intl.DateTimeFormat("en", {timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date()).map(p => [p.type, p.value]));
$("date").value = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
api("/api/review").then(value => {
  data = value; initialPending = new Set(data.records.filter(row => ["pending", "unsure"].includes(row.state)).map(row => row.row_id));
  $("suggestion-status").textContent = data.suggestion_status; $("file").textContent = `Review file: ${data.review_file}`;
  $("status").textContent = "Loaded. No decisions changed. Expand a message to read its full text."; render();
}).catch(error => { $("status").textContent = `Local records could not load: ${error.message}`; });
