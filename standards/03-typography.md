# Typography

Type emphasizes reading hierarchy. Content interfaces use a clear sans-serif. Display headings may use a Song (serif) typeface for a bronze-and-stone texture. Code stays monospaced. All fonts have local fallbacks and do not depend on external font services. Font size tokens use rem; px values in the table assume a browser root font size of 16 px and scale with user settings.

## Font roles

| Token | Preferred font stack | Purpose |
| --- | --- | --- |
| --xu-font-sans | Avenir Next / Noto Sans CJK SC | Interface and body text |
| --xu-font-display | Iowan Old Style / Songti SC | Display headings; avoid in dense controls |
| --xu-font-mono | JetBrains Mono / SFMono-Regular | Tokens, code, technical identifiers |

When a font is missing, the operating system chooses a fallback font, so screenshots are not a pixel-exact baseline across systems. Applications must not use a font's fixed width as the width of a text container.

## Font size and line height

| Level | Token | Line height | Purpose |
| --- | --- | --- | --- |
| Caption | text-xs / 12 px | 1.65 | Short metadata; not for long text |
| Control | text-sm / 14 px | 1.65 | Buttons and navigation |
| Body | text-md / 16 px | 1.65 | Standard body text and form descriptions |
| Subheading | text-lg / 20 px | 1.3 | Content groups |
| Section | text-xl / 28 px | 1.15 | Page sections |
| Page title | text-2xl / 40 px | 1.15 | Main page title |

The showcase cover may use fluid display sizes; they must shrink on narrow screens. Keep long Chinese text to about 38–44 Chinese characters per line, and avoid spanning ultra-wide screens.

## Mixed text and code

- Keep a space between Chinese and English text or numbers, as illustrated in the Chinese edition of this standard.
- Chinese sentences use full-width punctuation. Paths, commands and identifiers stay as-is.
- Code blocks may scroll horizontally, and body text may wrap. Do not use truncation in place of an error description.
- Prefer tabular (monospaced) digits for number comparisons, and right-align quantities in tables.
- XU's # import prefix must not be colored as a comment. Code examples in this library use HTML and CSS and do not claim to provide a complete XU syntax highlighter.

## Acceptance

With browser zoom at 200%, headings, labels and buttons do not overlap or obscure each other. Body text stays readable with custom line height. Primary actions remain visible when fonts fail to load. Do not draw descriptive text into images.

Tool and resource pages use an explicit resource name as the title, and avoid repeated marketing slogans and eyebrow headings. Component controls use the sans-serif font. The monospaced font is only for code, resource identifiers and actual parameters.
