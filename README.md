# ErsatzTV Query Builder (Web, English)

## Overview
This is a standalone, English-language ErsatzTV Query Builder web app. It helps build Lucene-like query strings for ErsatzTV search.

## Requirements
- A modern web browser.
- (Optional) A simple local web server to avoid `file://` restrictions.

## Run locally
- Open `index.html` in your browser.
- If options do not load, serve the folder with a local web server and open the page via `http://`.

## Folder structure
```
webapps/ersatztv-query-builder-en/
├── app.js
├── index.html
├── query_builder_adapter.js
├── query_builder_data.js
├── styles.css
└── version.js
```

## Notes
- The query-building logic is based on the existing Query Builder implementation, but the original files in this repository remain unchanged.

## Troubleshooting
- **Dropdowns are empty:** Some browsers block local file access. Use a local web server and open the page via `http://`.
