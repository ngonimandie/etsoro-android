'use strict';
const BootBot = require('./lib/BootBot');
const config = require('config')
const echoModule = require('./examples/modules/echo');

/*
 *Ecocash 
 */
/**
 * Test page access token :
 * EAANJUh7qVgoBAO15uU0CbNILxjrZCpnNj2GhPDYxp5N3k0ZAbSrfCftRRhU0lZBvBLyCT79cGTQ3UcDg0wfLI4Eg1zHqB9MBTRCMo4r2SewDFgBvht9GiTJRzZBzm1FhxM6IMFvzS756584c3d64bQeudam9bgXEZAaTV0OEVqnjD2ibL4eiyd0EwpZAYMFXVGrIk3hN15RAZDZD
 */
const { Paynow } = require("paynow");
let paynow = new Paynow("11207", "7cd5b3e7-87df-4ad0-9776-0491b491d35b");

/**
 * Mail Sending
 * 
 */
const nodemailer = require("nodemailer");

/**
 * PDF Certficate
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a document
const doc = new PDFDocument({
  layout: 'landscape',
  size: 'A4',
});

// Helper to move to next line
function jumpLine(doc, lines) {
  for (let index = 0; index < lines; index++) {
    doc.moveDown();
  }
}

//Download file using express
var express = require('express')
var app = express()
//Look for statics first
app.use(express.static('public'));
//Return the index for any other GET request
app.get('/*', function (req, res) {
    res.sendFile('index.html',  'public');
});
/**
 * Bot Verification
 */
const bot = new BootBot({
  accessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET,
  //appSecret: config.get('app_secret')
});
//bot.module(echoModule);

/*Start Menu */
const startMenu = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'Register for Marathon', payload: 'MENU_REGISTER' },
      { type: 'postback', title: 'Submit Results', payload: 'MENU_SUBMIT_RESULTS' },
      { type: 'postback', title: 'Tell me more', payload: 'MENU_TELL_ME_MORE' }
    ];
    convo.sendButtonTemplate(`Welcome to Island Hospice Virtual Marathon`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('start_menu_item', text)
  }, [
    {
      event: 'postback:MENU_REGISTER',
      callback: (payload, convo) => {
        convo.say(`Let's start the registration process`).then(() => askName(convo));
      }
    },
    {
      event: 'postback:MENU_SUBMIT_RESULTS',
      callback: (payload, convo) => {
        convo.say(`Starting the Submission process`).then(() => askRaceNumber(convo));
      }
    },
    {
      event: 'postback:MENU_TELL_ME_MORE',
      callback: (payload, convo) => {
        convo.say(`Let's just chat. There isn't much more infortmation to talk about the marathon for now`).then(() => askName(convo));
      }
    }
    /*,
    {
      pattern: ['yes', /yea(h)?/i, 'yup'],
      callback: () => {
        convo.say('You said YES!').then(() => askAge(convo));
      }
    }
    */
  ]);
};

const askName = (convo) => {
  convo.ask(`What's your first name?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('name', text);
    convo.say(`Okay ${text}`).then(() => askSurname(convo));
  });
};

const askSurname = (convo) => {
  convo.ask(`What is your Surname?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('surname', text);
    convo.say(`Got it, Please give me more info about yourself `).then(() => askGender(convo));
  });
};
const askEmail = (convo) => {
  convo.ask(`What is your email address?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('email', text);
    convo.say(`I may use this email to send you some information later. `).then(() => askMobile(convo));
  });
};

const askMobile = (convo) => {
  convo.ask(`What is your mobile number?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('mobile', text);
    convo.say(`Got it!`).then(() => askRaceCategory(convo));
  });
};

const askGender = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'Male', payload: 'GENDER_MALE' },
      { type: 'postback', title: 'Female', payload: 'GENDER_FEMALE' },
      { type: 'postback', title: 'I don\'t wanna say', payload: 'GENDER_UNKNOWN' }
    ];
    convo.sendButtonTemplate(`Which Gender best describes you?`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('gender', text);
    convo.say(`Ok thanks.`).then(() => askAge(convo));
  }, [
    {
      event: 'postback',
      callback: (payload, convo) => {
        convo.say('You clicked on a button').then(() => askAge(convo));
      }
    },
    {
      event: 'postback:GENDER_MALE',
      callback: (payload, convo) => {
        convo.say('You said you are a Male').then(() => askAge(convo));
      }
    },
    {
      event: 'quick_reply',
      callback: () => { }
    },
    {
      event: 'quick_reply:COLOR_BLUE',
      callback: () => { }
    },
    {
      pattern: ['yes', /yea(h)?/i, 'yup'],
      callback: () => {
        convo.say('You said YES!').then(() => askAge(convo));
      }
    }
  ]);
};


const askAge = (convo) => {
  convo.ask(`Please tell me your age in years... eg 25`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('age', text);
    convo.say('Ok').then(() => askEmail(convo));

    /*
    convo.say(`That's great!`).then(() => {
      convo.say(`Ok, here's what you told me about you:
      - Name: ${convo.get('name')}
      - Your Race: ${convo.get('race')}
      - Gender: ${convo.get('gender')}
      - Age: ${convo.get('age')}
      `);
      convo.end();
    });
    */
  });
};

const askRaceCategory = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: '5 km', payload: 'RACE_MENU_5KM' },
      { type: 'postback', title: '10 km', payload: 'RACE_MENU_10KM' },
      { type: 'postback', title: '21 km', payload: 'RACE_MENU_21KM' },
    ];
    convo.sendButtonTemplate(`Choose Race Category`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('race_menu_value', text);
  }, [
    {
      event: 'postback',
      callback: (payload, convo) => {
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    },
    {
      event: 'postback:RACE_MENU_5KM',
      callback: (payload, convo) => {
        convo.set(`race`, '5KM');
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    },
    {
      event: 'postback:RACE_MENU_10KM',
      callback: (payload, convo) => {
        convo.set(`race`, '10KM');
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    }, {
      event: 'postback:RACE_MENU_21KM',
      callback: (payload, convo) => {
        convo.set(`race`, '21KM');
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    }
  ]);
};
const askPaymentAmount = (convo) => {
  convo.ask(`Enter amount as digit eg. 500`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('payment_amount', text);
    askPaymentMethod(convo);
  });
};

const askPaymentMethod = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'Ecocash', payload: 'PAYMENT_METHOD_MENU_ECOCASH' },
      { type: 'postback', title: 'Visa/Mastercard', payload: 'PAYMENT_METHOD_MENU_VISA' },
    ];
    convo.sendButtonTemplate(`Choose a payment Method`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('payment_method_menu_value', text);
  }, [
    {
      event: 'postback:PAYMENT_METHOD_MENU_ECOCASH',
      callback: (payload, convo) => {
        convo.say(`Enter your ecocash Number eg. 0779077679 and enter pin when prompted on your phone and type "Done" when you have paid`).then(() => askEcocashNumber(convo));
      }
    },
    {
      event: 'postback:PAYMENT_METHOD_MENU_VISA',
      callback: (payload, convo) => {
        convo.say(`Complete your VISA/Mastercard payment and type "Done" when you have paid`).then(() => confirmEcocashPayment(convo));
      }

    },
  ]);
};

const askEcocashNumber = (convo) => {
  convo.ask(`Enter ecocash number (eg: 0779077679)`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('ecocash_number', text);
    confirmEcocashPayment(convo);
  });
};

const confirmEcocashPayment = (convo) => {
  convo.say(`Verifying your ecocash payment... please wait.`);
  const email = convo.get('email');
  const paymentItem = 'Marathon Registration fee';
  const paymentMobileNumber = convo.get('ecocash_number');
  const paymentAmount = convo.get('payment_amount');
  const invoiceRef = 'IHMarathon' + email + paymentAmount;
  const payment = paynow.createPayment(invoiceRef, email);
  let paynowResp = "No response from paynow...";
  payment.add(paymentItem, paymentAmount, 1);
  paynow.sendMobile(payment, paymentMobileNumber, "ecocash")
    .then(function (response) {
      // paynowResp= paynowResponse;
      if (response.success) {
        // These are the instructions to show the user.
        // Instruction for how the user can make payment
        // eslint-disable-next-line prefer-const
        let instructions = response.instructions; // Get Payment instructions for the selected mobile money method
        const pollUrl = response.pollUrl;
        paynowResp = instructions;
        const status = paynow.pollTransaction(pollUrl);
        console.log(pollUrl);
        if (status.paid()) {
          // Yay! Transaction was paid for
          // resp.send("paid");
          paynowResp = "paid";
          console.log("Payment Successfully Made!");
          convo.say(paynowResp).then(() => recordProgress(convo));
          //resp.send(paynowResp);
        } else {
          console.log("Why you no pay?");
          // resp.send("Payment Failed... To completed transaction, please complete payment first...");
          paynowResp = "Payment Failed... To complete registration, please complete payment first...";
          convo.say(paynowResp).then(() => recordProgress(convo));
        }
        // Get poll url for the transaction. This is the url used to check the status of the transaction.
        // You might want to save this, we recommend you do it
        // const pollUrl = response.pollUrl;
        // paynowResp= instructions;
        // resp.send(paynowResp);
        console.log(instructions);
      } else {
        // paynowResp= response.error;
        console.log(response.error);
      }
    }).catch((ex) => {
      // Ahhhhhhhhhhhhhhh
      // *freak out*

      paynowResp = "Wanna try paying again? Yes or No...";
      console.log("Your application has broken an axle", ex);
      recordProgress(convo);

      /**
       * 
       * convo.say(paynowResp).then(() => askPaymentAmount(convo));

      convo.ask(`Do you want to redo the transaction? Yes/No`, (payload, convo, data) => {
        const text = payload.message.text;
        convo.set('rety_ecocash_transaction', text);
        confirmEcocashPayment(convo);
      });
       */


    });

};
const confirmVisaPayment = (convo) => {
  convo.say(`Payment not complete`);

};
// Setting this to true would disable the text input on mobile
// and the user will only be able to communicate via the persistent menu.
const disableInput = false;
const recordProgress = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'Yes', payload: 'RECORD_PROGRESS_YES' },
      { type: 'postback', title: 'No', payload: 'RECORD_PROGRESS_NO' },
    ];
    convo.sendButtonTemplate(`You can use any fitneess app to record your progress during the race. We have set up the race on Adidas Runtastic, Strava and Nike Run. Do you use any one of these?`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('record_progress_value', text);
  }, [
    {
      event: 'postback',
      callback: (payload, convo) => {
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    },
    {
      event: 'postback:RECORD_PROGRESS_YES',
      callback: (payload, convo) => {
        convo.set(`has_fitness_app`, 'YES');
        //bot.module(echoModule);
        bot.setPersistentMenu([
          {
            type: 'web_url',
            title: 'ADIDAS RUNNING',
            url: 'https://www.runtastic.com/'
          },
          {
            type: 'web_url',
            title: 'NIKE RUN',
            url: 'https://www.nike.com/nrc-app'
          },
          {
            type: 'web_url',
            title: 'STRAVA',
            url: 'https://www.strava.com/login'
          }
        ], disableInput);



        convo.say('Make sure that you use the applications :ADIDAS RUNNING, NIKE RUN or STRAVA to register for the run').then(() => askCountry(convo));
      }
    },
    {
      event: 'postback:RECORD_PROGRESS_NO',
      callback: (payload, convo) => {
        convo.set(`has_fitness_app`, 'NO');
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    },
  ]);
};
const applicationLinks = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'STRAVA', payload: 'RUN_APP_STRAVA' },
      { type: 'postback', title: 'NIKE RUN', payload: 'RUN_APP_NIKE' },
      { type: 'postback', title: 'ADIDAS RUNNING', payload: 'RUN_APP_ADIDAS' },
    ];
    convo.sendButtonTemplate(`Use these app Links to register for the run`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('run_app_value', text);
  }, [
    {
      event: 'postback',
      callback: (payload, convo) => {
        convo.say('Make sure that you have completed you are using one of the above apps');
      }
    },
    {
      event: 'postback:RUN_APP_STRAVA',
      callback: (payload, convo) => {
        convo.set(`race`, '5KM');
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    },
    {
      event: 'postback:RUN_APP_NIKE',
      callback: (payload, convo) => {
        convo.set(`race`, '10KM');
        convo.say('In order to register for the Marathon you need to pay a participation fee. This fee is ZWL$500 or USD$5. All proceeding are for fundraising').then(() => askPaymentAmount(convo));
      }
    }, {
      event: 'postback:RUN_APP_ADIDAS',
      callback: (payload, convo) => {
        convo.set(`run_app`, 'adidas');
        http.get('*',function(req,res){  
          res.redirect('http://exmple.com')
      })
      }
    }
  ]);
};
const askCountry = (convo) => {
  convo.ask(`Which country are you going to be participating from?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('country', text);
    askCity(convo);
  });
};
const askCity = (convo) => {
  convo.ask(`Which city in ${convo.get('country')} will you be participating in?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('city', text);
    askHowYouHeard(convo);
  });
};
const askHowYouHeard = (convo) => {
  convo.ask(`Please tell me how you heard about the Marathon?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('how_you_heard', text);
    convo.say('You have successfully registered for the Marathon. I will be sending you an email in a moment.').then(() => sendMail(convo));
  });
};
const sendMail = (convo) => {
  const emailRecepient = convo.get('email');
  const raceNumber= "I"+ convo.get('mobile') + "M";

  let testAccount = nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'namadingomwamba@gmail.com', // generated ethereal user
      pass: 'Nama_@000', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = transporter.sendMail({
    from: '"Island Hospice 👻" namadingomwamba@gmail.com', // sender address
    to: emailRecepient, // list of receivers
    subject: "Marathon Reg Confirmation ✔", // Subject line
    text: "Congratulations ${convo.get('name')} ${convo.get('surname')} ", // plain text body
    html: "<b> Your Race number is I20" +  "21H</b> <br/> Use this number to Submit Results", // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
const sendCertificateMail = (convo) => {
  const emailRecepientName = convo.get('name');
  const emailRecepient = convo.get('email');
  const raceNumber= "I"+ convo.get('mobile') + "M";

  let testAccount = nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'namadingomwamba@gmail.com', // generated ethereal user
      pass: 'Nama_@000', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = transporter.sendMail({
    from: '"Island Hospice 👻" namadingomwamba@gmail.com', // sender address
    to: emailRecepient, // list of receivers
    subject: "Certificate of Appreciation ✔", // Subject line
    text: "Congratulations ${convo.get('name')} ${convo.get('surname')} ", // plain text body
    html: "<b> Dear" + emailRecepientName+  "</b> <br/> Kindly find attached the certificate for your completion of the Island Hospice virtual Marathon", // html body
    attachments: [
      {   // file on disk as an attachment
        filename: 'Certificate_of_appreciation_for_' + emailRecepientName +".pdf",
        path: './public/Certificate_of_appreciation_for_' + emailRecepientName +'.pdf' // stream this file
    },]
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));



};

/**
 * const joinRace = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'ADIDAS', payload: 'ADIDAS_LINK' },
      { type: 'postback', title: 'NIKE RUN', payload: 'ADIDAS_LINK' },
      { type: 'postback', title: 'STRAVA', payload: 'STRAVA_LINK' },
    ];
    convo.sendButtonTemplate(`You can join the race with your prefered fitness app using the link below`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('fitness_app', text);
  }, [
    {
      event: 'postback:_ADIDAS_LINK',
      callback: (payload, convo) => {
        convo.say(`Enter your ecocash Number eg. 0779077679 and enter pin when prompted on your phone and type "Done" when you have paid`).then(() => askEcocashNumber(convo));
      }
    },
    {
      event: 'postback:PAYMENT_METHOD_MENU_VISA',
      callback: (payload, convo) => {
        convo.say(`Complete your VISA/Mastercard payment and type "Done" when you have paid`).then(() => confirmVisaPayment(convo));
      }

    },
  ]);
};
 */

const askRaceNumber = (convo) => {
  convo.ask(`Please enter your race number`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('result_race_number', text);
    askRaceTime(convo);
  });
};

const askRaceTime = (convo) => {
  convo.ask(`Enter your race time in the format HH:MM. e.g enter 2:56 fro 2 hours and 56 minutes`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('race_time', text);
    askResultRaceCategory(convo);
  });
};

const askResultRaceCategory = (convo) => {
  convo.ask(`Did you run 5km, 10 km, 21km or 41km?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('result_race_category', text);
    askResultScreenshot(convo);
  });
};
const askResultScreenshot = (convo) => {
  convo.ask(`Please upload a screenshot of the results of your race`, (payload, convo, data) => {
    const image = payload.message.image;
    convo.set('result_screenshot', image);
    downloadCertificate(convo).then(() => sendCertificateMail(convo));
  });
};

const downloadCertificate = (convo) => {

  convo.say('Certificate is being generated, check your email for a pdf Certificate').then(() => sendThankYouMessage(convo));
  const firstName= convo.get('name');
  const lastName= convo.get('surname');
  const race= convo.get('race');

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(fs.createWriteStream('./public/Certificate_of_appreciation_for_' + firstName +'.pdf'));

  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');

  doc.fontSize(10);

  // Margin
  const distanceMargin = 18;

  doc
    .fillAndStroke('#11d12a')
    .lineWidth(20)
    .lineJoin('round')
    .rect(
      distanceMargin,
      distanceMargin,
      doc.page.width - distanceMargin * 2,
      doc.page.height - distanceMargin * 2,
    )
    .stroke();

  // Header
  const maxWidth = 140;
  const maxHeight = 70;

  doc.image('./assets/images/logo-island.jpg', doc.page.width / 2 - maxWidth / 2, 60, {
    fit: [maxWidth, maxHeight],
    align: 'center',
  });

  jumpLine(doc, 5)

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Island Hospice Virtual Marathon', {
      align: 'center',
    });

  jumpLine(doc, 2)

  // Content
  doc
    .font('./assets/fonts/NotoSansJP-Regular.otf')
    .fontSize(16)
    .fill('#021c27')
    .text('CERTIFICATE OF APPRECIATION', {
      align: 'center',
    });

  jumpLine(doc, 1)

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Present to', {
      align: 'center',
    });

  jumpLine(doc, 2)

  doc
    .font('./assets/fonts/NotoSansJP-Bold.otf')
    .fontSize(24)
    .fill('#021c27')
    .text(firstName +'' + lastName, {
      align: 'center',
    });

  jumpLine(doc, 1)

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Successfully completed the virtual marathon.', {
      align: 'center',
    });

  jumpLine(doc, 7)

  doc.lineWidth(1);

  // Signatures
  const lineSize = 174;
  const signatureHeight = 390;

  doc.fillAndStroke('#021c27');
  doc.strokeOpacity(0.2);

  const startLine1 = 128;
  const endLine1 = 128 + lineSize;
  doc
    .moveTo(startLine1, signatureHeight)
    .lineTo(endLine1, signatureHeight)
    .stroke();

  const startLine2 = endLine1 + 32;
  const endLine2 = startLine2 + lineSize;
  doc
    .moveTo(startLine2, signatureHeight)
    .lineTo(endLine2, signatureHeight)
    .stroke();

  const startLine3 = endLine2 + 32;
  const endLine3 = startLine3 + lineSize;
  doc
    .moveTo(startLine3, signatureHeight)
    .lineTo(endLine3, signatureHeight)
    .stroke();

  doc
    .font('./assets/fonts/NotoSansJP-Bold.otf')
    .fontSize(10)
    .fill('#021c27')
    .text(race, startLine1, signatureHeight + 10, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: 'center',
    });

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Race Distance', startLine1, signatureHeight + 25, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: 'center',
    });

  doc
    .font('./assets/fonts/NotoSansJP-Bold.otf')
    .fontSize(10)
    .fill('#021c27')
    .text(firstName +' ' + lastName, startLine2, signatureHeight + 10, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: 'center',
    });

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Participant', startLine2, signatureHeight + 25, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: 'center',
    });

  doc
    .font('./assets/fonts/NotoSansJP-Bold.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Island Hospice', startLine3, signatureHeight + 10, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: 'center',
    });

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text('Marathon Host', startLine3, signatureHeight + 25, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: 'center',
    });

  jumpLine(doc, 4);

  // Validation link
  const link =
    'https://islandhospice.care';

  const linkWidth = doc.widthOfString(link);
  const linkHeight = doc.currentLineHeight();

  doc
    .underline(
      doc.page.width / 2 - linkWidth / 2,
      448,
      linkWidth,
      linkHeight,
      { color: '#021c27' },
    )
    .link(
      doc.page.width / 2 - linkWidth / 2,
      448,
      linkWidth,
      linkHeight,
      link,
    );

  doc
    .font('./assets/fonts/NotoSansJP-Light.otf')
    .fontSize(10)
    .fill('#021c27')
    .text(
      link,
      doc.page.width / 2 - linkWidth / 2,
      448,
      linkWidth,
      linkHeight
    );

  // Footer
  const bottomHeight = doc.page.height - 100;

  doc.image('./assets/images/logo-island.jpg', doc.page.width / 2 - 30, bottomHeight, {
    fit: [60, 60],
  });

  doc.end();
};

const saveCertificate = (convo) => {
  
  app.get('/downloadCertificate/', (req, res) => {
    res.download('./assets/certificates/vmarathon_certificate.pdf');

  })
};
const sendThankYouMessage = (convo) => {
  convo.say('Thank you for participating in the Marathon for 2021');
  convo.end();
};

bot.hear('Marathon', (payload, chat) => {
  chat.conversation((convo) => {
    convo.sendTypingIndicator(1000).then(() => startMenu(convo));
  });
});

bot.hear('hey', (payload, chat) => {
  chat.say('Hello friend', { typing: true }).then(() => (
    chat.say('So, I’m good at guiding you though the Island Hospice Marathon Registration. If you need help just enter “help.”', { typing: true })
  ));
});
bot.hear('test email', (payload, chat) => {
  chat.say('Hey tester', { typing: true }).then(() => (
    chat.say('This will test the email functionality', { typing: true }).then(() => sendMail())
  ));
});
bot.hear('save cert', (payload, chat) => {
  chat.say('Hey tester... Download Should Start Shortly', { typing: true }).then(() => saveCertificate());
});
bot.hear('test pdf', (payload, chat) => {
  chat.say('Hey tester', { typing: true }).then(() => (
    chat.say('This will test the pdf functionality', { typing: true }).then(() => downloadCertificate())
  ));
});


bot.hear('color', (payload, chat) => {
  chat.say({
    text: 'Favorite color?',
    quickReplies: ['Red', 'Blue', 'Green']
  });
});

bot.hear('image', (payload, chat) => {
  chat.say({
    attachment: 'image',
    url: 'http://static3.gamespot.com/uploads/screen_medium/1365/13658182/3067965-overwatch-review-promo-20160523_v2.jpg',
    quickReplies: ['Red', 'Blue', 'Green']
  });
});

bot.hear('button', (payload, chat) => {
  chat.say({
    text: 'Select a button',
    buttons: ['Male', 'Female', `Don't wanna say`]
  });
});

bot.hear('convo', (payload, chat) => {
  chat.conversation(convo => {
    convo.ask({
      text: 'Favorite color?',
      quickReplies: ['Red', 'Blue', 'Green']
    }, (payload, convo) => {
      const text = payload.message.text;
      convo.say(`Oh your favorite color is ${text}, cool!`);
      convo.end();
    }, [
      {
        event: 'quick_reply',
        callback: (payload, convo) => {
          const text = payload.message.text;
          convo.say(`Thanks for choosing one of the options. Your favorite color is ${text}`);
          convo.end();
        }
      }
    ]);
  });
});

bot.start();

module.exports = BootBot;
