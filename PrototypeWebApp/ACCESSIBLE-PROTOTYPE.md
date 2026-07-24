# Accessible Scam Awareness Prototype

## Purpose

`AccessiblePrototype.aspx` is a parallel, age-inclusive redesign of the existing
XML-driven scam simulator. It presents one simulated artifact, one question, and
one decision at a time while leaving the existing prototypes unchanged.

The page is an experimental direct URL. It does not replace `Default.aspx` and is
not linked from the application's default entry page.

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

## Protected Baselines

The following were not modified:

- `Default.aspx`
- `Default.aspx.vb`
- `Default.aspx.designer.vb`
- `prototypes/active-scenario-01.xml`
- `prototypes/bank-alert-scenario.xml`
- Everything under `modern-prototype/`
- The deployment-artifact stash

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

- Both existing scenario URLs
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

`Scripts/scenario-presentation.js` is a presentation-only sidecar keyed by
scenario path and video ID. It supplies named stages, artifact types,
transcripts, choice subtitles, educational feedback, warning signs, outcome
labels, and real-world guidance.

The sidecar cannot choose a destination or end a scenario. The XML transition
graph remains authoritative. Scenes without metadata receive a generic artifact,
question, transcript, media fallback, and command presentation. The sample
scenario intentionally relies on these fallbacks.

## Running Locally

Open the solution in Visual Studio, start IIS Express, and visit:

`https://localhost:44310/AccessiblePrototype.aspx`

The implementation was also smoke-tested with IIS Express at:

`http://localhost:8099/AccessiblePrototype.aspx`

Compare the three implementations at:

- `Default.aspx` for the original XML player
- `AccessiblePrototype.aspx` for the parallel accessible redesign
- `modern-prototype/index.html` for the independent static design experiment

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
- Both existing XML scenarios loaded through the new page
- Bank scenario: every prompt option, the call loop, all safe and dangerous
  endings, feedback restart, active restart, completion restart, and scenario menu
- Sample scenario: every prompt option, download, both jumps,
  restart-or-quit, stop, and missing-command recovery
- First-command starts confirmed: bank scene `1`, sample scene `2`
- Every current XML destination confirmed to reference an existing video ID
- Generic presentation fallback and unavailable-media fallback confirmed
- Transcript shortcut and disclosure confirmed
- Text-size increase, reset, and reload persistence confirmed
- Focus movement after scene changes and pointer-triggered feedback confirmed
- Desktop and 320px mobile layouts inspected with screenshots
- No horizontal overflow at desktop or 320px
- Largest application text setting tested at 320px without horizontal overflow
- Protected files and deployment stash verified unchanged

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
- The sample scenario has scenario-level metadata but intentionally uses generic
  scene fallbacks.
- Named-stage progress is educational and approximate because the XML graph can
  branch or repeat a scene.
- Scenario state is intentionally browser-memory state and is lost on page reload.
- No analytics, accounts, user data, or server-side persistence are included.

## Deployment Considerations

The new files are registered in `PrototypeWebApp.vbproj`, but no Azure publish was
performed. The existing deployment stash was not restored, changed, dropped, or
combined with this work. Review any future `.vbproj` conflict carefully before
applying that stash.
