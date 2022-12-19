let divRoomSelection = document.getElementById("roomSelection");
let divMeetingRoom = document.getElementById("meetingRoom");
let inputRoom = document.getElementById("room");
let inputName = document.getElementById("name");
let btnRegister = document.getElementById("register");

let socket = io();
let kurentoClient= null

// variables
let roomName = null;
let userName = null;
let participants = {};

const sendMessage = (message) => {
    console.log("Client sending message: ", message);
    socket.emit("message", message);
};

const register = () => {
    roomName = inputRoom.value;
    userName = inputName.value;
    if (!roomName || !userName) {
        alert("Please enter your name and room name");
    } else {
        let message = {
            event: "joinRoom",
            room: roomName,
            name: userName,
        };
        sendMessage(message);

        divRoomSelection.style = "display: none;";
        divMeetingRoom.style = "display: block;";
    }
};

const onExistingParticipants = (userId, exisTingUsers) => {};

const onReceiveVideoAnswer = (userId, sdpAnswer) => {};

const receiveVideo = (userId, userName) => {};

const addIceCandidate = (userId, candidate) => {};

btnRegister.addEventListener("click", register);

socket.on("message", (message) => {
    console.log("Client received message:", message?.event);
    switch (message.event) {
        case "newParticipantArrived":
            onExistingParticipants(message.userId, message.userName);
            break;
        case "existingParticipants":
            onExistingParticipants(message.userId, message.existingUsers);
            break;
        case "receiveVideoAnswer":
            onReceiveVideoAnswer(message.senderId, message.sdpAnswer);
            break;
        case "candidate":
            addIceCandidate(message.userId, message.candidate);
            break;
        default:
            break;
    }
});
