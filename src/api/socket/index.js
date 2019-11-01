import openSocket from "socket.io-client"

export function openChatSocket() {
    return openSocket("http://localhost:8080");
}
