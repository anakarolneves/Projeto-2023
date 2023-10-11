const {object, string, date} = require("yup");

class Animal {
    async store(req, res, next) {
        let animalSchema = object({
            ani_porte: string().required("Entre com o porte do animal"),
            ani_raca: string().required("Entre com a raça do animal "),
            ani_idade:string().required("Entre com a idade "),
            ani_sexo:string().required("Entre com o sexo "),
            ani_vacinas: string().required("Entre com as vacinas"),
            ani_dataentrada: date().required("Entre com a data de entrada"),
            ani_foto: string().required("Entre com a foto do animal")
        })

        req.body = {
            ...req.body,
            ani_foto: "",
            ani_castracao: false,
            created_at: new Date(),
            updated_at: ""
          };

        try {
            await animalSchema.validate(req.body);
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

module.exports = new Animal();