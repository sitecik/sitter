const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// CORS ayarlarını Netlify frontend URL'sine göre güncelle
const io = new Server(server, {
    cors: {
        origin: "https://your-netlify-site.netlify.app"  // Netlify frontend URL'sini buraya ekleyin
    }
});

app.use(cors());

let users = [];
let messages = [];

// Kullanıcı bağlandığında
io.on("connection", (socket) => {
    console.log("Bir kullanıcı bağlandı", socket.id);
    
    socket.on("setNick", ({ nick }) => {
        users.push({ id: socket.id, username: nick });
        io.emit("updateUsers", users);
        io.emit("updateUserCount", users.length);
        socket.emit("loadMessages", messages); // Eski mesajları gönder
    });

    socket.on("sendMessage", ({ username, message }) => {
        const msgData = {
            username,
            message,
            time: new Date().toLocaleTimeString()
        };
        messages.push(msgData);
        io.emit("receiveMessage", msgData);
    });

    socket.on("disconnect", () => {
        users = users.filter(user => user.id !== socket.id);
        io.emit("updateUsers", users);
        io.emit("updateUserCount", users.length);
        console.log("Bir kullanıcı ayrıldı", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor...`));