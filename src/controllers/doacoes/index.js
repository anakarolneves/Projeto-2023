const {object, string, date} = require("yup");

class Doacoes {
    async store(req, res, next) {
        let doacoesSchema = object({
            doa_praquem: string().required("Nome do tutor"),
            doa_data: date().required("Entre com a data"),
            doa_contato: string().required("Contato do tutot")
    
        })

        req.body = {
            ...req.body,
            created_at: new Date(),
            updated_at: ""
          };

        try {
            await doacoesSchema.validate(req.body);
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

module.exports = new Doacoes();