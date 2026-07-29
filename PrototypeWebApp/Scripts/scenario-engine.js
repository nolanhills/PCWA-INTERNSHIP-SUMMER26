(function (global) {
    "use strict";

    let availableScenarios = [];

    class ScenarioEngineError extends Error {
        constructor(code, message) {
            super(message);
            this.name = "ScenarioEngineError";
            this.code = code;
        }
    }

    function requiredAttribute(element, name, context) {
        const value = element.getAttribute(name);

        if (value === null || value.trim() === "") {
            throw new ScenarioEngineError(
                "malformed-xml",
                `${context} is missing the required ${name} attribute.`
            );
        }

        return value;
    }

    function directChild(element, tagName) {
        return Array.from(element.children).find(
            (child) => child.tagName === tagName
        ) || null;
    }

    function childText(element, tagName) {
        const child = directChild(element, tagName);
        return child ? child.textContent.trim() : "";
    }

    function childTextList(element, containerName, itemName) {
        const container = directChild(element, containerName);

        if (!container) {
            return [];
        }

        return Array.from(container.children)
            .filter((child) => child.tagName === itemName)
            .map((child) => child.textContent.trim())
            .filter(Boolean);
    }

    function parseBoolean(value, defaultValue) {
        if (value === null || value === undefined || value === "") {
            return defaultValue;
        }

        return /^(true|1|yes)$/i.test(value.trim());
    }

    function parsePositiveInteger(value) {
        const number = Number(value);

        return Number.isInteger(number) && number > 0 ? number : null;
    }

    function parseArtifact(artifactElement) {
        if (!artifactElement) {
            return null;
        }

        const artifact = {
            type: artifactElement.getAttribute("type") || "narration",
            sender: childText(artifactElement, "sender"),
            senderStatus: childText(artifactElement, "senderStatus"),
            caller: childText(artifactElement, "caller"),
            callerStatus: childText(artifactElement, "callerStatus"),
            callStatus: childText(artifactElement, "callStatus"),
            domain: childText(artifactElement, "domain"),
            heading: childText(artifactElement, "heading"),
            message: childText(artifactElement, "message") ||
                childText(artifactElement, "content"),
            transcript: childText(artifactElement, "transcript"),
            requestedInformation: childTextList(
                artifactElement,
                "requestedInformation",
                "item"
            )
        };
        const mediaElement = directChild(artifactElement, "media");

        if (mediaElement) {
            const videoPath = mediaElement.getAttribute("video") || "";
            const audioPath = mediaElement.getAttribute("audio") || "";
            const mediaPath = videoPath || audioPath;

            artifact.mediaSrc = mediaPath;
            artifact.mediaPath = mediaPath;
            artifact.posterSrc = mediaElement.getAttribute("poster") || "";
            artifact.captionSrc = mediaElement.getAttribute("captions") || "";
            artifact.mediaAvailable = parseBoolean(
                mediaElement.getAttribute("available"),
                Boolean(mediaPath)
            );
        }

        return artifact;
    }

    function parseChoice(choiceElement) {
        const destinationVideoId = requiredAttribute(
            choiceElement,
            "destinationVideoId",
            "Presentation choice"
        );
        const feedbackElement = directChild(choiceElement, "feedback");

        return {
            choiceId: (choiceElement.getAttribute("choiceId") || "").trim(),
            destinationVideoId: destinationVideoId,
            metadata: {
                title: childText(choiceElement, "title"),
                subtitle: childText(choiceElement, "subtitle"),
                classification: choiceElement.getAttribute("classification") || "neutral",
                feedbackHeading: feedbackElement
                    ? feedbackElement.getAttribute("heading") ||
                        childText(feedbackElement, "heading")
                    : "",
                consequence: feedbackElement
                    ? childText(feedbackElement, "consequence")
                    : "",
                explanation: feedbackElement
                    ? childText(feedbackElement, "explanation")
                    : "",
                warningSigns: feedbackElement
                    ? childTextList(feedbackElement, "warningSigns", "sign")
                    : []
            }
        };
    }

    function parseOutcome(outcomeElement) {
        if (!outcomeElement) {
            return null;
        }

        return {
            classification: outcomeElement.getAttribute("classification") || "neutral",
            label: childText(outcomeElement, "label"),
            heading: childText(outcomeElement, "heading"),
            explanation: childText(outcomeElement, "explanation")
        };
    }

    function parsePresentation(playlist) {
        const presentationElement = directChild(playlist, "presentation");

        if (!presentationElement) {
            return null;
        }

        const stages = childTextList(presentationElement, "stages", "stage");
        const scenes = {};
        const scenesElement = directChild(presentationElement, "scenes");
        const finalReviewElement = directChild(presentationElement, "finalReview");

        if (scenesElement) {
            Array.from(scenesElement.children)
                .filter((child) => child.tagName === "scene")
                .forEach((sceneElement) => {
                    const videoId = requiredAttribute(
                        sceneElement,
                        "videoId",
                        "Presentation scene"
                    );
                    const choices = {};
                    const choicesById = {};
                    const choicesElement = directChild(sceneElement, "choices");

                    if (choicesElement) {
                        Array.from(choicesElement.children)
                            .filter((child) => child.tagName === "choice")
                            .forEach((choiceElement) => {
                                const parsedChoice = parseChoice(choiceElement);

                                if (parsedChoice.choiceId) {
                                    if (choicesById[parsedChoice.choiceId]) {
                                        throw new ScenarioEngineError(
                                            "malformed-xml",
                                            `Presentation scene ${videoId} contains duplicate choiceId ${parsedChoice.choiceId}.`
                                        );
                                    }

                                    choicesById[parsedChoice.choiceId] =
                                        parsedChoice.metadata;
                                }

                                if (Object.prototype.hasOwnProperty.call(
                                    choices,
                                    parsedChoice.destinationVideoId
                                )) {
                                    choices[parsedChoice.destinationVideoId] = null;
                                } else {
                                    choices[parsedChoice.destinationVideoId] =
                                        parsedChoice.metadata;
                                }
                            });
                    }

                    scenes[videoId] = {
                        stageName: sceneElement.getAttribute("stageName") || "",
                        stageIndex: Number(sceneElement.getAttribute("stageIndex")) || null,
                        artifact: parseArtifact(directChild(sceneElement, "artifact")),
                        question: childText(sceneElement, "question"),
                        description: childText(sceneElement, "description"),
                        warningSigns: childTextList(
                            sceneElement,
                            "warningSigns",
                            "sign"
                        ),
                        choices: choices,
                        choicesById: choicesById,
                        outcome: parseOutcome(directChild(sceneElement, "outcome"))
                    };
                });
        }

        return {
            title: childText(presentationElement, "title"),
            summary: childText(presentationElement, "summary"),
            practiceGoal: childText(presentationElement, "practiceGoal"),
            approximateStages: Number(
                presentationElement.getAttribute("approximateStages")
            ) || stages.length || null,
            stages: stages,
            scenes: scenes,
            finalReview: finalReviewElement
                ? {
                    warningSigns: childTextList(
                        finalReviewElement,
                        "warningSigns",
                        "sign"
                    ),
                    safestAction: childText(finalReviewElement, "safestAction"),
                    realWorldActions: childTextList(
                        finalReviewElement,
                        "realWorldActions",
                        "action"
                    )
                }
                : null
        };
    }

    function parseScenarioCatalogXml(xmlText) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const parserError = xml.getElementsByTagName("parsererror")[0];

        if (parserError) {
            throw new ScenarioEngineError(
                "malformed-catalog",
                "The scenario catalog contains XML that the browser could not read."
            );
        }

        const catalog = xml.getElementsByTagName("scenarios")[0];

        if (!catalog) {
            throw new ScenarioEngineError(
                "malformed-catalog",
                "The scenario catalog does not contain a scenarios element."
            );
        }

        const scenarios = Array.from(catalog.children)
            .filter((child) => child.tagName === "scenario")
            .map((scenarioElement, index) => ({
                id: requiredAttribute(
                    scenarioElement,
                    "id",
                    `Catalog scenario ${index + 1}`
                ),
                title: childText(scenarioElement, "title"),
                description: childText(scenarioElement, "description"),
                path: childText(scenarioElement, "file"),
                approximateStages: parsePositiveInteger(
                    scenarioElement.getAttribute("approximateStages")
                ),
                enabled: parseBoolean(
                    scenarioElement.getAttribute("enabled"),
                    true
                )
            }));

        scenarios.forEach((scenario, index) => {
            if (!scenario.path) {
                throw new ScenarioEngineError(
                    "malformed-catalog",
                    `Catalog scenario ${index + 1} does not specify a file.`
                );
            }
        });

        return scenarios;
    }

    async function loadScenarioCatalog(path) {
        try {
            const response = await fetch(path, { cache: "no-store" });

            if (!response.ok) {
                throw new ScenarioEngineError(
                    "catalog-load-failed",
                    `The scenario catalog could not be loaded (status ${response.status}).`
                );
            }

            availableScenarios = parseScenarioCatalogXml(await response.text());

            if (!availableScenarios.some((scenario) => scenario.enabled)) {
                throw new ScenarioEngineError(
                    "no-enabled-scenarios",
                    "The scenario catalog does not contain any enabled scenarios."
                );
            }

            return availableScenarios
                .filter((scenario) => scenario.enabled)
                .map((scenario) => Object.assign({}, scenario));
        } catch (error) {
            availableScenarios = [];
            throw error instanceof ScenarioEngineError
                ? error
                : new ScenarioEngineError(
                    "catalog-load-failed",
                    "The scenario catalog could not be loaded."
                );
        }
    }

    function parseScenarioXml(xmlText, path) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const parserError = xml.getElementsByTagName("parsererror")[0];

        if (parserError) {
            throw new ScenarioEngineError(
                "malformed-xml",
                "The scenario file contains XML that the browser could not read."
            );
        }

        const playlist = xml.getElementsByTagName("playlist")[0];

        if (!playlist) {
            throw new ScenarioEngineError(
                "malformed-xml",
                "The scenario file does not contain a playlist."
            );
        }

        const videos = [];
        const videoById = new Map();
        const videoElements = Array.from(playlist.getElementsByTagName("video"));

        videoElements.forEach((videoElement, index) => {
            const id = requiredAttribute(videoElement, "id", `Video ${index + 1}`);
            const video = {
                id: id,
                path: videoElement.textContent.trim()
            };

            videos.push(video);
            videoById.set(id, video);
        });

        const commands = [];
        const commandByVideoId = new Map();
        const commandElements = Array.from(playlist.getElementsByTagName("command"));

        commandElements.forEach((commandElement, index) => {
            const type = requiredAttribute(commandElement, "type", `Command ${index + 1}`);
            const videoId = requiredAttribute(
                commandElement,
                "videoId",
                `Command ${index + 1}`
            );
            const command = {
                type: type,
                videoId: videoId,
                displayText: commandElement.getAttribute("displayText") || "",
                nextVideoId: commandElement.getAttribute("nextVideoId"),
                targetId: commandElement.getAttribute("targetId"),
                options: [],
                files: []
            };
            const choiceIds = new Set();
            const destinationCounts = new Map();

            Array.from(commandElement.getElementsByTagName("option")).forEach(
                (optionElement, optionIndex) => {
                    const choiceId = (optionElement.getAttribute("choiceId") || "").trim();
                    const destinationVideoId = requiredAttribute(
                        optionElement,
                        "id",
                        `Option ${optionIndex + 1} in scene ${videoId}`
                    );

                    if (choiceId && choiceIds.has(choiceId)) {
                        throw new ScenarioEngineError(
                            "malformed-xml",
                            `Prompt ${videoId} contains duplicate choiceId ${choiceId}.`
                        );
                    }

                    if (choiceId) {
                        choiceIds.add(choiceId);
                    }

                    destinationCounts.set(
                        destinationVideoId,
                        (destinationCounts.get(destinationVideoId) || 0) + 1
                    );
                    command.options.push({
                        choiceId: choiceId,
                        destinationVideoId: destinationVideoId,
                        text: optionElement.getAttribute("text") || ""
                    });
                }
            );

            destinationCounts.forEach((count, destinationVideoId) => {
                if (count < 2) {
                    return;
                }

                const sharedOptions = command.options.filter(
                    (option) => option.destinationVideoId === destinationVideoId
                );

                if (sharedOptions.some((option) => !option.choiceId)) {
                    throw new ScenarioEngineError(
                        "malformed-xml",
                        `Prompt ${videoId} has multiple choices for destination ${destinationVideoId}; each requires a unique choiceId.`
                    );
                }
            });

            Array.from(commandElement.getElementsByTagName("file")).forEach(
                (fileElement) => {
                    command.files.push({
                        name: fileElement.getAttribute("name") || "File",
                        path: fileElement.getAttribute("path") || ""
                    });
                }
            );

            commands.push(command);
            commandByVideoId.set(videoId, command);
        });

        if (commands.length === 0) {
            throw new ScenarioEngineError(
                "no-commands",
                "The scenario does not contain any commands to play."
            );
        }

        return {
            path: path,
            videos: videos,
            videoById: videoById,
            commands: commands,
            commandByVideoId: commandByVideoId,
            startVideoId: commands[0].videoId,
            presentation: parsePresentation(playlist)
        };
    }

    function createScenarioEngine() {
        const listeners = new Set();
        let scenario = null;
        let currentVideoId = null;
        let pendingChoice = null;

        function notify(type, detail) {
            listeners.forEach((listener) => {
                listener({
                    type: type,
                    detail: detail || {}
                });
            });
        }

        function reportError(error) {
            const engineError = error instanceof ScenarioEngineError
                ? error
                : new ScenarioEngineError(
                    "unexpected-error",
                    "The scenario could not continue."
                );

            notify("error", { error: engineError });
            return engineError;
        }

        function requireLoadedScenario() {
            if (!scenario) {
                throw new ScenarioEngineError(
                    "not-loaded",
                    "Choose and load a scenario before continuing."
                );
            }
        }

        function getCurrentScene() {
            if (!scenario || currentVideoId === null) {
                return null;
            }

            return {
                id: currentVideoId,
                video: scenario.videoById.get(currentVideoId) || null,
                command: scenario.commandByVideoId.get(currentVideoId) || null
            };
        }

        function getPresentation() {
            return scenario ? scenario.presentation : null;
        }

        function getState() {
            return {
                isLoaded: scenario !== null,
                scenarioPath: scenario ? scenario.path : null,
                startVideoId: scenario ? scenario.startVideoId : null,
                currentVideoId: currentVideoId,
                currentScene: getCurrentScene(),
                commandCount: scenario ? scenario.commands.length : 0,
                hasPendingChoice: pendingChoice !== null
            };
        }

        function emitCurrentScene(eventType) {
            const scene = getCurrentScene();

            notify(eventType || "scene-changed", {
                state: getState(),
                scene: scene
            });

            if (scene && scene.command && scene.command.type === "stop") {
                notify("scenario-ended", {
                    state: getState(),
                    scene: scene
                });
            }

            return scene;
        }

        function transitionTo(videoId) {
            requireLoadedScenario();

            const destination = String(videoId);
            const destinationExists =
                scenario.videoById.has(destination) ||
                scenario.commandByVideoId.has(destination);

            if (!destinationExists) {
                throw reportError(
                    new ScenarioEngineError(
                        "missing-destination",
                        `The scenario points to scene ${destination}, but that scene does not exist.`
                    )
                );
            }

            currentVideoId = destination;
            pendingChoice = null;
            return emitCurrentScene("scene-changed");
        }

        async function loadScenario(path) {
            scenario = null;
            currentVideoId = null;
            pendingChoice = null;
            notify("loading", { path: path });

            try {
                const response = await fetch(path, { cache: "no-store" });

                if (!response.ok) {
                    throw new ScenarioEngineError(
                        "load-failed",
                        `The scenario file could not be loaded (status ${response.status}).`
                    );
                }

                const xmlText = await response.text();
                scenario = parseScenarioXml(xmlText, path);
                currentVideoId = scenario.startVideoId;

                notify("scenario-loaded", {
                    state: getState(),
                    scenario: {
                        path: scenario.path,
                        startVideoId: scenario.startVideoId,
                        commandCount: scenario.commands.length
                    }
                });

                return getState();
            } catch (error) {
                scenario = null;
                currentVideoId = null;
                pendingChoice = null;
                throw reportError(error);
            }
        }

        function start() {
            requireLoadedScenario();
            pendingChoice = null;
            return emitCurrentScene("scenario-started");
        }

        function selectOption(optionIndex) {
            requireLoadedScenario();

            const scene = getCurrentScene();
            const command = scene ? scene.command : null;

            if (!command || command.type !== "prompt") {
                throw reportError(
                    new ScenarioEngineError(
                        "invalid-choice",
                        "This scene does not contain a decision."
                    )
                );
            }

            const option = command.options[optionIndex];

            if (!option) {
                throw reportError(
                    new ScenarioEngineError(
                        "invalid-choice",
                        "The selected option is not available in this scene."
                    )
                );
            }

            pendingChoice = {
                optionIndex: optionIndex,
                choiceId: option.choiceId,
                sourceVideoId: currentVideoId,
                destinationVideoId: option.destinationVideoId,
                text: option.text
            };

            notify("choice-selected", {
                state: getState(),
                choice: Object.assign({}, pendingChoice)
            });

            return Object.assign({}, pendingChoice);
        }

        function continueAfterChoice() {
            requireLoadedScenario();

            if (!pendingChoice) {
                throw reportError(
                    new ScenarioEngineError(
                        "no-pending-choice",
                        "Choose an option before continuing."
                    )
                );
            }

            return transitionTo(pendingChoice.destinationVideoId);
        }

        function continueCommand() {
            requireLoadedScenario();

            const scene = getCurrentScene();
            const command = scene ? scene.command : null;

            if (!command) {
                throw reportError(
                    new ScenarioEngineError(
                        "missing-command",
                        `No command is assigned to scene ${currentVideoId}.`
                    )
                );
            }

            if (command.type === "download") {
                if (!command.nextVideoId) {
                    throw reportError(
                        new ScenarioEngineError(
                            "missing-destination",
                            "The download command does not specify its next scene."
                        )
                    );
                }

                return transitionTo(command.nextVideoId);
            }

            if (command.type === "jump") {
                if (!command.targetId) {
                    throw reportError(
                        new ScenarioEngineError(
                            "missing-destination",
                            "The jump command does not specify its destination."
                        )
                    );
                }

                return transitionTo(command.targetId);
            }

            throw reportError(
                new ScenarioEngineError(
                    "unsupported-continuation",
                    `The ${command.type} command does not use a standard Continue action.`
                )
            );
        }

        function restart() {
            requireLoadedScenario();
            currentVideoId = scenario.startVideoId;
            pendingChoice = null;
            return emitCurrentScene("scenario-restarted");
        }

        function clear() {
            scenario = null;
            currentVideoId = null;
            pendingChoice = null;
            notify("scenario-cleared", {});
        }

        function subscribe(listener) {
            listeners.add(listener);

            return function unsubscribe() {
                listeners.delete(listener);
            };
        }

        return Object.freeze({
            loadScenario: loadScenario,
            start: start,
            selectOption: selectOption,
            continueAfterChoice: continueAfterChoice,
            continueCommand: continueCommand,
            transitionTo: transitionTo,
            restart: restart,
            clear: clear,
            getState: getState,
            getCurrentScene: getCurrentScene,
            getPresentation: getPresentation,
            subscribe: subscribe
        });
    }

    global.ScamScenarioEngine = Object.freeze({
        loadCatalog: loadScenarioCatalog,
        getAvailableScenarios: function () {
            return availableScenarios
                .filter((scenario) => scenario.enabled)
                .map((scenario) => Object.assign({}, scenario));
        },
        create: createScenarioEngine,
        ScenarioEngineError: ScenarioEngineError
    });
}(window));
