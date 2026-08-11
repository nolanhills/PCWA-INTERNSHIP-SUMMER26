<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="AccessiblePrototype.aspx.vb" Inherits="PrototypeWebApp.AccessiblePrototype" %>

<!--
  File: AccessiblePrototype.aspx
  Project: PCWA Senior Scam Awareness Simulator

  Purpose:
  Defines the accessible simulator page shell and the regions populated by the
  shared scenario engine and client-side renderer.

  Maintenance Notes:
  Scenario content and routing belong in XML. Preserve control IDs, accessibility
  relationships, stylesheet and script references, and script loading order.
-->

<!DOCTYPE html>
<html lang="en">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Scam Awareness Practice</title>
    <link rel="stylesheet" href="Content/accessibility-prototype.css?v=1" />
</head>
<body>
    <a class="skip-link" href="#mainContent">Skip to the current activity</a>

    <form id="form1" runat="server">
        <header class="app-header">
            <div class="header-inner">
                <div class="program-identity">
                    <span class="program-mark" aria-hidden="true">SA</span>
                    <div>
                        <p class="program-name">Scam Awareness Practice</p>
                        <p id="headerScenarioTitle" class="header-context">Choose a scenario to begin</p>
                    </div>
                </div>

                <nav class="accessibility-toolbar" aria-label="Accessibility tools">
                    <span class="toolbar-label">Text size</span>
                    <button id="decreaseTextButton" class="toolbar-button" type="button">
                        <span aria-hidden="true">A-</span>
                        <span>Decrease</span>
                    </button>
                    <button id="resetTextButton" class="toolbar-button" type="button">
                        <span aria-hidden="true">A</span>
                        <span>Reset</span>
                    </button>
                    <button id="increaseTextButton" class="toolbar-button" type="button">
                        <span aria-hidden="true">A+</span>
                        <span>Increase</span>
                    </button>
                    <button id="transcriptShortcutButton" class="toolbar-button" type="button" hidden>
                        <span aria-hidden="true">T</span>
                        <span>Transcript</span>
                    </button>
                    <button id="soundButton" class="toolbar-button" type="button" hidden>
                        <span aria-hidden="true">S</span>
                        <span>Mute sound</span>
                    </button>
                </nav>
            </div>
        </header>

        <!-- The renderer shows one primary view at a time and moves focus to the
             heading that describes the new chooser, introduction, or scene state. -->
        <main id="mainContent" class="main-content" tabindex="-1">
            <section id="chooserView" class="view-section chooser-view" aria-labelledby="chooserHeading">
                <div class="intro-copy">
                    <p class="section-kicker">Practice without risk</p>
                    <h1 id="chooserHeading" tabindex="-1">Build confidence spotting scams</h1>
                    <p class="lead">
                        Work through realistic messages and calls, make a decision, and learn what
                        warning signs to notice next time.
                    </p>
                    <div class="safety-note" role="note">
                        <span class="note-symbol" aria-hidden="true">i</span>
                        <p>
                            Everything here is simulated. No real account, money, password, security
                            code, or personal information is used or requested.
                        </p>
                    </div>
                </div>

                <section aria-labelledby="scenarioListHeading">
                    <h2 id="scenarioListHeading">Choose a practice scenario</h2>
                    <div id="scenarioList" class="scenario-list"></div>
                </section>
            </section>

            <section id="introView" class="view-section scenario-intro" aria-labelledby="introHeading" hidden>
                <button id="introBackButton" class="text-button back-button" type="button">
                    <span aria-hidden="true">&larr;</span>
                    <span>Back to scenarios</span>
                </button>
                <p class="section-kicker">Before you begin</p>
                <h1 id="introHeading" tabindex="-1"></h1>
                <p id="introSummary" class="lead"></p>
                <div class="intro-facts" aria-label="Scenario details">
                    <div>
                        <strong id="introStageCount"></strong>
                        <span>Approximate stages</span>
                    </div>
                    <div>
                        <strong>Private practice</strong>
                        <span>No information is collected</span>
                    </div>
                </div>
                <section class="practice-goal" aria-labelledby="practiceGoalHeading">
                    <h2 id="practiceGoalHeading">What you will practice</h2>
                    <p id="introPracticeGoal"></p>
                </section>
                <div class="primary-action-row">
                    <button id="beginScenarioButton" class="primary-button" type="button">
                        Start scenario
                        <span aria-hidden="true">&rarr;</span>
                    </button>
                </div>
            </section>

            <section id="simulatorView" class="simulator-view" aria-labelledby="simulatorTitle" hidden>
                <h1 id="simulatorTitle" class="visually-hidden"></h1>
                <section class="progress-section" aria-labelledby="progressHeading">
                    <div class="progress-copy">
                        <div>
                            <p class="progress-label">Current stage</p>
                            <h2 id="progressHeading" class="progress-heading"></h2>
                        </div>
                        <p id="stepText" class="step-text"></p>
                    </div>
                    <progress id="scenarioProgress" class="progress-bar" max="100" value="0">
                        0 percent
                    </progress>
                    <p class="progress-note">Your route may change based on your decisions.</p>
                    <ol id="stageList" class="stage-list" aria-label="Scenario stages"></ol>
                </section>

                <section class="activity-workspace">
                    <div class="artifact-header">
                        <p class="simulation-label">
                            <span class="simulation-dot" aria-hidden="true"></span>
                            Simulated scam example
                        </p>
                        <p id="artifactTypeLabel" class="artifact-type"></p>
                    </div>

                    <section id="artifactSection" class="artifact-section" aria-labelledby="artifactHeading">
                        <h2 id="artifactHeading" class="visually-hidden">Current simulated example</h2>
                        <div id="artifactContainer"></div>
                    </section>

                    <section id="decisionSection" class="decision-section" aria-labelledby="sceneHeading" hidden>
                        <p class="decision-prompt">What would you do?</p>
                        <h2 id="sceneHeading" class="scene-heading" tabindex="-1"></h2>
                        <p id="sceneDescription" class="scene-description"></p>
                        <div id="choiceList" class="choice-list" aria-label="Available decisions"></div>
                    </section>

                    <section id="feedbackPanel" class="feedback-panel" aria-labelledby="feedbackHeading" tabindex="-1" hidden>
                        <div class="feedback-title-row">
                            <span id="feedbackSymbol" class="feedback-symbol" aria-hidden="true"></span>
                            <div>
                                <p id="feedbackClassification" class="feedback-classification"></p>
                                <h2 id="feedbackHeading" tabindex="-1"></h2>
                            </div>
                        </div>
                        <p id="feedbackSelection" class="feedback-selection"></p>
                        <p id="feedbackConsequence"></p>
                        <section class="feedback-explanation" aria-labelledby="feedbackWhyHeading">
                            <h3 id="feedbackWhyHeading">Why this matters</h3>
                            <p id="feedbackExplanation"></p>
                        </section>
                        <section id="feedbackWarningsSection" aria-labelledby="feedbackWarningsHeading">
                            <h3 id="feedbackWarningsHeading">Warning signs</h3>
                            <ul id="feedbackWarnings"></ul>
                        </section>
                        <button id="continueButton" class="primary-button" type="button">
                            Continue
                            <span aria-hidden="true">&rarr;</span>
                        </button>
                    </section>

                    <section id="commandPanel" class="command-panel" aria-labelledby="commandHeading" hidden>
                        <h2 id="commandHeading" class="scene-heading" tabindex="-1"></h2>
                        <p id="commandDescription"></p>
                        <div id="commandContent"></div>
                        <div id="commandActions" class="command-actions"></div>
                    </section>

                    <section id="completionPanel" class="completion-panel" aria-labelledby="completionHeading" hidden>
                        <div class="outcome-heading-row">
                            <span id="outcomeSymbol" class="outcome-symbol" aria-hidden="true"></span>
                            <div>
                                <p id="outcomeLabel" class="outcome-label"></p>
                                <h2 id="completionHeading" tabindex="-1"></h2>
                            </div>
                        </div>
                        <p id="completionMessage" class="lead"></p>

                        <section aria-labelledby="pathReviewHeading">
                            <h2 id="pathReviewHeading">Your path</h2>
                            <ol id="historyList" class="history-list"></ol>
                        </section>

                        <section class="review-section" aria-labelledby="keyWarningsHeading">
                            <h2 id="keyWarningsHeading">Key warning signs</h2>
                            <ul id="completionWarnings"></ul>
                        </section>

                        <section class="real-world-section" aria-labelledby="realWorldHeading">
                            <h2 id="realWorldHeading">If this happens in real life</h2>
                            <p id="safestAction" class="safest-action"></p>
                            <ul id="realWorldActions"></ul>
                        </section>

                        <div class="completion-actions">
                            <button id="completionRestartButton" class="primary-button" type="button">
                                Restart scenario
                            </button>
                            <button id="completionMenuButton" class="secondary-button" type="button">
                                Choose another scenario
                            </button>
                        </div>
                    </section>

                    <section id="errorPanel" class="error-panel" role="alert" aria-labelledby="errorHeading" tabindex="-1" hidden>
                        <span class="error-symbol" aria-hidden="true">!</span>
                        <div>
                            <h2 id="errorHeading" tabindex="-1">This scenario could not continue</h2>
                            <p id="errorMessage"></p>
                            <div id="errorActions" class="command-actions"></div>
                        </div>
                    </section>

                    <section id="supportSection" class="support-section" aria-label="Supporting information" hidden>
                        <details id="transcriptDisclosure" class="support-disclosure">
                            <summary>Read transcript</summary>
                            <p id="transcriptText" tabindex="-1"></p>
                        </details>
                        <details id="warningSignsDisclosure" class="support-disclosure">
                            <summary>Review warning signs</summary>
                            <ul id="contextWarningSigns"></ul>
                        </details>
                    </section>
                </section>

                <nav id="scenarioUtilities" class="scenario-utilities" aria-label="Scenario controls">
                    <button id="restartButton" class="text-button" type="button">Restart scenario</button>
                    <button id="scenarioMenuButton" class="text-button" type="button">Choose another scenario</button>
                </nav>
            </section>
        </main>

        <footer class="app-footer">
            <p>This learning tool never asks for real passwords, security codes, or financial information.</p>
        </footer>

        <!-- Meaningful client-side state changes are repeated here for screen readers. -->
        <div id="statusAnnouncement" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>
    </form>

    <script src="Scripts/scenario-engine.js?v=1"></script>
    <script src="Scripts/accessibility-simulator.js?v=1"></script>
</body>
</html>
