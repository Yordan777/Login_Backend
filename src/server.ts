import express from 'express';
import dotenv from "dotenv";
import cors from "cors"
import router from './routers/authRouter';
import { connectDB } from './config/BaseData';
import { corsConfig } from './config/cors';

dotenv.config()
connectDB()

const app = express()

app.use(cors(corsConfig))
app.use(express.json())
app.use('/auth', router)

export default app 