(function (global) {
    "use strict";

    const availableScenarios = Object.freeze([
        Object.freeze({
            id: "sample-scenario",
            path: "prototypes/active-scenario-01.xml"
        }),
        Object.freeze({
            id: "bank-alert",
            path: "prototypes/bank-alert-scenario.xml"
        })
    ]);

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

            Array.from(commandElement.getElementsByTagName("option")).forEach(
                (optionElement, optionIndex) => {
                    command.options.push({
                        destinationVideoId: requiredAttribute(
                            optionElement,
                            "id",
                            `Option ${optionIndex + 1} in scene ${videoId}`
                        ),
                        text: optionElement.getAttribute("text") || ""
                    });
                }
            );

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
            startVideoId: commands[0].videoId
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
            subscribe: subscribe
        });
    }

    global.ScamScenarioEngine = Object.freeze({
        getAvailableScenarios: function () {
            return availableScenarios.map((scenario) => Object.assign({}, scenario));
        },
        create: createScenarioEngine,
        ScenarioEngineError: ScenarioEngineError
    });
}(window));
