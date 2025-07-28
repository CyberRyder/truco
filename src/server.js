import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    }
});

const PORT = 4000;

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.join("room1");

    socket.on("disconnect", () => {
        console.log("a user disconnected:", socket.id);
        socket.leave("room1");
    });

    socket.on("play card", (card, player) => {
        io.to("room1").emit("play card", card, player);
        console.log("a user played a card:", card, player);
    });

    socket.on("fold", (player) => {
        io.to("room1").emit("fold", player);
        console.log("a user folded:", player);
    });

    socket.on("accept", (player) => {
        io.to("room1").emit("accept", player);
        console.log("a user accepted:", player);
    });

    socket.on("bet", (betValue, player) => {
        io.to("room1").emit("bet", betValue, player);
        console.log("a user bet:", betValue, player);
    });

    socket.on("new round", () => {
        io.to("room1").emit("new round");
        console.log("a new round started");
    });

    socket.on("reset game", () => {
        io.to("room1").emit("reset game");
        console.log("the game was reset");
    });
});
