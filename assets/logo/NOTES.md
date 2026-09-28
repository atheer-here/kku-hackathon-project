# Massari logo mark

`massari-mark.svg`: 64×64 viewBox, three paths.

| Path | Class | Paint | Meaning |
|---|---|---|---|
| Eight-point star (outline) | `star` | stroke `currentColor`, width 4.5 | Khatam / Najdi eight-point star: Saudi and Islamic geometric heritage |
| Rising arc | `route` | stroke `currentColor`, width 6 | The path (مسار), rising from lower left toward the goal |
| Filled circle | `accent` | fill gold (`#B7862B` fallback; theme CSS `.accent { fill: … }` overrides) | The destination. Together with the arc it also reads as a calligraphic meem (م), the first letter of مساري |

All strokes use `stroke-linecap="round"` and `stroke-linejoin="round"`. For canvas, set `ctx.lineCap = ctx.lineJoin = "round"` before drawing `logo-paths.json`.

`logo-paths.json` follows the `logoPaths` contract: `[{ d, role: "stroke"|"fill"|"accent", strokeWidth? }]` in a 64×64 box. Draw each item with `new Path2D(d)`: stroke items get ink colour and `strokeWidth`, and accent items get the gold fill. The file has no `fill` items. The paths, drawn in order, are the star, then the route, then the accent. That order also suits a DrawSVG reveal: draw the star, draw the route, then pop in the accent.

## Source and licence

- Route idea: Lucide `route` icon (lucide-static 1.48.0, ISC licence, Copyright (c) Lucide Contributors). It is a winding path between an origin circle and a destination circle. We kept the "path ending in a destination dot" idea and redrew it: one rising cubic arc, with the origin circle dropped and the destination enlarged into the accent.
- Star: Tabler `jewish-star` / Phosphor `star-four` were checked as star bases. They were not used, because a Star of David or a four-point star is the wrong motif. The eight-point star (two squares at 0° and 45°, outer radius 28, inner radius 21.43) is plain geometry drawn for this mark.
- Also checked and not used: Phosphor `path`, `compass-rose`, `navigation-arrow`, `signpost`, `steps`; Tabler `route-2`, `map-route`, `north-star`; Lucide `waypoints`, `milestone`, `signpost`; Iconoir `path-arrow`, `navigator`. All are MIT/ISC, but none gave a distinctive mark by itself.

## Candidates considered (rendered at 20/48/160 px on sand and night neumorphic badges)

- **A: Star + route.** Eight-point star outline with a Lucide-style zig-zag route inside, running from an ink origin dot to a gold destination. Rejected: the zig-zag reads as a Latin "S" (a superhero or dollar badge), and it clogs at 20 px. Refined into the final mark by replacing the zig-zag with a single rising arc plus a gold head.
- **B: Meem pin.** One thick stroke rising from lower left into a closed loop, with a gold dot in the loop (pin + meem). Rejected: it reads as a magnifier or rattle, and the thin loop breaks up at 20 px.
- **C: Compass rose.** Filled eight-ray compass rose with the north ray in gold. Rejected: it is generic (a stock "navigation" icon), and the rays are spindly at small sizes.
- **Final (A, refined).** Bold star silhouette, which still reads at 16–20 px. One arc plus one gold head give a single clear focal point. It carries three readings: heritage star, rising path to a destination, and the letter meem.
