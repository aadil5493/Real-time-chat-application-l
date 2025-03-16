const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000; // Render provides a dynamic port

// CORS Configuration
app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

// Serve Static Files (index.html, client.js, style.css)
app.use(express.static("public"));

// Socket.io Configuration
const io = new Server(server, {
    cors: {
        origin: "*", // Change this if hosting client separately
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"] // Ensures mobile compatibility
});

const users = {};

// WebSocket Connection
io.on("connection", socket => {
    console.log("New user connected:", socket.id);

    socket.on('new-user-joined', name => {
        if (name && name.trim() !== "") {
            users[socket.id] = name;
            socket.broadcast.emit('user-joined', name);
        }
    });

    socket.on("send", message => {
        if (users[socket.id]) {
            socket.broadcast.emit("receive", { message: message, name: users[socket.id] });
        }
    });

    socket.on("typing", () => {
        if (users[socket.id]) {
            socket.broadcast.emit("user-typing", users[socket.id]);
        }
    });

    socket.on("stop-typing", () => {
        socket.broadcast.emit("user-stop-typing");
    });

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            socket.broadcast.emit('left', users[socket.id]);
            delete users[socket.id];  // Remove user from the list
        }
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
