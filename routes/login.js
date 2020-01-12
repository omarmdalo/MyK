"use strict";
var express = require("express");
var bcryptjs = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;
var CLIENT_ID = require("../config/config").CLIENT_ID;

var app = express();

var mssql = require("mssql");

// Google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

// ====================================================
// Autentificacion de aplicacion
// ====================================================

app.post("/", (req, res) => {
    var body = req.body;

    // Creamos un objeto de mssql
    var request = new mssql.Request();


    // Consulta a la base de datos
    request.query("SELECT u.*, up.PasswordHash FROM [dbo].[User] u INNER JOIN UserPassword up ON u.idUser = up.UserId  WHERE [Email] = '" + body.email + "'", function(err, recordset) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de base de datos",
                errors: err
            });
        }

        if (Array.isArray(recordset.recordset) && !recordset.recordset.length) {
            return res.status(400).json({
                ok: false,
                mensaje: "El email no existe",
                errors: { message: body.email }
            });
        }

        if (!recordset.recordset[0].Active) {
            return res.status(400).json({
                ok: false,
                mensaje: "Usuario Inhabilitado",
                errors: { message: 'Usuario Inhabilitado' }
            });
        }


        if (!bcryptjs.compareSync(body.password, recordset.recordset[0].PasswordHash)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Password Incorrecto",
                errors: { message: recordset.recordset[0].PasswordHash }
            });
        }

        // Crear un Token
        recordset.recordset[0].PasswordHash = ":)";

        var token = jwt.sign({ usuario: recordset.recordset[0] }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

        res.status(200).json({
            ok: true,
            mensaje: "Usuario Valido",
            usuario: recordset.recordset,
            token: token
        });


    });
});

// ====================================================
// Autentificacion de Google
// ====================================================

app.post("/google", async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            mensaje: "Error al verificar",
            errors: {
                message: "Error al verificar el token",
                error: e
            }
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al buscar el usuario",
                errors: err
            });
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar la autentificacion normal"
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, {
                    expiresIn: 14400
                }); //Expira en 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: "Usuario Valido",
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            }
        } else {
            // El usuario no existe
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, {
                    expiresIn: 14400
                }); //Expira en 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: "Usuario Valido",
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: "Peticion correcta",
    //     googleUser: googleUser

    // });
});

// ====================================================
// Funcion de verificacion de Token
// ====================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

module.exports = app;


//SELECT * FROM[dbo].[User] WHERE[Email] =