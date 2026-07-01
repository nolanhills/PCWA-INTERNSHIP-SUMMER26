<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="Default.aspx.vb" Inherits="PrototypeWebApp._Default" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Scam Awareness Prototype</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background: #f5f5f5;
            color: #222;
        }

        .prototype {
            max-width: 800px;
            background: white;
            padding: 24px;
            border: 1px solid #ddd;
        }

        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }

        .header-row h1 {
            margin: 0;
        }

        .media-box {
            padding: 20px;
            margin: 16px 0;
            background: #111;
            color: white;
        }

        button {
            display: block;
            margin: 8px 0;
            padding: 10px 14px;
            cursor: pointer;
        }

        .main-menu-button {
            display: none;
            margin: 0;
        }

        .small {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
        <div class="prototype">
            <div class="header-row">
                <h1>Scam Awareness Prototype</h1>

                <button id="mainMenuButton" class="main-menu-button" type="button" onclick="showScenarioChooser()">
                    Main Menu
                </button>
            </div>

            <div id="scenarioChooser">
                <br />
                <button type="button" onclick="loadScenario('prototypes/active-scenario-01.xml')">
                    Load sample scenario
                </button>

                <button type="button" onclick="loadScenario('prototypes/bank-alert-scenario.xml')">
                    Load bank alert scam scenario
                </button>
            </div>

            <div id="app">Choose a scenario above to begin.</div>
        </div>
    </form>

    <script>
        let videos = {};
        let commands = {};
        let currentVideoId = null;

        function loadScenario(filePath) {
            videos = {};
            commands = {};
            currentVideoId = null;

            document.getElementById("scenarioChooser").style.display = "none";
            document.getElementById("mainMenuButton").style.display = "block";
            document.getElementById("app").innerHTML = "<p>Loading scenario...</p>";

            fetch(filePath)
                .then(response => response.text())
                .then(xmlText => {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(xmlText, "text/xml");

                    xml.querySelectorAll("video").forEach(video => {
                        videos[video.getAttribute("id")] = video.textContent;
                    });

                    xml.querySelectorAll("command").forEach(command => {
                        commands[command.getAttribute("videoId")] = command;
                    });

                    currentVideoId = Object.keys(commands)[0];
                    showScene(currentVideoId);
                })
                .catch(error => {
                    document.getElementById("app").innerHTML = "<p>Could not load XML file.</p>";
                    console.error(error);
                });
        }

        function showScene(videoId) {
            currentVideoId = videoId;

            const app = document.getElementById("app");
            const videoPath = videos[videoId] || "No video assigned";
            const command = commands[videoId];

            let html = `
                <h2>Scene ${videoId}</h2>
                <div class="media-box">
                    <strong>Video placeholder:</strong><br />
                    ${videoPath}
                </div>
            `;

            if (!command) {
                html += `
                    <p>No command found for this scene.</p>
                    <button type="button" onclick="restart()">Restart This Scenario</button>
                    <button type="button" onclick="showScenarioChooser()">Choose Another Scenario</button>
                `;
                app.innerHTML = html;
                return;
            }

            const type = command.getAttribute("type");
            const displayText = command.getAttribute("displayText") || "";

            html += `<h3>${displayText}</h3>`;

            if (type === "prompt") {
                command.querySelectorAll("option").forEach(option => {
                    const targetId = option.getAttribute("id");
                    const text = option.getAttribute("text");

                    html += `<button type="button" onclick="showScene('${targetId}')">${text}</button>`;
                });
            }
            else if (type === "download") {
                html += "<p>Files to review:</p>";

                command.querySelectorAll("file").forEach(file => {
                    html += `<p>${file.getAttribute("name")} - ${file.getAttribute("path")}</p>`;
                });

                const nextVideoId = command.getAttribute("nextVideoId");
                html += `<button type="button" onclick="showScene('${nextVideoId}')">Continue</button>`;
            }
            else if (type === "jump") {
                const targetId = command.getAttribute("targetId");
                html += `<button type="button" onclick="showScene('${targetId}')">Continue</button>`;
            }
            else if (type === "restart-or-quit") {
                html += `
                    <button type="button" onclick="restart()">Restart This Scenario</button>
                    <button type="button" onclick="showScenarioChooser()">Choose Another Scenario</button>
                `;
            }
            else if (type === "stop") {
                html += `
                    <p>The scenario has ended.</p>
                    <button type="button" onclick="restart()">Restart This Scenario</button>
                    <button type="button" onclick="showScenarioChooser()">Choose Another Scenario</button>
                `;
            }

            app.innerHTML = html;
        }

        function restart() {
            showScene(Object.keys(commands)[0]);
        }

        function showScenarioChooser() {
            videos = {};
            commands = {};
            currentVideoId = null;

            document.getElementById("scenarioChooser").style.display = "block";
            document.getElementById("mainMenuButton").style.display = "none";
            document.getElementById("app").innerHTML = "Choose a scenario above to begin.";
        }

        function quit() {
            showScenarioChooser();
        }
    </script>
</body>
</html>