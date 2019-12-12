'use strict'
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//middleware
app.use(fileUpload());

//Models
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// RUTAS
app.put("/:tipo/:id", (req, res, next) => {


    var tipo = req.params.tipo.toLocaleLowerCase();
    var id = req.params.id;

    //Tipos de coleccion
    var colecciones = ['hospitales', 'medicos', 'usuarios'];

    if (colecciones.indexOf(tipo) < 0) {
        return res.status(500).json({
            ok: false,
            mensaje: "Coleccion no valida",
            errors: { mensaje: 'Solo puede subir archivos a las colecciones ' + colecciones.join(', ') }
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(500).json({
            ok: false,
            mensaje: "No selecciono archivos",
            errors: { mensaje: 'Debe seleccionar un archivo' }
        });
    }

    //Obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombrecortado = archivo.name.split('.');
    var extarchivo = nombrecortado[nombrecortado.length - 1];

    //Extensiones aceptadas
    var extvalidad = ['png', 'jpg', 'jpeg'];

    if (extvalidad.indexOf(extarchivo) < 0) {
        return res.status(500).json({
            ok: false,
            mensaje: "Extension no valida",
            errors: { mensaje: 'Solo debe subir archivos con extenciones ' + extvalidad.join(', ') }
        });
    }


    // Nombre de archivo Personalizado
    var nombreArchivo = `${ id }${ new Date().getMilliseconds() }.${ extarchivo }`;

    //Mover Archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);



    });
});



function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {


            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    ensaje: "El Usuario con el id " + id + " no existe",
                    errors: { message: "No existe un usuario con ese ID" }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Elimina en caso de que exista
            try {
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) {
                            console.error('Error al eliminar la imagen', err);
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario Actualizada",
                    usuario: usuarioActualizado
                });
            })
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    ensaje: "El Usuario con el id " + id + " no existe",
                    errors: { message: "No existe un usuario con ese ID" }
                });
            }


            var pathViejo = './uploads/medicos/' + medico.img;

            //Elimina en caso de que exista
            try {
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) {
                            console.error('Error al eliminar la imagen', err);
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico Actualizada",
                    medico: medicoActualizado
                });

            })



        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {


            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    ensaje: "El Usuario con el id " + id + " no existe",
                    errors: { message: "No existe un usuario con ese ID" }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Elimina en caso de que exista
            try {
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) {
                            console.error('Error al eliminar la imagen', err);
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital Actualizada",
                    hospital: hospitalActualizado
                });

            })



        });
    }
}



module.exports = app;