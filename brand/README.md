# Brand (vendored)

Source of truth: private repo [`MBeggiato/mbx-brand`](https://github.com/MBeggiato/mbx-brand).

This folder only keeps `glyphs.json` so the README card build can set text as
SVG paths without checking out the brand repo in CI. When the charset or
outlines change upstream, copy the new file here:

```bash
cp ../mbx-brand/glyphs.json brand/glyphs.json
```

Mark geometry for the header card lives inline in `scripts/mark.ts` (mascot)
and must stay in sync with `mbx-mascot.svg` in mbx-brand.
