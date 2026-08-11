# Accessible Scam Awareness Flagship Application

**Project:** PCWA Senior Scam Awareness Simulator
**Created by:** Nolan Hill

**Purpose:** Explains the active accessible simulator's runtime architecture,
accessibility behavior, local testing, and deployment safeguards.

## Purpose

`AccessiblePrototype.aspx` is the official age-inclusive, XML-driven scam
simulator. It presents one simulated artifact, one question, and one decision at
a time. The application root is configured to open this page by default.

The active product is maintained on `ui/accessibility-redesign`. It has not yet
been merged into `main`. The former modern-prototype branch remains available as
a historical archive; the obsolete implementation is not part of this branch.

## Entry Point and Root Routing

The Web Forms entry page is `AccessiblePrototype.aspx`. `Web.config` declares it
as the IIS default document, so these routes open the same application:

- `/`
- `/AccessiblePrototype.aspx`

This repository-tracked routing is authoritative. Local Visual Studio user
settings and Azure portal settings are not required to select the flagship page.

## Runtime Dependency Flow

1. IIS serves `AccessiblePrototype.aspx` and its minimal VB.NET code-behind.
2. The page loads `Content/accessibility-prototype.css`.
3. The page loads `Scripts/scenario-engine.js` and
   `Scripts/accessibility-simulator.js`, in that order.
4. The simulator asks the engine to fetch `prototypes/scenarios.xml`.
5. The chooser displays enabled catalog entries.
6. Selecting a scenario causes the engine to fetch and parse its XML file.
7. The simulator renders artifacts, choices, feedback, transcripts, outcomes,
   and media or missing-media behavior from the parsed data.

## Existing Architecture

The tracked application is ASP.NET Web Forms using VB.NET and .NET Framework
4.7.2. Its scenario behavior is client-side JavaScript and XML. There is no
server-side scenario engine, Session or ViewState scenario state, dynamic server
control tree, UpdatePanel, or server-side XML parser.

The entry page keeps a minimal code-behind and uses native HTML controls inside the
single Web Forms server form. Scenario choices are `button type="button"`
elements and do not cause postbacks.

## Current Scenarios

The catalog currently enables:

- Bank fraud alert — `prototypes/bank-alert-scenario.xml`
- Grandchild Emergency Call — `prototypes/grandchild-emergency-scenario.xml`
- Tech Support Pop-Up Scam — `prototypes/tech-support-popup-scenario.xml`
- Package Delivery Text Scam — `prototypes/package-delivery-text-scenario.xml`
- Online Friendship / Romance Scam — `prototypes/online-friendship-romance-scenario.xml`
- Fake Charity / Disaster Donation Scam — `prototypes/fake-charity-disaster-donation-scenario.xml`
- Government / Social Security Threat Call — `prototypes/government-social-security-threat-call-scenario.xml`
- Sweepstakes / Prize Advance-Fee Scam — `prototypes/sweepstakes-prize-advance-fee-scenario.xml`

Each scenario is an independent XML file. Future scenarios should be added to
the catalog only after their content, routing, accessibility, and route coverage
have been reviewed.

## Scenario Catalog and Routing

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

`prototypes/scenarios.xml` supplies the stable scenario ID, chooser title,
description, file path, enabled state, and approximate stage count. Catalog
order controls chooser order. Disabled entries are not displayed.

## Presentation Metadata

Scenario XML may include a `<presentation>` element with named
stages, artifact types, transcripts, choice feedback, warning signs, outcomes,
and future media paths.

Presentation values are resolved in this order:

1. Presentation metadata in the selected scenario XML
2. Catalog values, where applicable
3. Generic accessible defaults

The sidecar cannot choose a destination or end a scenario. The XML transition
graph remains authoritative. Scenes without metadata receive a generic artifact,
question, transcript, media fallback, and command presentation.

Stable `choiceId` values are used for presentation lookup before the legacy
destination-based fallback. This allows two choices to share a destination while
retaining different feedback and classifications.

## Script Responsibilities

- `Scripts/accessibility-simulator.js` owns page state, accessible DOM rendering,
  focus movement, feedback, progress, transcript controls, text sizing, sound
  controls, error presentation, and the scenario chooser.
- `Scripts/scenario-engine.js` is the only XML interpreter. It loads the catalog,
  parses routing and presentation data, validates transitions, and exposes the
  current scenario state.
Scenario XML should contain complete learner-facing presentation metadata. The
catalog supplies chooser-level title, summary, and stage-count information when
needed, and generic accessible defaults cover omitted optional fields.

See `SCENARIO-XML-GUIDE.md` for the catalog format, optional presentation schema,
media conventions, and steps for adding another independent scenario file.

## Running Locally

Use Visual Studio 2022 with the ASP.NET and web development workload and the
.NET Framework 4.7.2 developer tools. Open `PrototypeWebApp.sln`, restore NuGet
packages, select Debug, and build the solution. Start IIS Express and visit:

`https://localhost:44310/`

The page also remains available directly at:

`https://localhost:44310/AccessiblePrototype.aspx`

The page must run through IIS Express or another web server because browser
`fetch()` loads the XML scenario files.

## Accessibility and Missing-Media Behavior

Generated video, poster, caption, and audio assets have not yet been added.
Current scenario XML declares planned media with `available="false"`. The
simulated artifact, transcript, choices, feedback, and outcome remain available,
so learners do not need media to understand or complete a scenario. If future
media is enabled but fails to load, the renderer replaces it with an unavailable
media notice and directs the learner to the transcript and simulated artifact.

Accessibility decisions include:

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

## Local Testing Checklist

Before integrating a scenario or publishing the application:

1. Restore NuGet packages.
2. Run Debug and Release rebuilds and require zero warnings and zero errors.
3. Run JavaScript syntax checks for both flagship scripts.
4. Validate `prototypes/scenarios.xml` and every enabled scenario XML file.
5. Traverse every choice, destination, loop, and terminal outcome.
6. Confirm every enabled command has matching video and presentation data.
7. Confirm each scene has a transcript and correct media availability metadata.
8. Start IIS Express and verify `/` and `/AccessiblePrototype.aspx`.
9. Confirm the chooser displays only the intended enabled scenarios.
10. Exercise keyboard focus, feedback, transcript, restart, and menu behavior.
11. Check the browser console for errors.

The current flagship has been tested with:

- Debug build: succeeded with zero warnings and zero errors
- Release build: succeeded with zero warnings and zero errors
- JavaScript syntax checks: both scripts passed
- Unsafe HTML search: no `innerHTML`, `outerHTML`, or adjacent HTML insertion
- Browser console: no errors
- All eight enabled scenarios loaded through the flagship page
- Bank scenario: every prompt option, the call loop, all safe and dangerous
  endings, feedback restart, active restart, completion restart, and scenario menu
- First-command starts confirmed for all eight enabled scenarios
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

## Azure Publishing Workflow

The Azure App Service is named `AccessiblePrototypePCWAnolan`. Publishing is a
manual Visual Studio action; commits and pushes do not deploy the site.

1. Confirm the intended branch is clean and synchronized with its remote.
2. Restore NuGet packages.
3. Run Debug and Release builds with zero warnings and zero errors.
4. Review the local Visual Studio publish settings and selected App Service.
5. Publish only after the application and scenario routes have been approved.
6. Smoke-test `/`, `/AccessiblePrototype.aspx`, the chooser, and every enabled
   scenario on Azure.

Visual Studio publish profiles under `My Project/PublishProfiles/` are local and
ignored by Git. Files under `Properties/ServiceDependencies/`, publish history,
`.pubxml.user` files, credentials, subscription information, and other Azure
metadata must also remain local. A new clone can build and run without these
publishing files, but a developer must create or receive an approved local
profile before publishing to the existing App Service.
