import app from "./server";

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`conexión correcta, server ${port}`);
})