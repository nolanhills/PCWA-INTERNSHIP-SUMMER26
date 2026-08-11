# PCWA Scam Awareness Practice

**Project:** PCWA Senior Scam Awareness Simulator
**Created by:** Nolan Hill

**Purpose:** Introduces the active accessible simulator, repository layout,
local development workflow, scenario architecture, and deployment safeguards.

## Project Purpose

This repository contains an interactive learning application that helps older
adult learners recognize scam warning signs, practice safer decisions, and see
the consequences of risky choices without using real personal or financial
information.

## Current Product Status

The accessible XML-driven application is the active flagship product. Its entry
page is `PrototypeWebApp/AccessiblePrototype.aspx`, and `Web.config` configures
the site root to open that page automatically.

The flagship work currently lives on `ui/accessibility-redesign`. That branch
has not been merged into `main`, so `main` must not yet be treated as the
replacement for the flagship branch. The former modern prototype has been
removed from this branch. Its historical branch remains available as an archive.

## Enabled Scenarios

- Bank fraud alert
- Grandchild Emergency Call
- Tech Support Pop-Up Scam
- Package Delivery Text Scam
- Online Friendship / Romance Scam
- Fake Charity / Disaster Donation Scam
- Government / Social Security Threat Call
- Sweepstakes / Prize Advance-Fee Scam

Future scenarios should use the same catalog-based XML architecture.

## Technology Stack

- ASP.NET Web Forms with VB.NET
- .NET Framework 4.7.2
- Client-side JavaScript and XML scenario files
- HTML and CSS designed for an accessible, responsive interface
- NuGet package restore for `Microsoft.CodeDom.Providers.DotNetCompilerPlatform`
- IIS Express for local hosting
- Azure App Service for deployment

## Repository Layout

The repository root contains this README and the `PrototypeWebApp` application
directory. Open `PrototypeWebApp/PrototypeWebApp.sln` in Visual Studio.

Important paths:

- `PrototypeWebApp/AccessiblePrototype.aspx` — flagship entry page
- `PrototypeWebApp/prototypes/scenarios.xml` — scenario catalog
- `PrototypeWebApp/prototypes/*.xml` — independent scenario definitions
- `PrototypeWebApp/Scripts/` — generic scenario engine and accessible renderer
- `PrototypeWebApp/Content/` — flagship stylesheet
- `PrototypeWebApp/SCENARIO-XML-GUIDE.md` — detailed authoring guide

## Local Setup Requirements

Install Visual Studio 2022 with the ASP.NET and web development workload and the
.NET Framework 4.7.2 developer tools. NuGet restore must be available so the
project-local `packages/` directory can be recreated. That directory, build
outputs, Visual Studio user settings, and local deployment metadata are ignored
by Git.

## Build and Run

1. Open `PrototypeWebApp/PrototypeWebApp.sln` in Visual Studio.
2. Restore NuGet packages if Visual Studio does not restore them automatically.
3. Select the Debug configuration and build the solution.
4. Start the application with IIS Express.
5. Open either `/` or `/AccessiblePrototype.aspx` on the local site.
6. Confirm the chooser displays all eight enabled scenarios.

From a Visual Studio Developer PowerShell prompt, a Debug rebuild can also be
run from the repository root:

```powershell
msbuild PrototypeWebApp\PrototypeWebApp.sln /t:Rebuild /p:Configuration=Debug
```

The application must be served through IIS Express, IIS, or another web server.
Opening the ASPX file directly from disk will not support the browser `fetch()`
requests used to load the catalog and scenario XML.

## XML Scenario Architecture

`PrototypeWebApp/Scripts/accessibility-simulator.js` initializes the interface
and asks `PrototypeWebApp/Scripts/scenario-engine.js` to load
`PrototypeWebApp/prototypes/scenarios.xml`. Each enabled catalog entry points to
one scenario XML file. In that file:

- `<videos>` declares scene identifiers and planned media paths.
- `<commands>` controls choices, destinations, loops, and terminal stops.
- `<presentation>` supplies learner-facing artifacts, transcripts, feedback,
  warning signs, stage information, and outcomes.

Routing remains authoritative in `<commands>`. Presentation metadata cannot
change a destination. Stable `choiceId` values let authors preserve distinct
feedback even when multiple choices share a destination.

## Missing-Media Behavior

Generated video, poster, caption, and audio assets have not yet been added.
Current XML declares planned media as unavailable. The application continues to
show the simulated artifact, transcript, decisions, feedback, and outcome so a
scenario remains understandable and completable without media.

## Azure Deployment Overview

The Azure target is the App Service named `AccessiblePrototypePCWAnolan`.
Publishing is a manual Visual Studio workflow and is not triggered by a commit.
The Visual Studio publish profile is stored locally under
`PrototypeWebApp/My Project/PublishProfiles/` and is ignored by Git. Azure
service-dependency metadata is also local and ignored. Never add credentials,
subscription identifiers, passwords, or publish secrets to the repository.

Before publishing, verify a clean intended branch, restore packages, run the
Debug and Release builds, and inspect the publish settings. After publishing,
smoke-test `/`, `/AccessiblePrototype.aspx`, the chooser, and every enabled
scenario.

## Branch Strategy

- `ui/accessibility-redesign` is the current flagship integration branch.
- `main` has not yet been replaced by the flagship work.
- The former modern-prototype branch is retained as a historical archive and
  should not receive flagship changes.
- New scenarios should be developed on focused branches and reviewed before
  being integrated into the flagship branch.

## Further Documentation

- See `PrototypeWebApp/ACCESSIBLE-PROTOTYPE.md` for runtime architecture,
  accessibility behavior, testing, and publishing details.
- See `PrototypeWebApp/SCENARIO-XML-GUIDE.md` for XML schema, routing,
  presentation metadata, media declarations, and route-validation guidance.
