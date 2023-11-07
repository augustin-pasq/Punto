import http from "http"
import {Server} from "socket.io"

const server = http.createServer((req, res) => {
    res.writeHead(302, {location: 'localhost:3000'})
    res.end()
})

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
})

server.listen(4000)