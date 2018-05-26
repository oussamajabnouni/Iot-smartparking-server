const nodemailer = require('nodemailer');

var send=  function(tomail,password){

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'osama.jbnoni@gmail.com',
        pass: '********'
    }
});
// setup email data with unicode symbols
let mailOptions = {
    from: 'Smart Parking Administrator', // sender address
    to: tomail, // list of receivers
    subject: 'Welcome to our family ✔', // Subject line
    text: 'Hello world ', // plain text body
    html: '<div style="height: 120px;padding-top: 23%;text-align: center;font-size:150%;"><div>'+
    'You password is : <b>'+password+'</b></div></div>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
});

}

module.exports = send
