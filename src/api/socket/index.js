// import openSocket from "socket.io"
import openSocket from "socket.io-client"

// const socket = openSocket("http://localhost:8080");
//
// export {socket};

export function openChatSocket() {
    return openSocket("http://localhost:8080");
}

// export function onGetMessage() {
//
// }