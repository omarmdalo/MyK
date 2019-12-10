"use strict";
var express = require("express");
var bcryptjs = require("bcryptjs");
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();

var Usuario = require("../models/usuario");

// ====================================================
// Obtener todos los usuarios GET
// ====================================================

// RUTAS
app.get("/", (req, res, next) => {
    Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error Cargando Usuarios",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Usuario Listados",
            usuarios: usuarios
        });
    });
});




// ====================================================
// Actualizar Usuario
// ====================================================

app.put("/:id", mdAutentificacion.verificatoken, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al buscar el usuario",
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El Usuario con el id " + id + " no existe",
                errors: { message: "No existe un usuario con ese ID" }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;


        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error de BD al actualizar el usuario",
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                mensaje: "Usuario Actualizadp",
                usuario: usuarioGuardado
            });
        });

    });
});

// ====================================================
// Crear un nuevo usuario
// ====================================================

app.post("/", mdAutentificacion.verificatoken, (req, res) => {
    var body = req.body;

    var usuario = Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error de BD al guardar el usuario",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Usuario Guardado",
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});


// ====================================================
// Borrar un Usuario por el ID
// ====================================================

app.delete('/:id', mdAutentificacion.verificatoken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al borrar el usuario",
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El Usuario con el id " + id + " no existe",
                errors: { message: "No existe un usuario con ese ID" }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Usuario Borrado",
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;