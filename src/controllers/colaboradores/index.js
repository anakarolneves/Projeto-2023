const {object, string, mixed} = require ("yup");

class Colaboradores {
    async store (req,res,next){

        let colaboradoresSchema = object ({
            col_nome: string().required("Enre com o nome"),
            col_email: string().email("Entre com um e-mail válido").required("Entre com o e-mail"),
            col_senha: string().min(6, "Asenha tem que ter no mínimo seis dígitos").required("entre com a senha"),
            col_nivel:mixed().oneOf(["empresa","colaborador"],"Usuário inválido")
        });

        !req.body?.col_nivel && (req.body = {...req.body, col_nivel:""});
        !req.body?.col_telefone && (req.body = {...req.body, col_telefone:""});
        !req.body?.col_nome && (req.body = {...req.body, col_nome:""});
        req.body={...req.body,col_foto: "",col_email:"",col_funcao:"",col_dataentrada:"",created_at: new Date(), update_at:"" };
        next();

        try {
            await colaboradoresSchema.validate(req.body);
        } 
        catch (error){
            return res.status(400).end(error.message);
    
        } 
        next();
    }

    async update (req,res,next){
        req.body={...req.body,created_at: new Date() };
        next();
    }
}

module.exports = new Colaboradores();