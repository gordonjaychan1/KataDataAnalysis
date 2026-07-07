# Athlete headshots

Drop athlete photos here and they'll appear on each athlete card, in the square
to the right of the Differential stat box. No code changes needed.

## Filename convention

`<slug>.jpg`, where the slug is the athlete's name (exactly as it appears in the
data CSVs), lowercased, with accents stripped and every run of non-alphanumeric
characters collapsed to a single hyphen.

Examples:

| Athlete name             | Filename                          |
| ------------------------ | --------------------------------- |
| `Alexandra Feracci`      | `alexandra-feracci.jpg`           |
| `Ortiz Aquino Jefferson` | `ortiz-aquino-jefferson.jpg`      |
| `Aya En-Nesyry`          | `aya-en-nesyry.jpg`               |

The slug logic lives in `photoSlug()` in `other/app.js`.

## Notes

- Must be `.jpg` (lowercase extension). GitHub Pages is case-sensitive.
- If no file matches an athlete, the card leaves that square empty — nothing breaks.
- Roughly square crops look best (the image is centered and cropped to fill).
- Keep files small (a few hundred KB); these are tiny thumbnails on the card.
