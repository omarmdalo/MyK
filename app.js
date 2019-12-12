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
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imageRoutes = require('./routes/imagenes');


// CONEXION A LA BD
// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
//     if (err) throw err;

//     console.log("Base de datos corriendo en puerto: \x1b[32m%s\x1b[0m ", " 27017");
// });

// Server index  config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imageRoutes);
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