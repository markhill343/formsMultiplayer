const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Datastore = require('nedb');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Initialize NeDB databases
const canvasDB = new Datastore({ filename: './canvas.db', autoload: true });
const eventDB = new Datastore({ filename: './event.db', autoload: true });

eventDB.ensureIndex({ fieldName: 'eventId', unique: true }, function (err) {
    if (err) console.error("Error creating unique index for eventId:", err);
});


app.use(cors()); // To handle CORS issues
app.use(express.json()); // For parsing JSON request bodies

// Canvas Routes:

// Create new canvas
app.post('/api/canvas', (req, res) => {
    const canvas = req.body;
    canvas.id = uuidv4();
    canvasDB.insert(canvas, (err, newDoc) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).json(newDoc);
    });
});

// Get all canvases
app.get('/api/canvas', (req, res) => {
    canvasDB.find({}, (err, docs) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(docs);
    });
});

// Get a specific canvas
app.get('/api/canvas/:canvasId', (req, res) => {
    const canvasId = req.params.canvasId;
    canvasDB.findOne({ _id: canvasId }, (err, doc) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (!doc) {
            res.status(404).send({ message: 'Canvas not found!' });
            return;
        }
        res.json(doc);
    });
});

// Event Routes:

// Create a new event
app.post('/api/event', (req, res) => {
    const event = req.body;
    console.log("create new event" + req.body)
    eventDB.insert(event, (err, newDoc) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).json(newDoc);
    });
});

// Websockets Event:
wss.on('connection', (ws) => {
    // Handle new WebSocket connection
    const clientId = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    ws.send(JSON.stringify({ command: 'register', clientId }));

    ws.on('message', (message) => {
        // Handle incoming messages
        const data = JSON.parse(message);

        switch (data.command) {
            case 'registerForCanvas':
                const canvasId = data.canvasId;
                canvasDB.findOne({ id: canvasId }, (err, canvas) => {
                    if (canvas) {
                        eventDB.find({ canvasId: canvas.id }, (err, events) => {
                            console.log("Retrieved events:", events.command);  // <-- Add this line
                            ws.send(JSON.stringify({ command: 'eventsCanvas', events }));
                        });
                    }
                });
                break;

            case 'unregisterForCanvas':

                break;

            case 'event':
                const event = data;
                event.eventId = uuidv4();  // Assign a unique UUID to the eventId
                eventDB.insert(event, (err, newDoc) => {
                    if (err) {
                        if (err.errorType === "uniqueViolated") {
                            console.error("Unique constraint violated:", err);
                            // You can return an error response or handle it in another way.
                            return;
                        }
                        res.status(500).send(err);
                        return;
                    }
                    console.log("getting event ready for fast looking")
                    canvasDB.findOne({ id: data.canvasId }, (err, canvas) => {
                        if (canvas) {
                            // Broadcast the event to all connected clients
                            wss.clients.forEach((client) => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({ command: 'event', event: newDoc }));
                                }
                            });
                        }
                    });
                });
                break;

            default:
                console.log('Unknown command:', data.command);
        }
    });

    ws.on('close', () => {
        // Handle WebSocket closed
    });
});

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
