"use strict";
var express = require("express");
var bcryptjs = require("bcryptjs");
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();

var mssql = require("mssql");

var Usuario = require("../models/usuario");

// ====================================================
// Obtener todos los usuarios GET
// ====================================================
app.get("/", (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, "nombre email img role")
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error Cargando Usuarios",
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    mensaje: "Usuario Listados",
                    usuarios: usuarios,
                    total: conteo
                });
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

// Middleware de Autificacion del token
// mdAutentificacion.verificatoken
app.post("/", (req, res) => {
    var body = req.body;

    var request = new mssql.Request();

    request.input('FirstName', mssql.VarChar, body.nombre);
    request.input('LastName', mssql.VarChar, body.apellido);
    request.input('Email', mssql.VarChar, body.email);
    request.input('PasswordHash', mssql.VarChar, bcryptjs.hashSync(body.password, 10));
    request.input('RolID', mssql.Int, 1);
    request.input('ImgProfile', mssql.VarChar, 'noimg.jpg');
    request.input('Active', mssql.Int, 1);

    // Consulta a la base de datos
    request.query("INSERT INTO [dbo].[User]([FirstName],[LastName],[Email],[PasswordHash],[RolID],[ImgProfile],[Active]) OUTPUT INSERTED.* VALUES (@FirstName ,@LastName, @Email, @PasswordHash, @RolID, @ImgProfile , @Active)", function(err, recordset) {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Ocurrio un error en la base de datos",
                errors: err
            });
        }

        recordset.recordset[0].PasswordHash = ';)';

        res.status(201).json({
            ok: true,
            mensaje: "Usuario Guardado",
            usuario: recordset.recordset[0],
            usuarioToken: 'Usuario token'
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