# ErsatzTV Query Builder Roadmap

This roadmap focuses on improving query correctness and usability while keeping the project a static, client-only web app.

## P0 — Now (highest feasibility / lowest effort)

### 1) Special date operators: correct singular/plural units and value formatting
- **User value:** Produces queries that match the official docs, reducing confusion and copy/paste edits.
- **Proposed change:** When the special date number is `1`, use singular units (day/week/month/year) and keep the value formatting consistent with the docs.
- **Implementation notes (static-only):** Update client-side query construction only; no API calls required.
- **Acceptance criteria:**
  - Special date operators output `"1 day"`, `"1 week"`, `"1 month"`, or `"1 year"` when the number is `1`.
  - Special date operators output plural units for any other number.
  - Existing operators continue to work unchanged.

### 2) Auto-apply media type from dropdown
- **User value:** Prevents missing `type:movie` / `type:episode` clauses and makes the output more accurate.
- **Proposed change:** When a media type is selected, inject or append the matching `type:<value>` clause to the query.
- **Implementation notes (static-only):** Update the client-side query builder; no server state required.
- **Acceptance criteria:**
  - Selecting “Movie” results in a query that includes `type:movie`.
  - Changing media type updates the `type:` clause accordingly.
  - Users can still add other fields without conflicts.

### 3) Numeric fields: add comparison operators (> < >= <=)
- **User value:** Makes numeric filtering (e.g., minutes, seconds, height) possible without ranges.
- **Proposed change:** Add operators for greater-than/less-than and equality variants on numeric fields.
- **Implementation notes (static-only):** Extend operator list and query formatting logic in the UI.
- **Acceptance criteria:**
  - Numeric fields show operators `>`, `<`, `>=`, `<=` in the operator dropdown.
  - Generated queries match the selected comparison operator.
  - Range operator still works as before.

## P1 — Next (medium feasibility)

### 4) Multi-value OR input for genre/language/tag-style fields
- **User value:** Lets users build queries like `(genre:Action OR genre:Comedy)` without manual syntax.
- **Proposed change:** Allow comma-separated (or multi-select) values for designated fields and build an OR group.
- **Implementation notes (static-only):** Parse input client-side and generate grouped clauses.
- **Acceptance criteria:**
  - Inputting `Action, Comedy` for `genre` produces `(genre:Action OR genre:Comedy)`.
  - Single values still produce a single clause.
  - Empty or invalid entries are ignored with a clear UI message.

### 5) Time input UX improvements (validation + pluralization hints)
- **User value:** Reduces mistakes when entering special date values (e.g., “1 week” vs “2 weeks”).
- **Proposed change:** Add lightweight validation and helper text for units; auto-adjust pluralization in preview.
- **Implementation notes (static-only):** UI-only logic; no external libraries required.
- **Acceptance criteria:**
  - Invalid numeric input shows a clear inline warning.
  - The preview shows the correct singular/plural unit.
  - Users can still enter values quickly without extra clicks.

### 6) Visual grouping aids for nested parentheses
- **User value:** Makes complex boolean logic easier to understand and reduces query errors.
- **Proposed change:** Add subtle UI cues (indentation, chips, or highlights) for nested groups.
- **Implementation notes (static-only):** Pure CSS/HTML updates; no drag-and-drop required.
- **Acceptance criteria:**
  - Nested groups are visually distinguishable from parent groups.
  - The rendered query output is unchanged.
  - The UI remains accessible (contrast and focus states).

## P2 — Later (lower feasibility / higher effort)

### 7) Syntax validation and static preview
- **User value:** Catches mistakes early and builds confidence before copy/pasting queries.
- **Proposed change:** Add client-side validation and a preview panel with basic syntax checks (no API).
- **Implementation notes (static-only):** Use deterministic parsing/validation in the browser; do not call ErsatzTV APIs.
- **Acceptance criteria:**
  - Invalid constructs are highlighted in the UI.
  - The preview is generated entirely client-side.
  - No network requests are required for validation.

### 8) Optional: fuzzy vs exact search toggles
- **User value:** Gives advanced users control over matching behavior without manual Lucene syntax.
- **Proposed change:** Add an optional toggle that appends `~` (fuzzy) or wraps quotes for exact matches.
- **Implementation notes (static-only):** UI toggle only; no external dependencies.
- **Acceptance criteria:**
  - Users can enable/disable fuzzy matching per condition.
  - Exact mode produces quoted terms where appropriate.
  - Default behavior remains unchanged.

### 9) Optional: custom metadata fields
- **User value:** Allows power users to query custom ErsatzTV metadata keys.
- **Proposed change:** Provide a freeform field input for advanced metadata keys.
- **Implementation notes (static-only):** Add a text field for custom keys and validate client-side.
- **Acceptance criteria:**
  - Users can enter a custom field name and build a query clause.
  - Invalid field names show a clear warning.
  - No backend calls are introduced.

## Non-goals / Guardrails
- No backend services or server-side rendering.
- No mandatory ErsatzTV API integration (preview/validation stays client-only).
- No complex drag-and-drop or visual query builder editor unless explicitly deferred to a later phase.
- No heavy new dependencies unless absolutely necessary.
