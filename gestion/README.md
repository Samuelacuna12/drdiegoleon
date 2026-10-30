# Dr. Diego León · Control

Independent internal-workspace proposal at `https://samuelacuna12.github.io/drdiegoleon/gestion/`.

This folder is separate from the public marketing website. It has its own HTML, CSS, JavaScript, routes and local-storage key. The public website is unchanged.

## Demonstration boundary

All initial people, employees, contacts, campaigns and activity are fictional. Changes are stored only in the current browser. There is no authentication, shared database, email/WhatsApp sending, billing, patient record, or production clinic integration. Use sample information only. This public proposal must be connected to an authenticated backend with appropriate permissions before operational use.

## Locked design and research

Build target: the owner's approved black, midnight-blue and white website, adapted to a compact internal product. Spanish default; English available. DM Sans interface typography and Manrope headings retain the identity. Navy sidebar and overview feature panel frame white work surfaces. Motion is restrained to navigation, drawers and task feedback.

Live Refero research was unavailable (NO_SUBSCRIPTION). Use its bundled craft, typography and motion guides, the existing approved visual target, and primary product references:

- https://linear.app/docs/board-layout — shared board/list state and owner/status filters.
- https://attio.com/help/reference/managing-your-data/views/create-and-manage-kanban-views — stage-based records, detail previews and linked tasks.
- https://attio.com/help/reference/attio-101/attios-data-model/understanding-lists — one client record linked to independent processes.

| Decision | Source / role |
| --- | --- |
| Navy navigation, white work surfaces, consistent type | Existing approved website, adapted to working density |
| Board and list use the same records | Linear board/list pattern |
| Client, task, referral and partner relationships | Attio record/list pattern |
| Exit criteria shown per stage | User request for clearly defined pipelines |
| Manual campaign plans with eligible-audience previews | User's remarketing goal; exclude unknown/refused permission and unsubscribed contacts |
| Drawer editing, keyboard fallback for drag-and-drop, reduced motion | Refero craft and motion guides |

## Pipelines

- Tasks: To do → In progress → In review → Done. All checklist items must be completed before Done.
- CRM: New → Contacted → Consultation scheduled → Proposal shared → Confirmed; a separate Not continuing outcome.
- Remarketing: Draft → Audience validated → Ready → Follow-up → Closed. Audience, message and owner required before activation-ready stages. No messages are sent.
- Referrals: Received → Contact authorized → Consultation scheduled → Converted → Acknowledged. Explicit contact authorization is required beyond Received.
- Partners: Prospect → Conversation → Agreement review → Active → Paused. Agreement reviewed and a unique attribution code are required for Active.

Every process includes an owner, next date, activity history and explicit stage definitions. Campaign audiences are derived from commercial stage, days since contact, channel permission and opt-out status; no medical characteristics are used for targeting.

## Run

Serve the repository root with any static HTTP server and open `/gestion/`. No installation or build step is required.
