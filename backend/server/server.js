const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Datastore = require('nedb');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const canvasDB = new Datastore();
const eventDB = new Datastore();

app.use(cors()); // To handle CORS issues
app.use(express.json()); // For parsing JSON request bodies

// Canvas Routes:

// Create new canvas
app.post('/api/canvas', (req, res) => {
    const canvas = {};
    console.log("create ")
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
    console.log("get all ")
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
    console.log("create id ")
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
    eventDB.insert(event, (err, newDoc) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).json(newDoc);
    });
});

// Websockets Event:
io.on('connection', (socket) => {
    // Register client with a unique color code
    const clientId = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    socket.emit('register', { clientId });

    socket.on('disconnect', () => {
        // Handle client disconnection if needed
    });

    // Listen for client registration for a specific canvas
    socket.on('registerForCanvas', (canvasId) => {
        canvasDB.findOne({ _id: canvasId }, (err, canvas) => {
            if (canvas) {
                socket.join(canvasId);
                eventDB.find({ canvasId: canvas._id }, (err, events) => {
                    socket.emit('eventsForCanvas', events);
                });
            }
        });
    });

    // Listen for client unregistration from a specific canvas
    socket.on('unregisterForCanvas', (canvasId) => {
        socket.leave(canvasId);
    });

    // Listen for incoming events
    socket.on('event', (data) => {
        const event = data;
        eventDB.insert(event, (err, newDoc) => {
            if (err) {
                console.error("Error inserting event:", err);
                return;
            }
            canvasDB.findOne({ _id: data.canvasId }, (err, canvas) => {
                if (canvas) {
                    io.to(data.canvasId).emit('event', newDoc);
                }
            });
        });
    });
});

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
