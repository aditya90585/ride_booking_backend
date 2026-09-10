import { Server } from "socket.io"
import User from "../models/user.model.js"
import Captain from "../models/captain.model.js"
let io
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.CLIENT_URL, "http://localhost:5173"],
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on("join", async (data) => {
            const { userId, userType } = data
            if (userType == "user") {
                await User.findByIdAndUpdate(userId, { socketId: socket.id })
            } else if (userType == "captain") {
                await Captain.findByIdAndUpdate(userId, { socketId: socket.id })
            }
        })
        socket.on("update-location-captain", async (data) => {
            const { captainId, userSocketId, location } = data
            if (!captainId || !location.ltd || !location.lng) {
                return socket.emit("error", { message: "Invalid location or user" })
            }
            await Captain.findOneAndUpdate({ _id: captainId }, {
                location: {
                    type: "Point",
                    coordinates: [location.lng, location.ltd]
                }
            })

            if (!userSocketId) return
            socket.to(userSocketId).emit("captain-live-location", { ltd: location.ltd, lng: location.lng, heading: location.heading })

        })
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        })
    })
}

export const sendMessageToSocketId = async (socketId, messageObject) => {
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data)
    }
    else {
        console.log("socket is not established")
    }
}