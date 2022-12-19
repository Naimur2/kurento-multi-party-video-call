const express = require("express");

const app = express();
const http = require("http").Server(app);
const minimist = require("minimist");
const kurento = require("kurento-client");
let kurentoClient = null;

let io = require("socket.io")(http);

let argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: "http://localhost:3000",
        ws_uri: "ws://localhost:8888/kurento",
    },
});


const getRoom = (socket, roomName, cb) => {
    let myRoom = io.sockets.adapter.rooms[roomName] || { length: 0 };
    let numClients = myRoom.length;

    if (numClients === 0) {
        socket.join(roomName, () => {
            myRoom = io.sockets.adapter.rooms[roomName];
            getKurentoClient((error, kurento) => {
                kurento.create("MediaPipeline", (error, pipeline) => {
                    if (error) {
                        return cb(error);
                    }
                    myRoom.pipeline = pipeline;
                    myRoom.participants = {};
                    cb(null, myRoom);
                });
            });
        });
    }
    else {
        socket.join(roomName)
        cb(null, myRoom);
    }
};

const getKurentoClient = (callback) => {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    kurento(argv.ws_uri, (error, _kurentoClient) => {
        if (error) {
            console.log(
                "Could not find media server at address " + argv.ws_uri
            );
            return callback(
                "Could not find media server at address" +
                    argv.ws_uri +
                    ". Exiting with error " +
                    error
            );
        }

        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
};

const joinRoom = (socket, userName, roomName, cb) => {};
const receiveVideoFrom = (socket, userId, roomName, sdpOffer, cb) => {};
const addIceCandidate = (socket, userId, roomName, candidate, cb) => {};



io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    socket.on("message", (message) => {
        console.log("message: " + message);
        socket.on("message", (message) => {
            switch (message.event) {
                case "joinRoom":
                    joinRoom(
                        socket,
                        message.userName,
                        message.roomName,
                        (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("joinRoom success");
                            }
                        }
                    );
                    break;
                case "receiveVideoFrom":
                    receiveVideoFrom(
                        socket,
                        message.userId,
                        message.roomName,
                        message.sdpOffer,
                        (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("receiveVideoFrom success");
                            }
                        }
                    );
                    break;
                case "addIceCandidate":
                    addIceCandidate(
                        socket,
                        message.userId,
                        message.roomName,
                        message.candidate,
                        (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("addIceCandidate success");
                            }
                        }
                    );
                    break;
                default:
                    break;
            }
        });
    });
});

app.use(express.static("public"));

http.listen(3000, () => {
    console.log("listening on *:3000");
});
