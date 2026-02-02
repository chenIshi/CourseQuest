# CourseQuest
A lightweight framework for interactive, branching classroom activities built with Twine (SugarCube 2) and hosted on GitHub Pages.

## Quick start (Tweego v1, recommended)
Prerequisite: install Tweego and ensure the `tweego` command is available in your terminal.
1) Install Tweego locally (one-time setup).
2) Edit `content.csv` in Excel/Google Sheets.
3) Run the CSV → Twee converter:
   - `python3 tools/csv_to_twee.py`
4) Build the HTML with Tweego:
   - `tweego -f sugarcube-2 -o index.html twee`
5) Commit `index.html` to the repo root and enable GitHub Pages (branch `main`, root).

## Tweego dependency
Tweego is required to compile `.twee` into `index.html`.
- Install Tweego from its official releases (one-time setup).
- Verify it is on your PATH:
  - `tweego -v`

## Quick start (Twine GUI alternative)
1) Open Twine 2 and create a new story.
2) Set the story format to **SugarCube 2**.
3) Paste these files into Twine:
   - Story JavaScript: `twine/StoryJavaScript.js`
   - Story Stylesheet: `twine/StoryStylesheet.css`
   - Passages: create passages listed in `twine/Passages.md`
4) Open `content.csv` and copy the CSV into the `ContentCSV` passage.
5) Click **Build → Publish to File** in Twine, then rename the exported file to `index.html`.
6) Commit `index.html` to the repo root and enable GitHub Pages (branch `main`, root).

## CSV authoring format
The CSV is designed to be edited in Excel/Google Sheets. Use the first row as headers:

```
id,prompt,placeholder,answers,regex,onSuccess,nextId
```

- `id`: unique gate ID
- `prompt`: HTML or plain text prompt (Chinese supported)
- `placeholder`: placeholder text for the input box
- `answers`: accepted answers, separated by `|`
- `regex`: optional regex patterns, separated by `|`
- `onSuccess`: message shown after a correct answer
- `nextId`: the next gate ID (empty means end)

Example row:
```
G1,"第一關：三星堆最早於哪一年被發現？","輸入年份（例如 1929）","1929",,"太棒了！進入下一關。",G2
```

## Answer checking rules (v1)
- Trims whitespace, collapses multiple spaces, lowercases Latin letters.
- Converts full-width to half-width letters/numbers.
- Strict match for numeric answers.
- Optional regex matches if provided.

## Notes for non-technical editors
- Only edit `content.csv`.
- Run `python3 tools/csv_to_twee.py` before building (Tweego path).
- No JSON required.

## Deploy to GitHub Pages
1) Export from Twine and rename the file to `index.html`.
2) Commit `index.html` to repo root.
3) GitHub → Settings → Pages → Deploy from branch `main` (root).
4) Share the Pages URL or a QR code with students.
