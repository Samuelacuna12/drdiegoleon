# Dr. Diego León — A New Beginning

Independent website proposal built from scratch in **HTML, CSS and vanilla JavaScript**. No page builder, framework, package installation, or build step is required.

## Live website

https://samuelacuna12.github.io/drdiegoleon/

Repository: https://github.com/Samuelacuna12/drdiegoleon

## Local preview

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8765
```

Visit `http://localhost:8765`.

## Experience

- Cinematic black, midnight-blue and white visual direction.
- Original 720p clinic film and five additional videos with their original audio.
- Background video is muted, pausable, stops outside the viewport and respects reduced-motion preferences.
- User-initiated videos open with native playback and volume controls.
- Original before/after case gallery with an enlarged view.
- Fully responsive cinematic chapters: layered case gallery, sticky clinician portrait, stacked journey panels, staggered film cards and scroll-linked parallax.
- Muted patient-video previews on desktop hover; original audio opens on click.
- Global motion pause, reduced-motion preference support, accessible dialogs and keyboard navigation.
- English by default, with Spanish translation.
- Three-step sample appointment flow: modality, date/time and sample contact details.
- Colombia timezone displayed explicitly; past dates and Sundays disabled; sample Saturday hours reduced.
- WhatsApp opens the clinic's published number with a generic draft message. Nothing sends automatically.

## Important demo boundary

This is a design proposal, not the official clinic site. Calendar slots and 30-minute appointments are illustrative. Completing the appointment flow does not reserve a slot, send an email, write to a database or notify the clinic. Contact details remain in page memory only. Use fictitious data when presenting the demo.

WhatsApp, phone, email and map links point to public contact details from the original site. The WhatsApp dialog makes the destination explicit before opening the app. No demo form data is passed to WhatsApp.

## Files

- `index.html`: semantic content and UI.
- `style.css`: responsive styling, motion and reduced-motion fallback.
- `app.js`: language switching, media, dialogs, gallery and sample appointment flow.
- `experience.css` and `experience.js`: cinematic chapter layouts, scroll-linked motion, previews and motion controls.
- `assets/`: original clinic videos and optimized clinic images.
- `favicon.svg`: simple concept favicon.
- `DESIGN.md`: design rationale, references and implementation decisions.

## Connecting real appointments later

Replace illustrative calendar availability with the clinic's approved calendar or booking API. A production integration needs server-side availability validation, concurrency protection, a selected timezone, confirmed consultation durations, notifications, cancellation/rescheduling rules and an agreed privacy notice. The current prototype deliberately contains no API keys, calendar credentials or persistence.

## Source material

Media and factual clinic details were taken from https://www.drdiegoleon.com/ for this website proposal. Case images are reproduced without assigning unverified treatments, timelines or clinical outcomes. Original images remain the property of their respective rights holders; no open-source license is asserted for the clinical media.

Visual references supplied by the project owner:
- https://co.pinterest.com/pin/987625393270712146/ — Musemind's photographic composition and oversized typography.
- https://co.pinterest.com/pin/35254809579282539/ — Dovena's human photography and clear content progression.
- https://co.pinterest.com/pin/1035124295785020594/ — Dentiva's contrast and service hierarchy.

The final black / dark blue / white palette was explicitly selected by the project owner. No Pinterest imagery is used in the site.
