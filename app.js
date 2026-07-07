const scenario = {
    title: "Bank fraud alert",
    startScene: "text-alert",
    totalSteps: 5,
    scenes: {
        "text-alert": {
            type: "Text message",
            heading: "A text says there is a suspicious charge.",
            description: "Choose what you would do first. There is no real bank account involved.",
            interface: "text-message",
            media: {
                type: "video",
                title: "Scene 1: Alert arrives",
                status: "Fake video panel",
                visualTitle: "Suspicious Charge Alert",
                visualText: "The phone lights up with a warning about a large purchase.",
                caption: "A text claims there was a $1,248.50 charge and offers a link or reply option."
            },
            messages: [
                {
                    from: "Bank Fraud Alert",
                    text: "Suspicious charge of $1,248.50 at Target. Reply YES if this was you, NO to speak with Fraud Prevention, or tap this secure link to dispute: bank-secure-review.example"
                }
            ],
            choices: [
                {
                    label: "Reply NO by text",
                    rating: "risky",
                    feedbackTitle: "This keeps the conversation inside the scammer's channel.",
                    feedback: "Replying can confirm your number is active and may lead to a pressure call. A safer move is to contact the bank using an official number or app.",
                    nextScene: "phone-call"
                },
                {
                    label: "Tap the link in the text",
                    rating: "dangerous",
                    feedbackTitle: "Unexpected links can lead to fake sign-in pages.",
                    feedback: "Scammers often copy bank websites to collect usernames, passwords, Social Security numbers, or security codes.",
                    nextScene: "fake-login"
                },
                {
                    label: "Open the official bank app or call the number on your card",
                    rating: "safe",
                    feedbackTitle: "Good choice: you changed to a trusted channel.",
                    feedback: "Using a saved app, bookmark, statement, or the number on your card helps avoid fake links and fake phone numbers.",
                    nextScene: "safe-ending"
                }
            ]
        },
        "phone-call": {
            type: "Phone call",
            heading: "A caller says your account is being drained.",
            description: "The caller sounds urgent and says your money must be moved immediately.",
            interface: "phone-call",
            media: {
                type: "phone-call",
                title: "Scene 2: Pressure call",
                status: "Caller audio",
                visualTitle: "Incoming call from Fraud Prevention",
                visualText: "The voice is calm but urgent, and the caller tries to keep you on the line.",
                caption: "The caller says hackers are draining the account and asks for an immediate transfer."
            },
            caller: "Fraud Prevention Department",
            callText: "We see hackers trying to empty your account. To protect your money, transfer it to a temporary government safe vault right now.",
            choices: [
                {
                    label: "Agree to transfer the money",
                    rating: "dangerous",
                    feedbackTitle: "Urgent transfer requests are a major warning sign.",
                    feedback: "Banks do not ask customers to move money to a safe vault. Scammers use fear and speed to stop people from checking.",
                    nextScene: "security-code"
                },
                {
                    label: "Ask the caller to prove who they are",
                    rating: "risky",
                    feedbackTitle: "Scammers can fake confidence and details.",
                    feedback: "A caller may know your name, bank, or part of your account information. Verification is safer when you end the call and contact the bank yourself.",
                    nextScene: "phone-call"
                },
                {
                    label: "Hang up and call the number on your debit card",
                    rating: "safe",
                    feedbackTitle: "Good choice: you ended the pressure.",
                    feedback: "Ending the call gives you time to think and lets you contact the real bank through a trusted number.",
                    nextScene: "safe-ending"
                }
            ]
        },
        "security-code": {
            type: "Security code",
            heading: "The caller asks you to read a code out loud.",
            description: "A new text arrives while the caller stays on the line.",
            interface: "text-message",
            media: {
                type: "text-message",
                title: "Scene 3: Code request",
                status: "Text and call overlap",
                visualTitle: "Security Code: 994-123",
                visualText: "The warning says bank employees will never ask for this code.",
                caption: "The caller wants the exact code while the text message warns not to share it."
            },
            messages: [
                {
                    from: "Bank Security",
                    text: "Security Code: 994-123. Bank employees will NEVER ask for this code over the phone. Do not share it."
                }
            ],
            choices: [
                {
                    label: "Read the code out loud",
                    rating: "dangerous",
                    feedbackTitle: "Never share a one-time security code.",
                    feedback: "The scammer can use that code to sign in, approve a transfer, or bypass account protection.",
                    nextScene: "danger-ending"
                },
                {
                    label: "Read the full message and hang up",
                    rating: "safe",
                    feedbackTitle: "Good choice: the warning told you what to do.",
                    feedback: "Security codes are for you only. If anyone asks for one, stop the conversation and contact the company directly.",
                    nextScene: "safe-ending"
                }
            ]
        },
        "fake-login": {
            type: "Fake website",
            heading: "The link opens a sign-in page.",
            description: "The page looks official, but the web address is strange and the form asks for too much information.",
            interface: "fake-website",
            media: {
                type: "fake-website",
                title: "Scene 2: Fake banking page",
                status: "Suspicious website",
                visualTitle: "Bank Account Verification",
                visualText: "The page copies bank language, but the address and requests are suspicious.",
                caption: "The site asks for username, password, and full Social Security number from a text link."
            },
            choices: [
                {
                    label: "Enter username, password, and Social Security number",
                    rating: "dangerous",
                    feedbackTitle: "This is a phishing trap.",
                    feedback: "A bank should not ask for your full Social Security number from a text link. Close the page and contact the bank through a trusted channel.",
                    nextScene: "danger-ending"
                },
                {
                    label: "Close the page and open the official bank app",
                    rating: "safe",
                    feedbackTitle: "Good choice: you avoided the fake page.",
                    feedback: "When a link feels suspicious, leave it and use a trusted route that you choose yourself.",
                    nextScene: "safe-ending"
                }
            ]
        },
        "safe-ending": {
            type: "Final review",
            heading: "You protected your account.",
            description: "You used a trusted channel and avoided sharing sensitive information.",
            interface: "review",
            media: {
                type: "review",
                title: "Final review",
                status: "Protected outcome",
                visualTitle: "Account protected",
                visualText: "You paused, changed channels, and avoided sharing private information.",
                caption: "The safest pattern is to stop, leave the message or call, and contact the bank yourself."
            },
            ending: "safe"
        },
        "danger-ending": {
            type: "Final review",
            heading: "The scammer gained access.",
            description: "This outcome shows how fast a scam can move when fear, links, transfers, and security codes are involved.",
            interface: "review",
            media: {
                type: "review",
                title: "Final review",
                status: "Practice outcome",
                visualTitle: "Account at risk",
                visualText: "The scam succeeded after sensitive information or a security code was shared.",
                caption: "This is a practice result. The goal is to spot the warning signs earlier next time."
            },
            ending: "danger"
        },
        "warning-signs": {
            type: "Review",
            heading: "Warning signs to remember",
            description: "Use this checklist when a message or caller says there is an emergency with your money.",
            interface: "review",
            media: {
                type: "review",
                title: "Warning signs",
                status: "Checklist",
                visualTitle: "Pause before responding",
                visualText: "Scams often combine urgency, fear, links, transfers, and security codes.",
                caption: "A trusted channel is one you choose yourself, such as the number on your card."
            },
            ending: "checklist"
        }
    }
};

let currentSceneId = scenario.startScene;
let lastChoiceSceneId = scenario.startScene;
let sceneBeforeReview = scenario.startScene;
let history = [];

const mediaFrame = document.getElementById("mediaFrame");
const interfaceFrame = document.getElementById("interfaceFrame");
const sceneType = document.getElementById("sceneType");
const sceneHeading = document.getElementById("sceneHeading");
const sceneDescription = document.getElementById("sceneDescription");
const choices = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const stepCount = document.getElementById("stepCount");
const progressFill = document.getElementById("progressFill");
const tryAgainButton = document.getElementById("tryAgainButton");
const reviewButton = document.getElementById("reviewButton");
const restartButton = document.getElementById("restartButton");

function renderScene(sceneId) {
    const scene = scenario.scenes[sceneId];
    currentSceneId = sceneId;

    sceneType.textContent = scene.type;
    sceneHeading.textContent = scene.heading;
    sceneDescription.textContent = scene.description;
    updateProgress(scene);

    feedback.hidden = true;
    feedback.className = "feedback";
    feedback.innerHTML = "";
    tryAgainButton.hidden = true;
    reviewButton.hidden = sceneId === "warning-signs";

    mediaFrame.innerHTML = createMediaPanel(scene);
    renderInterface(scene);
    renderChoices(scene);
}

function updateProgress(scene) {
    const isReviewScene = !scene.choices;
    const visibleStep = Math.min(history.length + 1, scenario.totalSteps);
    const percent = isReviewScene ? 100 : Math.min((visibleStep / scenario.totalSteps) * 100, 100);

    stepCount.textContent = isReviewScene ? "Review" : `${visibleStep} of ${scenario.totalSteps}`;
    progressFill.style.width = `${percent}%`;
}

function renderInterface(scene) {
    if (scene.interface === "text-message") {
        interfaceFrame.innerHTML = createTextInterface(scene);
        return;
    }

    if (scene.interface === "phone-call") {
        interfaceFrame.innerHTML = createCallInterface(scene);
        return;
    }

    if (scene.interface === "fake-website") {
        interfaceFrame.innerHTML = createFakeWebsiteInterface();
        return;
    }

    interfaceFrame.innerHTML = createReviewInterface(scene);
}

function renderChoices(scene) {
    choices.innerHTML = "";

    if (!scene.choices) {
        if (currentSceneId !== "warning-signs") {
            const reviewButtonElement = document.createElement("button");
            reviewButtonElement.className = "primary-button";
            reviewButtonElement.type = "button";
            reviewButtonElement.textContent = "Review Warning Signs";
            reviewButtonElement.addEventListener("click", showWarningSigns);
            choices.appendChild(reviewButtonElement);
        } else {
            const returnButtonElement = document.createElement("button");
            returnButtonElement.className = "primary-button";
            returnButtonElement.type = "button";
            returnButtonElement.textContent = "Return to Scenario";
            returnButtonElement.addEventListener("click", () => renderScene(sceneBeforeReview));
            choices.appendChild(returnButtonElement);
        }

        const restartButtonElement = document.createElement("button");
        restartButtonElement.className = "secondary-button";
        restartButtonElement.type = "button";
        restartButtonElement.textContent = "Restart Scenario";
        restartButtonElement.addEventListener("click", restartScenario);
        choices.appendChild(restartButtonElement);
        return;
    }

    scene.choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.className = "choice-button";
        button.type = "button";
        button.innerHTML = `
            <span class="choice-number">Choice ${index + 1}</span>
            <span>${choice.label}</span>
        `;
        button.addEventListener("click", () => chooseOption(choice));
        choices.appendChild(button);
    });
}

function chooseOption(choice) {
    lastChoiceSceneId = currentSceneId;

    history.push({
        scene: scenario.scenes[currentSceneId].heading,
        choice: choice.label,
        rating: choice.rating,
        feedbackTitle: choice.feedbackTitle
    });

    feedback.hidden = false;
    feedback.className = `feedback ${choice.rating}`;
    feedback.innerHTML = `
        <h3>${getRatingLabel(choice.rating)}: ${choice.feedbackTitle}</h3>
        <p>${choice.feedback}</p>
        <button class="primary-button" type="button" id="continueButton">Continue</button>
    `;

    choices.innerHTML = "";
    tryAgainButton.hidden = false;

    document.getElementById("continueButton").addEventListener("click", () => {
        renderScene(choice.nextScene);
    });
}

function createMediaPanel(scene) {
    const media = scene.media;
    const mediaBody = media.src ? createRealVideo(media) : createFakeVideoFrame(media);

    return `
        <div class="media-panel" data-media-type="${media.type}">
            <div class="media-topline">
                <span class="media-pill">${formatMediaType(media.type)}</span>
                <span class="media-status">${media.status}</span>
            </div>
            ${mediaBody}
            ${createPlayerControls(media)}
            <div class="caption-box">
                <strong>Transcript</strong>
                <p>${media.caption}</p>
            </div>
        </div>
    `;
}

function createRealVideo(media) {
    return `
        <video class="real-video" controls preload="metadata">
            <source src="${media.src}" type="video/mp4">
            This browser cannot play the local video file.
        </video>
    `;
}

function createFakeVideoFrame(media) {
    return `
        <div class="video-frame" aria-label="${media.title}">
            <div class="frame-art">
                ${createFrameArt(media)}
            </div>
        </div>
    `;
}

function createFrameArt(media) {
    if (media.type === "phone-call") {
        return `
            <div class="audio-panel">
                <strong>${media.visualTitle}</strong>
                <span class="call-status">Caller audio active</span>
                <div class="audio-bars" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
                <p class="frame-text">${media.visualText}</p>
            </div>
        `;
    }

    if (media.type === "text-message") {
        return `
            <div class="alert-card">
                <strong>${media.visualTitle}</strong>
                <p class="frame-text">${media.visualText}</p>
            </div>
        `;
    }

    if (media.type === "fake-website") {
        return `
            <div class="browser-preview">
                <span class="browser-bar">bank-secure-review.example/login</span>
                <strong>${media.visualTitle}</strong>
                <p class="frame-text">${media.visualText}</p>
            </div>
        `;
    }

    if (media.type === "review") {
        return `
            <div class="review-visual">
                <strong>${media.visualTitle}</strong>
                <p class="frame-text">${media.visualText}</p>
            </div>
        `;
    }

    return `
        <span class="frame-title">${media.visualTitle}</span>
        <p class="frame-text">${media.visualText}</p>
    `;
}

function createPlayerControls(media) {
    if (media.src) {
        return `
            <div class="player-controls" aria-hidden="true">
                <span class="control-button">Video file</span>
                <span class="control-button">Native controls</span>
                <span class="timeline"><span style="width: 100%;"></span></span>
                <span>${media.title}</span>
            </div>
        `;
    }

    return `
        <div class="player-controls" aria-hidden="true">
            <span class="control-button">Play</span>
            <span class="control-button">Pause</span>
            <span class="timeline"><span></span></span>
            <span>${media.title}</span>
        </div>
    `;
}

function createTextInterface(scene) {
    const messages = scene.messages.map((message) => {
        const userClass = message.direction === "user" ? " user" : "";

        return `
            <div class="text-bubble${userClass}">
                <strong>${message.from}</strong>
                <p>${message.text}</p>
            </div>
        `;
    }).join("");

    return `
        <div class="phone-shell" aria-label="Simulated phone text message">
            <div class="phone-speaker" aria-hidden="true"></div>
            <div class="phone-screen">
                <div class="phone-top">
                    <span>9:41 AM</span>
                    <span>Messages</span>
                </div>
                <div class="phone-contact">
                    <strong>Bank Security</strong>
                    <span>Unknown sender</span>
                </div>
                <div class="message-thread">
                    ${messages}
                </div>
                <div class="compose-bar" aria-hidden="true">Text message</div>
            </div>
        </div>
    `;
}

function createCallInterface(scene) {
    return `
        <div class="phone-shell" aria-label="Simulated incoming phone call">
            <div class="phone-speaker" aria-hidden="true"></div>
            <div class="phone-screen">
                <div class="phone-top">
                    <span>9:43 AM</span>
                    <span>Phone</span>
                </div>
                <div class="call-card">
                    <span class="call-status">Incoming call</span>
                    <div class="caller-avatar" aria-hidden="true">${getInitials(scene.caller)}</div>
                    <h3>${scene.caller}</h3>
                    <p>${scene.callText}</p>
                    <div class="call-actions" aria-hidden="true">
                        <span class="call-action end">End</span>
                        <span class="call-action">Keypad</span>
                        <span class="call-action">Speaker</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createFakeWebsiteInterface() {
    return `
        <div class="fake-screen" aria-label="Simulated fake bank website">
            <div class="browser-chrome">
                <span class="fake-address">bank-secure-review.example/login</span>
            </div>
            <div class="fake-site-body">
                <span class="fake-logo">Secure Bank Center</span>
                <h3>Bank Account Verification</h3>
                <p>To stop the suspicious charge, verify your full identity immediately.</p>
                <div class="fake-form" aria-hidden="true">
                    <label>Username</label>
                    <div class="fake-input">Required</div>
                    <label>Password</label>
                    <div class="fake-input">Required</div>
                    <label>Full Social Security Number</label>
                    <div class="fake-input">Required</div>
                </div>
            </div>
        </div>
    `;
}

function createReviewInterface(scene) {
    const safeChoices = history.filter((item) => item.rating === "safe").length;
    const riskyChoices = history.filter((item) => item.rating === "risky").length;
    const dangerousChoices = history.filter((item) => item.rating === "dangerous").length;

    if (scene.ending === "checklist") {
        return `
            <div class="review-card">
                <h3>Warning Signs</h3>
                <ul>
                    <li>Unexpected messages about money, charges, or account trouble.</li>
                    <li>Pressure to act immediately.</li>
                    <li>Links that ask you to sign in or give personal information.</li>
                    <li>Requests to transfer money to protect it.</li>
                    <li>Anyone asking for a one-time security code.</li>
                </ul>
            </div>
        `;
    }

    return `
        <div class="review-card">
            <span class="review-score">${safeChoices} safe, ${riskyChoices} risky, ${dangerousChoices} dangerous</span>
            <h3>Your Path</h3>
            ${createHistoryList()}
            <h3>Safer Real-World Actions</h3>
            <ul>
                <li>Pause before responding to urgent money messages.</li>
                <li>Do not tap links in unexpected texts.</li>
                <li>Call the number on your card or bank statement.</li>
                <li>Never share a one-time security code with a caller.</li>
            </ul>
        </div>
    `;
}

function createHistoryList() {
    if (history.length === 0) {
        return "<p>No choices recorded yet.</p>";
    }

    const items = history.map((item) => `
        <li>
            <strong>${getRatingLabel(item.rating)}:</strong>
            ${item.choice}
        </li>
    `).join("");

    return `<ul>${items}</ul>`;
}

function formatMediaType(mediaType) {
    if (mediaType === "phone-call") {
        return "Phone call";
    }

    if (mediaType === "text-message") {
        return "Text message";
    }

    if (mediaType === "fake-website") {
        return "Fake website";
    }

    if (mediaType === "review") {
        return "Review";
    }

    return "Video";
}

function getRatingLabel(rating) {
    if (rating === "safe") {
        return "Safe choice";
    }

    if (rating === "risky") {
        return "Risky choice";
    }

    return "Dangerous choice";
}

function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function restartScenario() {
    history = [];
    sceneBeforeReview = scenario.startScene;
    renderScene(scenario.startScene);
}

function showWarningSigns() {
    if (currentSceneId !== "warning-signs") {
        sceneBeforeReview = currentSceneId;
    }

    renderScene("warning-signs");
}

tryAgainButton.addEventListener("click", () => {
    if (history.length > 0) {
        history.pop();
    }

    renderScene(lastChoiceSceneId);
});

reviewButton.addEventListener("click", () => {
    showWarningSigns();
});

restartButton.addEventListener("click", restartScenario);

document.getElementById("scenarioTitle").textContent = scenario.title;
renderScene(scenario.startScene);
