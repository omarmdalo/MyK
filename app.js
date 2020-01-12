 // ====================================================
 // LIBRERIAS REQUERIDAS
 // ====================================================
 var express = require("express");
 var mssql = require("mssql");
 var bodyParser = require('body-parser');
 const cors = require('cors');

 // ====================================================
 // INICIALIZAR VARIABLES
 // ====================================================
 var app = express();

 // ====================================================
 // CORS PARA PERMITIR CONSULTAS FUERA DEL DOMINIO
 // ====================================================
 app.use(cors());


 // ====================================================
 // BODY PARSER
 // ====================================================

 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(bodyParser.json());


 // ====================================================
 // IMPORTANDO RUTAS
 // ====================================================

 var appRoutes = require('./routes/app');
 var usuarioRoutes = require('./routes/usuario');
 var loginRoutes = require('./routes/login');
 var hospitalRoutes = require('./routes/hospital');
 var medicoRoutes = require('./routes/medico');
 var busquedaRoutes = require('./routes/busqueda');
 var uploadRoutes = require('./routes/upload');
 var imageRoutes = require('./routes/imagenes');

 app.use('/login', loginRoutes);
 app.use('/hospital', hospitalRoutes);
 app.use('/medico', medicoRoutes);
 app.use('/usuario', usuarioRoutes);
 app.use('/busqueda', busquedaRoutes);
 app.use('/upload', uploadRoutes);
 app.use('/img', imageRoutes);
 app.use('/', appRoutes);


 // ====================================================
 // CONEXION A BASE DE DATOS MSSQL 
 // ====================================================

 var dbConfig = {
     user: 'sa',
     password: 'qwerty',
     server: 'localhost',
     database: 'PortalKia',
     port: 1433,
     connectionTimeiut: 150000,
     driver: 'tedious',
     stream: false,
     options: {
         appName: 'PortalKia',
         encrypt: false
     },
     pool: {
         max: 20,
         min: 0,
         idleTimeoutMillis: 30000
     }
 };

 mssql.connect(dbConfig).then(pool => {
     if (pool.connecting) {
         console.log('Conectadando a la base de datos..');
     }
     if (pool.connected) {
         app.listen(3000, () => {
             console.log(
                 "Express server corriendo en puerto: \x1b[32m%s\x1b[0m ",
                 " 3000"
             );
             console.log(
                 "Base de datos SQL Server en puerto: \x1b[32m%s\x1b[0m ",
                 dbConfig.port.toString()
             );
         });
     }
     return pool;
 }).catch((err) => {
     console.error("No logro conectar a la base de datos \x1b[41m%s\x1b[0m ", err);
 });