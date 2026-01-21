// NOTE: This app is bundled into a single script to avoid file:// ES module import failures.
const MEDIA_FIELDS = {
  Movie: [
    "title",
    "genre",
    "tag",
    "tag_full",
    "collection",
    "plot",
    "studio",
    "actor",
    "director",
    "writer",
    "library_name",
    "content_rating",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "release_date",
    "added_date",
    "chapters",
    "minutes",
    "seconds",
    "height",
    "width",
    "video_codec",
    "video_bit_depth",
    "video_dynamic_range",
    "type",
  ],
  Show: [
    "title",
    "genre",
    "tag",
    "tag_full",
    "collection",
    "plot",
    "studio",
    "network",
    "actor",
    "library_name",
    "content_rating",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "release_date",
    "added_date",
    "type",
  ],
  Season: [
    "title",
    "tag",
    "tag_full",
    "collection",
    "library_name",
    "season_number",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "show_title",
    "show_genre",
    "show_studio",
    "show_content_rating",
    "show_tag",
    "type",
  ],
  Episode: [
    "title",
    "plot",
    "director",
    "writer",
    "tag",
    "tag_full",
    "collection",
    "library_name",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "release_date",
    "added_date",
    "chapters",
    "minutes",
    "seconds",
    "height",
    "width",
    "season_number",
    "episode_number",
    "show_title",
    "show_genre",
    "show_studio",
    "show_network",
    "show_content_rating",
    "show_tag",
    "video_codec",
    "video_bit_depth",
    "video_dynamic_range",
    "type",
  ],
  Artist: [
    "title",
    "genre",
    "style",
    "mood",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "collection",
    "added_date",
    "library_name",
    "type",
  ],
  "Music Video": [
    "title",
    "artist",
    "album",
    "genre",
    "tag",
    "tag_full",
    "collection",
    "library_name",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "release_date",
    "added_date",
    "chapters",
    "minutes",
    "seconds",
    "height",
    "width",
    "video_codec",
    "video_bit_depth",
    "video_dynamic_range",
    "type",
  ],
  "Other Video": [
    "title",
    "genre",
    "tag",
    "tag_full",
    "collection",
    "plot",
    "studio",
    "actor",
    "director",
    "writer",
    "library_name",
    "content_rating",
    "language",
    "language_tag",
    "sub_language",
    "sub_language_tag",
    "release_date",
    "added_date",
    "chapters",
    "minutes",
    "seconds",
    "height",
    "width",
    "video_codec",
    "video_bit_depth",
    "video_dynamic_range",
    "type",
  ],
  Song: [
    "title",
    "album",
    "artist",
    "album_artist",
    "genre",
    "tag",
    "tag_full",
    "collection",
    "library_name",
    "minutes",
    "seconds",
    "added_date",
    "type",
  ],
  Image: [
    "title",
    "genre",
    "tag",
    "tag_full",
    "collection",
    "library_name",
    "added_date",
    "type",
  ],
};

const SPECIAL_FIELDS = {
  released_inthelast: "Released in the last X (days/weeks/months/years)",
  released_notinthelast: "Not released in the last X (days/weeks/months/years)",
  released_onthisday: "Released on this day (X years)",
  added_inthelast: "Added in the last X (days/weeks/months/years)",
  added_notinthelast: "Not added in the last X (days/weeks/months/years)",
};

const UNITS = ["days", "weeks", "months", "years"];

const OPERATORS = ["=", "contains", "starts with", "ends with", "range"];

const TYPE_VALUES = [
  "movie",
  "show",
  "season",
  "episode",
  "artist",
  "music_video",
  "other_video",
  "song",
  "image",
];

function buildCondition({
  field,
  operator,
  value,
  rangeMin,
  rangeMax,
  specialNumber,
  specialUnit,
}) {
  if (!operator) {
    return { error: "Please select an operator." };
  }

  if (operator.startsWith("Special:")) {
    const fieldName = operator.replace("Special:", "").trim();
    if (!specialNumber) {
      return { error: "Please enter a number for the special field." };
    }
    const unit = specialUnit || UNITS[0];
    return { clause: `${fieldName}:${formatValue(`${specialNumber} ${unit}`)}` };
  }

  if (!field) {
    return { error: "Please select a field." };
  }

  if (operator === "range") {
    if (!rangeMin || !rangeMax) {
      return { error: "Please enter both a minimum and a maximum value." };
    }
    return { clause: `${field}:[${rangeMin} TO ${rangeMax}]` };
  }

  if (!value) {
    return { error: "Please enter a value." };
  }

  if (operator === "=") {
    return { clause: `${field}:${formatValue(value)}` };
  }
  if (operator === "contains") {
    return { clause: `${field}:${applyWildcards(value, "*", "*")}` };
  }
  if (operator === "starts with") {
    return { clause: `${field}:${applyWildcards(value, "", "*")}` };
  }
  if (operator === "ends with") {
    return { clause: `${field}:${applyWildcards(value, "*", "")}` };
  }

  return { clause: `${field}:${formatValue(value)}` };
}

function formatQuery(conditions) {
  if (!conditions.length) {
    return "";
  }

  const segments = [];
  for (const { operator, clause } of conditions) {
    if (segments.length && operator === "OR") {
      segments[segments.length - 1].clauses.push(clause);
    } else {
      segments.push({ operator, clauses: [clause] });
    }
  }

  const parts = [];
  for (const segment of segments) {
    if (segment.operator) {
      parts.push(segment.operator);
    }
    if (segment.clauses.length > 1) {
      parts.push(`(${segment.clauses.join(" OR ")})`);
    } else {
      parts.push(segment.clauses[0]);
    }
  }

  return parts.join(" ");
}

function normalizeOperator(operator) {
  if (operator === "NOT") {
    return "NOT";
  }
  return operator || "AND";
}

function getOperatorOptions() {
  const specials = Object.keys(SPECIAL_FIELDS).map((key) => `Special: ${key}`);
  return [...OPERATORS, ...specials];
}

function getDefaultOperator() {
  return OPERATORS[0];
}

function isSpecialOperator(operator) {
  return operator.startsWith("Special:");
}

function isRangeOperator(operator) {
  return operator === "range";
}

function isTypeField(field) {
  return field === "type";
}

function getTypeValues() {
  return TYPE_VALUES;
}

function formatValue(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (trimmed.includes(" ") && !(trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return `"${trimmed}"`;
  }
  return trimmed;
}

function applyWildcards(value, prefix, suffix) {
  return `${prefix}${formatValue(value)}${suffix}`;
}

const state = {
  conditions: [],
};

const elements = {
  mediaType: document.querySelector("#media-type"),
  field: document.querySelector("#field"),
  operator: document.querySelector("#operator"),
  logic: document.querySelector("#logic"),
  valueText: document.querySelector("#value"),
  valueType: document.querySelector("#value-type"),
  range: document.querySelector("#range"),
  rangeMin: document.querySelector("#range-min"),
  rangeMax: document.querySelector("#range-max"),
  special: document.querySelector("#special"),
  specialNumber: document.querySelector("#special-number"),
  specialUnit: document.querySelector("#special-unit"),
  addCondition: document.querySelector("#add-condition"),
  generate: document.querySelector("#generate"),
  reset: document.querySelector("#reset"),
  copy: document.querySelector("#copy"),
  queryOutput: document.querySelector("#query"),
  conditionList: document.querySelector("#conditions"),
  hint: document.querySelector("#hint"),
  status: document.querySelector("#status"),
  version: document.querySelector("#app-version"),
};

function init() {
  setVersion();
  if (!ensureDataReady()) {
    return;
  }
  populateMediaTypes();
  populateOperators();
  populateUnits();
  elements.operator.value = getDefaultOperator();
  elements.logic.value = "AND";
  handleMediaTypeChange();
  handleOperatorChange();
  bindEvents();
  renderConditions();
}

function setVersion() {
  if (!elements.version) {
    return;
  }
  const version = window.ERSATZTV_QUERY_BUILDER_VERSION || "0.1";
  elements.version.textContent = `v${version}`;
}

function ensureDataReady() {
  const hasMedia = MEDIA_FIELDS && Object.keys(MEDIA_FIELDS).length > 0;
  const operatorOptions = getOperatorOptions();
  if (!hasMedia || operatorOptions.length === 0) {
    showStatus(
      "Options could not be loaded. Please open the web app through a local web server.",
      "error"
    );
    disableInputs();
    return false;
  }
  hideStatus();
  return true;
}

function disableInputs() {
  [
    elements.mediaType,
    elements.field,
    elements.operator,
    elements.logic,
    elements.valueText,
    elements.valueType,
    elements.rangeMin,
    elements.rangeMax,
    elements.specialNumber,
    elements.specialUnit,
    elements.addCondition,
    elements.generate,
    elements.reset,
    elements.copy,
  ].forEach((element) => {
    if (element) {
      element.disabled = true;
    }
  });
}

function showStatus(message, tone) {
  if (!elements.status) {
    return;
  }
  elements.status.textContent = message;
  elements.status.className = `status ${tone}`.trim();
  elements.status.hidden = false;
}

function hideStatus() {
  if (!elements.status) {
    return;
  }
  elements.status.hidden = true;
}

function setSelectOptions(select, options, emptyLabel) {
  if (!select) {
    return;
  }
  select.innerHTML = "";
  if (!options.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = emptyLabel;
    select.appendChild(option);
    select.disabled = true;
    return;
  }
  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.disabled = false;
}

function populateMediaTypes() {
  const mediaTypes = Object.keys(MEDIA_FIELDS);
  setSelectOptions(elements.mediaType, mediaTypes, "Options could not be loaded");
}

function populateOperators() {
  setSelectOptions(
    elements.operator,
    getOperatorOptions(),
    "Options could not be loaded"
  );
}

function populateUnits() {
  setSelectOptions(elements.specialUnit, UNITS, "No units available");
}

function populateFields() {
  const fields = MEDIA_FIELDS[elements.mediaType.value] || [];
  setSelectOptions(elements.field, fields, "Options could not be loaded");

  if (fields.length) {
    elements.field.value = fields[0];
  }

  handleFieldChange();
}

function handleMediaTypeChange() {
  populateFields();
}

function handleFieldChange() {
  const field = elements.field.value;
  if (isTypeField(field)) {
    elements.valueType.hidden = false;
    elements.valueText.hidden = true;
    populateTypeValues();
  } else {
    elements.valueType.hidden = true;
    elements.valueText.hidden = false;
  }
}

function populateTypeValues() {
  setSelectOptions(elements.valueType, getTypeValues(), "Options could not be loaded");
  elements.valueType.value = getTypeValues()[0];
}

function handleOperatorChange() {
  const operator = elements.operator.value;
  elements.range.hidden = !isRangeOperator(operator);
  elements.special.hidden = !isSpecialOperator(operator);

  if (!elements.range.hidden) {
    elements.valueText.hidden = true;
    elements.valueType.hidden = true;
  } else if (!elements.special.hidden) {
    elements.valueText.hidden = true;
    elements.valueType.hidden = true;
    showSpecialHint(operator);
  } else {
    handleFieldChange();
    hideHint();
  }
}

function showSpecialHint(operator) {
  const key = operator.replace("Special:", "").trim();
  const description = SPECIAL_FIELDS[key];
  elements.hint.textContent = description || "";
  elements.hint.hidden = !description;
}

function hideHint() {
  elements.hint.hidden = true;
  elements.hint.textContent = "";
}

function bindEvents() {
  elements.mediaType.addEventListener("change", handleMediaTypeChange);
  elements.field.addEventListener("change", handleFieldChange);
  elements.operator.addEventListener("change", handleOperatorChange);
  elements.addCondition.addEventListener("click", onAddCondition);
  elements.generate.addEventListener("click", renderQuery);
  elements.reset.addEventListener("click", resetAll);
  elements.copy.addEventListener("click", copyQuery);
}

function onAddCondition() {
  const operator = elements.operator.value;
  const field = elements.field.value;
  const value = elements.valueText.hidden ? elements.valueType.value : elements.valueText.value;

  const { clause, error } = buildCondition({
    field,
    operator,
    value,
    rangeMin: elements.rangeMin.value.trim(),
    rangeMax: elements.rangeMax.value.trim(),
    specialNumber: elements.specialNumber.value.trim(),
    specialUnit: elements.specialUnit.value,
  });

  if (error) {
    window.alert(error);
    return;
  }

  let logic = normalizeOperator(elements.logic.value);
  let finalClause = clause;

  if (!state.conditions.length) {
    logic = null;
    if (elements.logic.value === "NOT") {
      finalClause = `NOT ${finalClause}`;
    }
  }

  state.conditions.push({ operator: logic, clause: finalClause });
  renderConditions();
  renderQuery();
}

function renderConditions() {
  elements.conditionList.innerHTML = "";
  if (!state.conditions.length) {
    const empty = document.createElement("li");
    empty.textContent = "No conditions added yet.";
    empty.classList.add("muted");
    elements.conditionList.appendChild(empty);
    return;
  }

  state.conditions.forEach((condition, index) => {
    const item = document.createElement("li");
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = condition.operator ?? "Start";

    const text = document.createElement("span");
    text.textContent = condition.clause;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "secondary";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeCondition(index));

    item.appendChild(badge);
    item.appendChild(text);
    item.appendChild(removeButton);
    elements.conditionList.appendChild(item);
  });
}

function removeCondition(index) {
  state.conditions.splice(index, 1);
  renderConditions();
  renderQuery();
}

function renderQuery() {
  elements.queryOutput.value = formatQuery(state.conditions);
}

function resetAll() {
  state.conditions = [];
  elements.valueText.value = "";
  elements.rangeMin.value = "";
  elements.rangeMax.value = "";
  elements.specialNumber.value = "";
  elements.logic.value = "AND";
  elements.operator.value = getDefaultOperator();
  hideHint();
  handleOperatorChange();
  renderConditions();
  renderQuery();
}

async function copyQuery() {
  const text = elements.queryOutput.value.trim();
  if (!text) {
    window.alert("There is no query to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    window.alert("The query has been copied to the clipboard.");
  } catch (error) {
    window.alert("Copy failed. Please select and copy manually.");
  }
}

init();
