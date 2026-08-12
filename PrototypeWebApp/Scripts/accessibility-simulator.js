/**
 * File: accessibility-simulator.js
 * Project: PCWA Senior Scam Awareness Simulator
 * Created by: Nolan Hill
 *
 * Purpose:
 * Renders the catalog, scenario introductions, artifacts, decisions, feedback,
 * outcomes, transcripts, progress, optional media, and accessible controls.
 *
 * Responsibilities:
 * - Translate generic engine state and XML presentation metadata into the DOM
 * - Preserve keyboard focus and announce meaningful client-side state changes
 * - Record the learner's decision history for final review
 * - Keep optional supporting media separate from the primary simulated artifact
 *
 * Maintenance Notes:
 * Keep scenario-specific content in XML. Add new reusable artifact renderers in
 * renderArtifact and keep their markup aligned with accessibility-prototype.css.
 */

(function () {
    "use strict";

    const textSizeKey = "scam-awareness-text-size";
    const textSizes = ["small", "medium", "large"];
    const scenarioCatalogPath = "prototypes/scenarios.xml";
    const engine = window.ScamScenarioEngine.create();

    let selectedScenarioPath = null;
    let history = [];
    let visitedSceneIds = [];
    let activeMediaElement = null;

    // These stable IDs are the contract between AccessiblePrototype.aspx and the
    // renderer. Caching them once keeps later view transitions focused on state.
    const elements = {
        chooserView: document.getElementById("chooserView"),
        chooserHeading: document.getElementById("chooserHeading"),
        scenarioList: document.getElementById("scenarioList"),
        introView: document.getElementById("introView"),
        introHeading: document.getElementById("introHeading"),
        introSummary: document.getElementById("introSummary"),
        introStageCount: document.getElementById("introStageCount"),
        introPracticeGoal: document.getElementById("introPracticeGoal"),
        introBackButton: document.getElementById("introBackButton"),
        beginScenarioButton: document.getElementById("beginScenarioButton"),
        simulatorView: document.getElementById("simulatorView"),
        simulatorTitle: document.getElementById("simulatorTitle"),
        headerScenarioTitle: document.getElementById("headerScenarioTitle"),
        progressSection: document.querySelector(".progress-section"),
        artifactHeader: document.querySelector(".artifact-header"),
        progressHeading: document.getElementById("progressHeading"),
        stepText: document.getElementById("stepText"),
        scenarioProgress: document.getElementById("scenarioProgress"),
        stageList: document.getElementById("stageList"),
        artifactSection: document.getElementById("artifactSection"),
        artifactContainer: document.getElementById("artifactContainer"),
        artifactTypeLabel: document.getElementById("artifactTypeLabel"),
        decisionSection: document.getElementById("decisionSection"),
        sceneHeading: document.getElementById("sceneHeading"),
        sceneDescription: document.getElementById("sceneDescription"),
        choiceList: document.getElementById("choiceList"),
        feedbackPanel: document.getElementById("feedbackPanel"),
        feedbackSymbol: document.getElementById("feedbackSymbol"),
        feedbackClassification: document.getElementById("feedbackClassification"),
        feedbackHeading: document.getElementById("feedbackHeading"),
        feedbackSelection: document.getElementById("feedbackSelection"),
        feedbackConsequence: document.getElementById("feedbackConsequence"),
        feedbackExplanation: document.getElementById("feedbackExplanation"),
        feedbackWarningsSection: document.getElementById("feedbackWarningsSection"),
        feedbackWarnings: document.getElementById("feedbackWarnings"),
        continueButton: document.getElementById("continueButton"),
        commandPanel: document.getElementById("commandPanel"),
        commandHeading: document.getElementById("commandHeading"),
        commandDescription: document.getElementById("commandDescription"),
        commandContent: document.getElementById("commandContent"),
        commandActions: document.getElementById("commandActions"),
        completionPanel: document.getElementById("completionPanel"),
        outcomeSymbol: document.getElementById("outcomeSymbol"),
        outcomeLabel: document.getElementById("outcomeLabel"),
        completionHeading: document.getElementById("completionHeading"),
        completionMessage: document.getElementById("completionMessage"),
        historyList: document.getElementById("historyList"),
        completionWarnings: document.getElementById("completionWarnings"),
        safestAction: document.getElementById("safestAction"),
        realWorldActions: document.getElementById("realWorldActions"),
        completionRestartButton: document.getElementById("completionRestartButton"),
        completionMenuButton: document.getElementById("completionMenuButton"),
        errorPanel: document.getElementById("errorPanel"),
        errorHeading: document.getElementById("errorHeading"),
        errorMessage: document.getElementById("errorMessage"),
        errorActions: document.getElementById("errorActions"),
        supportSection: document.getElementById("supportSection"),
        transcriptDisclosure: document.getElementById("transcriptDisclosure"),
        transcriptText: document.getElementById("transcriptText"),
        warningSignsDisclosure: document.getElementById("warningSignsDisclosure"),
        contextWarningSigns: document.getElementById("contextWarningSigns"),
        restartButton: document.getElementById("restartButton"),
        scenarioMenuButton: document.getElementById("scenarioMenuButton"),
        scenarioUtilities: document.getElementById("scenarioUtilities"),
        decreaseTextButton: document.getElementById("decreaseTextButton"),
        resetTextButton: document.getElementById("resetTextButton"),
        increaseTextButton: document.getElementById("increaseTextButton"),
        transcriptShortcutButton: document.getElementById("transcriptShortcutButton"),
        soundButton: document.getElementById("soundButton"),
        statusAnnouncement: document.getElementById("statusAnnouncement")
    };

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = text;
        }

        return element;
    }

    function createButton(label, className, handler) {
        const button = createElement("button", className, label);
        button.type = "button";
        button.addEventListener("click", handler);
        return button;
    }

    function replaceList(listElement, items) {
        const children = items.map((item) => createElement("li", "", item));
        listElement.replaceChildren.apply(listElement, children);
    }

    function uniqueItems(items) {
        const seen = new Set();

        return items.filter((item) => {
            const value = String(item || "").trim();

            if (!value || seen.has(value)) {
                return false;
            }

            seen.add(value);
            return true;
        });
    }

    function setHidden(element, hidden) {
        element.hidden = hidden;
    }

    function announce(message) {
        // Clearing first ensures repeated messages are exposed as new polite
        // live-region updates instead of being ignored by assistive technology.
        elements.statusAnnouncement.textContent = "";
        window.setTimeout(() => {
            elements.statusAnnouncement.textContent = message;
        }, 25);
    }

    function focusElement(element) {
        // Defer focus until the browser has applied the preceding hidden-state
        // and DOM updates, so keyboard and screen-reader context stays in sync.
        window.setTimeout(() => {
            element.focus();
        }, 10);
    }

    /**
     * Recursively applies presentation fallbacks without mutating parsed XML data.
     * XML values take precedence, followed by catalog values and generic defaults.
     */
    function mergeMetadata(primary, fallback) {
        if (Array.isArray(primary)) {
            return primary.length
                ? primary.slice()
                : Array.isArray(fallback) ? fallback.slice() : [];
        }

        if (primary && typeof primary === "object") {
            const fallbackObject = fallback && typeof fallback === "object"
                ? fallback
                : {};
            const keys = new Set(
                Object.keys(fallbackObject).concat(Object.keys(primary))
            );
            const merged = {};

            keys.forEach((key) => {
                merged[key] = mergeMetadata(primary[key], fallbackObject[key]);
            });

            return merged;
        }

        if (primary !== undefined && primary !== null && primary !== "") {
            return primary;
        }

        if (Array.isArray(fallback)) {
            return fallback.slice();
        }

        if (fallback && typeof fallback === "object") {
            return mergeMetadata({}, fallback);
        }

        return fallback;
    }

    function getScenarioDetails(path) {
        const definition = window.ScamScenarioEngine
            .getAvailableScenarios()
            .find((scenario) => scenario.path === path);
        const fallbackName = definition
            ? definition.id.replace(/-/g, " ")
            : "Practice scenario";
        const genericDetails = {
            title: fallbackName,
            summary: "Practice responding to an interactive scenario.",
            practiceGoal: "Pause, review the information, and choose a response.",
            approximateStages: 1,
            stages: ["Practice"],
            scenes: {},
            finalReview: {
                warningSigns: [],
                safestAction: "Pause and verify unexpected requests through a trusted source.",
                realWorldActions: [
                    "Stop before sharing information or money.",
                    "Contact the organization through a trusted method."
                ]
            }
        };
        const catalogDetails = definition
            ? {
                title: definition.title,
                summary: definition.description,
                approximateStages: definition.approximateStages
            }
            : {};
        const engineState = engine.getState();
        const xmlDetails = engineState.isLoaded && engineState.scenarioPath === path
            ? engine.getPresentation() || {}
            : {};

        return mergeMetadata(
            xmlDetails,
            mergeMetadata(catalogDetails, genericDetails)
        );
    }

    function getSceneDetails(details, scene) {
        return details.scenes && details.scenes[String(scene.id)]
            ? details.scenes[String(scene.id)]
            : getGenericScenePresentation(scene);
    }

    function hidePrimaryViews() {
        setHidden(elements.chooserView, true);
        setHidden(elements.introView, true);
        setHidden(elements.simulatorView, true);
    }

    function resetSimulatorPanels() {
        setHidden(elements.decisionSection, true);
        setHidden(elements.feedbackPanel, true);
        setHidden(elements.commandPanel, true);
        setHidden(elements.completionPanel, true);
        setHidden(elements.errorPanel, true);
        elements.choiceList.replaceChildren();
        elements.commandContent.replaceChildren();
        elements.commandActions.replaceChildren();
        elements.errorActions.replaceChildren();
        elements.feedbackPanel.className = "feedback-panel";
    }

    function showChooser() {
        engine.clear();
        selectedScenarioPath = null;
        history = [];
        visitedSceneIds = [];
        activeMediaElement = null;
        hidePrimaryViews();
        setHidden(elements.chooserView, false);
        elements.headerScenarioTitle.textContent = "Choose a scenario to begin";
        elements.transcriptShortcutButton.hidden = true;
        elements.soundButton.hidden = true;
        renderScenarioChooser();
        announce("Scenario selection");
        focusElement(elements.chooserHeading);
    }

    /**
     * Builds chooser cards from enabled catalog entries. Scenario XML is loaded
     * only after a learner selects a card, while catalog data supplies the menu.
     */
    function renderScenarioChooser() {
        const scenarioCards = window.ScamScenarioEngine
            .getAvailableScenarios()
            .map((scenarioDefinition) => {
                const details = getScenarioDetails(scenarioDefinition.path);
                const scenarioTitle = scenarioDefinition.title || details.title;
                const scenarioSummary = scenarioDefinition.description || details.summary;
                const card = createElement("article", "scenario-card");
                const copy = createElement("div", "scenario-card-copy");
                const title = createElement("h3", "", scenarioTitle);
                const summary = createElement("p", "", scenarioSummary);
                const stageText = createElement(
                    "p",
                    "scenario-stage-count",
                    `About ${details.approximateStages} ${
                        details.approximateStages === 1 ? "stage" : "stages"
                    }`
                );
                const startButton = createButton(
                    `Start ${scenarioTitle}`,
                    "primary-button scenario-start-button",
                    () => loadScenarioForIntroduction(scenarioDefinition.path, startButton)
                );

                copy.append(title, summary, stageText);
                card.append(copy, startButton);
                return card;
            });

        elements.scenarioList.replaceChildren.apply(elements.scenarioList, scenarioCards);
    }

    /**
     * Loads the selected XML before presenting its introduction so presentation
     * metadata and catalog fallbacks are ready when the learner begins.
     */
    async function loadScenarioForIntroduction(path, sourceButton) {
        selectedScenarioPath = path;
        sourceButton.disabled = true;
        sourceButton.textContent = "Loading scenario...";
        announce("Loading scenario");

        try {
            await engine.loadScenario(path);
            showScenarioIntroduction();
        } catch (error) {
            showError(error, {
                retry: function () {
                    retryScenarioLoad(path);
                }
            });
        } finally {
            sourceButton.disabled = false;
        }
    }

    async function retryScenarioLoad(path) {
        announce("Retrying scenario load");

        try {
            await engine.loadScenario(path);
            showScenarioIntroduction();
        } catch (error) {
            showError(error, {
                retry: function () {
                    retryScenarioLoad(path);
                }
            });
        }
    }

    function showScenarioIntroduction() {
        const details = getScenarioDetails(selectedScenarioPath);

        hidePrimaryViews();
        setHidden(elements.introView, false);
        elements.headerScenarioTitle.textContent = details.title;
        elements.introHeading.textContent = details.title;
        elements.introSummary.textContent = details.summary;
        elements.introStageCount.textContent = String(details.approximateStages);
        elements.introPracticeGoal.textContent = details.practiceGoal;
        elements.transcriptShortcutButton.hidden = true;
        elements.soundButton.hidden = true;
        announce(`${details.title}. Scenario introduction.`);
        focusElement(elements.introHeading);
    }

    function beginScenario() {
        history = [];
        visitedSceneIds = [];

        try {
            const scene = engine.start();
            renderScene(scene);
        } catch (error) {
            showError(error);
        }
    }

    function getGenericScenePresentation(scene) {
        const command = scene.command;
        const commandType = command ? command.type : "general";
        const displayText = command && command.displayText
            ? command.displayText
            : `Scene ${scene.id}`;
        let artifactType = "narration";

        if (commandType === "download") {
            artifactType = "file-download";
        }

        return {
            stageName: `Scene ${scene.id}`,
            artifact: {
                type: artifactType,
                heading: `Scene ${scene.id}`,
                message: displayText,
                transcript: displayText,
                mediaAvailable: false
            },
            question: displayText || "Choose what you would do next.",
            description: `This is a simulated ${commandType} step.`,
            warningSigns: []
        };
    }

    function rememberVisitedScene(sceneId) {
        if (!visitedSceneIds.includes(sceneId)) {
            visitedSceneIds.push(sceneId);
        }
    }

    /**
     * Renders the shared scene shell, then delegates the command-specific action.
     * Command routing remains in the engine; this function only selects UI states.
     */
    function renderScene(scene) {
        if (!scene) {
            showError(new Error("The current scene is unavailable."));
            return;
        }

        hidePrimaryViews();
        setHidden(elements.simulatorView, false);
        setHidden(elements.progressSection, false);
        setHidden(elements.artifactHeader, false);
        setHidden(elements.artifactSection, false);
        setHidden(elements.scenarioUtilities, false);
        resetSimulatorPanels();
        activeMediaElement = null;
        updateSoundControl();

        rememberVisitedScene(scene.id);

        const details = getScenarioDetails(selectedScenarioPath);
        const sceneMetadata = getSceneDetails(details, scene);
        const isComplete = Boolean(scene.command && scene.command.type === "stop");

        elements.headerScenarioTitle.textContent = details.title;
        elements.simulatorTitle.textContent = /scenario$/i.test(details.title)
            ? details.title
            : `${details.title} scenario`;
        renderProgress(details, sceneMetadata, isComplete, engine.getState().commandCount);
        renderArtifact(sceneMetadata.artifact, scene);
        renderSupport(sceneMetadata);

        if (!scene.command) {
            showSceneError(
                "No action is assigned to this scene",
                `Scene ${scene.id} has media information but no command.`
            );
            return;
        }

        if (scene.command.type === "prompt") {
            renderDecision(scene, sceneMetadata);
            return;
        }

        if (scene.command.type === "download") {
            renderDownloadCommand(scene, sceneMetadata);
            return;
        }

        if (scene.command.type === "jump") {
            renderJumpCommand(scene, sceneMetadata);
            return;
        }

        if (scene.command.type === "restart-or-quit") {
            renderRestartOrQuitCommand(scene, sceneMetadata);
            return;
        }

        if (scene.command.type === "stop") {
            renderCompletion(scene, sceneMetadata, details);
            return;
        }

        showSceneError(
            "This command is not supported",
            `The command type "${scene.command.type}" cannot be displayed.`
        );
    }

    /**
     * Renders approximate named-stage progress. Branches and repeated scenes mean
     * visited-scene count is only a fallback when XML omits a stage index.
     */
    function renderProgress(details, sceneMetadata, isComplete, commandCount) {
        const stages = details.stages && details.stages.length
            ? details.stages
            : Array.from(
                { length: Math.max(commandCount, 1) },
                (_, index) => `Stage ${index + 1}`
            );
        const totalStages = stages.length;
        const metadataIndex = Number(sceneMetadata.stageIndex);
        let currentIndex = Number.isFinite(metadataIndex) && metadataIndex > 0
            ? metadataIndex
            : Math.min(visitedSceneIds.length, totalStages);

        if (isComplete) {
            currentIndex = totalStages;
        }

        currentIndex = Math.max(1, Math.min(currentIndex, totalStages));
        const currentStageName = isComplete
            ? stages[totalStages - 1]
            : sceneMetadata.stageName || stages[currentIndex - 1];
        const percent = Math.round((currentIndex / totalStages) * 100);

        elements.progressHeading.textContent = currentStageName;
        elements.stepText.textContent = `Step ${currentIndex} of ${totalStages}`;
        elements.scenarioProgress.value = percent;
        elements.scenarioProgress.textContent = `${percent} percent`;
        elements.scenarioProgress.setAttribute("aria-label", `${currentStageName}, step ${currentIndex} of ${totalStages}`);

        const stageItems = stages.map((stage, index) => {
            const item = createElement("li", "stage-item");
            const number = createElement("span", "stage-number", String(index + 1));
            const label = createElement("span", "stage-name", stage);

            if (index + 1 < currentIndex) {
                item.classList.add("is-complete");
                number.textContent = "Done";
            } else if (index + 1 === currentIndex) {
                item.classList.add("is-current");
                item.setAttribute("aria-current", "step");
            }

            item.append(number, label);
            return item;
        });

        elements.stageList.replaceChildren.apply(elements.stageList, stageItems);
    }

    /**
     * Selects a generic artifact renderer by XML type. Add reusable artifact
     * types here; scenario-specific DOM branches do not belong in this module.
     */
    function renderArtifact(artifact, scene) {
        const type = artifact && artifact.type ? artifact.type : "narration";
        const supportingVideo = createSupportingVideo(artifact, type);
        let artifactElement;

        elements.artifactTypeLabel.textContent = formatArtifactType(type);

        if (type === "text-message") {
            artifactElement = createTextMessageArtifact(artifact);
        } else if (type === "phone-call") {
            artifactElement = createPhoneCallArtifact(artifact);
        } else if (type === "fake-website") {
            artifactElement = createWebsiteArtifact(artifact);
        } else if (type === "video" || type === "audio") {
            artifactElement = createMediaArtifact(artifact, type);
        } else if (type === "file-download") {
            artifactElement = createFileArtifact(artifact);
        } else {
            artifactElement = createNarrationArtifact(artifact);
        }

        // Supplemental video precedes but never replaces the simulated artifact,
        // which contains the evidence needed to make the decision.
        elements.artifactContainer.replaceChildren.apply(
            elements.artifactContainer,
            supportingVideo ? [supportingVideo, artifactElement] : [artifactElement]
        );
    }

    /**
     * Creates supplemental video only when XML explicitly marks it available.
     * Returning null avoids an empty panel, warning, or layout gap when optional
     * media is absent; primary video/audio artifacts handle fallback separately.
     */
    function createSupportingVideo(artifact, artifactType) {
        const isPrimaryMedia = artifactType === "video" || artifactType === "audio";

        if (
            isPrimaryMedia ||
            !artifact ||
            !artifact.mediaAvailable ||
            !artifact.mediaSrc
        ) {
            return null;
        }

        const panel = createElement("section", "supporting-video-panel");
        const heading = createElement("h2", "supporting-video-heading", "Supporting video");
        const video = document.createElement("video");

        video.controls = true;
        video.preload = "metadata";
        video.src = artifact.mediaSrc;
        video.setAttribute(
            "aria-label",
            artifact.heading
                ? `Supporting video for ${artifact.heading}`
                : "Supporting video for this scenario step"
        );

        if (artifact.posterSrc) {
            video.poster = artifact.posterSrc;
        }

        if (artifact.captionSrc) {
            const captions = document.createElement("track");
            captions.kind = "captions";
            captions.src = artifact.captionSrc;
            captions.srclang = "en";
            captions.label = "English captions";
            captions.default = true;
            video.append(captions);
        }

        video.addEventListener("error", () => {
            // Remove only failed supplemental media. The primary artifact,
            // transcript, and decision path remain fully available.
            panel.remove();

            if (activeMediaElement === video) {
                activeMediaElement = null;
                updateSoundControl();
            }
        }, { once: true });

        panel.append(heading, video);
        activeMediaElement = video;
        updateSoundControl();
        return panel;
    }

    function formatArtifactType(type) {
        const labels = {
            "text-message": "Text message",
            "phone-call": "Phone call",
            "fake-website": "Website",
            "file-download": "File review",
            "video": "Video",
            "audio": "Audio",
            "narration": "Scenario update",
            "review": "Review"
        };

        return labels[type] || "Scenario example";
    }

    function createTextMessageArtifact(artifact) {
        const shell = createElement("article", "message-device");
        shell.setAttribute("aria-label", "Simulated text message");

        const deviceTop = createElement("div", "message-device-top");
        deviceTop.append(
            createElement("span", "", "9:41 AM"),
            createElement("span", "", "Messages")
        );

        const contact = createElement("div", "message-contact");
        const sender = createElement("strong", "", artifact.sender || "Unknown sender");
        const senderStatus = createElement(
            "span",
            "sender-status",
            artifact.senderStatus || "Sender not verified"
        );
        contact.append(sender, senderStatus);

        const thread = createElement("div", "message-thread");
        const bubble = createElement("div", "message-bubble");
        bubble.append(
            createElement("h2", "artifact-title", artifact.heading || "New message"),
            createElement("p", "", artifact.message || "No message text is available.")
        );
        thread.append(bubble);

        const inertNotice = createElement(
            "p",
            "inert-notice",
            "Links and phone numbers in this simulation are not active."
        );

        shell.append(deviceTop, contact, thread, inertNotice);
        return shell;
    }

    function createPhoneCallArtifact(artifact) {
        const call = createElement("article", "call-artifact");
        call.setAttribute("aria-label", "Simulated phone call");

        const status = createElement(
            "p",
            "call-status",
            artifact.callStatus || "Simulated call"
        );
        const avatar = createElement(
            "span",
            "caller-avatar",
            getInitials(artifact.caller || "Unknown caller")
        );
        avatar.setAttribute("aria-hidden", "true");
        const caller = createElement("h2", "artifact-title", artifact.caller || "Unknown caller");
        const identity = createElement(
            "p",
            "caller-identity",
            artifact.callerStatus || "Caller identity not verified"
        );
        const statement = createElement("blockquote", "caller-statement");
        statement.append(
            createElement("strong", "", artifact.heading || "Caller says"),
            createElement("p", "", artifact.message || "No call summary is available.")
        );

        call.append(status, avatar, caller, identity, statement);
        return call;
    }

    function createWebsiteArtifact(artifact) {
        const browser = createElement("article", "website-artifact");
        browser.setAttribute("aria-label", "Simulated suspicious website");

        const browserBar = createElement("div", "browser-bar");
        const browserControls = createElement("span", "browser-controls", "x x x");
        const browserAddress = createElement(
            "span",
            "browser-address",
            artifact.domain || "unverified.example"
        );
        browserControls.setAttribute("aria-hidden", "true");
        browserBar.append(browserControls, browserAddress);

        const page = createElement("div", "simulated-page");
        const siteLabel = createElement("p", "simulated-site-label", "Simulated banking page");
        const heading = createElement(
            "h2",
            "artifact-title",
            artifact.heading || "Account verification"
        );
        const message = createElement(
            "p",
            "",
            artifact.message || "This page requests account information."
        );
        const requestHeading = createElement("h3", "", "Information requested");
        const requests = createElement("ul", "requested-information");

        replaceList(
            requests,
            artifact.requestedInformation || ["Personal or account information"]
        );

        const warning = createElement(
            "p",
            "inert-notice warning-notice",
            "This is not a working form. It cannot accept information."
        );

        page.append(siteLabel, heading, message, requestHeading, requests, warning);
        browser.append(browserBar, page);
        return browser;
    }

    /**
     * Renders media when it is the primary artifact. Unlike supplemental media,
     * an unavailable primary asset leaves a compact notice that points learners
     * to the transcript and other simulated evidence.
     */
    function createMediaArtifact(artifact, type) {
        const wrapper = createElement("article", "media-artifact");
        const heading = createElement(
            "h2",
            "artifact-title",
            artifact.heading || `${formatArtifactType(type)} scene`
        );
        const description = createElement(
            "p",
            "",
            artifact.message || "Supporting media for this scene."
        );

        wrapper.append(heading, description);

        if (artifact.mediaAvailable && artifact.mediaSrc) {
            const media = document.createElement(type);
            media.controls = true;
            media.preload = "metadata";
            media.src = artifact.mediaSrc;
            media.setAttribute("aria-label", artifact.heading || "Scenario media");

            if (type === "video" && artifact.posterSrc) {
                media.poster = artifact.posterSrc;
            }

            if (type === "video" && artifact.captionSrc) {
                const captions = document.createElement("track");
                captions.kind = "captions";
                captions.src = artifact.captionSrc;
                captions.srclang = "en";
                captions.label = "English captions";
                captions.default = true;
                media.append(captions);
            }

            media.addEventListener("error", () => {
                // Replace the failed player without blocking navigation or
                // leaving the global sound control attached to unusable media.
                wrapper.replaceChildren(
                    heading,
                    description,
                    createUnavailableMediaNotice(artifact.mediaSrc)
                );
                activeMediaElement = null;
                updateSoundControl();
            });

            const replayButton = createButton(
                "Replay media",
                "secondary-button compact-button",
                () => {
                    media.currentTime = 0;
                    media.play().catch(() => {
                        announce("Use the media Play control to begin playback.");
                    });
                }
            );

            activeMediaElement = media;
            wrapper.append(media, replayButton);
            updateSoundControl();
        } else {
            const path = artifact.mediaPath || "";
            wrapper.append(createUnavailableMediaNotice(path));
        }

        return wrapper;
    }

    function createUnavailableMediaNotice(path) {
        const notice = createElement("div", "media-unavailable");
        notice.append(
            createElement("span", "media-symbol", "Media"),
            createElement("strong", "", "Media is not available yet"),
            createElement(
                "p",
                "",
                "Use the transcript and simulated artifact to complete this step."
            )
        );

        if (path) {
            notice.append(createElement("p", "planned-media", `Planned file: ${path}`));
        }

        return notice;
    }

    function createFileArtifact(artifact) {
        const fileArtifact = createElement("article", "file-artifact");
        fileArtifact.append(
            createElement("span", "file-symbol", "FILE"),
            createElement(
                "div",
                "",
                null
            )
        );

        const copy = fileArtifact.lastElementChild;
        copy.append(
            createElement("h2", "artifact-title", artifact.heading || "Files to review"),
            createElement(
                "p",
                "",
                artifact.message || "Review the listed files before continuing."
            )
        );

        return fileArtifact;
    }

    function createNarrationArtifact(artifact) {
        const narration = createElement("article", "narration-artifact");
        const symbol = createElement("span", "narration-symbol", "i");
        symbol.setAttribute("aria-hidden", "true");
        const copy = createElement("div", "");
        copy.append(
            createElement("h2", "artifact-title", artifact.heading || "Scenario update"),
            createElement(
                "p",
                "",
                artifact.message || "The scenario is ready to continue."
            )
        );
        narration.append(symbol, copy);
        return narration;
    }

    /**
     * Keeps text alternatives available independently of playable media and
     * hides disclosures and toolbar shortcuts when they have no content.
     */
    function renderSupport(sceneMetadata) {
        const artifact = sceneMetadata.artifact || {};
        const transcript = artifact.transcript || artifact.message || "";
        const warningSigns = sceneMetadata.warningSigns || [];
        const hasTranscript = Boolean(transcript.trim());
        const hasWarnings = warningSigns.length > 0;

        setHidden(elements.supportSection, !hasTranscript && !hasWarnings);
        setHidden(elements.transcriptDisclosure, !hasTranscript);
        setHidden(elements.warningSignsDisclosure, !hasWarnings);
        elements.transcriptDisclosure.open = false;
        elements.warningSignsDisclosure.open = false;
        elements.transcriptText.textContent = transcript;
        replaceList(elements.contextWarningSigns, warningSigns);
        elements.transcriptShortcutButton.hidden = !hasTranscript;
    }

    /**
     * Creates native button choices in source order. Native controls retain
     * expected keyboard behavior while feedback focus is managed after selection.
     */
    function renderDecision(scene, sceneMetadata) {
        const command = scene.command;

        setHidden(elements.decisionSection, false);
        elements.sceneHeading.textContent =
            sceneMetadata.question || command.displayText || "Choose what you would do.";
        elements.sceneDescription.textContent =
            sceneMetadata.description || "Select one response to continue the scenario.";

        if (command.options.length === 0) {
            showSceneError(
                "No choices are available",
                `The prompt in scene ${scene.id} does not contain any options.`
            );
            return;
        }

        const choiceButtons = command.options.map((option, index) => {
            const choiceMetadata = getChoiceMetadata(sceneMetadata, option);
            const titleText = choiceMetadata && choiceMetadata.title
                ? choiceMetadata.title
                : option.text || `Choice ${index + 1}`;
            const subtitleText = choiceMetadata && choiceMetadata.subtitle
                ? choiceMetadata.subtitle
                : `Continue with this action to scene ${option.destinationVideoId}.`;
            const button = createElement("button", "decision-card");
            const choiceNumber = createElement(
                "span",
                "choice-index",
                `Choice ${index + 1}`
            );
            const title = createElement("span", "choice-title", titleText);
            const subtitle = createElement("span", "choice-subtitle", subtitleText);

            button.type = "button";
            button.dataset.destination = option.destinationVideoId;

            if (option.choiceId) {
                button.dataset.choiceId = option.choiceId;
            }

            button.append(choiceNumber, title, subtitle);
            button.addEventListener("click", () => {
                selectChoice(scene, index, button, choiceMetadata);
            });
            return button;
        });

        elements.choiceList.replaceChildren.apply(elements.choiceList, choiceButtons);
        announce(`${elements.sceneHeading.textContent}. ${command.options.length} choices available.`);
        focusElement(elements.sceneHeading);
    }

    function getChoiceMetadata(sceneMetadata, option) {
        // Stable choiceId is authoritative when choices converge. Destination
        // lookup remains as a backward-compatible fallback for older XML.
        if (
            option.choiceId &&
            sceneMetadata.choicesById &&
            sceneMetadata.choicesById[option.choiceId]
        ) {
            return sceneMetadata.choicesById[option.choiceId];
        }

        return sceneMetadata.choices &&
            sceneMetadata.choices[String(option.destinationVideoId)]
            ? sceneMetadata.choices[String(option.destinationVideoId)]
            : null;
    }

    function selectChoice(scene, optionIndex, selectedButton, choiceMetadata) {
        try {
            const selectedChoice = engine.selectOption(optionIndex);
            const classification = choiceMetadata && choiceMetadata.classification
                ? choiceMetadata.classification
                : "neutral";
            const warningSigns = choiceMetadata && choiceMetadata.warningSigns
                ? choiceMetadata.warningSigns
                : [];

            Array.from(elements.choiceList.querySelectorAll("button")).forEach((button) => {
                button.disabled = true;
                button.setAttribute("aria-pressed", button === selectedButton ? "true" : "false");
            });

            selectedButton.classList.add("is-selected");
            selectedButton.append(
                createElement("span", "selected-label", "Selected choice")
            );

            // Store learner-facing labels and classifications, not DOM nodes, so
            // final review can be rebuilt after any number of scene transitions.
            history.push({
                sceneId: scene.id,
                choiceId: selectedChoice.choiceId,
                destinationVideoId: selectedChoice.destinationVideoId,
                choiceText: selectedChoice.text,
                title: choiceMetadata && choiceMetadata.title
                    ? choiceMetadata.title
                    : selectedChoice.text,
                classification: classification,
                warningSigns: warningSigns
            });

            showFeedback(selectedChoice, choiceMetadata, classification, scene);
        } catch (error) {
            showError(error);
        }
    }

    function showFeedback(selectedChoice, choiceMetadata, classification, scene) {
        const labels = {
            safe: "Safer response",
            risky: "Risky response",
            dangerous: "Dangerous response",
            neutral: "Your decision"
        };
        const symbols = {
            safe: "OK",
            risky: "!",
            dangerous: "!",
            neutral: "i"
        };
        const details = getScenarioDetails(selectedScenarioPath);
        const sceneMetadata = getSceneDetails(details, scene);
        const warnings = choiceMetadata && choiceMetadata.warningSigns
            ? choiceMetadata.warningSigns
            : sceneMetadata.warningSigns || [];

        setHidden(elements.feedbackPanel, false);
        elements.feedbackPanel.className = `feedback-panel feedback-${classification}`;
        elements.feedbackSymbol.textContent = symbols[classification] || "i";
        elements.feedbackClassification.textContent =
            labels[classification] || labels.neutral;
        elements.feedbackHeading.textContent = choiceMetadata && choiceMetadata.feedbackHeading
            ? choiceMetadata.feedbackHeading
            : "Your choice changes what happens next";
        elements.feedbackSelection.textContent = `You chose: ${selectedChoice.text}`;
        elements.feedbackConsequence.textContent =
            choiceMetadata && choiceMetadata.consequence
                ? choiceMetadata.consequence
                : `The scenario will continue to scene ${selectedChoice.destinationVideoId}.`;
        elements.feedbackExplanation.textContent =
            choiceMetadata && choiceMetadata.explanation
                ? choiceMetadata.explanation
                : "This scenario does not include additional teaching notes for this choice.";
        replaceList(elements.feedbackWarnings, warnings);
        setHidden(elements.feedbackWarningsSection, warnings.length === 0);
        announce(`${elements.feedbackClassification.textContent}. ${elements.feedbackHeading.textContent}`);
        focusElement(elements.feedbackHeading);
    }

    function continueAfterFeedback() {
        try {
            const scene = engine.continueAfterChoice();
            renderScene(scene);
        } catch (error) {
            showError(error);
        }
    }

    function renderDownloadCommand(scene, sceneMetadata) {
        const command = scene.command;
        const heading = command.displayText || "Review these files";
        const description = sceneMetadata.description ||
            "Review the file names and paths before continuing.";
        const fileList = createElement("ul", "file-list");

        command.files.forEach((file) => {
            const item = createElement("li", "file-list-item");
            item.append(
                createElement("strong", "", file.name),
                createElement("span", "", file.path || "No path provided")
            );
            fileList.append(item);
        });

        if (command.files.length === 0) {
            fileList.append(createElement("li", "", "No files are listed."));
        }

        showCommandPanel(heading, description, fileList);
        elements.commandActions.append(
            createButton("Continue", "primary-button", continueCurrentCommand)
        );
    }

    function renderJumpCommand(scene, sceneMetadata) {
        const command = scene.command;
        const heading = command.displayText || "The scenario is ready to continue";
        const description = sceneMetadata.description ||
            "Continue to follow the next step in the XML scenario.";

        showCommandPanel(heading, description);
        elements.commandActions.append(
            createButton("Continue", "primary-button", continueCurrentCommand)
        );
    }

    function renderRestartOrQuitCommand(scene, sceneMetadata) {
        const command = scene.command;
        const heading = command.displayText || "What would you like to do next?";
        const description = sceneMetadata.description ||
            "Restart this scenario or return to the scenario list.";

        showCommandPanel(heading, description);
        setHidden(elements.scenarioUtilities, true);
        elements.commandActions.append(
            createButton("Restart scenario", "primary-button", restartScenario),
            createButton("Choose another scenario", "secondary-button", showChooser)
        );
    }

    function showCommandPanel(heading, description, content) {
        setHidden(elements.commandPanel, false);
        elements.commandHeading.textContent = heading;
        elements.commandDescription.textContent = description;
        elements.commandContent.replaceChildren();
        elements.commandActions.replaceChildren();

        if (content) {
            elements.commandContent.append(content);
        }

        announce(heading);
        focusElement(elements.commandHeading);
    }

    function continueCurrentCommand() {
        try {
            const scene = engine.continueCommand();
            renderScene(scene);
        } catch (error) {
            showError(error);
        }
    }

    /**
     * Combines the terminal outcome, decision history, and de-duplicated warning
     * signs into the final review without changing the route that reached it.
     */
    function renderCompletion(scene, sceneMetadata, scenarioDetails) {
        const outcome = sceneMetadata.outcome || {
            classification: "neutral",
            label: "Scenario complete",
            heading: "You reached the end of this path"
        };
        const classification = outcome.classification || "neutral";
        const symbols = {
            safe: "OK",
            risky: "!",
            dangerous: "!",
            neutral: "End"
        };
        const finalReview = scenarioDetails.finalReview || {};
        const historyWarnings = history.reduce(
            (warnings, item) => warnings.concat(item.warningSigns || []),
            []
        );
        const warnings = uniqueItems(
            (finalReview.warningSigns || [])
                .concat(sceneMetadata.warningSigns || [])
                .concat(historyWarnings)
        ).slice(0, 8);

        setHidden(elements.completionPanel, false);
        setHidden(elements.scenarioUtilities, true);
        elements.completionPanel.className =
            `completion-panel completion-${classification}`;
        elements.outcomeSymbol.textContent = symbols[classification] || "End";
        elements.outcomeLabel.textContent = outcome.label || "Scenario complete";
        elements.completionHeading.textContent =
            outcome.heading || "You reached the end of this path";
        elements.completionMessage.textContent =
            outcome.explanation || scene.command.displayText ||
            "The scenario has ended.";
        renderHistory();
        replaceList(elements.completionWarnings, warnings);
        elements.safestAction.textContent =
            finalReview.safestAction ||
            "Pause and verify unexpected requests through a trusted source.";
        replaceList(
            elements.realWorldActions,
            finalReview.realWorldActions || [
                "Stop before sharing information or money.",
                "Contact the organization through a trusted method."
            ]
        );

        announce(`${elements.outcomeLabel.textContent}. ${elements.completionHeading.textContent}`);
        focusElement(elements.completionHeading);
    }

    function renderHistory() {
        if (history.length === 0) {
            elements.historyList.replaceChildren(
                createElement("li", "history-item", "No decisions were recorded on this path.")
            );
            return;
        }

        const items = history.map((item) => {
            const listItem = createElement(
                "li",
                `history-item history-${item.classification}`
            );
            const label = classificationLabel(item.classification);
            listItem.append(
                createElement("span", "history-status", label),
                createElement("strong", "", item.title || item.choiceText)
            );
            return listItem;
        });

        elements.historyList.replaceChildren.apply(elements.historyList, items);
    }

    function classificationLabel(classification) {
        const labels = {
            safe: "Safer",
            risky: "Risky",
            dangerous: "Dangerous",
            neutral: "Choice"
        };

        return labels[classification] || labels.neutral;
    }

    function showSceneError(heading, message) {
        showError(
            new window.ScamScenarioEngine.ScenarioEngineError(
                "scene-error",
                message
            ),
            {
                heading: heading,
                allowRestart: true
            }
        );
    }

    /**
     * Replaces active simulator regions with a focused recovery state. Technical
     * details remain in the engine while learners receive actionable retry,
     * restart, or menu options when those actions are valid.
     */
    function showError(error, options) {
        const settings = options || {};
        const message = error && error.message
            ? error.message
            : "The scenario could not continue.";

        hidePrimaryViews();
        setHidden(elements.simulatorView, false);
        setHidden(elements.progressSection, true);
        setHidden(elements.artifactHeader, true);
        setHidden(elements.artifactSection, true);
        resetSimulatorPanels();
        setHidden(elements.errorPanel, false);
        setHidden(elements.supportSection, true);
        setHidden(elements.scenarioUtilities, true);
        elements.transcriptShortcutButton.hidden = true;
        elements.soundButton.hidden = true;
        elements.errorHeading.textContent =
            settings.heading || "This scenario could not continue";
        elements.errorMessage.textContent = message;

        if (settings.allowRestart && engine.getState().isLoaded) {
            elements.errorActions.append(
                createButton("Restart scenario", "primary-button", restartScenario)
            );
        }

        if (settings.retry) {
            elements.errorActions.append(
                createButton("Try again", "primary-button", settings.retry)
            );
        }

        elements.errorActions.append(
            createButton("Choose another scenario", "secondary-button", showChooser)
        );
        announce(elements.errorHeading.textContent);
        focusElement(elements.errorHeading);
    }

    function restartScenario() {
        if (!engine.getState().isLoaded) {
            showChooser();
            return;
        }

        history = [];
        visitedSceneIds = [];

        try {
            const scene = engine.restart();
            renderScene(scene);
            announce("Scenario restarted");
        } catch (error) {
            showError(error);
        }
    }

    function getInitials(name) {
        return name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }

    function getStoredTextSize() {
        try {
            const storedSize = window.localStorage.getItem(textSizeKey);
            return textSizes.includes(storedSize) ? storedSize : "medium";
        } catch (error) {
            return "medium";
        }
    }

    function setTextSize(size, shouldAnnounce) {
        const safeSize = textSizes.includes(size) ? size : "medium";
        document.documentElement.dataset.textSize = safeSize;

        try {
            window.localStorage.setItem(textSizeKey, safeSize);
        } catch (error) {
            // The preference still applies for this page when storage is unavailable.
        }

        elements.decreaseTextButton.disabled = safeSize === "small";
        elements.increaseTextButton.disabled = safeSize === "large";
        elements.resetTextButton.disabled = safeSize === "medium";

        if (shouldAnnounce) {
            announce(`Text size set to ${safeSize}.`);
        }
    }

    function changeTextSize(direction) {
        const currentSize = document.documentElement.dataset.textSize || "medium";
        const currentIndex = textSizes.indexOf(currentSize);
        const nextIndex = Math.max(
            0,
            Math.min(currentIndex + direction, textSizes.length - 1)
        );

        setTextSize(textSizes[nextIndex], true);
    }

    function openTranscript() {
        if (elements.transcriptDisclosure.hidden) {
            announce("No transcript is available for this step.");
            return;
        }

        elements.transcriptDisclosure.open = true;
        focusElement(elements.transcriptText);
        announce("Transcript opened.");
    }

    function toggleSound() {
        if (!activeMediaElement) {
            announce("No playable media is available in this step.");
            return;
        }

        activeMediaElement.muted = !activeMediaElement.muted;
        updateSoundControl();
        announce(activeMediaElement.muted ? "Sound muted." : "Sound on.");
    }

    function updateSoundControl() {
        const hasMedia = Boolean(activeMediaElement);
        elements.soundButton.hidden = !hasMedia;

        if (hasMedia) {
            const label = activeMediaElement.muted ? "Turn sound on" : "Mute sound";
            elements.soundButton.lastElementChild.textContent = label;
        }
    }

    /**
     * Loads the catalog before exposing the chooser so disabled or malformed
     * entries never produce incomplete scenario cards.
     */
    async function initializeScenarioCatalog() {
        elements.scenarioList.replaceChildren(
            createElement("p", "scenario-loading", "Loading scenarios...")
        );

        try {
            await window.ScamScenarioEngine.loadCatalog(scenarioCatalogPath);
            showChooser();
        } catch (error) {
            showError(error, {
                heading: "The scenario list could not be loaded",
                retry: initializeScenarioCatalog
            });
        }
    }

    elements.introBackButton.addEventListener("click", showChooser);
    elements.beginScenarioButton.addEventListener("click", beginScenario);
    elements.continueButton.addEventListener("click", continueAfterFeedback);
    elements.restartButton.addEventListener("click", restartScenario);
    elements.scenarioMenuButton.addEventListener("click", showChooser);
    elements.completionRestartButton.addEventListener("click", restartScenario);
    elements.completionMenuButton.addEventListener("click", showChooser);
    elements.decreaseTextButton.addEventListener("click", () => changeTextSize(-1));
    elements.resetTextButton.addEventListener("click", () => setTextSize("medium", true));
    elements.increaseTextButton.addEventListener("click", () => changeTextSize(1));
    elements.transcriptShortcutButton.addEventListener("click", openTranscript);
    elements.soundButton.addEventListener("click", toggleSound);

    setTextSize(getStoredTextSize(), false);
    initializeScenarioCatalog();
}());
