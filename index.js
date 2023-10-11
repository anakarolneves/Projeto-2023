const express = require("express");
const cors = require("cors");
const {server: api} = require ("./src/api/index");
const { routes } = require ("./src/routes/index");

const app = express();
const port = process.env.port || 8080;

const corsOptions = {
  origin: "https://ktnjgm.csb.app", // Substitua com a URL do seu aplicativo frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Se você estiver usando autenticação com cookies ou tokens, defina isso como true
  optionsSuccessStatus: 204,
};

// app.use(cors(corsOptions));
app.use(cors());

app.use(cors());
app.use(express.json());
app.use(routes);
app.use("/api", api);

app.listen(port, () => {
  console.log(`O sevidor está funcionando na porta  ${port}`);
});