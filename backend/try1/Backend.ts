// Native Node.js modules
import { createRequire } from "module";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const path = require("path");
const http = require("http");

// Third-party libraries
const express = require("express");
const webSocket = require("ws");

// Custom modules
import { WsService } from "./WsService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8085;  // Use environment variable or default to 8085

const app = express();
const server = http.createServer(app);
const wsService = new WsService();
const appDir = path.resolve(__dirname, "frontend/");

function run() {
    // Serve static files
    app.use(express.static(appDir));

    // Fallback route for single-page applications
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(appDir, "index.html"));
    });

    // WebSocket setup
    const wss = new webSocket.Server({ server });

    wss.on("connection", (client) => {
        wsService.handleConnection(client);

        client.on("message", (message) => {
            wsService.handleMessage(message.toString(), client);
        });
    });

    // Start the server
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Start the application
run();
