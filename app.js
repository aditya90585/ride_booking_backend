import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"
import UserRouter from "./routes/user.route.js"
import captainRouter from "./routes/captain.route.js"
import mapsRouter from "./routes/maps.route.js"
import rideRouter from "./routes/ride.route.js"
import cookeiParser from "cookie-parser"
connectDB()

const app = express()

app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookeiParser())


app.get("/", (req, res) => {
    res.send("ride booking application backend running...")
})
app.use("/api/user", UserRouter)
app.use("/api/captain", captainRouter)
app.use("/api/maps", mapsRouter)
app.use("/api/ride", rideRouter)

export { app }