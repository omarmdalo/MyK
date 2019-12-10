// REQUIRES

var express = require("express");
var mongoose = require("mongoose");

// INICIALIZAR VARIABLES

var app = express();

// CONEXION A LA BD
// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
//     if (err) throw err;

//     console.log("Base de datos corriendo en puerto: \x1b[32m%s\x1b[0m ", " 27017");
// });

// RUTAS
app.get("/", (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: "Peticion correcta"
    });
});


mongoose.connect("mongodb://localhost:27017/hospitalDB", { useNewUrlParser: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log(
        "Base de datos corriendo en puerto: \x1b[32m%s\x1b[0m ",
        " 27017"
    );
    // ESCUCHAR PETICIONES
    app.listen(3000, () => {
        console.log(
            "Express server corriendo en puerto: \x1b[32m%s\x1b[0m ",
            " 3000"
        );
    });
});