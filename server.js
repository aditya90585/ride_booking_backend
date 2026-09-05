import http from "http"
import { app } from "./app.js"

const PORT = process.env.port || 4000
const server = http.createServer(app)

server.listen(PORT,()=>{
    console.log("server running on port :",PORT)
})