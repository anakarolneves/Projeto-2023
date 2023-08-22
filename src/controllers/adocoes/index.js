const {object, string, date} = require("yup");

class Adocoes {
    async store(req, res, next) {
        let adocoesSchema = object({
            ado_valor: string().required("Entre com o valor da doação "),
            ado_forma: string().required("Qual a forma de doação"),
            ado_data: date().required("Entre com a data da doação")
    
        })

        req.body = {
            ...req.body,
            created_at: new Date(),
            updated_at: ""
          };

        try {
            await adocoesSchema.validate(req.body);
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

module.exports = new Adocoes();