const socket = io("https://real-time-chat-application-l-2.onrender.com/", {
    transports: ["websocket", "polling"] // Ensures mobile compatibility
});

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInp");
const sendButton = document.querySelector(".send-btn");
const typingStatus = document.querySelector(".typing-status");
var audio = new Audio("ting.mp3");

// Append message to chat box
const appendMessage = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.classList.add("message", position);
    chatBox.append(messageElement);

    if (position === "left") {
        audio.play();
    }

    // Auto-scroll to the latest message
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
};

// Prompt for username
const name = prompt("Enter Your Name:") || "Anonymous";  
socket.emit("new-user-joined", name);

// Listen for events
socket.on("user-joined", name => {
    if (name) appendMessage(`${name} joined the chat`, "left");
});

socket.on("receive", data => {
    if (data.name) appendMessage(`${data.name}: ${data.message}`, "left");
});

socket.on("left", name => {
    if (name) appendMessage(`${name} left the chat`, "left");
});

// Typing indicator
let typingTimeout;
messageInput.addEventListener("input", () => {
    socket.emit("typing");

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit("stop-typing");
    }, 1500); // Stops typing after 1.5s
});

socket.on("user-typing", name => {
    if (name) typingStatus.innerText = `${name} is typing...`;
});

socket.on("user-stop-typing", () => {
    typingStatus.innerText = "";
});

// Send message
sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message !== "") {
        appendMessage(`You: ${message}`, "right");
        socket.emit("send", message);
        messageInput.value = "";
    }
});
