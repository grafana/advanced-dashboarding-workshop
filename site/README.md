# Website

This is the documentation site for the **Advanced Dashboarding Workshop**, built using [Docusaurus](https://docusaurus.io/), a modern static website generator. The lab content lives in `docs/`.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18

### Installation

```
npm install
```

### Local Development

```
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Export a PDF

```
npm run export:pdf
```

This builds the workshop, prints the introductory page and every lab/exercise page, and writes the combined file to `pdf/advanced-dashboarding-workshop.pdf`. The export requires Chrome or Chromium, Python 3, `curl`, and Poppler's `pdfunite` utility. Set `PDF_EXPORT_PORT` if port `4173` is already in use.

## Deployment

The site is published to GitHub Pages at https://grafana.github.io/advanced-dashboarding-workshop/. Pushes to `main` are deployed automatically by the [`deploy-site.yml`](../.github/workflows/deploy-site.yml) GitHub Actions workflow — there's no need to deploy by hand.

## Updating the docs

To compress a screen recording (for animations):

    ffmpeg -i recording.webm -c:v libvpx-vp9 -crf 40 -b:v 0 -an recording-compressed.webm
