import mongoose from "mongoose";
import { exit } from "node:process";

export const connectDB = async () => {
  
  try {
     const {connection} = await mongoose.connect(process.env.DATABASE_URL, {
      connectTimeoutMS: 1000
     });
     const url = `${connection.host}:${connection.port}`
     console.log(`MongoDB Conectado en: ${url}`)
  } catch (error) {
    console.error('Error al conectar a la base de datos', error);
    exit(1); // Salir con error
  }
}; 