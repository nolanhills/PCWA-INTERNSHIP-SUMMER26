# XML Scenario Authoring Guide

**Project:** PCWA Senior Scam Awareness Simulator
**Created by:** Nolan Hill

**Purpose:** Documents the catalog, routing, run-scoped variables, presentation
metadata, media conventions, and validation requirements for XML-authored scenarios.

## Architecture

The accessible flagship application loads `prototypes/scenarios.xml` first. Each enabled
catalog entry points to one independent scenario XML file. The routing engine in
`Scripts/scenario-engine.js` reads that scenario's `<commands>` element, while
the optional `<presentation>` element supplies the content shown by the
accessible interface, including media declared on each scene artifact.

Routing and presentation are deliberately separate:

- `<commands>` is authoritative for where a choice goes and when a path ends.
- `<presentation>` describes how a scene, choice, and outcome should appear.
- `<variables>` optionally defines values chosen once per scenario run for
  learner-facing text substitution.
- Catalog information supplies chooser-level values when an XML field is absent.
- Generic accessible content is used when neither XML nor the catalog supplies
  an optional field.

The presentation layer cannot change a destination. This preserves the original
XML branching semantics.

## Scenario Catalog

Register every scenario in `prototypes/scenarios.xml`:

```xml
<scenario id="bank-alert" approximateStages="5" enabled="true">
  <title>Bank fraud alert</title>
  <description>Practice responding to an unexpected bank alert.</description>
  <file>prototypes/bank-alert-scenario.xml</file>
</scenario>
```

- `id` is a stable, unique catalog identifier.
- `enabled="true"` displays the scenario. Use `false` to keep an unfinished
  scenario out of the menu without deleting its file.
- `title` and `description` provide menu content before the scenario file loads.
- `file` is an application-relative URL from the web root, not a Windows file
  path.
- `approximateStages` is an optional positive whole number displayed in the
  chooser before the scenario XML loads. Missing, zero, negative, or nonnumeric
  values use the presentation value when available and otherwise use the generic
  one-stage fallback.

Catalog order controls menu order. A catalog or scenario XML file must be served
through IIS Express or another web server because the browser loads it with
`fetch()`.

## Routing Structure

The playlist root retains the authoritative commands; optional presentation
metadata may precede them:

```xml
<playlist>
  <commands>
    <command type="prompt" videoId="1" displayText="What would you do?">
      <options>
        <option
          id="2"
          choiceId="use-trusted-channel"
          text="Choose a trusted action" />
      </options>
    </command>
    <command type="stop" videoId="2" displayText="Scenario complete." />
  </commands>
</playlist>
```

The engine continues to support these command meanings:

- `prompt`: each option's `id` is its destination scene ID.
- `download`: `nextVideoId` is the Continue destination.
- `jump`: `targetId` is the Continue destination.
- `restart-or-quit`: offers restart and return-to-menu actions.
- `stop`: ends the current path and opens the final review.

The first command is the starting scene. Keep every destination matched to an
existing command ID and, for learner-facing content, a presentation scene. Do
not use presentation metadata to express routing.

`choiceId` is optional and does not affect routing. It gives an answer a stable
identity independent of the option's destination. This lets two answers share
one destination while retaining different titles, classifications, and
feedback. Choice IDs must be unique within one prompt. Legacy options without
`choiceId` continue to use their destination `id` for presentation lookup.

The interface randomizes the visible choice order once per decision scene and
keeps that display order stable if the scene is revisited during the same run.
Each displayed choice retains its original command-option index, so XML order,
destinations, `choiceId`, classifications, feedback, and history remain
authoritative. Starting or restarting a scenario clears the display-order cache.

## Run-Scoped Money Variables

Place an optional `<variables>` element directly under `<playlist>`, before
`<presentation>` and `<commands>`. The initial implementation supports explicit
money value lists:

```xml
<playlist>
  <variables>
    <money
      id="depositAmount"
      values="1500,2000,2500,3000"
      currency="USD" />
  </variables>

  <presentation>
    <scenes>
      <scene videoId="cash-deposit">
        <artifact type="payment-request">
          <heading>Deposit requested: {{depositAmount}}</heading>
          <message>Pay {{depositAmount}} in cash today.</message>
        </artifact>
        <question>Would you pay {{depositAmount}}?</question>
      </scene>
    </scenes>
  </presentation>

  <commands>
    <command type="prompt" videoId="cash-deposit"
             displayText="The contractor asks for {{depositAmount}}.">
      <options>
        <option id="next" choiceId="pay"
                text="Pay {{depositAmount}}" />
      </options>
    </command>
  </commands>
</playlist>
```

- `id` must start with a letter and may contain letters, numbers, `_`, or `-`.
- `values` is a finite comma-separated list of nonnegative numbers. Do not use
  an unrestricted range for educational content.
- `currency` is an optional three-letter currency code and defaults to `USD`.
- Reference the formatted value with `{{variableId}}` only in learner-facing
  text. Do not place variables in routing IDs, `choiceId`, media paths, phone
  numbers, security codes, dates, account identifiers, or lesson thresholds.
- The engine chooses and formats one allowed value when the scenario loads. The
  same value is substituted in presentation text, choice content, command
  `displayText`, option text, feedback, outcomes, and review copy for that run.
- Scene changes and loops do not reroll values. Restarting, returning to the
  menu and loading the scenario again, or starting another scenario creates a
  fresh run and may choose another allowed value.
- Duplicate declarations, invalid money values, unsupported variable types, or
  references to undeclared variables are treated as malformed XML.

## Optional Presentation Structure

Place `<presentation>` before `<commands>`. The parser permits individual fields
to be omitted; missing fields fall back to catalog information where applicable
and then to generic accessible copy. New flagship scenarios should provide
complete learner-facing presentation metadata rather than relying on fallbacks.

```xml
<presentation approximateStages="3">
  <title>Scenario title</title>
  <summary>A short introduction for the learner.</summary>
  <practiceGoal>The skill this scenario practices.</practiceGoal>
  <stages>
    <stage>Message arrives</stage>
    <stage>Pressure increases</stage>
    <stage>Takeaways</stage>
  </stages>
  <finalReview>
    <warningSigns>
      <sign>An unexpected request creates urgency.</sign>
    </warningSigns>
    <safestAction>Stop and verify through a trusted channel.</safestAction>
    <realWorldActions>
      <action>Do not use contact details supplied by the message.</action>
    </realWorldActions>
  </finalReview>
  <scenes>
    <scene videoId="1" stageName="Message arrives" stageIndex="1">
      <artifact type="text-message">
        <sender>Account Security</sender>
        <senderStatus>Unknown sender</senderStatus>
        <heading>Urgent account alert</heading>
        <message>The visible simulated message.</message>
        <transcript>A complete text alternative for the artifact or media.</transcript>
        <media
          video="media/example/opening.mp4"
          poster="media/example/opening.jpg"
          captions="media/example/opening.vtt"
          available="true" />
      </artifact>
      <question>What would you do?</question>
      <description>Choose the action you would take first.</description>
      <warningSigns>
        <sign>The message was unexpected.</sign>
      </warningSigns>
      <choices>
        <choice
          choiceId="use-trusted-channel"
          destinationVideoId="2"
          classification="safe">
          <title>Contact the organization yourself</title>
          <subtitle>Use a number or app you already trust.</subtitle>
          <feedback heading="You changed to a trusted channel">
            <consequence>The suspicious sender no longer controls the contact.</consequence>
            <explanation>Independent verification interrupts the scam.</explanation>
            <warningSigns>
              <sign>The original message supplied its own contact route.</sign>
            </warningSigns>
          </feedback>
        </choice>
      </choices>
    </scene>
    <scene videoId="2" stageName="Takeaways" stageIndex="3">
      <artifact type="review">
        <heading>Scenario complete</heading>
        <message>You stopped and verified safely.</message>
        <transcript>The learner independently verifies the request.</transcript>
      </artifact>
      <outcome classification="safe">
        <label>Scam stopped</label>
        <heading>You protected your information</heading>
        <explanation>You used a trusted contact method.</explanation>
      </outcome>
    </scene>
  </scenes>
</presentation>
```

## Supported Presentation Fields

Scenario-level fields are `title`, `summary`, `practiceGoal`, `stages`, and
`finalReview`. A scene can define `stageName`, `stageIndex`, `artifact`,
`question`, `description`, `warningSigns`, `choices`, and `outcome`.

Artifact types currently understood by the interface are:

- `text-message`
- `phone-call`
- `fake-website`
- `video`
- `audio`
- `file-download`
- `narration`
- `review`

Artifact content fields include `sender`, `senderStatus`, `caller`,
`callerStatus`, `callStatus`, `domain`, `heading`, `message` (or `content`),
`requestedInformation`, and `transcript`. Unsupported fields are ignored.

Choice `classification` values are `safe`, `risky`, or `dangerous`. Outcomes
use the same values and can provide `label`, `heading`, and `explanation`.
Classification changes feedback wording and styling but never changes routing.

For new scenarios, give every `<option>` a readable `choiceId` and repeat that
value on its matching presentation `<choice>`. The command option's `id` remains
the destination scene ID. For example, these two options can converge on the
same scene without sharing feedback:

```xml
<option id="next-call" choiceId="agree-to-secrecy" text="Keep it secret" />
<option id="next-call" choiceId="require-verification" text="Verify first" />

<choice choiceId="agree-to-secrecy"
        destinationVideoId="next-call"
        classification="risky">
  <!-- Risk-specific feedback -->
</choice>
<choice choiceId="require-verification"
        destinationVideoId="next-call"
        classification="safe">
  <!-- Safer-response feedback -->
</choice>
```

When `choiceId` is present, XML presentation lookup uses it first. If it is
absent, destination-based XML metadata remains the backward-compatible fallback,
followed by the generic defaults.

## Media, Posters, Captions, and Transcripts

Reference future assets with application-relative URLs:

```xml
<media
  video="media/bank-alert/scene-01.mp4"
  poster="media/bank-alert/scene-01.jpg"
  captions="media/bank-alert/scene-01.vtt"
  available="true" />
```

Use `audio` instead of `video` for an audio-only file. Set `available="true"`
only after the referenced asset has been added and tested. When media is absent,
unavailable, or fails to load, the player keeps the simulated artifact and
transcript available; media is never required to understand or finish a scene.

After the learner activates **Start scenario**, the runtime attempts to play
only the first scene's available video. It uses the native `video.play()` API,
keeps all native controls, and silently leaves the player ready for manual Play
if browser autoplay policy rejects the request. Later scene videos never
autoplay. Restarting or starting another scenario makes only that run's first
scene eligible again.

Caption files should use WebVTT (`.vtt`) and describe all meaningful speech and
sounds. Poster images should not contain essential text that is missing from the
artifact or transcript. Every scene should have a useful transcript even when a
video is planned.

## Route Validation

Validate the complete graph before enabling or merging a scenario:

1. Confirm the scenario XML is well formed.
2. Confirm every command `videoId` has a matching presentation `<scene>`.
3. Confirm every prompt option `id`, download `nextVideoId`, and jump `targetId`
   points to an existing command and presentation scene.
4. Confirm each command is reachable from the first command. Document intentional
   loops and make sure each loop still offers a path forward or out.
5. Match every option to presentation feedback by `choiceId`; use the legacy
   destination match only when maintaining an older scenario.
6. Exercise every distinct safe, risky, and dangerous decision. Confirm the
   classification and explanation match the result without changing routing.
7. Confirm every terminal route reaches a `stop` command and a presentation
   `<outcome>` with an appropriate classification, label, heading, and
   explanation.
8. Confirm every scene has a useful transcript. For unavailable media, require
   a `<media available="false" ... />` declaration and verify the fallback is
   understandable without the asset.
9. Load the scenario through the chooser, test restart and menu behavior, and
   check the browser console for errors.
10. If variables are declared, start and restart several runs. Confirm every
    reference uses one allowed value consistently and routing remains unchanged.

## Adding a Scenario

1. Copy an existing scenario XML file to a new, descriptive filename under
   `prototypes/`.
2. Give every command and new choice a stable readable ID.
3. Build and manually review the command graph before adding presentation data.
4. Add complete `<presentation>` metadata for each learner-facing scene,
   including transcripts, choice feedback, warning signs, and terminal outcomes.
5. Add the scenario to `prototypes/scenarios.xml` with a positive
   `approximateStages` value and `enabled="false"`.
6. Run the build and JavaScript/XML checks.
7. Follow the route-validation checklist above for every choice, loop, jump,
   restart, download, and ending.
8. Set `enabled="true"` after content, accessibility, and routing review.

Keep learner-facing presentation data in the scenario XML so the artifact,
feedback, review, and recovery experience remains self-contained.
