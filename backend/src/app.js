import express from "express";
import { deleteUnverifiedUsers } from "./utils/cleanUp.js";
import cookieParser from "cookie-parser";


const app = express()

app.use(express.json());
app.use(cookieParser());

//Routes
import userRoute from "./routes/user.route.js"


app.get("/", (req, res) => {
  res.send("Welcome to MS ECOMMERCE API !");
});


//Routes Declaring
app.use("/api/v1/users",userRoute)




//Deleting User in 10 Minute
setInterval(deleteUnverifiedUsers, 10 * 60 * 1000);
export default app;