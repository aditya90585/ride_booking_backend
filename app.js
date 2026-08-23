import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import  connectDB  from "./config/db.js"
import UserRouter from "./routes/user.route.js"
import captainRouter from "./routes/captain.route.js"
import cookeiParser from "cookie-parser"
connectDB()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookeiParser())


app.get("/",(req,res)=>{
    res.send("ride booking application backend running...")
})
app.use("/api/user",UserRouter)
app.use("/api/captain",captainRouter)

export  {app}