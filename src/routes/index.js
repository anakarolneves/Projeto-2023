const { Router, static: expressStatic } = require("express");
const http = require ("http");
const {storage, uploadFolder} = require("../config/upload");
const multer = require ("multer");

const Colaboradores = require ("../controllers/colaboradores/index");
const colaboradores = require("../controllers/colaboradores/index");

const routes = new Router();
const upload = multer ({storage});



routes.get("/", (req, res) => {
    res.send("Trabalho de TCC");
    });

routes.put("/api/*", (req, res) => {
    return res.status(400).end();
});

routes.get("/api/db", (res,req) => {
    return res.status(404).end(http.STATUS_CODES[404]);
});


routes.post("api/auth", Colaboradores.auth )

routes.use(colaboradores.ensureAuthenticated)

routes.use("/files", expressStatic(uploadFolder));

routes.post("/api/colaboradores", Colaboradores.store);
routes.patch("/api/colaboradores/:id", Colaboradores.update);
routes.get("/activate/:chave", Colaboradores.activate);
routes.patch("/api/avatar/:id", upload.single ("avatar"), Colaboradores.upluadPhoto);

module.exports= {routes};