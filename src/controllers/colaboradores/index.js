const {object, string, mixed} = require ("yup");
const{ apiEndpoints } = require ("../../api/index");
const MailService = require ("../../services/mail");
const fs=require("fs");
const {upluadPhoto} = require ('../../config/upload');
const { error } = require("console");

const criarChave = (n, r="")=>{
    while (n--){
    r+= String.fromCharCode(
        (
            (r=(Math.random() *62) | 0), 
            (r+= r > 9 ? ( r < 36 ? 55 : 61 ) : 48)
        )
    );
  }
  return r;
};

class Colaboradores {
    async store (req,res,next){

//validar os atributos com YUP
        let colaboradoresSchema = object ({
            col_nome: string().required("Entre  com o nome"),
            col_email: string().email("Entre com um e-mail válido").required("Entre com o e-mail"),
            col_senha: string()
            .required("Entre com a senha")
            .matches(
              "^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{6,}$",
              "A senha precisa ter no mínimo 6 caracteres, sendo: uma maiúscula, uma minúscula, um número e um caractere especial"
            ),
            col_nivel: mixed().oneOf(["colaborador","empresa"],"Tipo de usuário inválido")
        });

//verificando se o atributo não foi passado com parâmetros
        !req.body?.col_nivel && (req.body = {...req.body, col_nivel:""});
        !req.body?.col_telefone && (req.body = {...req.body, col_telefone:""});
        !req.body?.col_nome && (req.body = {...req.body, col_nome:""});

        const col_chave= criarChave (10);
        const {col_nome , col_email }= req.body;
        await MailService.sendActivation({
         col_nome,
         col_email,
         col_chave
        });
        
//atributos de controle do sístema pode-se inserir sem verificar
        req.body={
        ...req.body,
        col_foto: "",
        col_chave: col_chave,
        col_emailconfirmado: false,
        created_at: new Date(), 
        update_at:"" };
        next();

        try {
            await colaboradoresSchema.validate(req.body);
        } 
        catch (error){
            return res.status(400).end({error:error.message});
    
        } 

//localizando uma email existente
        let ColaboradorFinded = apiEndpoints.db
        .get("colaboradores")
        .find({col_email:req.body.col_email})
        .cloneDeep()
        .value();

        if(colaboradorFinded){
            return res.status(400).send ({error :"Usuário já cadastrado"}).end(0);
        }

        next();
    }

    async update (req,res,next){
        req.body={...req.body,created_at: new Date() };
        next();
    }

    async activate(req,res,next){
        const {chave} = req.params;

        let colaborador = apiEndpoints.db 
        .get("colaboradores")
        .find({ usu_chave : chave})
        .value();

        if(!colaborador){
            return res.status(400).send({ error: " Key not finded"}).end();
        }

        colaborador.col_chave=""
        colaborador.col_emailconfirmado = true;
        apiEndpoints.db.write();

        return res.status(200).sed({ response: "User activated"}).end();

    }
    async upluadPhoto(req, res, next){ 
        const { id } = req.params;
        const avatar = req.file;

        let colaborador = await apiEndpoints.db
        .get("colaboradores")
        .find({ id: parseInt(id, 10)})
        .value();

        if(!colaborador) return res.st(400).send({error: "id not found"}).end();
        if(colaborador.col_foto !== ""){
            try{
            fs.unlinkSync('${uploadFolder}/${colaborador.col_foto}');
            }catch(error){
                    console.log('Erro ao excluir o arquivo ${uploadFolder}/${colaborador.col_foto}');
            }
        };


//atualizo e gravo atualização
    colaborador.col_foto = avatar.filename;
    colaborador.col_updated_at = new Date ();
    apiEndpoints.db.write();

    let output = object.assign({}, Colaboradores);
    delete output.col_senha;

    return res
    .status(200)
    .send({...output})
    .end();
    }
    
    async auth (res,req,next){

    try{
      const{col_email, col_senha}=req.body
    //   console.log(col_email,col_senha)
      res.status(200).json({ok:"ok"})
    }catch (error) {

        let Colaboradores = await apiEndpoints.db.get("colaboradores").find({col_email}).cloneDeep().value()

    res.status(400).json({error:error.message})
    }

    }
    async ensureAuthenticated(res,req,next){
    res.status(200).json({ok:"ok"})
    }
}

module.exports = new Colaboradores();