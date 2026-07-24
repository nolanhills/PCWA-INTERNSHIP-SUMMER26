(function (global) {
    "use strict";

    const presentations = {
        "prototypes/active-scenario-01.xml": {
            title: "Sample branching scenario",
            summary: "Explore a general branching example that demonstrates every command supported by the XML player.",
            practiceGoal: "Practice making choices and following a scenario that can prompt, jump, show files, restart, or stop.",
            approximateStages: 8,
            stages: [
                "Opening choice",
                "First decision",
                "Second decision",
                "File review",
                "Branch",
                "Result",
                "Restart",
                "Takeaways"
            ],
            scenes: {},
            finalReview: {
                warningSigns: [
                    "Pause before acting when a message asks you to make a quick choice.",
                    "Check what information or files are being requested before continuing."
                ],
                safestAction: "When a real message feels uncertain, stop and verify it through a trusted source.",
                realWorldActions: [
                    "Leave the message or website if anything feels unusual.",
                    "Contact the organization using information you found independently.",
                    "Ask a trusted person for a second opinion."
                ]
            }
        },
        "prototypes/bank-alert-scenario.xml": {
            title: "Bank fraud alert",
            summary: "Practice responding to an unexpected bank text, a pressure call, a fake website, and a security-code request.",
            practiceGoal: "Recognize urgency, switch to a trusted contact method, and protect account credentials and security codes.",
            approximateStages: 5,
            stages: [
                "Text arrives",
                "Pressure call",
                "Verification trap",
                "Review",
                "Takeaways"
            ],
            finalReview: {
                warningSigns: [
                    "An unexpected alert creates fear about losing money.",
                    "A message includes a link and asks you to act immediately.",
                    "A caller asks you to move money to protect it.",
                    "Someone asks for a one-time security code."
                ],
                safestAction: "End the conversation and contact the bank using the number on your card, statement, or official app.",
                realWorldActions: [
                    "Do not reply to the message or use its link.",
                    "Call the bank through a number you already trust.",
                    "Never share a one-time security code with a caller.",
                    "If you shared information, contact the bank immediately and change affected passwords."
                ]
            },
            scenes: {
                "1": {
                    stageName: "Text arrives",
                    stageIndex: 1,
                    artifact: {
                        type: "text-message",
                        sender: "Bank Fraud Alert",
                        senderStatus: "Unknown sender",
                        heading: "Suspicious charge alert",
                        message: "BANK ALERT: Suspicious charge of $1,248.50 at Target. Reply YES if this was you, NO to speak with Fraud Prevention. Or use bank-secure-review.example to dispute this yourself.",
                        transcript: "A text claims there is a suspicious charge of $1,248.50. It asks for a reply or offers a link to dispute the charge."
                    },
                    question: "How would you check whether this alert is real?",
                    description: "Choose the first action you would take.",
                    warningSigns: [
                        "The message was unexpected.",
                        "It creates urgency around a large amount of money.",
                        "It asks you to reply or use a link supplied in the message."
                    ],
                    choices: {
                        "2": {
                            title: "Reply NO by text",
                            subtitle: "Continue the conversation using the number that contacted you.",
                            classification: "risky",
                            feedbackHeading: "The scammer still controls the conversation",
                            consequence: "Replying may confirm that your number is active and can lead to a convincing pressure call.",
                            explanation: "A safer verification starts through a contact method you choose yourself, not one supplied by the alert.",
                            warningSigns: [
                                "The sender controls the reply channel.",
                                "A reply can lead to more urgent contact."
                            ]
                        },
                        "3": {
                            title: "Use the link in the text",
                            subtitle: "Open the page supplied by the alert to dispute the charge.",
                            classification: "dangerous",
                            feedbackHeading: "Unexpected links can lead to imitation websites",
                            consequence: "The link can open a fake bank page designed to collect passwords and personal information.",
                            explanation: "Scammers copy familiar branding and use look-alike web addresses. Open the saved bank app or type a trusted address instead.",
                            warningSigns: [
                                "The link arrived without being requested.",
                                "The address does not match a known bank website."
                            ]
                        },
                        "4": {
                            title: "Contact the bank independently",
                            subtitle: "Open the official app or call the number printed on your card.",
                            classification: "safe",
                            feedbackHeading: "You changed to a trusted channel",
                            consequence: "You can check the account without relying on information supplied by the sender.",
                            explanation: "Choosing the contact method yourself breaks the scammer's control and gives you time to verify the claim.",
                            warningSigns: [
                                "The alert supplied its own contact route.",
                                "The message tried to rush the verification."
                            ]
                        }
                    }
                },
                "2": {
                    stageName: "Pressure call",
                    stageIndex: 2,
                    artifact: {
                        type: "phone-call",
                        caller: "Fraud Prevention Department",
                        callerStatus: "Identity not verified",
                        callStatus: "Simulated incoming call",
                        heading: "Your account is being drained",
                        message: "We see a hacker trying to empty your account. To protect your money, transfer it to a temporary government safe vault immediately.",
                        transcript: "The caller says hackers are draining the account and insists that the money must be transferred to a temporary government safe vault right now."
                    },
                    question: "What would you do while the caller is pressuring you?",
                    description: "The caller sounds calm and professional, but insists there is no time to wait.",
                    warningSigns: [
                        "The caller creates an emergency.",
                        "The caller asks for an immediate money transfer.",
                        "The caller discourages time to verify the claim."
                    ],
                    choices: {
                        "5": {
                            title: "Agree to transfer the money",
                            subtitle: "Follow the caller's instructions to move the funds.",
                            classification: "dangerous",
                            feedbackHeading: "Banks do not use secret safe-vault transfers",
                            consequence: "Money sent under the caller's direction may go directly to an account controlled by the scammer.",
                            explanation: "Urgency and unusual transfer instructions are strong signs to end the call and verify independently.",
                            warningSigns: [
                                "A request to move money to keep it safe.",
                                "Pressure to complete the transfer immediately."
                            ]
                        },
                        "7": {
                            title: "Hang up and call the bank yourself",
                            subtitle: "Use the number printed on the back of your debit card.",
                            classification: "safe",
                            feedbackHeading: "You ended the pressure and chose a trusted number",
                            consequence: "The real bank can check the account without the suspicious caller remaining involved.",
                            explanation: "Hanging up creates time to think and prevents the caller from guiding each next action.",
                            warningSigns: [
                                "The caller wanted to keep you on the line.",
                                "The caller supplied an unusual solution."
                            ]
                        },
                        "2": {
                            title: "Ask the caller to prove their identity",
                            subtitle: "Keep the call active while asking for employee details.",
                            classification: "risky",
                            feedbackHeading: "A scammer can prepare convincing details",
                            consequence: "The caller can provide a fake name, employee number, or information gathered about you.",
                            explanation: "Information supplied by the caller cannot independently verify the caller. End the call and contact the bank yourself.",
                            warningSigns: [
                                "The same caller supplies both the claim and the proof.",
                                "The pressure continues while you try to verify."
                            ]
                        }
                    }
                },
                "3": {
                    stageName: "Fake website",
                    stageIndex: 3,
                    artifact: {
                        type: "fake-website",
                        domain: "bank-secure-review.example",
                        heading: "Bank Account Verification",
                        message: "To stop the suspicious charge, verify your full identity immediately.",
                        requestedInformation: [
                            "Online banking username",
                            "Online banking password",
                            "Full Social Security number"
                        ],
                        transcript: "The page asks for a username, password, and full Social Security number. The web address came from an unexpected text and does not match a known bank address."
                    },
                    outcome: {
                        classification: "dangerous",
                        label: "Account information at risk",
                        heading: "The link led to a phishing page"
                    },
                    warningSigns: [
                        "The page was opened from an unexpected text.",
                        "The domain is unfamiliar.",
                        "The page asks for several sensitive details at once."
                    ]
                },
                "4": {
                    stageName: "Takeaways",
                    stageIndex: 5,
                    artifact: {
                        type: "narration",
                        heading: "Official account check",
                        message: "You open the official banking app yourself. The balance is correct and no suspicious charge appears.",
                        transcript: "The official banking app shows that the account is fine. The alert did not come from the bank."
                    },
                    outcome: {
                        classification: "safe",
                        label: "Account protected",
                        heading: "You verified the alert safely"
                    },
                    warningSigns: [
                        "The original message did not match the information in the official app.",
                        "The sender tried to direct the verification process."
                    ]
                },
                "5": {
                    stageName: "Verification trap",
                    stageIndex: 3,
                    artifact: {
                        type: "phone-call",
                        caller: "Fraud Prevention Department",
                        callerStatus: "Identity not verified",
                        callStatus: "Simulated call in progress",
                        heading: "A security code is requested",
                        message: "I started the secure transfer. I am texting you a verification code. Read it out loud so I can finalize the security vault.",
                        transcript: "The caller says a transfer is underway and asks the learner to read a new verification code aloud."
                    },
                    question: "What would you do when the caller asks for the code?",
                    description: "A text arrives while the caller remains on the line.",
                    warningSigns: [
                        "The caller asks for a one-time code.",
                        "The caller claims the code is needed to protect money.",
                        "The caller keeps the conversation moving quickly."
                    ],
                    choices: {
                        "8": {
                            title: "Read the code aloud",
                            subtitle: "Give the caller the number so the transfer can continue.",
                            classification: "dangerous",
                            feedbackHeading: "A security code can unlock the account",
                            consequence: "The scammer may use the code to sign in, approve a transfer, or bypass account protection.",
                            explanation: "One-time codes are intended only for the account owner. A legitimate employee should not ask you to read one aloud.",
                            warningSigns: [
                                "A caller requests a one-time code.",
                                "The code is tied to a transfer you did not initiate."
                            ]
                        },
                        "6": {
                            title: "Read the full text before speaking",
                            subtitle: "Pause and check what the security-code message actually says.",
                            classification: "safe",
                            feedbackHeading: "You paused long enough to see the warning",
                            consequence: "Reading the full message can reveal that the code must never be shared.",
                            explanation: "Slowing the conversation interrupts the scammer's pressure and gives written warnings a chance to help.",
                            warningSigns: [
                                "The caller tries to make you act before reading.",
                                "The request involves a private security code."
                            ]
                        }
                    }
                },
                "6": {
                    stageName: "Review",
                    stageIndex: 4,
                    artifact: {
                        type: "text-message",
                        sender: "Bank Security",
                        senderStatus: "Automated security message",
                        heading: "Security code: 994-123",
                        message: "Bank employees will NEVER ask for this code over the phone. Do not share it.",
                        transcript: "The security message says bank employees will never ask for this code over the phone and instructs the recipient not to share it."
                    },
                    question: "What would you do after reading the warning?",
                    description: "The caller is still waiting for an answer.",
                    warningSigns: [
                        "The text directly contradicts the caller.",
                        "The caller is asking for a code marked private."
                    ],
                    choices: {
                        "7": {
                            title: "Hang up and call the real bank",
                            subtitle: "Use the official fraud number from your card or statement.",
                            classification: "safe",
                            feedbackHeading: "You protected the code and changed channels",
                            consequence: "The scammer cannot use the code, and the real bank can help check the account.",
                            explanation: "Security codes should stay private. Ending the call prevents further pressure or requests.",
                            warningSigns: [
                                "The caller ignored a clear security warning.",
                                "The caller requested private authentication information."
                            ]
                        },
                        "8": {
                            title: "Trust the caller and share the code",
                            subtitle: "Assume the caller is an exception to the written warning.",
                            classification: "dangerous",
                            feedbackHeading: "The written warning applies to every caller",
                            consequence: "The code may allow the scammer to complete an account sign-in or money transfer.",
                            explanation: "A caller's confidence or urgency does not override the security instruction in the message.",
                            warningSigns: [
                                "The caller asks you to ignore a security warning.",
                                "The request gives someone else access to authentication."
                            ]
                        }
                    }
                },
                "7": {
                    stageName: "Takeaways",
                    stageIndex: 5,
                    artifact: {
                        type: "narration",
                        heading: "Trusted contact restored",
                        message: "You ended the suspicious conversation and contacted the bank through an official channel.",
                        transcript: "The suspicious conversation ends. The learner contacts the bank using a trusted number."
                    },
                    outcome: {
                        classification: "safe",
                        label: "Scam stopped",
                        heading: "You protected the account"
                    },
                    warningSigns: [
                        "The caller created urgency.",
                        "The caller requested unusual transfers or private codes."
                    ]
                },
                "8": {
                    stageName: "Takeaways",
                    stageIndex: 5,
                    artifact: {
                        type: "narration",
                        heading: "Security code shared",
                        message: "The scammer uses the code to bypass account protection and gain access.",
                        transcript: "After receiving the one-time code, the scammer can bypass two-factor authentication and compromise the account."
                    },
                    outcome: {
                        classification: "dangerous",
                        label: "Account compromised",
                        heading: "The scammer gained access"
                    },
                    warningSigns: [
                        "The caller requested a one-time security code.",
                        "The caller claimed normal security rules did not apply."
                    ]
                }
            }
        }
    };

    function getScenario(path) {
        return presentations[path] || null;
    }

    function getScene(path, videoId) {
        const scenario = getScenario(path);

        if (!scenario || !scenario.scenes) {
            return null;
        }

        return scenario.scenes[String(videoId)] || null;
    }

    function getChoice(path, videoId, destinationVideoId) {
        const scene = getScene(path, videoId);

        if (!scene || !scene.choices) {
            return null;
        }

        return scene.choices[String(destinationVideoId)] || null;
    }

    global.ScamScenarioPresentation = Object.freeze({
        getScenario: getScenario,
        getScene: getScene,
        getChoice: getChoice
    });
}(window));
