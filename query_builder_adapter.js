import { OPERATORS, SPECIAL_FIELDS, TYPE_VALUES, UNITS } from "./query_builder_data.js";

export function buildCondition({
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

export function formatQuery(conditions) {
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

export function normalizeOperator(operator) {
  if (operator === "NOT") {
    return "NOT";
  }
  return operator || "AND";
}

export function getOperatorOptions() {
  const specials = Object.keys(SPECIAL_FIELDS).map((key) => `Special: ${key}`);
  return [...OPERATORS, ...specials];
}

export function getDefaultOperator() {
  return OPERATORS[0];
}

export function isSpecialOperator(operator) {
  return operator.startsWith("Special:");
}

export function isRangeOperator(operator) {
  return operator === "range";
}

export function isTypeField(field) {
  return field === "type";
}

export function getTypeValues() {
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
