
import config from "config";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';
import FCM from 'fcm-push';

// var config2 = {
//   AWS: {
//     accessKeyId: config.get('AWS.accessKeyId'),
//     secretAccessKey: config.get('AWS.secretAccessKey'),
//     region: config.get('AWS.region')
//   },
//   topicArn: aws_topic,
// };

// var sender = new Sender(config2);

cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret')
});

var serverKey = config.get('fcm_serverKey');
var fcm = new FCM(serverKey);

////////////////// SendInBlue ////////////////////////

import SibApiV3Sdk from "sib-api-v3-sdk";
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = "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";  //client API Key

//////////////// SendInBlue End /////////////////////////////////


module.exports = {

  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'))
    return token;
  },

  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },

  sendMailNodemailer: async (to, name, link) => {
    let html = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <table style="width:100%">
            <tr>
                <th><img src="https://res.cloudinary.com/mobiloittetech/image/upload/v1656333463/kmhyv6gvvvzmhtfo4c3w.png" alt="Logo"
                        style="width:30%;height:30%;"></th>
            </tr>
        </table>
      </div>
      <p style="font-size:1.1em">Hi ${name},</p>
      <p>If you forgot your password, no worries: Click on reset button and we will send you a link you can use to pick a new password.</p>
      <div align="center">
        <a href="${config.get('web')}?token=${link}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
          <span style="display:block;padding:15px 40px 14px;line-height:120%;"><strong><span style="font-size: 16px; line-height: 19.2px;">RESET PASSWORD</span></strong></span>
        </a>
    </div>
      <p style="font-size:0.9em;">Regards,<br />Racing Game</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
  </div>`
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: 'Reset Link',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  sendMail: async (to, name, link) => {
    try {
      var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
      sendSmtpEmail = {
        sender: { email: "info@hovr.site" },
        to: [{ email: to }],
        subject: 'Reset Link',
        htmlContent: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <table style="width:100%">
                <tr>
                    <th><img src="https://res.cloudinary.com/mobiloittetech/image/upload/v1656333463/kmhyv6gvvvzmhtfo4c3w.png" alt="Logo"
                            style="width:30%;height:30%;"></th>
                </tr>
            </table>
          </div>
          <p style="font-size:1.1em">Hi ${name},</p>
          <p>If you forgot your password, no worries: Click on reset button and we will send you a link you can use to pick a new password.</p>
          <div align="center">
            <a href="${config.get('web')}?token=${link}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
              <span style="display:block;padding:15px 40px 14px;line-height:120%;"><strong><span style="font-size: 16px; line-height: 19.2px;">RESET PASSWORD</span></strong></span>
            </a>
        </div>
          <p style="font-size:0.9em;">Regards,<br />Racing Game</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          </div>
        </div>
      </div>`
      };
      return apiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
      throw error;
    }



  },


  subscribeMail: async (to, name, email) => {
    try {
      var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
      sendSmtpEmail = {
        sender: { email: "info@hovr.site" },
        to: [{ email: to }],
        subject: 'NEWSLETTER_NOTIFICTAION',
        htmlContent: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <table style="width:100%">
                <tr>
                    <th><img src="https://res.cloudinary.com/mobiloittetech/image/upload/v1656333463/kmhyv6gvvvzmhtfo4c3w.png" alt="Logo"
                            style="width:30%;height:30%;"></th>
                </tr>
            </table>
          </div>
          <p style="font-size:1.1em">Dear ${name} </p>
          <p>${email} has subscribe on your plateform for newsLetter.</p>
          <!--div align="center">
            <a href="${config.get('web')}?token=${email}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
              <span style="display:block;padding:15px 40px 14px;line-height:120%;"><strong><span style="font-size: 16px; line-height: 19.2px;">RESET PASSWORD</span></strong></span>
            </a>
        </div-->
          <p style="font-size:0.9em;">Regards,<br />Racing Game</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          </div>
        </div>
      </div>`
      };
      return apiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
      throw error;
    }
  },


  subscribeMailNodemailer: async (to, name, email) => {
    let html = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <table style="width:100%">
            <tr>
                <th><img src="https://res.cloudinary.com/mobiloittetech/image/upload/v1656333463/kmhyv6gvvvzmhtfo4c3w.png" alt="Logo"
                        style="width:30%;height:30%;"></th>
            </tr>
        </table>
      </div>
      <p style="font-size:1.1em">Dear ${name} </p>
      <p>${email} has subscribe on your plateform for newsLetter.</p>
      <!--div align="center">
        <a href="${config.get('web')}?token=${email}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
          <span style="display:block;padding:15px 40px 14px;line-height:120%;"><strong><span style="font-size: 16px; line-height: 19.2px;">RESET PASSWORD</span></strong></span>
        </a>
    </div-->
      <p style="font-size:0.9em;">Regards,<br />Racing Game</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
  </div>`
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: 'NEWSLETTER_NOTIFICTAION',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64);
    return result.secure_url;
  },

  getImageUrl: async (files) => {
    try {
      console.log('77 ==>', files)
      var result = await cloudinary.v2.uploader.upload(files[0].path, { resource_type: "auto" });
      return result.secure_url;
    } catch (error) {
      console.log(error)
    }
  },

  getImageUrlByPathObj: async (doc) => {
    var result = await cloudinary.v2.uploader.upload(doc.path, { resource_type: "auto" });
    return result.secure_url;
  },
  paginateGood: async (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  },

  pushNotification: async (message) => {
    var result = await fcm.send(message)
    console.log("299", result)
    return result;

  },
  paginationFunction: (result, page, limit) => {
    // console.log("=======>",result)
    let endIndex = (page) * limit;
    let startIndex = (page - 1) * limit;
    var resultArray = {}

    resultArray.page = page
    resultArray.limit = limit
    resultArray.remainingItems = result.length - endIndex

    if (result.length - endIndex < 0) {
      resultArray.remainingItems = 0
    }
    resultArray.count = result.length
    resultArray.docs = result.slice(startIndex, endIndex)
    resultArray.totalPages = Math.ceil(result.length / Number(resultArray.limit))
    return resultArray
  },
  speedup: async (obj) => {
    try {
      let speed = 15
      let increase = 0
      Object.keys(obj).map(o => {
        if (o === "Aerodynamics") {
          increase += (Number(obj[o]) / 2.5) * 0.25
        }
        if (o === "weight") {
          if (Number(obj[o]) > 20 && Number(obj[o]) <= 30) {
            increase += 0.25
          }
          else if (Number(obj[o]) > 30 && Number(obj[o]) <= 40) {
            increase += 0.50
          }
          else if (Number(obj[o]) > 40 && Number(obj[o]) <= 50) {
            increase += 0.60
          }
          else if (Number(obj[o]) > 50 && Number(obj[o]) <= 60) {
            increase += 0.70
          }
        }
        if (o === "ShoeType") {
          if (obj[o] === "Lightweight") {
            increase += 0.20
          } else if (obj[o] === "Trail") {
            increase += 0.40
          } else if (obj[o] === "Stability") {
            increase += 0.60
          } else if (obj[o] === "MotionControl") {
            increase += 0.80
          } else if (obj[o] === "Cushioned") {
            increase += 1.00
          }
        }
        if (o === "Coat") {
          if (obj[o] === "Longer") {
            increase += 0.20
          } else if (obj[o] === "Short") {
            increase += 0.40
          } else if (obj[o] === "Double") {
            increase += 0.60
          } else if (obj[o] === "Curly") {
            increase += 0.80
          } else if (obj[o] === "Silky") {
            increase += 1.00
          }
        }
        if (o === "Tail") {
          if (obj[o] === "Bobbedm") {
            increase += 0.20
          } else if (obj[o] === "Curly") {
            increase += 0.40
          } else if (obj[o] === "Sickle") {
            increase += 0.60
          } else if (obj[o] === "Otter") {
            increase += 0.80
          } else if (obj[o] === "Whip") {
            increase += 1.00
          } else if (obj[o] === "Saber") {
            increase += 1.10
          }
        }
        if (o==="Nurturing") {
          if (Number(obj[o]) > 0 && Number(obj[o]) <= 5) {
            increase += 0.25
          }
          else if (Number(obj[o]) > 5 && Number(obj[o]) <= 10) {
            increase += 0.50
          }
          else if (Number(obj[o]) > 10 && Number(obj[o]) <= 15) {
            increase += 0.75
          }
          else if (Number(obj[o]) > 15 && Number(obj[o]) <= 20) {
            increase += 1.0
          }
        }
      })
      let result=speed+increase
      if (result>20) {
        result=20
      }
      return result
    } catch (error) {
      return error
    }
  },
  speeddownNumber: async (obj) => {
    try {
      let increase = 0
      Object.keys(obj).map(o => {
        if (o === "Aerodynamics") {
          increase = (Number(obj[o]) / 2.5) * 0.25
        }
        if (o === "weight") {
          if (Number(obj[o]) > 20 && Number(obj[o]) <= 30) {
            increase += 0.25
          }
          else if (Number(obj[o]) > 30 && Number(obj[o]) <= 40) {
            increase += 0.50
          }
          else if (Number(obj[o]) > 40 && Number(obj[o]) <= 50) {
            increase += 0.60
          }
          else if (Number(obj[o]) > 50 && Number(obj[o]) <= 60) {
            increase += 0.70
          }
        }
        if (o==="Nurturing") {
          if (Number(obj[o]) > 0 && Number(obj[o]) <= 5) {
            increase += 0.25
          }
          else if (Number(obj[o]) > 5 && Number(obj[o]) <= 10) {
            increase += 0.50
          }
          else if (Number(obj[o]) > 10 && Number(obj[o]) <= 15) {
            increase += 0.75
          }
          else if (Number(obj[o]) > 15 && Number(obj[o]) <= 20) {
            increase += 1.0
          }
        }
      })
      return increase
    } catch (error) {
      return error
    }
  },
  speeddownAlpha: async (obj) => {
    try {
      let increase = 0
      obj.map(o => {
        if (o.categoryId.name === "ShoeType") {
          if (o.attributes[o.categoryId.name] === "Lightweight") {
            increase += 0.20
          } else if (o.attributes[o.categoryId.name] === "Trail") {
            increase += 0.40
          } else if (o.attributes[o.categoryId.name] === "Stability") {
            increase += 0.60
          } else if (o.attributes[o.categoryId.name] === "MotionControl") {
            increase += 0.80
          } else if (o.attributes[o.categoryId.name] === "Cushioned") {
            increase += 1.00
          }
        }
        if (o === "Coat") {
          if (o.attributes[o.categoryId.name] === "Longer") {
            increase += 0.20
          } else if (o.attributes[o.categoryId.name] === "Short") {
            increase += 0.40
          } else if (o.attributes[o.categoryId.name] === "Double") {
            increase += 0.60
          } else if (o.attributes[o.categoryId.name] === "Curly") {
            increase += 0.80
          } else if (o.attributes[o.categoryId.name] === "Silky") {
            increase += 1.00
          }
        }
        if (o === "Tail") {
          if (o.attributes[o.categoryId.name] === "Bobbedm") {
            increase += 0.20
          } else if (o.attributes[o.categoryId.name] === "Curly") {
            increase += 0.40
          } else if (o.attributes[o.categoryId.name] === "Sickle") {
            increase += 0.60
          } else if (o.attributes[o.categoryId.name] === "Otter") {
            increase += 0.80
          } else if (o.attributes[o.categoryId.name] === "Whip") {
            increase += 1.00
          } else if (o.attributes[o.categoryId.name] === "Saber") {
            increase += 1.10
          }
        }
        return increase
      })
      return increase
    } catch (error) {
      return error
    }
  }
}
