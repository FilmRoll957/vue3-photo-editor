# Vue3 PhotoEditor

A **Vue 3 + WebGL** based front-end-only photo editor. All image processing is done locally in the browser. **100% private, free and open source**.

#### Features

- **Image Loading**: Click / drag-and-drop, URL, Blob, ArrayBuffer, built-in samples
- **Composition**: Rotate, flip, 90° rotation, perspective correction, crop (free / original / 1:1 / 4:3 / 16:9), resize
- **Light**: Brightness, exposure, gamma, contrast, shadows, highlights, bloom
- **Color**: Temperature, tint, vibrance, saturation, sepia
- **Effects**: Clarity, noise, vignette
- **Curves**: Visual color curve adjustment
- **Filters**: 13 Instagram-style LUT filters with blend intensity
- **Blend**: Overlay another image with adjustable blend ratio
- **Blur**: Bokeh blur, Gaussian blur, custom blur center
- **Repair**: Telea algorithm image inpainting (brush mask to remove blemishes)
- **Recipes**: Save / load edit parameters as JSON
- **Tools**: Histogram, before/after split view, EXIF/TIFF file info
- **Export**: JPEG / PNG download, adjustable quality, EXIF preserved
- **UX**: Light / dark / auto theme, fullscreen, zoom & pan, mobile support

#### Installation

Requirements: Node.js 18+

```bash
# 1. Clone repository
git clone <repo-url>
cd vue3-img-editor

# 2. Install dependencies
npm install

# 3. Start dev server (default http://localhost:3000)
npm run dev

# 4. Production build
npm run build

# 5. Preview build
npm run serve
```

#### License

All source code is owned by the project author.
