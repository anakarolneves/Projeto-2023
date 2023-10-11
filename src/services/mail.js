const nodemailer = require("nodemailer");
const configMail = require("../config/mail");
const transporter = nodemailer.createTransport(configMail);

class MailService {
  async sendMail(message) {
    let resultado;
    try {
      resultado = transporter.sendMail({
        ...configMail.default,
        ...message
      });
    } catch (error) {
      console.log(error);
      return error;
    }
    return resultado;
  }

  async sendActivation({ emp_nome, emp_email, emp_chave }) {
    const output = `Olá, ${emp_nome}, <br/><br/>
      <a href="https://anakarolneves-ominous-orbit-6q46qjpr97p2rw7p-8080.preview.app.github.dev/ativacao${emp_chave}">Chave</a>
    `;
    try {
      await this.sendMail({
        to: `${emp_nome} <${emp_email}>`,
        subject: "Confirmação de E-mail",
        html: output
      });
    } catch (error) {
      console.log(error);
      return error;
    }
    return true;
  }
}

module.exports = new MailService();