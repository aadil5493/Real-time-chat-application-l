const socket = io('http://localhost:8000');

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInp");
const sendButton = document.querySelector(".send-btn");
const typingStatus = document.querySelector(".typing-status");
var audio = new Audio('ting.mp3');

const appendMessage = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.classList.add("message", position);
    chatBox.append(messageElement);
    
    if (position === 'left') {
        audio.play();
    }
    
    // Auto-scroll
    chatBox.scrollTop = chatBox.scrollHeight;
};

const name = prompt("Enter Your Name:") || "Anonymous";  // Default name if user cancels
socket.emit('new-user-joined', name);

socket.on('user-joined', name => {
    if (name) appendMessage(`${name} joined the chat`, 'left');
});

socket.on('receive', data => {
    if (data.name) appendMessage(`${data.name}: ${data.message}`, 'left');
});

socket.on('left', name => {
    if (name) appendMessage(`${name} left the chat`, 'left');
});

// Typing indicator
messageInput.addEventListener("input", () => {
    socket.emit("typing");
    setTimeout(() => socket.emit("stop-typing"), 2000);
});

socket.on("user-typing", name => {
    if (name) typingStatus.innerText = `${name} is typing...`;
});

socket.on("user-stop-typing", () => {
    typingStatus.innerText = "";
});

sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message !== "") {
        appendMessage(`You: ${message}`, 'right');
        socket.emit('send', message);
        messageInput.value = "";
    }
});
