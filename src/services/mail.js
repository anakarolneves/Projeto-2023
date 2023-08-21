const nodemailer = require("nodemailer");
const configMail = require("../config/mail");
const transporter = nodemailer.createTransport(configMail);

class MailService {
     async sendMail (message) {
        let resultado;
        try{
            resultado = transporter.sendMail({
                ...configMail.default,
                ...message
            });
        } catch (error){
            
            console.log(error);
            return error;
        }
        return resultado;
    };
    
    async sendActivation ({col_nome, col_email,col_chave}){
        const output = `Olá ${col_nome}... <br/><br/>
        Você precisa validar seu cadastro em:
        <a href="https://anakarolneves-ominous-orbit-6q46qjpr97p2rw7p-8080.preview.app.github.dev/ativacao${col_chave}"> chave </a>`;

        try {
            await this.sendMail({
                to:"${col_nome} <${col_email}>",
                subject: "Confimação de cadastro",
                HTML: output

            });
        } catch (error){
            console.log(error);
            return error;
        }
        return true;

    }
}


module.exports =new MailService ();