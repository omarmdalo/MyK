'use strict'
var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


var app = express();


// ====================================================
// Busqueda general por coleccion
// ====================================================


app.get("/coleccion/:tabla/:busqueda", (req, res, next) => {


    var tabla = (req.params.tabla).toLocaleLowerCase();
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);

            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: "Error en la solicitud"
            });
    }

    promesa.then(datos => {

        res.status(200).json({
            ok: true,
            mensaje: "Peticion correcta",
            [tabla]: datos // Se utiliza llaves para decirle que vamos a utilizar cono nombre el objeto el valor de la variable tabla
        });

    });
});



// ====================================================
// Busquedas generales todas la colecciones
// ====================================================
app.get("/todo/:busqueda", (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');


    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuarios(busqueda, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                mensaje: "Peticion correcta",
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});


// ====================================================
// Funciones de busqueda
// ====================================================
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });

    });
}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex }, (err, medicos) => {

            if (err) {
                reject('Error al cargar medicos', err);
            } else {
                resolve(medicos);
            }

        });

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(usuarios);
                }

            });

    });
}




module.exports = app;