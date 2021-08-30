// Load Modules
const express = require("express");
const socketIO = require("socket.io");
const got = require("got");

// Creating Express App
const app = express();
const port = process.env.PORT || 9000;

app.use(express.static("public"));

// Starting Server
const server = app.listen(port, () => {
    console.log(`Socket.IO server running at http: //localhost:${port}/`);
});

// Creating Object Of IO
const io = socketIO(server);

let waitingPlayer = null;

// IO Listener
io.on("connection", (socket) => {
    socket.on("details", (details) => {
        io.to(socket.id).emit("connection", { result: true });
        if (waitingPlayer == null) {
            waitingPlayer = {
                id: socket.id,
                name: details.name,
            };
        } else {
            io.to(waitingPlayer.id).emit("details", {
                id: socket.id,
                name: details.name,
                option: "X",
                turn: true,
            });
            io.to(socket.id).emit("details", {
                id: waitingPlayer.id,
                name: waitingPlayer.name,
                option: "O",
                turn: false,
            });
            waitingPlayer = null;
        }
        console.log(details.name);
    });

    socket.on("move", (move) => {
        io.to(move.id).emit("move", move);
    });

    socket.on("disconnect", () => {
        if (waitingPlayer != null) {
            if (waitingPlayer.id == socket.id) {
                waitingPlayer = null;
            }
        } else {
            socket.broadcast.emit("delete", socket.id);
        }
    });
});

// To Call Self API
const callingSelfAPI = async () => {
    try {
        await got("https://mr-coder-tic-tac-toe.glitch.me/");
        console.log("Called Self API");
    } catch (error) {
        console.log(error);
    }
};

setInterval(callingSelfAPI, 60000);
