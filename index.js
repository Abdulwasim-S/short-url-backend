import express from "express";
import cors from "cors";
import {} from "dotenv/config.js";
import { RouterPage } from "./Routers/RouterPage.js";
import { db_connection } from "./DataBase/DB.js";


const app = express();

db_connection();

app.use(cors({origin:"*"}));
app.use(express.json());

app.use('/',RouterPage);

app.listen(process.env.PORT,()=>console.log("Server connected"));