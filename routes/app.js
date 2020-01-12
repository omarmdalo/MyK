'use strict'
var express = require('express');

var app = express();

// RUTAS
app.get("/", (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: "Peticion correcta"
    });
});



module.exports = app;