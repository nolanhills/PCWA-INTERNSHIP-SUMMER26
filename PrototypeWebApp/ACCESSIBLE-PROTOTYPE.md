# Accessible Scam Awareness Prototype

## Purpose

`AccessiblePrototype.aspx` is the official age-inclusive, XML-driven scam
simulator. It presents one simulated artifact, one question, and one decision at
a time. The application root is configured to open this page by default.

## Files Created

- `AccessiblePrototype.aspx`
- `AccessiblePrototype.aspx.vb`
- `AccessiblePrototype.aspx.designer.vb`
- `Content/accessibility-prototype.css`
- `Scripts/scenario-engine.js`
- `Scripts/scenario-presentation.js`
- `Scripts/accessibility-simulator.js`
- `ACCESSIBLE-PROTOTYPE.md`

## File Modified

- `PrototypeWebApp.vbproj`

The project file includes the new page, code-behind, designer, stylesheet,
scripts, and this document so they are available to Web Application Project
build and publish tooling.

## XML Scenario System Phase

The reusable scenario phase adds `prototypes/scenarios.xml` as the scenario
catalog and `SCENARIO-XML-GUIDE.md` as the authoring reference. The bank-alert
scenario is the first XML presentation pilot. Its existing videos, commands,
destinations, and branching behavior are unchanged.

## Existing Architecture

The tracked application is ASP.NET Web Forms using VB.NET and .NET Framework
4.7.2. Its scenario behavior is client-side JavaScript and XML. There is no
server-side scenario engine, Session or ViewState scenario state, dynamic server
control tree, UpdatePanel, or server-side XML parser.

The new page keeps a minimal code-behind and uses native HTML controls inside the
single Web Forms server form. Scenario choices are `button type="button"`
elements and do not cause postbacks.

## XML Behavior

`Scripts/scenario-engine.js` is the only layer that interprets XML. It preserves:

- Catalog discovery through `prototypes/scenarios.xml`
- Every enabled scenario URL in the catalog
- The first command as the starting scene
- XML command order and string video IDs
- An option's `id` as its destination video ID
- Prompt destinations, download `nextVideoId`, and jump `targetId`
- `prompt`, `download`, `jump`, `restart-or-quit`, and `stop`
- Restart to the first command
- Ignoring `autostart`, `default`, and `timeout`

The engine reports load, parse, missing-command, missing-destination, and
unsupported-command errors without showing technical stack traces.

## Presentation Metadata

Scenario XML may now include an optional `<presentation>` element with named
stages, artifact types, transcripts, choice feedback, warning signs, outcomes,
and future media paths. `Scripts/scenario-presentation.js` remains a temporary
presentation-only fallback keyed by scenario path and video ID. XML values take
priority; missing optional values fall back to the sidecar and then to generic
accessible content.

The sidecar cannot choose a destination or end a scenario. The XML transition
graph remains authoritative. Scenes without metadata receive a generic artifact,
question, transcript, media fallback, and command presentation.

See `SCENARIO-XML-GUIDE.md` for the catalog format, optional presentation schema,
media conventions, and steps for adding another independent scenario file.

## Running Locally

Open the solution in Visual Studio, start IIS Express, and visit:

`https://localhost:44310/`

The page also remains available directly at:

`https://localhost:44310/AccessiblePrototype.aspx`

The page must run through IIS Express or another web server because browser
`fetch()` loads the XML scenario files.

## Accessibility Decisions

- A skip link, semantic landmarks, one active H1, and ordered headings
- Native buttons and native `details`/`summary` disclosures
- Programmatic focus on introductions, questions, feedback, commands, outcomes,
  errors, and the scenario chooser
- A restrained polite live region for meaningful state changes
- Accessible progress text and a native `progress` element
- Status text and symbols in addition to green, warning, or danger colors
- Approximately 18px default body text with comfortable line height
- Decision targets taller than 56px with visible focus, selected, and disabled states
- No navigable scam links and no working credential-entry form
- DOM construction with `textContent`, `createElement`, and `replaceChildren`
- No important information available only through media
- Motion limited to short hover transitions under `prefers-reduced-motion: no-preference`

## Keyboard and Text Size

All scenario actions are native buttons in normal document order. Selecting a
choice locks the decision cards, exposes feedback, and moves focus to the
feedback heading. Continuing moves focus to the next question or command.

The accessibility toolbar can decrease, reset, or increase application text.
The preference is stored in `localStorage` and persists after reload. Transcript
opens the current native disclosure and focuses its text. Sound controls appear
only when playable media exists.

## Responsive Behavior

The page uses one logical reading order on desktop, tablet, and mobile. The
artifact remains the primary surface, followed by the question, decisions,
feedback, transcript, and secondary navigation.

At narrow widths, the toolbar and stage list wrap, simulated artifacts become
fluid, choices become full width, and completion actions stack. No content
region uses a fixed height.

## Testing Performed

- Debug build: succeeded with zero warnings and zero errors
- Release build: succeeded with zero warnings and zero errors
- JavaScript syntax checks: all three scripts passed
- Unsafe HTML search: no `innerHTML`, `outerHTML`, or adjacent HTML insertion
- Browser console: no errors
- Bank Alert and Grandchild Emergency loaded through the flagship page
- Bank scenario: every prompt option, the call loop, all safe and dangerous
  endings, feedback restart, active restart, completion restart, and scenario menu
- First-command starts confirmed for both enabled scenarios
- Every current XML destination confirmed to reference an existing video ID
- Generic presentation fallback and unavailable-media fallback confirmed
- Transcript shortcut and disclosure confirmed
- Text-size increase, reset, and reload persistence confirmed
- Focus movement after scene changes and pointer-triggered feedback confirmed
- Desktop and 320px mobile layouts inspected with screenshots
- No horizontal overflow at desktop or 320px
- Largest application text setting tested at 320px without horizontal overflow

## Manual Verification Still Required

- A complete keyboard-only pass in a regular desktop browser. The automation
  environment focused native buttons but did not reliably synthesize Enter/Space
  activation.
- NVDA, JAWS, VoiceOver, or another screen-reader pass
- Actual browser zoom at 200% and 400%; 320px reflow and enlarged application
  text were tested as related checks
- Operating-system reduced-motion emulation
- Native video/audio controls, because the repository contains no media files
- Live malformed-XML, no-command, and network-failure injection
- Azure App Service smoke testing and publish-package inspection

## Known Limitations

- Existing XML video paths point to files that are not present in the repository.
  The page therefore shows compact unavailable-media notices and transcripts.
- Named-stage progress is educational and approximate because the XML graph can
  branch or repeat a scene.
- Scenario state is intentionally browser-memory state and is lost on page reload.
- No analytics, accounts, user data, or server-side persistence are included.

## Deployment Considerations

The new files are registered in `PrototypeWebApp.vbproj`, but no Azure publish was
performed. The existing deployment stash was not restored, changed, dropped, or
combined with this work. Review any future `.vbproj` conflict carefully before
applying that stash.
