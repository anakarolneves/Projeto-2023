const { object, string } = require("yup");
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
    console.log(`   ${Date.now()}`);
    next();
  }

  async store(req, res, next) {
    let empresaSchema = object({
      emp_nome: string()
        .required("Entre com o nome da empresa")
        .min(7, "Nome deve ter pelo menos 7 caracteres")
        .matches(/\s/, "O nome deve conter pelo menos um espaço"),
      emp_email: string()
        .email("Entre com um e-mail válido")
        .required("Entre com o e-mail"),
      emp_senha: string().matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/,
        "A senha deve conter pelo menos 6 caracteres, incluindo: uma letra maiúscula, uma letra minúscula, um número e um caractere especial"
      ),
    });

    !req.body?.emp_telefone && (req.body = { ...req.body, emp_telefone: "" });
    !req.body?.emp_cpf && (req.body = { ...req.body, emp_cpf: "" });

    const emp_chave = criarChave(10);
    const { emp_nome, emp_email } = req.body;
    await MailService.sendActivation({
      emp_nome,
      emp_email,
      emp_chave,
    });

    req.body = {
      ...req.body,
      emp_foto: "",
      emp_chave: emp_chave,
      created_at: new Date(),
      updated_at: "",
    };

    try {
      await empresaSchema.validate(req.body);
    } catch (error) {
      return res.status(400).send({ error: error.message }).end();
    }

    console.log(req.body)

    const empresa = apiEndpoints.db
      .get("empresa")
      .find({ emp_email: req.body.emp_email })
      .cloneDeep()
      .value();

    if (empresa) {
      return res.status(400).json({error: "Empresa já cadastrada" }).end();
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
      return res.status(400).send({ error: "Chave não encontrada" }).end();
    }

    empresa.emp_chave = "";
    apiEndpoints.db.write();

    return res.status(200).send({ response: "Usuário ativado" }).end();
  }

  async uploadPhoto(req, res, next) {
    const { id } = req.params;
    const avatar = req.file;

    let empresa = await apiEndpoints.db
      .get("empresas")
      .find({ id: parseInt(id, 10) })
      .value();

    if (!empresa) return res.status(400).send({ error: "ID não encontrado" }).end();

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

    let empresa = apiEndpoints.db
      .get("empresas")
      .find({ emp_email })
      .cloneDeep()
      .value();

    if (!empresa)
      return res
        .status(400)
        .json({ error: "Combinação de usuário/senha incorreta" });

    if (empresa.emp_senha !== emp_senha)
      return res
        .status(400)
        .json({ error: "Combinação de usuário/senha incorreta" });

    delete empresa.emp_senha;

    const token = sign({}, authConfig.jwt.secret, {
      subject: empresa.id.toString(),
      expiresIn: authConfig.jwt.expiresIn,
    });

    return res.status(200).send({ empresa, token }).end();
  }

  async ensureAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(400).json({ error: "Token JWT está faltando" });

    const [, token] = authHeader.split(" ");
    try {
      const decoded = await verify(token, authConfig.jwt.secret);
      const { sub } = decoded;
      req.user = { id: sub };
      next();
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Token JWT inválido ou com formato incorreto" });
    }
  }
}

module.exports = new Empresas();
