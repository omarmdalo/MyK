"use strict";
var express = require("express");
var bcryptjs = require("bcryptjs");
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;



var app = express();

var Usuario = require("../models/usuario");

// ====================================================
// Iniciar sesion
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



module.exports = app;