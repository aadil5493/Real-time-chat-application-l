const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 8000; // Render provides a dynamic port

const users = {};

app.use(cors()); 
app.use(express.static("public")); // Serve static files (index.html, client.js, style.css)

// WebSocket connection
io.on("connection", socket => {
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

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
