const {object, string, date} = require("yup");

class Colaboradores {
    async store(req, res, next) {
        let colaboradoresSchema = object({
            col_nome: string().required("Entre com o nome"),
            col_email: string().required("Entre com o email"),
            col_CPF: string().required("CPF"),
            col_funcao: string().required("Entre com a função"),
            col_dataentrada: date().required("Data de entrada"),
            col_telefone: string().required("Entre com o telefone"),
            col_foto: string().required("Foto do colaborador")
        })

        req.body = {
            ...req.body,
            col_foto: "",
            created_at: new Date(),
            updated_at: ""
          };

        try {
            await colaboradoresSchema.validate(req.body);
        } catch (error) {
            return res.status(400).json({error: error.message}).end()
        }

        req.body = {...req.body, created_at: new Date(), updated_at: ""}
        next()
    }

    async update(req, res, next) {
        req.body = {...req.body, updated_at: new Date()}
        next()
    }
}

module.exports = new Colaboradores();