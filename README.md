# danbirman.com

Personal site: an interactive 3D brain (three.js) with photo cards that open
info modals, plus a second "climbing" scene with a rotatable earth and
photo pins.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs a static site to `dist/`. Deployment to GitHub Pages happens
automatically via `.github/workflows/deploy.yml` on push to `main`.

## Adding climbing photos

Earth-scene photo pins are driven by [`public/data/photos.csv`](public/data/photos.csv):

```
name,year,desc,image,lat,lon
```

- `image` is a filename in [`public/photos/`](public/photos/) — drop a new photo
  there and reference it by filename.
- `lat`/`lon` place the pin on the globe.
- `year`/`desc` are optional and shown in the photo viewer.

No rebuild step is needed beyond the normal `npm run build` / deploy — no code
changes required to add, move, or remove photos.

## Editing the brain-card layout

The five cards around the brain (About / Research / Teaching / Volcano /
Climbing) have hand-placed 3D transforms in
[`src/card-transforms.json`](src/card-transforms.json). To reposition them,
open the app with `?edit` (e.g. `npm run dev` then visit
`http://localhost:5173/?edit`), use the on-screen gizmo tool to move/rotate
cards, then copy/download the resulting JSON back into
`src/card-transforms.json`.
