const configMail={
    host : "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:{
        user: "projetotcc@gmail.com",
        pass:"ANINHA@$123"
    },
    default:{
        from:"no-reply <noreply@acompanhatcc.com.br>"
    }
};

module.exports=configMail;