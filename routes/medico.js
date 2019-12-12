"use strict";
var express = require("express");


var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');

// ====================================================
// Obtener Medicos
// ====================================================
app.get("/", (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, "nombre img hospital")
        .skip(desde)
        .limit(5)
        .populate('usuario', "nombre email")
        .populate('hospital', "nombre")
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error Cargando Medicos",
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    mensaje: "Medicos listados",
                    medicos: medicos,
                    total: conteo
                });

            });


        });
});



// ====================================================
// Crear un nuevo medico
// ====================================================

app.post("/", mdAutentificacion.verificatoken, (req, res) => {
    var body = req.body;

    var medico = Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error de BD al guardar el medico",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Medico Guardado",
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    });
});



// ====================================================
// Actualizar Hospital
// ====================================================

app.put("/:id", mdAutentificacion.verificatoken, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al buscar el medico",
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con el id " + id + " no existe",
                errors: { message: "No existe un medico con ese ID" }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error de BD al actualizar el medico",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "Medico actualizado",
                medico: medicoGuardado,
                usuarioToken: req.usuario
            });
        });

    });
});

// ====================================================
// Borrar un Medico por el ID
// ====================================================

app.delete('/:id', mdAutentificacion.verificatoken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al borrar el medico",
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El Medico con el id " + id + " no existe",
                errors: { message: "No existe un medico con ese ID" }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Medico Borrado",
            medico: medicoBorrado
        });

    });

});


module.exports = app;