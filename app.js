// REQUIRES

var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

// INICIALIZAR VARIABLES

var app = express();



//BODY-PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// IMPORTAR RUTAS
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// CONEXION A LA BD
// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
//     if (err) throw err;

//     console.log("Base de datos corriendo en puerto: \x1b[32m%s\x1b[0m ", " 27017");
// });

app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);



// // CONEXION A LA BD
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