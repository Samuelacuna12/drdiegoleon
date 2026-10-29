# Design decisions

## Locked direction

Cinematic, image-led dentistry. Black and midnight blue create the frame for the original clinic films; white sections provide contrast for case evaluation, questions and appointment selection. The visitor should immediately understand how to begin a conversation.

- Canvas: #08090c and #08172f, with full white sections.
- Typography: Manrope display, DM Sans body; white main headlines and pale-blue supporting display text.
- Layout: large film hero → white case gallery → navy clinician section → white international journey → black story gallery → white FAQ → navy booking invitation.
- Media: actual doctor, patients and case images from the existing website. No invented clinical evidence or stock substitutions.
- Buttons: primary white on dark; navy on white. No lime or gold accents.
- Motion: headline reveal, one-time scroll reveals, restrained image zoom, animated panel entry, fast control feedback. No scroll hijacking.

## References and their bounded roles

| Decision | Basis | Role |
| --- | --- | --- |
| Full-width photographic/video hero | Musemind Dental Care pin | Composition and visual hierarchy only |
| Human emphasis and clear sections | Dovena pin | Content rhythm, not its brown palette |
| Strong light/dark separation | Dentiva pin and user request | Section contrast, not its 3D implant graphics |
| Black / dark blue / white | Explicit user selection | Final palette |
| Original video and audio | Explicit user instruction and original clinic site | Actual media assets |
| Side-panel appointment flow | User request for online scheduling | Demo interaction, no live availability claims |

## Product boundaries

No actual bookings, CRM writes, notifications or local-storage persistence. WhatsApp is separate from sample scheduling and shows its real destination. No review scores, treatment prices, accreditation, response times or clinical guarantees were invented.

## Quality checks

Review desktop and narrow-screen presentation, both languages, case switching/enlargement, media controls, appointment progression and validation, WhatsApp destination, navigation, and keyboard dismissal. Confirm there is no horizontal overflow and that reduced-motion styles remove entrance animation and automatic video playback.
