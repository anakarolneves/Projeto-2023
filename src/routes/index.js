const { Router, static: expressStatic } = require("express");
const http = require ("http");
const {storage, uploadFolder} = require("../config/upload");
const multer = require ("multer");
const Animal = require ("../controllers/animal/index");
const Empresas = require ("../controllers/empresas/index");
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


// routes.post("api/auth", Empresas.auth )
// routes.post("/signup", Empresas.signup);
// routes.use(Empresas.ensureAuthenticated)

routes.use("/files", expressStatic(uploadFolder));

routes.post("/api/Animal", Animal.store);
routes.patch("/api/Animal/:id", Animal.update);

routes.post("/api/empresa", Empresas.store);
routes.patch("/api/empresa/:id", Empresas.update);
routes.get("/activate/:chave", Empresas.activate);
routes.patch("/api/avatar/:id", upload.single ("avatar"), Empresas.uploadPhoto);

module.exports= {routes};