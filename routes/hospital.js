"use strict";
var express = require("express");


var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();

var Hospital = require('../models/hospital');

// ====================================================
// Obtener Hospitales
// ====================================================
app.get("/", (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, "nombre img")
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error Cargando Hospitales",
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    mensaje: "Hospitales listados",
                    hospitales: hospitales,
                    total: conteo
                });


            });


        });
});



// ====================================================
// Crear un nuevo horpital
// ====================================================

app.post("/", mdAutentificacion.verificatoken, (req, res) => {
    var body = req.body;

    var hospital = Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error de BD al guardar el hospital",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Hospital Guardado",
            hospital: hospitalGuardado,
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


    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al buscar el hospital",
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El Hospital con el id " + id + " no existe",
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save((err, HospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error de BD al actualizar el Hospital",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "Hospital Actualizadp",
                hospital: HospitalGuardado,
                usuarioToken: req.usuario
            });
        });

    });
});

// ====================================================
// Borrar un Hospital por el ID
// ====================================================

app.delete('/:id', mdAutentificacion.verificatoken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error de BD al borrar el hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El Hopital con el id " + id + " no existe",
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Hospital Borrado",
            hospital: hospitalBorrado
        });

    });

});


module.exports = app;