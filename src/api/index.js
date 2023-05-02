const {create,defaults,router } = require ("json-server");
const path = require("path");

const server = create();
const apiEndpoints = router(path.join(__dirname,"..","data", "db.json"), {
foreignKeySuffix: "_id"
});

const middlewares = defaults();

server.use(middlewares);
server.use(apiEndpoints);

module.exports = { server, apiEndpoints };
