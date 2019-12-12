"use strict";
var express = require("express");
var bcryptjs = require("bcryptjs");
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;



var app = express();

var Usuario = require("../models/usuario");

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);



// ====================================================
// Autentificacion de aplicacion
// ====================================================

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, UsuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al buscar el usuario",
                errors: err
            });
        }

        if (!UsuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales Incorrectas - email",
                errors: { message: "Credenciales invalidas" }
            });
        }

        if (!(bcryptjs.compareSync(body.password, UsuarioBD.password))) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales Incorrectas - password",
                errors: { message: "Credenciales invalidas" }
            });
        }

        // Crear un Token
        UsuarioBD.password = ':)';

        var token = jwt.sign({ usuario: UsuarioBD }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

        res.status(200).json({
            ok: true,
            mensaje: "Usuario Valido",
            usuario: UsuarioBD,
            token: token,
            id: UsuarioBD._id
        });
    });
});

// ====================================================
// Autentificacion de Google
// ====================================================

app.post("/google", async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch((e) => {
            return res.status(403).json({
                ok: false,
                mensaje: "Error al verificar",
                errors: {
                    message: "Error al verificar el token",
                    error: e
                }
            });
        })


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al buscar el usuario",
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar la autentificacion normal"
                });
            } else {

                var token = jwt.sign({ usuario: UsuarioBD }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: "Usuario Valido",
                    usuario: UsuarioBD,
                    token: token,
                    id: UsuarioBD._id
                });

            }

        } else { // El usuario no existe
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {


                var token = jwt.sign({ usuario: UsuarioBD }, SEED, { expiresIn: 14400 }); //Expira en 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: "Usuario Valido",
                    usuario: UsuarioBD,
                    token: token,
                    id: UsuarioBD._id
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
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
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
        img: pauload.picture,
        google: true
    }
}


module.exports = app;