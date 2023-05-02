const { Router } = require("express");
const http = require ("http");

const Colaboradores = require("../controllers/colaboradores/index");
const colaboradores = require("../controllers/colaboradores/index");

const routes = new Router();

routes.get("/", (req, res) => {
    res.send("Trabalho de TCC");
    });

routes.put("/api/*", (req, res) => {
    return res.status(400).end();
});

routes.get("/api/db", (res,req) => {
    return res.status(404).end(http.STATUS_CODES[404]);
});

routes.post("/api/colaboradores", Colaboradores.store);
routes.patch("/api/colaboradores/:id", Colaboradores.update);

module.express = {routes};