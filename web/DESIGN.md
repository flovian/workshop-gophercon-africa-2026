# Design: Night Safari

The home page is a night field log: warm light on a dark savannah, one big
banner, the numbers, then a wall of photographs, a map and a footer. GBIF data is
untrusted and patchy, so every empty state stays.

## Feel

Cinematic and quiet, like a game drive after sunset: charcoal ground, gold light,
the occasional ember. Nothing shouts except the headline.

## Colours

Held as custom properties on `:root` in `web/assets/css/app.css`.

| Token | Hex | Use |
|-------|-----|-----|
| `--ink` | `#12100E` | Page ground |
| `--ink-2` | `#1A1712` | Raised panels, cards |
| `--ink-3` | `#241F17` | Deeper wells |
| `--line` | `#3A3226` | Borders and rules |
| `--gold` | `#D4A017` | Primary accent, figures, focus |
| `--gold-soft` | `#E8C25A` | Links, hover |
| `--ember` | `#E2703A` | Hot accent, the globe's points |
| `--acacia` | `#2E5B3E` | Secondary, the rule gradient |
| `--cream` | `#F5EBD8` | Headings and body text |
| `--sand` | `#C9BBA1` | Secondary text |
| `--sand-dim` | `#8C8069` | Muted text, labels |

## Lettering

- Display: **Fraunces** (variable optical serif), for headings and figures.
- Text: **Inter**, for everything else.
- Both load from Google Fonts; the stacks fall back to Georgia and the system UI.

## Shape and motion

- Cards and panels: `--radius` `16px`; chips and buttons are pills.
- Soft drop shadows, a 4–6px lift and a slow image zoom on hover.
- Reveal on sections, not on every tile: `reveal.css` with an IntersectionObserver.
- Everything yields to `prefers-reduced-motion`, including the globe.

## The pieces

- **Hero** (`web/views/pages/home.templ`): headline figures from
  `sighting.Summarise` over a 3D globe (`three_scene.templ`, `scenes/globe.js`).
- **Numbers**: six tiles, a per-year sparkline and bars for the top species and
  countries (`charts.templ`).
- **Field log**: a filter of chips and a search box (`filter.templ`, `filter.js`)
  over the photo wall of `SightingCard` tiles (`sighting_card.templ`).
- **Map**: dark Leaflet with clustered markers (`map.templ`, `map.js`).
- **Weather**: the WMO sky, temperature and wind on every card (`weather.templ`).

## To avoid

- No light theme: the site is dark by design (`color-scheme: dark`).
- No stock photography of our own; the only images are GBIF's.
- No inline styles built from GBIF text. The one inline style is a chart's `--bar`
  percentage, worked out in Go.
