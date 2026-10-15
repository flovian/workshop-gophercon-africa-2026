# block: tracks

Follow one animal across the map: its sightings are joined in the order they
happened, a tracer walks the line, and the caption reports how far it was seen
to travel. Data-driven, so it needs the server to supply the routes.

## Files

- `tracks.css` — the picker, the map frame and the caption. Uses the site's
  own tokens (`--gold`, `--gold-soft`, `--ember`, `--ink`, `--line`).
- `tracks.js` — reads `#track-data`, draws the chosen route on its own Leaflet
  map, and animates a tracer along it. Needs Leaflet on the page already.

## Server side

Supply a JSON array on `<script id="track-data" type="application/json">`,
one object per animal:

```json
{ "animal": "blue whale",
  "points": [ { "lat": -74.4, "lng": -174.6, "date": "24 Feb 1948",
                "place": "Antarctica", "anchor": "sighting-<uuid>" } ] }
```

Mark the map element `data-track-map`, the buttons `.tracks__pick` (with
`data-track` set to the index), and the caption `[data-track-caption]`.
Buttons carry `aria-pressed`; the first route is drawn on load.

## Notes

- Points are drawn straight between records: the line is the order of the
  sightings, not a path the animal actually walked. Say so in the copy.
- The caption's distance is the great-circle sum between the points, which
  meaningfully understates a wandering animal. Keep it honest.
- Respects `prefers-reduced-motion`: the tracer is skipped, the route stays.
