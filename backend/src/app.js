import express from "express";
import { deleteUnverifiedUsers } from "./utils/cleanUp.js";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express()

app.use(express.json());
app.use(cookieParser());

//Cors Handling
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

//Routes
import userRoute from "./routes/user.route.js"
import itemRoute from "./routes/item.route.js"


app.get("/", (req, res) => {
  res.send("Welcome to MS ECOMMERCE API !");
});


//Routes Declaring
app.use("/api/v1/users",userRoute)
app.use("/admin",itemRoute)




//Deleting Unvarified User in 10 Minute
setInterval(deleteUnverifiedUsers, 10 * 60 * 1000);
export default app;