const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Canvas = require('./models/Canvas');
const Event = require('./models/Events');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors()); // To handle CORS issues
app.use(express.json()); // For parsing JSON request bodies

mongoose.connect('mongodb://localhost:27017/canvasApp', { useNewUrlParser: true, useUnifiedTopology: true });


//Routes
// Canvas
// Create new canvas
app.post('/api/canvas', async (req, res) => {
    const canvas = new Canvas();
    await canvas.save();
    res.status(201).json(canvas);
});

// Get all canvases
app.get('/api/canvas', async (req, res) => {
    const canvases = await Canvas.find().populate('events');
    res.json(canvases);

});

// Get a specific canvas
app.get('/api/canvas/:canvasId', async (req, res) => {
    const canvas = await Canvas.findById(req.params.canvasId).populate('events');
    if (canvas) {
        res.json(canvas);
    } else {
        res.status(404).send({ message: 'Canvas not found!' });
    }
});

// Websockets Event
io.on('connection', (socket) => {
    // Register client with a unique color code
    const clientId = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    socket.emit('register', { clientId });

    socket.on('disconnect', () => {
        // Handle client disconnection if needed
    });

    // Listen for client registration for a specific canvas
    socket.on('registerForCanvas', async (canvasId) => {
        const canvas = await Canvas.findById(canvasId).populate('events');
        if (canvas) {
            socket.join(canvasId);
            socket.emit('eventsForCanvas', canvas.events);
        }
    });

    // Listen for client unregistration from a specific canvas
    socket.on('unregisterForCanvas', (canvasId) => {
        socket.leave(canvasId);
    });

    // Listen for incoming events
    socket.on('event', async (data) => {
        const event = new Event(data);
        await event.save();
        const canvas = await Canvas.findById(data.canvasId);
        if (canvas) {
            canvas.events.push(event);
            await canvas.save();
            io.to(data.canvasId).emit('event', event); // Broadcast the event to clients of the specific canvas
        }
    });
});

// Create a new event
app.post('/api/event', async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    const canvas = await Canvas.findById(event.canvas);
    if (canvas) {
        canvas.events.push(event);
        await canvas.save();
    }
    res.status(201).json(event);
});

function generateColorCode() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
