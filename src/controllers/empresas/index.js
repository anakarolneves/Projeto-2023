const { object, string, mixed } = require("yup");
const { apiEndpoints } = require("../../api/index");
const MailService = require("../../services/mail");
const fs = require("fs");
const { uploadFolder } = require("../../config/upload");
const { sign, verify } = require("jsonwebtoken");
const authConfig = require("../../config/auth");

const criarChave = (n, r = "") => {
  while (n--) {
    r += String.fromCharCode(
      ((r = (Math.random() * 62) | 0), (r += r > 9 ? (r < 36 ? 55 : 61) : 48))
    );
  }
  return r;
};

class Empresas {
  async signup(req, res, next) {
    // return res.status(200).send("A vila é bela 2").end();
    console.log(`   ${Date.now()}`);
    next();
  }

  async store(req, res, next) {
    let empresaSchema = object({
      emp_nome: string().required("Entre com o nome da empresa"),
      emp_email: string()
        .email("Entre com um e-mail válido")
        .required("Entre com o e-mail"),
      emp_senha: string()
        .required("Entre com a senha")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/,
          "A senha precisa ter no mínimo 6 caracteres, sendo: uma maiúscula, uma minúscula, um número e um caracter especial"
        ),
    });

    !req.body?.emp_telefone && (req.body = { ...req.body, emp_telefone: "" });
    !req.body?.emp_cpf && (req.body = { ...req.body, emp_cpf: "" });

    const emp_chave = criarChave(10);
    const { emp_nome, emp_email } = req.body;
    await MailService.sendActivation({
    emp_nome,
    emp_email,
    emp_chave
    });

    req.body = {
      ...req.body,
      emp_foto: "",
      emp_chave: emp_chave,
      created_at: new Date(),
      updated_at: ""
    };

    try {
      await empresaSchema.validate(req.body);
    } catch (error) {
      //return res.status(400).json({ error: error.message });
      return res.status(400).send({error: error.message}).end();
      //return res.status(400).end({ error: error.message });
    }

    const empresa = apiEndpoints.db
      .get("empresas")
      .find({ emp_email: req.body.emp_email })
      .cloneDeep()
      .value();

    if (empresa) {
      return res.status(400).send({ error: "empresa já cadastrada " }).end();
    }
    next();
  }

  async update(req, res, next) {
    req.body = { ...req.body, updated_at: new Date() };
    next();
  }

  async activate(req, res, next) {
    const { chave } = req.params;

    let empresa = apiEndpoints.db
      .get("empresas")
      .find({ emp_chave: chave })
      .value();

    if (!empresa) {
      return res.status(400).send({ error: "key not finded" }).end();
    }

    empresa.emp_chave = "";
    apiEndpoints.db.write();

    return res.status(200).send({ response: "User activated" }).end();
  }

  async uploadPhoto(req, res, next) {
    const { id } = req.params;
    const avatar = req.file;

    let empresa = await apiEndpoints.db
      .get("empresas")
      .find({ id: parseInt(id, 10) })
      .value();

    if (!empresa) return res.st(400).send({ error: "id not found" }).end();

    if (empresa.emp_foto !== "") {
      try {
        fs.unlinkSync(`${uploadFolder}/${empresa.emp_foto}`);
      } catch (error) {
        console.log(
          `Erro ao excluir o arquivo ${uploadFolder}/${empresa.emp_foto}`
        );
      }
    }

    empresa.emp_foto = avatar.filename;
    empresa.emp_updated_at = new Date();
    apiEndpoints.db.write();

    let output = Object.assign({}, empresa);
    delete output.emp_senha;

    return res
      .status(200)
      .send({ ...output })
      .end();
  }

  async auth(req, res, next) {
    const { emp_email, emp_senha } = req.body;

    // console.log(req.body);
    let empresa = apiEndpoints.db
      .get("empresas")
      .find({ emp_email })
      .cloneDeep()
      .value();

    if (!empresa)
      return res
        .status(400)
        .json({ error: "Incorrect user/password combination" });

    if (empresa.emp_senha !== emp_senha)
      return res
        .status(400)
        .json({ error: "Incorrect user/password combination" });

    delete empresa.emp_senha;

    const token = sign({}, authConfig.jwt.secret, {
      subject: empresa.id.toString(),
      expiresIn: authConfig.jwt.expiresIn
    });

    return res.status(200).send({ empresa, token }).end();
  }

  async ensureAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(400).json({ error: "JWT token is missing" });

    const [, token] = authHeader.split(" ");
    console.log("Token Ensure: " + token);
    try {
      console.log("token : " + token);
      const decoded = await verify(token, authConfig.jwt.secret);
      const { sub } = decoded;
      req.user = { id: sub };
      next();
    } catch (error) {
      return res
        .status(400)
        .json({ error: "jwt malformed or invalid signature" });
    }
  }
}

module.exports = new Empresas();