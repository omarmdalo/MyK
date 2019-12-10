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









// CURSO VICTOR ROBLES

// 'use strict'

// var express = require ('express');
// var ProjectController = require ('../controllers/project');

// var router = express.Router();

// //middleware carga archivos
// var multipart = require ('connect-multiparty');
// var multipartMiddleware = multipart({uploadDir : './uploads'});


// router.get('/home', ProjectController.home);
// router.post('/test', ProjectController.test);
// router.post('/save-project', ProjectController.saveProject);
// router.get('/project/:id?', ProjectController.getProject);
// router.get('/projects', ProjectController.getProjects);
// router.put('/project/:id', ProjectController.updateProject);
// router.delete('/project/:id', ProjectController.deleteProject);
// router.post('/upload-image/:id',multipartMiddleware, ProjectController.uploadImage);
// router.get('/get-image/:image', ProjectController.getImageFile);

// module.exports = router;