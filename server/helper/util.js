import config from "config";
import jwt from 'jsonwebtoken';
import Sender from 'aws-sms-send';
const fs = require('fs');
var aws_topic = 'arn:aws:sns:us-east-1:729366371820:coinbaazar';
var config2 = {
  AWS: {
    accessKeyId: config.get('AWS.accessKeyId'),
    secretAccessKey: config.get('AWS.secretAccessKey'),
    region: config.get('AWS.region')
  },
  topicArn: aws_topic,
};

var sender = new Sender(config2);

import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';

import QRCode from 'qrcode';


////////////////// SendInBlue ////////////////////////

// import SibApiV3Sdk from "sib-api-v3-sdk";
// var defaultClient = SibApiV3Sdk.ApiClient.instance;
// var apiKey = defaultClient.authentications["api-key"];
// apiKey.apiKey = "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";  //client API Key

//////////////// SendInBlue End /////////////////////////////////



cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret')
});


import qrcode from 'qrcode';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get("sendGridKey"));

module.exports = {

  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },

  dateTime() {
    var today = new Date(new Date() - new Date().getTimezoneOffset() * 60 * 1000).toISOString();
    var check = "";
    check = today.split(".")[0].split("T")
    var time = check[1].split(":")[0] > "11" ? " PM" : " AM"
    check = check[0].split("-").reverse().join("/") + " " + check[1] + time;
    return check
  },

  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'), { expiresIn: "24h" })
    return token;
  },

  sendMail: async (to, subject, body) => {
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: subject,
      text: body
    };
    return await transporter.sendMail(mailOptions)
  },

  sendMailContent: async (email, body) => {
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: "OpenSea2",
      text: body,
      // html: html,

    };
    return await transporter.sendMail(mailOptions)
  },
  
  // sendMailRequest: async (to, body) => {
  //   try {
  //     var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     sendSmtpEmail = {
  //       sender: { email: "info@FIEREX.site" },
  //       to: [{ email: to }],
  //       subject: "UNBLOCK_REQUEST",
  //       htmlContent: body,
  //     };
  //     return apiInstance.sendTransacEmail(sendSmtpEmail)
  //   } catch (error) {
  //     // console.log(error)
  //     throw error;
  //   }
  // },

  getImageUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files[0].path)
    return result.secure_url;
  },

  getImageUrl1: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files.path)
    return result.secure_url;
  },

  getImageUrlforPDF_docx: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files[0].path, { resource_type: "auto" })
    return result.secure_url;
  },

  genBase64: async (data) => {
    return await qrcode.toDataURL(data);
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64, { resource_type: 'auto' });
    return result.secure_url;
  },

  uploadImage(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, function (error, result) {
        if (error) {
          reject(error);

        }
        else {
          resolve(result.url)
        }
      });
    })
  },

  async ipfsUpload(tokenId, tokenData) {
    try {
      const { cid } = await ipfs.add({ path: tokenId, content: JSON.stringify(tokenData) }, { cidVersion: 1, hashAlg: 'sha2-256' });
      return cid.toString()
    } catch (error) {
      console.log('error', error);
    }
  },

  async addFile(fileName, filePath) {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file }, { cidVersion: 1, hashAlg: 'sha2-256' });
    const fileHash = fileAdded.cid.toString();
    return fileHash;
  },

  async deleteFile(filePath) {
    fs.unlink(filePath, (deleteErr) => {
      if (deleteErr) {
        console.log("Error: failed to delete the file", deleteErr);
      }
    })
  },

  // sendSubscribeTemplateForUser: async (email, link) => {
  //   try {
  //     // var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     // var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     // sendSmtpEmail = {
  //     //   sender: { email: "info@FIEREX.site" },
  //     //   to: [{ email: to }],
  //     //   subject: 'SUBSCRIBER_DETAIL',
  //       let html= `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">
      
  //     <head>
  //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta name="x-apple-disable-message-reformatting">
  //       <!--[if !mso]>
  //               <!-->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //       <title></title>
  //       <style type="text/css">
  //         table,
  //         td {
  //           color: #000000;
  //         }
      
  //         a {
  //           color: #0000ee;
  //           text-decoration: underline;
  //         }
      
  //         @media only screen and (min-width: 670px) {
  //           .u-row {
  //             width: 650px !important;
  //           }
      
  //           .u-row .u-col {
  //             vertical-align: top;
  //           }
      
  //           .u-row .u-col-100 {
  //             width: 650px !important;
  //           }
  //         }
      
  //         @media (max-width: 670px) {
  //           .u-row-container {
  //             max-width: 100% !important;
  //             padding-left: 0px !important;
  //             padding-right: 0px !important;
  //           }
      
  //           .u-row .u-col {
  //             min-width: 320px !important;
  //             max-width: 100% !important;
  //             display: block !important;
  //           }
      
  //           .u-row {
  //             width: calc(100% - 40px) !important;
  //           }
      
  //           .u-col {
  //             width: 100% !important;
  //           }
      
  //           .u-col>div {
  //             margin: 0 auto;
  //           }
  //         }
      
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
      
  //         table,
  //         tr,
  //         td {
  //           vertical-align: top;
  //           border-collapse: collapse;
  //         }
      
  //         p {
  //           margin: 0;
  //         }
      
  //         .ie-container table,
  //         .mso-container table {
  //           table-layout: fixed;
  //         }
      
  //         * {
  //           line-height: inherit;
  //         }
      
  //         a[x-apple-data-detectors='true'] {
  //           color: inherit !important;
  //           text-decoration: none !important;
  //         }
  //       </style>
  //       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
  //     </head>
      
  //     <body class="clean-body u_body"
  //       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  //       <table
  //         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
  //         cellpadding="0" cellspacing="0">
  //         <tbody>
  //           <tr style="vertical-align: top">
  //             <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <div
  //                           stestingmailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;background-color: #8#F6F0BC;"
  //                                   align="center">
  //                                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                     <tbody>
  //                                       <tr>
  //                                         <td style="padding-right: 0px;padding-left: 0px;" align="center">
  //                                           <img align="center" border="0"
  //                                             src="https://res.cloudinary.com/dgsoomgbn/image/upload/v1675858315/Screenshot_2023-02-08_at_5.40.32_PM_byouxn.png"
  //                                             alt="Image" title="Image"
  //                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
  //                                             width="117">
  //                                         </td>
  //                                       </tr>
  //                                     </tbody>
  //                                   </table>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div
  //                                     style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
  //                                     <br>
  //                                     <br>
  //                                     <p style="font-size: 14px; line-height: 140%;">Verify Your email For Subscribe
  //                                       <br>Please Confirm that you want to use this email as your subscribe email
  //                                       address.Once its done you will able to receive all notification.</br>
  //                                       <br><br>
  //                                       <b>
  //                                         </head>
      
  //                                         <body>
  //                                           <a href=${link}>
  //                                             <button style="background: #0BA8E6;
  //                                             / Green /
  //                                             border: none;
  //                                             color: white;
  //                                             padding: 10px 30px;
  //                                             text-align: center;
  //                                             text-decoration: none;
  //                                             font-size: 12px;
  //                                             margin: 4px 2px;
  //                                             cursor: pointer;
  //                                             -webkit-transition-duration: 0.4s;
  //                                             / Safari /
  //                                             transition-duration: 0.4s;">Verify Email</button>
  //                                           </a>
  //                                       </b> <br>
  //                                       <br>
  //                                       <n>If you don't want to subscribe or didn't request this, just ignore and delete this
  //                                         message.</n>
  //                                     </p>
  //                                     <br>
  //                                     <p>Thanks and Regards, <br>
  //                                       <b>FIEREX.site</b>
  //                                     </p><br/>
  //                                     <p style="font-size:70%;">You received this email because you subscribe on this Plateform. <br>
  //                                     </p>
  //                                     <a href=${link}>
  //                                             <p style="font-size:70%;">Unsubscribe<p/>
  //                                           </a>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <td style="" align="left">
  //                                 <div align="center">
  //                                   <a href="${link}" target="_blank"
  //                                     style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;"></a>
  //                                 </div>
  //                               </td>
  //                               <tr></tr>
  //                             </tbody>
  //                           </table>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #DFF1FF;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <br>
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;background-color: #DFF1FF;"
  //                                   align="left">
  //                                   <div style="color: #00000; line-height: 150%; text-align: center; word-wrap: break-word;">
  //                                     <p style="font-size: 14px; line-height: 140%;">
  //                                       <span style="font-size: 14px; line-height: 19.6px;">Copyright@2022 FIEREX</span>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </body>
      
  //     </html>`
      
  //     var transporter = nodemailer.createTransport({
  //       service: config.get('nodemailer.service'),
  //       auth: {
  //         "user": config.get('nodemailer.email'),
  //         "pass": config.get('nodemailer.password')
  //       }
  //     });
  //     var mailOptions = {
  //       from: "<do_not_reply@gmail.com>",
  //       to: email,
  //       subject: "PAYMENT VERIFY",
  //       // text: body,
  //       html: html,
  
  //     };
  //     return await transporter.sendMail(mailOptions)
  //   } catch (error) {
  //     throw error;
  //   }



  // },

  // sendSubscribeTemplateForAdmin: async (email, SendEmail) => {
  //   try {
  //     // var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     // var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     // sendSmtpEmail = {
  //     //   sender: { email: "info@FIEREX.site" },
  //     //   to: [{ email: to }],
  //     //   subject: 'SUBSCRIBER_DETAIL',
  //      let html= `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">
      
  //     <head>
  //       <!--[if gte mso 9]>
  //         <xml>
  //           <o:OfficeDocumentSettings>
  //             <o:AllowPNG/>
  //             <o:PixelsPerInch>96</o:PixelsPerInch>
  //           </o:OfficeDocumentSettings>
  //         </xml>
  //         <![endif]-->
  //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta name="x-apple-disable-message-reformatting">
  //       <!--[if !mso]>
  //               <!-->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //       <!--
  //                 <![endif]-->
  //       <title></title>
  //       <style type="text/css">
  //         table,
  //         td {
  //           color: #000000;
  //         }
      
  //         a {
  //           color: #0000ee;
  //           text-decoration: underline;
  //         }
      
  //         @media only screen and (min-width: 670px) {
  //           .u-row {
  //             width: 650px !important;
  //           }
      
  //           .u-row .u-col {
  //             vertical-align: top;
  //           }
      
  //           .u-row .u-col-100 {
  //             width: 650px !important;
  //           }
  //         }
      
  //         @media (max-width: 670px) {
  //           .u-row-container {
  //             max-width: 100% !important;
  //             padding-left: 0px !important;
  //             padding-right: 0px !important;
  //           }
      
  //           .u-row .u-col {
  //             min-width: 320px !important;
  //             max-width: 100% !important;
  //             display: block !important;
  //           }
      
  //           .u-row {
  //             width: calc(100% - 40px) !important;
  //           }
      
  //           .u-col {
  //             width: 100% !important;
  //           }
      
  //           .u-col>div {
  //             margin: 0 auto;
  //           }
  //         }
      
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
      
  //         table,
  //         tr,
  //         td {
  //           vertical-align: top;
  //           border-collapse: collapse;
  //         }
      
  //         p {
  //           margin: 0;
  //         }
      
  //         .ie-container table,
  //         .mso-container table {
  //           table-layout: fixed;
  //         }
      
  //         * {
  //           line-height: inherit;
  //         }
      
  //         a[x-apple-data-detectors='true'] {
  //           color: inherit !important;
  //           text-decoration: none !important;
  //         }
  //       </style>
  //       <!--[if !mso]>
  //                 <!-->
  //       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
  //       <!--
  //                   <![endif]-->
  //     </head>
      
  //     <body class="clean-body u_body"
  //       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  //       <!--[if IE]>
  //                   <div class="ie-container">
  //                     <![endif]-->
  //       <!--[if mso]>
  //                     <div class="mso-container">
  //                       <![endif]-->
  //       <table
  //         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
  //         cellpadding="0" cellspacing="0">
  //         <tbody>
  //           <tr style="vertical-align: top">
  //             <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  //               <!--[if (mso)|(IE)]>
  //                               <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                 <tr>
  //                                   <td align="center" style="background-color: #ffffff;">
  //                                     <![endif]-->
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                           <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                             <tr>
  //                                               <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                 <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                   <tr style="background-color: #dff1ff;">
  //                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                       <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                           <!-->
  //                         <div
  //                           stestingmailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                             <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;background-color: #8#F6F0BC;"
  //                                   align="center">
  //                                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                     <tbody>
  //                                       <tr>
  //                                         <td style="padding-right: 0px;padding-left: 0px;" align="center">
  //                                           <img align="center" border="0"
  //                                             src="https://res.cloudinary.com/dgsoomgbn/image/upload/v1675858315/Screenshot_2023-02-08_at_5.40.32_PM_byouxn.png"
  //                                             alt="Image" title="Image"
  //                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
  //                                             width="117">
  //                                         </td>
  //                                       </tr>
  //                                     </tbody>
  //                                   </table>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                       </td>
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     </tr>
  //                                                   </table>
  //                                                 </td>
  //                                               </tr>
  //                                             </table>
  //                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                               <tr>
  //                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                     <tr style="background-color: #f3fbfd;">
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div
  //                                     style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
  //                                     <br>
  //                                     <br>
  //                                     <p style="font-size: 14px; line-height: 140%;">   Dear , <br>
  //                         A new user Subscribe on Your plateform <b>${SendEmail}</b> </br>
  //                                       <br>
  //                                       <b>
                                          
  //                                     <br>
  //                                     <p>Thanks and Regards, <br>
  //                                       <b>FIEREX.site</b>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <td style="" align="left">
  //                                 <div align="center">
  //                                   <!--[if mso]>
  //                                                                                     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;">
  //                                                                                       <tr>
  //                                                                                         <td style="font-family:'Montserrat',sans-serif;" align="center">
  //                                                                                           <v:roundrect
  //                                                                                             xmlns:v="urn:schemas-microsoft-com:vml"
  //                                                                                             xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee">
  //                                                                                             <w:anchorlock/>
  //                                                                                             <center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;">
  //                                                                                               <![endif]-->
  //                                   <a href="link" target="_blank"
  //                                     style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;"></a>
  //                                   <!--[if mso]>
  //                                                                                             </center>
  //                                                                                           </v:roundrect>
  //                                                                                         </td>
  //                                                                                       </tr>
  //                                                                                     </table>
  //                                                                                     <![endif]-->
  //                                 </div>
  //                               </td>
  //                               <tr></tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         </div>
  //                         <!--
  //                                                                           <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </td>
  //                                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                   </tr>
  //                                                                 </table>
  //                                                               </td>
  //                                                             </tr>
  //                                                           </table>
  //                                                           <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #DFF1FF;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <br>
  //                     <!--[if (mso)|(IE)]>
  //                                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                                               <tr>
  //                                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                                     <tr style="background-color: #151418;">
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;background-color: #DFF1FF;"
  //                                   align="left">
  //                                   <div style="color: #00000; line-height: 150%; text-align: center; word-wrap: break-word;">
  //                                     <p style="font-size: 14px; line-height: 140%;">
  //                                       <span style="font-size: 14px; line-height: 19.6px;"><b></b>Copyright@ 2022 FIEREX</b></span>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                       </td>
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </tr>
  //                                                                   </table>
  //                                                                 </td>
  //                                                               </tr>
  //                                                             </table>
  //                                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <!--[if (mso)|(IE)]>
  //                                                     </td>
  //                                                   </tr>
  //                                                 </table>
  //                                                 <![endif]-->
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <!--[if mso]>
  //                                       </div>
  //                                       <![endif]-->
  //       <!--[if IE]>
  //                                     </div>
  //                                     <![endif]-->
  //     </body>
      
  //     </html>`
      
  //     var transporter = nodemailer.createTransport({
  //       service: config.get('nodemailer.service'),
  //       auth: {
  //         "user": config.get('nodemailer.email'),
  //         "pass": config.get('nodemailer.password')
  //       }
  //     });
  //     var mailOptions = {
  //       from: "<do_not_reply@gmail.com>",
  //       to: email,
  //       subject: "PAYMENT VERIFY",
  //       // text: body,
  //       html: html,
  
  //     };
  //     return await transporter.sendMail(mailOptions)
  //   } catch (error) {
  //     throw error;
  //   }


  // },

  // sendMailContactus: async (email, adminName, validatedBody) => {
  //   const { name, email, subject, message } = validatedBody;
  //   try {
  //     // var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     // var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     // sendSmtpEmail = {
  //     //   sender: { email: "info@FIEREX.site" },
  //     //   to: [{ email: to }],
  //     //   subject: 'CONTACT_US',
  //      let html= `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">
      
  //     <head>
  //       <!--[if gte mso 9]>
  //         <xml>
  //           <o:OfficeDocumentSettings>
  //             <o:AllowPNG/>
  //             <o:PixelsPerInch>96</o:PixelsPerInch>
  //           </o:OfficeDocumentSettings>
  //         </xml>
  //         <![endif]-->
  //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta name="x-apple-disable-message-reformatting">
  //       <!--[if !mso]>
  //               <!-->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //       <!--
  //                 <![endif]-->
  //       <title></title>
  //       <style type="text/css">
  //         table,
  //         td {
  //           color: #000000;
  //         }
      
  //         a {
  //           color: #0000ee;
  //           text-decoration: underline;
  //         }
      
  //         @media only screen and (min-width: 670px) {
  //           .u-row {
  //             width: 650px !important;
  //           }
      
  //           .u-row .u-col {
  //             vertical-align: top;
  //           }
      
  //           .u-row .u-col-100 {
  //             width: 650px !important;
  //           }
  //         }
      
  //         @media (max-width: 670px) {
  //           .u-row-container {
  //             max-width: 100% !important;
  //             padding-left: 0px !important;
  //             padding-right: 0px !important;
  //           }
      
  //           .u-row .u-col {
  //             min-width: 320px !important;
  //             max-width: 100% !important;
  //             display: block !important;
  //           }
      
  //           .u-row {
  //             width: calc(100% - 40px) !important;
  //           }
      
  //           .u-col {
  //             width: 100% !important;
  //           }
      
  //           .u-col>div {
  //             margin: 0 auto;
  //           }
  //         }
      
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
      
  //         table,
  //         tr,
  //         td {
  //           vertical-align: top;
  //           border-collapse: collapse;
  //         }
      
  //         p {
  //           margin: 0;
  //         }
      
  //         .ie-container table,
  //         .mso-container table {
  //           table-layout: fixed;
  //         }
      
  //         * {
  //           line-height: inherit;
  //         }
      
  //         a[x-apple-data-detectors='true'] {
  //           color: inherit !important;
  //           text-decoration: none !important;
  //         }
  //       </style>
  //       <!--[if !mso]>
  //                 <!-->
  //       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
  //       <!--
  //                   <![endif]-->
  //     </head>
      
  //     <body class="clean-body u_body"
  //       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  //       <!--[if IE]>
  //                   <div class="ie-container">
  //                     <![endif]-->
  //       <!--[if mso]>
  //                     <div class="mso-container">
  //                       <![endif]-->
  //       <table
  //         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
  //         cellpadding="0" cellspacing="0">
  //         <tbody>
  //           <tr style="vertical-align: top">
  //             <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  //               <!--[if (mso)|(IE)]>
  //                               <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                 <tr>
  //                                   <td align="center" style="background-color: #ffffff;">
  //                                     <![endif]-->
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                           <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                             <tr>
  //                                               <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                 <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                   <tr style="background-color: #dff1ff;">
  //                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                       <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                           <!-->
  //                         <div
  //                           stestingmailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                             <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;background-color: #8#F6F0BC;"
  //                                   align="center">
  //                                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                     <tbody>
  //                                       <tr>
  //                                         <td style="padding-right: 0px;padding-left: 0px;" align="center">
  //                                           <img align="center" border="0"
  //                                             src="https://res.cloudinary.com/dgsoomgbn/image/upload/v1675858315/Screenshot_2023-02-08_at_5.40.32_PM_byouxn.png"
  //                                             alt="Image" title="Image"
  //                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
  //                                             width="117">
  //                                         </td>
  //                                       </tr>
  //                                     </tbody>
  //                                   </table>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                       </td>
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     </tr>
  //                                                   </table>
  //                                                 </td>
  //                                               </tr>
  //                                             </table>
  //                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                               <tr>
  //                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                     <tr style="background-color: #f3fbfd;">
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div
  //                                     style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
  //                                     <br>
  //                                     <br>
  //                                     <p style="font-size: 14px; line-height: 140%;"> Dear ${adminName}, <br>
  //                         A new user queried on Your platform  </br>
  //                                       <br><b>Name:</b>${name}</b>
  //                                       <b>
                                            
  //                                     <br>Email:</b> ${email} </b> <b>
                                        
                                   
  //                                   <br>Subject:</b> ${subject}</b>  <b>
                                        
  //                                            <br>Message:</b>  ${message}</b> <b>
  //                                       </br>
  //                                    </br>
  //                                    </br>
  //                                    </br>
  //                                     <p>Thanks and Regards, <br>
  //                                       <b>FIEREX.site</b>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <td style="" align="left">
  //                                 <div align="center">
  //                                   <!--[if mso]>
  //                                                                                     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;">
  //                                                                                       <tr>
  //                                                                                         <td style="font-family:'Montserrat',sans-serif;" align="center">
  //                                                                                           <v:roundrect
  //                                                                                             xmlns:v="urn:schemas-microsoft-com:vml"
  //                                                                                             xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee">
  //                                                                                             <w:anchorlock/>
  //                                                                                             <center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;">
  //                                                                                               <![endif]-->
  //                                   <a href="link" target="_blank"
  //                                     style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;"></a>
  //                                   <!--[if mso]>
  //                                                                                             </center>
  //                                                                                           </v:roundrect>
  //                                                                                         </td>
  //                                                                                       </tr>
  //                                                                                     </table>
  //                                                                                     <![endif]-->
  //                                 </div>
  //                               </td>
  //                               <tr></tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         </div>
  //                         <!--
  //                                                                           <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </td>
  //                                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                   </tr>
  //                                                                 </table>
  //                                                               </td>
  //                                                             </tr>
  //                                                           </table>
  //                                                           <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #DFF1FF;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <br>
  //                     <!--[if (mso)|(IE)]>
  //                                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                                               <tr>
  //                                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                                     <tr style="background-color: #151418;">
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;background-color: #DFF1FF;"
  //                                   align="left">
  //                                   <div style="color: #00000; line-height: 150%; text-align: center; word-wrap: break-word;">
  //                                     <p style="font-size: 14px; line-height: 140%;">
  //                                       <span style="font-size: 14px; line-height: 19.6px;"><b></b>Copyright@ 2022 FIEREX</b></span>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                       </td>
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </tr>
  //                                                                   </table>
  //                                                                 </td>
  //                                                               </tr>
  //                                                             </table>
  //                                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <!--[if (mso)|(IE)]>
  //                                                     </td>
  //                                                   </tr>
  //                                                 </table>
  //                                                 <![endif]-->
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <!--[if mso]>
  //                                       </div>
  //                                       <![endif]-->
  //       <!--[if IE]>
  //                                     </div>
  //                                     <![endif]-->
  //     </body>
      
  //     </html>`
   
  //     var transporter = nodemailer.createTransport({
  //       service: config.get('nodemailer.service'),
  //       auth: {
  //         "user": config.get('nodemailer.email'),
  //         "pass": config.get('nodemailer.password')
  //       }
  //     });
  //     var mailOptions = {
  //       from: "<do_not_reply@gmail.com>",
  //       to: email,
  //       subject: "PAYMENT VERIFY",
  //       // text: body,
  //       html: html,
  
  //     };
  //     return await transporter.sendMail(mailOptions)
  //   } catch (error) {
  //     throw error;
  //   }


  // },

  // sendMailContactus: async (email, adminName, validatedBody) => {
  //   const { name, email, subject, message } = validatedBody;
  //   try {
  //     // var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     // var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     // sendSmtpEmail = {
  //     //   sender: { email: "info@FIEREX.site" },
  //     //   to: [{ email: to }],
  //     //   subject: 'CONTACT_US',
  //       let html= `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">
      
  //     <head>
  //       <!--[if gte mso 9]>
  //         <xml>
  //           <o:OfficeDocumentSettings>
  //             <o:AllowPNG/>
  //             <o:PixelsPerInch>96</o:PixelsPerInch>
  //           </o:OfficeDocumentSettings>
  //         </xml>
  //         <![endif]-->
  //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta name="x-apple-disable-message-reformatting">
  //       <!--[if !mso]>
  //               <!-->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //       <!--
  //                 <![endif]-->
  //       <title></title>
  //       <style type="text/css">
  //         table,
  //         td {
  //           color: #000000;
  //         }
      
  //         a {
  //           color: #0000ee;
  //           text-decoration: underline;
  //         }
      
  //         @media only screen and (min-width: 670px) {
  //           .u-row {
  //             width: 650px !important;
  //           }
      
  //           .u-row .u-col {
  //             vertical-align: top;
  //           }
      
  //           .u-row .u-col-100 {
  //             width: 650px !important;
  //           }
  //         }
      
  //         @media (max-width: 670px) {
  //           .u-row-container {
  //             max-width: 100% !important;
  //             padding-left: 0px !important;
  //             padding-right: 0px !important;
  //           }
      
  //           .u-row .u-col {
  //             min-width: 320px !important;
  //             max-width: 100% !important;
  //             display: block !important;
  //           }
      
  //           .u-row {
  //             width: calc(100% - 40px) !important;
  //           }
      
  //           .u-col {
  //             width: 100% !important;
  //           }
      
  //           .u-col>div {
  //             margin: 0 auto;
  //           }
  //         }
      
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
      
  //         table,
  //         tr,
  //         td {
  //           vertical-align: top;
  //           border-collapse: collapse;
  //         }
      
  //         p {
  //           margin: 0;
  //         }
      
  //         .ie-container table,
  //         .mso-container table {
  //           table-layout: fixed;
  //         }
      
  //         * {
  //           line-height: inherit;
  //         }
      
  //         a[x-apple-data-detectors='true'] {
  //           color: inherit !important;
  //           text-decoration: none !important;
  //         }
  //       </style>
  //       <!--[if !mso]>
  //                 <!-->
  //       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
  //       <!--
  //                   <![endif]-->
  //     </head>
      
  //     <body class="clean-body u_body"
  //       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  //       <!--[if IE]>
  //                   <div class="ie-container">
  //                     <![endif]-->
  //       <!--[if mso]>
  //                     <div class="mso-container">
  //                       <![endif]-->
  //       <table
  //         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
  //         cellpadding="0" cellspacing="0">
  //         <tbody>
  //           <tr style="vertical-align: top">
  //             <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  //               <!--[if (mso)|(IE)]>
  //                               <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                 <tr>
  //                                   <td align="center" style="background-color: #ffffff;">
  //                                     <![endif]-->
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                           <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                             <tr>
  //                                               <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                 <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                   <tr style="background-color: #dff1ff;">
  //                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                       <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                           <!-->
  //                         <div
  //                           stestingmailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                             <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;background-color: #8#F6F0BC;"
  //                                   align="center">
  //                                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                     <tbody>
  //                                       <tr>
  //                                         <td style="padding-right: 0px;padding-left: 0px;" align="center">
  //                                           <img align="center" border="0"
  //                                             src="https://res.cloudinary.com/dgsoomgbn/image/upload/v1675858315/Screenshot_2023-02-08_at_5.40.32_PM_byouxn.png"
  //                                             alt="Image" title="Image"
  //                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
  //                                             width="117">
  //                                         </td>
  //                                       </tr>
  //                                     </tbody>
  //                                   </table>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                       </td>
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     </tr>
  //                                                   </table>
  //                                                 </td>
  //                                               </tr>
  //                                             </table>
  //                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                               <tr>
  //                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                     <tr style="background-color: #f3fbfd;">
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div
  //                                     style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
  //                                     <br>
  //                                     <br>
  //                                     <p style="font-size: 14px; line-height: 140%;"> Dear ${adminName}, <br>
  //                         A new user queried on Your platform  </br>
  //                                       <br><b>Name:</b>${name}</b>
  //                                       <b>
                                            
  //                                     <br>Email:</b> ${email} </b> <b>
                                        
                                   
  //                                   <br>Subject:</b> ${subject}</b>  <b>
                                        
  //                                            <br>Message:</b>  ${message}</b> <b>
  //                                       </br>
  //                                    </br>
  //                                    </br>
  //                                    </br>
  //                                     <p>Thanks and Regards, <br>
  //                                       <b>FIEREX.site</b>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <td style="" align="left">
  //                                 <div align="center">
  //                                   <!--[if mso]>
  //                                                                                     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;">
  //                                                                                       <tr>
  //                                                                                         <td style="font-family:'Montserrat',sans-serif;" align="center">
  //                                                                                           <v:roundrect
  //                                                                                             xmlns:v="urn:schemas-microsoft-com:vml"
  //                                                                                             xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee">
  //                                                                                             <w:anchorlock/>
  //                                                                                             <center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;">
  //                                                                                               <![endif]-->
  //                                   <a href="link" target="_blank"
  //                                     style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;"></a>
  //                                   <!--[if mso]>
  //                                                                                             </center>
  //                                                                                           </v:roundrect>
  //                                                                                         </td>
  //                                                                                       </tr>
  //                                                                                     </table>
  //                                                                                     <![endif]-->
  //                                 </div>
  //                               </td>
  //                               <tr></tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         </div>
  //                         <!--
  //                                                                           <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </td>
  //                                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                   </tr>
  //                                                                 </table>
  //                                                               </td>
  //                                                             </tr>
  //                                                           </table>
  //                                                           <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #DFF1FF;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <br>
  //                     <!--[if (mso)|(IE)]>
  //                                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                                               <tr>
  //                                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                                     <tr style="background-color: #151418;">
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;background-color: #DFF1FF;"
  //                                   align="left">
  //                                   <div style="color: #00000; line-height: 150%; text-align: center; word-wrap: break-word;">
  //                                     <p style="font-size: 14px; line-height: 140%;">
  //                                       <span style="font-size: 14px; line-height: 19.6px;"><b></b>Copyright@ 2022 FIEREX</b></span>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                       </td>
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </tr>
  //                                                                   </table>
  //                                                                 </td>
  //                                                               </tr>
  //                                                             </table>
  //                                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <!--[if (mso)|(IE)]>
  //                                                     </td>
  //                                                   </tr>
  //                                                 </table>
  //                                                 <![endif]-->
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <!--[if mso]>
  //                                       </div>
  //                                       <![endif]-->
  //       <!--[if IE]>
  //                                     </div>
  //                                     <![endif]-->
  //     </body>
      
  //     </html>`
    
  //     var transporter = nodemailer.createTransport({
  //       service: config.get('nodemailer.service'),
  //       auth: {
  //         "user": config.get('nodemailer.email'),
  //         "pass": config.get('nodemailer.password')
  //       }
  //     });
  //     var mailOptions = {
  //       from: "<do_not_reply@gmail.com>",
  //       to: email,
  //       subject: "PAYMENT VERIFY",
  //       // text: body,
  //       html: html,
  
  //     };
  //     return await transporter.sendMail(mailOptions)
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  generateRandomImage: async (index) => {
    switch (index) {
      case 0:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510441139311651044113927_profile1.png";
      case 1:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510442225311651044222528_profile2.png";
      case 2:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510456436621651045643658_profile3.png";
      case 3:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510457580741651045758069_profile4.png";
      case 4:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510458808661651045880863_profile5.png";
    }
  },

  generateRandomCoverImage: async (index) => {
    switch (index) {
      case 0:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510526996981651052699633_cover1.png";
      case 1:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510527344391651052734381_cover2.png";
      case 2:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510527711001651052771064_cover3.png";
      case 3:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510527984471651052798191_cover4.png";
      case 4:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510528252201651052825192_cover5.png";
      case 5:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510528749711651052874938_cover6.png";
      case 6:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510529024211651052902364_cover7.png";
      case 7:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510529440371651052943993_cover8.png";
      case 8:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510529771781651052977103_cover9.png";
      case 9:
        return "https://newchatmodule.s3.us-east-2.amazonaws.com/uploads/16510530092911651053009228_cover10.png";

    }

  },

  generateQR: async (data) => {
    try {
      let strData = JSON.stringify(data);
      let base64 = await QRCode.toDataURL(strData);
      var result = await cloudinary.v2.uploader.upload(base64);
      console.log("====result.secure_url==", result.secure_url)
      return result.secure_url;
      // return base64;
      return await QRCode.toDataURL(data);

    } catch (err) {
      console.error(err)
    }
  },

  // sendMailAcceptBrand: async (email, validatedBody) => {
  //   const { brandName, brandApproval } = validatedBody;
  //   try {
  //     // var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     // var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     // sendSmtpEmail = {
  //     //   sender: { email: "info@FIEREX.site" },
  //     //   to: [{ email: to }],
  //     //   subject: 'BRAND_REQUEST',
  //     let html= `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">
      
  //     <head>
  //       <!--[if gte mso 9]>
  //         <xml>
  //           <o:OfficeDocumentSettings>
  //             <o:AllowPNG/>
  //             <o:PixelsPerInch>96</o:PixelsPerInch>
  //           </o:OfficeDocumentSettings>
  //         </xml>
  //         <![endif]-->
  //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta name="x-apple-disable-message-reformatting">
  //       <!--[if !mso]>
  //               <!-->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //       <!--
  //                 <![endif]-->
  //       <title></title>
  //       <style type="text/css">
  //         table,
  //         td {
  //           color: #000000;
  //         }
      
  //         a {
  //           color: #0000ee;
  //           text-decoration: underline;
  //         }
      
  //         @media only screen and (min-width: 670px) {
  //           .u-row {
  //             width: 650px !important;
  //           }
      
  //           .u-row .u-col {
  //             vertical-align: top;
  //           }
      
  //           .u-row .u-col-100 {
  //             width: 650px !important;
  //           }
  //         }
      
  //         @media (max-width: 670px) {
  //           .u-row-container {
  //             max-width: 100% !important;
  //             padding-left: 0px !important;
  //             padding-right: 0px !important;
  //           }
      
  //           .u-row .u-col {
  //             min-width: 320px !important;
  //             max-width: 100% !important;
  //             display: block !important;
  //           }
      
  //           .u-row {
  //             width: calc(100% - 40px) !important;
  //           }
      
  //           .u-col {
  //             width: 100% !important;
  //           }
      
  //           .u-col>div {
  //             margin: 0 auto;
  //           }
  //         }
      
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
      
  //         table,
  //         tr,
  //         td {
  //           vertical-align: top;
  //           border-collapse: collapse;
  //         }
      
  //         p {
  //           margin: 0;
  //         }
      
  //         .ie-container table,
  //         .mso-container table {
  //           table-layout: fixed;
  //         }
      
  //         * {
  //           line-height: inherit;
  //         }
      
  //         a[x-apple-data-detectors='true'] {
  //           color: inherit !important;
  //           text-decoration: none !important;
  //         }
  //       </style>
  //       <!--[if !mso]>
  //                 <!-->
  //       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
  //       <!--
  //                   <![endif]-->
  //     </head>
      
  //     <body class="clean-body u_body"
  //       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  //       <!--[if IE]>
  //                   <div class="ie-container">
  //                     <![endif]-->
  //       <!--[if mso]>
  //                     <div class="mso-container">
  //                       <![endif]-->
  //       <table
  //         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
  //         cellpadding="0" cellspacing="0">
  //         <tbody>
  //           <tr style="vertical-align: top">
  //             <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  //               <!--[if (mso)|(IE)]>
  //                               <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                 <tr>
  //                                   <td align="center" style="background-color: #ffffff;">
  //                                     <![endif]-->
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                           <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                             <tr>
  //                                               <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                 <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                   <tr style="background-color: #dff1ff;">
  //                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                       <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                           <!-->
  //                         <div
  //                           stestingmailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                             <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;background-color: #8#F6F0BC;"
  //                                   align="center">
  //                                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                     <tbody>
  //                                       <tr>
  //                                         <td style="padding-right: 0px;padding-left: 0px;" align="center">
  //                                           <img align="center" border="0"
  //                                             src="https://res.cloudinary.com/dgsoomgbn/image/upload/v1675858315/Screenshot_2023-02-08_at_5.40.32_PM_byouxn.png"
  //                                             alt="Image" title="Image"
  //                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
  //                                             width="117">
  //                                         </td>
  //                                       </tr>
  //                                     </tbody>
  //                                   </table>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                       </td>
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     </tr>
  //                                                   </table>
  //                                                 </td>
  //                                               </tr>
  //                                             </table>
  //                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                               <tr>
  //                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                     <tr style="background-color: #f3fbfd;">
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div
  //                                     style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
  //                                     <br>
  //                                     <br>
  //                                     <p style="font-size: 14px; line-height: 140%;"> Dear, <br>
  //                         Your request on plateform for ${brandName} brand  is ${brandApproval} by Admin  </br>
                                     
  //                                    </br>
  //                                    </br>
  //                                    </br>
  //                                     <p>Thanks and Regards, <br>
  //                                       <b>FIEREX.site</b>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <td style="" align="left">
  //                                 <div align="center">
  //                                   <!--[if mso]>
  //                                                                                     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;">
  //                                                                                       <tr>
  //                                                                                         <td style="font-family:'Montserrat',sans-serif;" align="center">
  //                                                                                           <v:roundrect
  //                                                                                             xmlns:v="urn:schemas-microsoft-com:vml"
  //                                                                                             xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee">
  //                                                                                             <w:anchorlock/>
  //                                                                                             <center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;">
  //                                                                                               <![endif]-->
  //                                   <a href="link" target="_blank"
  //                                     style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;"></a>
  //                                   <!--[if mso]>
  //                                                                                             </center>
  //                                                                                           </v:roundrect>
  //                                                                                         </td>
  //                                                                                       </tr>
  //                                                                                     </table>
  //                                                                                     <![endif]-->
  //                                 </div>
  //                               </td>
  //                               <tr></tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         </div>
  //                         <!--
  //                                                                           <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </td>
  //                                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                   </tr>
  //                                                                 </table>
  //                                                               </td>
  //                                                             </tr>
  //                                                           </table>
  //                                                           <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #DFF1FF;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <br>
  //                     <!--[if (mso)|(IE)]>
  //                                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                                               <tr>
  //                                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                                     <tr style="background-color: #151418;">
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;background-color: #DFF1FF;"
  //                                   align="left">
  //                                   <div style="color: #00000; line-height: 150%; text-align: center; word-wrap: break-word;">
  //                                     <p style="font-size: 14px; line-height: 140%;">
  //                                       <span style="font-size: 14px; line-height: 19.6px;"><b></b>Copyright@ 2022 FIEREX</b></span>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                       </td>
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </tr>
  //                                                                   </table>
  //                                                                 </td>
  //                                                               </tr>
  //                                                             </table>
  //                                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <!--[if (mso)|(IE)]>
  //                                                     </td>
  //                                                   </tr>
  //                                                 </table>
  //                                                 <![endif]-->
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <!--[if mso]>
  //                                       </div>
  //                                       <![endif]-->
  //       <!--[if IE]>
  //                                     </div>
  //                                     <![endif]-->
  //     </body>
      
  //     </html>`
    
  //     var transporter = nodemailer.createTransport({
  //       service: config.get('nodemailer.service'),
  //       auth: {
  //         "user": config.get('nodemailer.email'),
  //         "pass": config.get('nodemailer.password')
  //       }
  //     });
  //     var mailOptions = {
  //       from: "<do_not_reply@gmail.com>",
  //       to: email,
  //       subject: "PAYMENT VERIFY",
  //       // text: body,
  //       html: html,
  
  //     };
  //     return await transporter.sendMail(mailOptions)
  //   } catch (error) {
  //     throw error;
  //   }


  // },

  // sendMailRejectBrand: async (enail, validatedBody) => {
  //   const { brandName, brandApproval,reason } = validatedBody;
  //   try {
  //     // var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  //     // var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //     // sendSmtpEmail = {
  //     //   sender: { email: "info@FIEREX.site" },
  //     //   to: [{ email: to }],
  //     //   subject: 'BRAND_REQUEST',
  //       let html= `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">
      
  //     <head>
  //       <!--[if gte mso 9]>
  //         <xml>
  //           <o:OfficeDocumentSettings>
  //             <o:AllowPNG/>
  //             <o:PixelsPerInch>96</o:PixelsPerInch>
  //           </o:OfficeDocumentSettings>
  //         </xml>
  //         <![endif]-->
  //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta name="x-apple-disable-message-reformatting">
  //       <!--[if !mso]>
  //               <!-->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //       <!--
  //                 <![endif]-->
  //       <title></title>
  //       <style type="text/css">
  //         table,
  //         td {
  //           color: #000000;
  //         }
      
  //         a {
  //           color: #0000ee;
  //           text-decoration: underline;
  //         }
      
  //         @media only screen and (min-width: 670px) {
  //           .u-row {
  //             width: 650px !important;
  //           }
      
  //           .u-row .u-col {
  //             vertical-align: top;
  //           }
      
  //           .u-row .u-col-100 {
  //             width: 650px !important;
  //           }
  //         }
      
  //         @media (max-width: 670px) {
  //           .u-row-container {
  //             max-width: 100% !important;
  //             padding-left: 0px !important;
  //             padding-right: 0px !important;
  //           }
      
  //           .u-row .u-col {
  //             min-width: 320px !important;
  //             max-width: 100% !important;
  //             display: block !important;
  //           }
      
  //           .u-row {
  //             width: calc(100% - 40px) !important;
  //           }
      
  //           .u-col {
  //             width: 100% !important;
  //           }
      
  //           .u-col>div {
  //             margin: 0 auto;
  //           }
  //         }
      
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
      
  //         table,
  //         tr,
  //         td {
  //           vertical-align: top;
  //           border-collapse: collapse;
  //         }
      
  //         p {
  //           margin: 0;
  //         }
      
  //         .ie-container table,
  //         .mso-container table {
  //           table-layout: fixed;
  //         }
      
  //         * {
  //           line-height: inherit;
  //         }
      
  //         a[x-apple-data-detectors='true'] {
  //           color: inherit !important;
  //           text-decoration: none !important;
  //         }
  //       </style>
  //       <!--[if !mso]>
  //                 <!-->
  //       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
  //       <!--
  //                   <![endif]-->
  //     </head>
      
  //     <body class="clean-body u_body"
  //       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  //       <!--[if IE]>
  //                   <div class="ie-container">
  //                     <![endif]-->
  //       <!--[if mso]>
  //                     <div class="mso-container">
  //                       <![endif]-->
  //       <table
  //         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
  //         cellpadding="0" cellspacing="0">
  //         <tbody>
  //           <tr style="vertical-align: top">
  //             <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
  //               <!--[if (mso)|(IE)]>
  //                               <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                 <tr>
  //                                   <td align="center" style="background-color: #ffffff;">
  //                                     <![endif]-->
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                           <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                             <tr>
  //                                               <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                 <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                   <tr style="background-color: #dff1ff;">
  //                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                       <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                           <!-->
  //                         <div
  //                           stestingmailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                             <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;background-color: #8#F6F0BC;"
  //                                   align="center">
  //                                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                     <tbody>
  //                                       <tr>
  //                                         <td style="padding-right: 0px;padding-left: 0px;" align="center">
  //                                           <img align="center" border="0"
  //                                             src="https://res.cloudinary.com/dgsoomgbn/image/upload/v1675858315/Screenshot_2023-02-08_at_5.40.32_PM_byouxn.png"
  //                                             alt="Image" title="Image"
  //                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 18%;max-width: 117px;"
  //                                             width="117">
  //                                         </td>
  //                                       </tr>
  //                                     </tbody>
  //                                   </table>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                       </td>
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                     </tr>
  //                                                   </table>
  //                                                 </td>
  //                                               </tr>
  //                                             </table>
  //                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <!--[if (mso)|(IE)]>
  //                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                               <tr>
  //                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                     <tr style="background-color: #f3fbfd;">
  //                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
  //                                   align="left">
  //                                   <div
  //                                     style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
  //                                     <br>
  //                                     <br>
  //                                     <p style="font-size: 14px; line-height: 140%;"> Dear, <br>
  //                         Your request on plateform for ${brandName} brand  is ${brandApproval} <br>with Reason: ${reason}  </br>
                                     
  //                                    </br>
  //                                    </br>
  //                                    </br>
  //                                     <p>Thanks and Regards, <br>
  //                                       <b>FIEREX.site</b>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <td style="" align="left">
  //                                 <div align="center">
  //                                   <!--[if mso]>
  //                                                                                     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Montserrat',sans-serif;">
  //                                                                                       <tr>
  //                                                                                         <td style="font-family:'Montserrat',sans-serif;" align="center">
  //                                                                                           <v:roundrect
  //                                                                                             xmlns:v="urn:schemas-microsoft-com:vml"
  //                                                                                             xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:48px; v-text-anchor:middle; width:290px;" arcsize="125%" stroke="f" fillcolor="#0088ee">
  //                                                                                             <w:anchorlock/>
  //                                                                                             <center style="color:#FFFFFF;font-family:'Montserrat',sans-serif;">
  //                                                                                               <![endif]-->
  //                                   <a href="link" target="_blank"
  //                                     style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;"></a>
  //                                   <!--[if mso]>
  //                                                                                             </center>
  //                                                                                           </v:roundrect>
  //                                                                                         </td>
  //                                                                                       </tr>
  //                                                                                     </table>
  //                                                                                     <![endif]-->
  //                                 </div>
  //                               </td>
  //                               <tr></tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         </div>
  //                         <!--
  //                                                                           <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </td>
  //                                                                     <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                   </tr>
  //                                                                 </table>
  //                                                               </td>
  //                                                             </tr>
  //                                                           </table>
  //                                                           <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="u-row-container" style="padding: 0px;background-color: transparent">
  //                 <div class="u-row"
  //                   style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #DFF1FF;">
  //                   <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
  //                     <br>
  //                     <!--[if (mso)|(IE)]>
  //                                                             <table width="100%" cellpadding="0" cellspacing="0" border="0">
  //                                                               <tr>
  //                                                                 <td style="padding: 0px;background-color: transparent;" align="center">
  //                                                                   <table cellpadding="0" cellspacing="0" border="0" style="width:650px;">
  //                                                                     <tr style="background-color: #151418;">
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                       <td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
  //                                                                         <![endif]-->
  //                     <div class="u-col u-col-100"
  //                       style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
  //                       <div style="width: 100% !important;">
  //                         <!--[if (!mso)&(!IE)]>
  //                                                                             <!-->
  //                         <div
  //                           style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
  //                           <!--
  //                                                                               <![endif]-->
  //                           <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
  //                             cellspacing="0" width="100%" border="0">
  //                             <tbody>
  //                               <tr>
  //                                 <td
  //                                   style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;background-color: #DFF1FF;"
  //                                   align="left">
  //                                   <div style="color: #00000; line-height: 150%; text-align: center; word-wrap: break-word;">
  //                                     <p style="font-size: 14px; line-height: 140%;">
  //                                       <span style="font-size: 14px; line-height: 19.6px;"><b></b>Copyright@ 2022 FIEREX</b></span>
  //                                     </p>
  //                                   </div>
  //                                 </td>
  //                               </tr>
  //                             </tbody>
  //                           </table>
  //                           <!--[if (!mso)&(!IE)]>
  //                                                                               <!-->
  //                         </div>
  //                         <!--
  //                                                                             <![endif]-->
  //                       </div>
  //                     </div>
  //                     <!--[if (mso)|(IE)]>
  //                                                                       </td>
  //                                                                       <![endif]-->
  //                     <!--[if (mso)|(IE)]>
  //                                                                     </tr>
  //                                                                   </table>
  //                                                                 </td>
  //                                                               </tr>
  //                                                             </table>
  //                                                             <![endif]-->
  //                   </div>
  //                 </div>
  //               </div>
  //               <!--[if (mso)|(IE)]>
  //                                                     </td>
  //                                                   </tr>
  //                                                 </table>
  //                                                 <![endif]-->
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <!--[if mso]>
  //                                       </div>
  //                                       <![endif]-->
  //       <!--[if IE]>
  //                                     </div>
  //                                     <![endif]-->
  //     </body>
      
  //     </html>`
    
  //     var transporter = nodemailer.createTransport({
  //       service: config.get('nodemailer.service'),
  //       auth: {
  //         "user": config.get('nodemailer.email'),
  //         "pass": config.get('nodemailer.password')
  //       }
  //     });
  //     var mailOptions = {
  //       from: "<do_not_reply@gmail.com>",
  //       to: email,
  //       subject: "PAYMENT VERIFY",
  //       // text: body,
  //       html: html,
  
  //     };
  //     return await transporter.sendMail(mailOptions)
  //   } catch (error) {
  //     throw error;
  //   }


  // },








 sendMailOtpNodeMailer: async (email, otp, firstName) => {
    try {
      let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        
          <style type="text/css">
            table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
      @media only screen and (min-width: 670px) {
        .u-row {
          width: 650px !important;
        }
        .u-row .u-col {
          vertical-align: top;
        }
      
        .u-row .u-col-100 {
          width: 650px !important;
        }
      
      }
      
      @media (max-width: 670px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
        }
        .u-row {
          width: calc(100% - 40px) !important;
        }
        .u-col {
          width: 100% !important;
        }
        .u-col > div {
          margin: 0 auto;
        }
      }
      body {
        margin: 0;
        padding: 0;
      }
      
      table,
      tr,
      td {
        vertical-align: top;
        border-collapse: collapse;
      }
      
      p {
        margin: 0;
      }
      
      .ie-container table,
      .mso-container table {
        table-layout: fixed;
      }
      
      * {
        line-height: inherit;
      }
      
      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      
      </style>
        
        
      
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  
        <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
        <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
          
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677656315/zikjloc2mzahzgfqycdk.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none; width: 100%;max-width: 300px;" width="100%"/>
            
          </td>
        </tr>
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span style="font-size: 24px; line-height: 40.8px; color: #000000;"><strong>T H A N K S &nbsp; F O R &nbsp; S I G N I N G &nbsp; U P !</strong></span></p>
      <p style="font-size: 14px; line-height: 170%; text-align: center;"><span style="font-size: 16px; line-height: 27.2px; color: #000000;">Verify Your OTP</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>     
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;"></br></br>
          <p style="font-size: 14px; line-height: 140%;">Hi ${firstName}</p>
      <p style="font-size: 14px; line-height: 140%;">Welcome to  <b> 12-jyotirlingas. </b> Your Email One Time Password (OTP) to log in to your 12-jyotirlingas account is <b>${otp}</b>.The OTP is valid for 3 minutes. This OTP will be used to verify the device you are logging in from. For account safety, Do not share your OTP with others.</p></br>
     <p>Thanks and Regards, <br>
  <b>Team 12-jyotirlingas </b></p> 
        </div>
        
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
              
      <div align="center">
          <a href="${otp}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
           
          </a>
      </div>
      
            </td>
          </tr>
        </tbody>
      </table></div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
       <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">Copyright @ 1999-2023 GoDaddy, LLC. All rights reserved.</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
  
          </td>
        </tr>
        </tbody>
        </table>
      </body>
      
      </html>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')
        }
      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: email,
        subject: "ACCOUNT VERIFICATION",
        // text: body,
        html: html,

      };
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error==>>", error);
      throw error;
    }

  },

  sendMailKYCapprove: async (email, body) => {
    try {
      let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        
          <style type="text/css">
            table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
      @media only screen and (min-width: 670px) {
        .u-row {
          width: 650px !important;
        }
        .u-row .u-col {
          vertical-align: top;
        }
      
        .u-row .u-col-100 {
          width: 650px !important;
        }
      
      }
      
      @media (max-width: 670px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
        }
        .u-row {
          width: calc(100% - 40px) !important;
        }
        .u-col {
          width: 100% !important;
        }
        .u-col > div {
          margin: 0 auto;
        }
      }
      body {
        margin: 0;
        padding: 0;
      }
      
      table,
      tr,
      td {
        vertical-align: top;
        border-collapse: collapse;
      }
      
      p {
        margin: 0;
      }
      
      .ie-container table,
      .mso-container table {
        table-layout: fixed;
      }
      
      * {
        line-height: inherit;
      }
      
      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      
      </style>
        
        
      
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  
        <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
        <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
          
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677656315/zikjloc2mzahzgfqycdk.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;max-width: 300px;" width="100%"/>
            
          </td>
        </tr>   
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span style="font-size: 24px; line-height: 40.8px; color: #000000;"><strong>Approve&nbsp;KYC&nbsp;Status &nbsp;by&nbsp;Admin! </strong></span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;"></br></br>
          <p style="font-size: 14px; line-height: 140%;">Hi ${body.name}</p>
      <p style="font-size: 14px; line-height: 140%;">Your KYC kycId: ${body.kycId} is ${body.status} by Admin on Plateform 12-jyotirlingas .</p></br>
     <p>Thanks and Regards, <br>
  <b>Team 12-jyotirlingas</b></p> 
        </div>
        
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
              
      <div align="center">
          <a href="" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
           
          </a>
      </div>
      
            </td>
          </tr>
        </tbody>
      </table></div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
       <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">2023 @12-jyotirlingas| All Rights Reserved</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
  
          </td>
        </tr>
        </tbody>
        </table>
      </body>
      
      </html>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')
        }
      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: email,
        subject: "KYC STATUS",
        // text: body,
        html: html,

      };
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error==>>", error);
      throw error;
    }

  },

  sendMailKYCreject: async (email, body) => {
    try {
      let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        
          <style type="text/css">
            table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
      @media only screen and (min-width: 670px) {
        .u-row {
          width: 650px !important;
        }
        .u-row .u-col {
          vertical-align: top;
        }
      
        .u-row .u-col-100 {
          width: 650px !important;
        }
      
      }
      
      @media (max-width: 670px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
        }
        .u-row {
          width: calc(100% - 40px) !important;
        }
        .u-col {
          width: 100% !important;
        }
        .u-col > div {
          margin: 0 auto;
        }
      }
      body {
        margin: 0;
        padding: 0;
      }
      
      table,
      tr,
      td {
        vertical-align: top;
        border-collapse: collapse;
      }
      
      p {
        margin: 0;
      }
      
      .ie-container table,
      .mso-container table {
        table-layout: fixed;
      }
      
      * {
        line-height: inherit;
      }
      
      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      
      </style>
        
        
      
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  
        <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
        <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
          
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677656315/zikjloc2mzahzgfqycdk.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;max-width: 300px;" width="100%"/>
            
          </td>
        </tr>
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span style="font-size: 24px; line-height: 40.8px; color: #000000;"><strong>Approve&nbsp;KYC&nbsp;Status &nbsp;by&nbsp;Admin! </strong></span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #1b262c; line-height: 140%; text-align: center; word-break: break-word; word-wrap: break-word; "></br></br>
          <p style="font-size: 14px; line-height: 140%;">Hi ${body.name}</p>
      <p style="font-size: 14px; line-height: 140%;  word-break: break-word;">Your KYC kycId: ${body.kycId} is ${body.status} by Admin with reason :${body.reason} on Plateform 12-jyotirlingas .</p></br>
     <p>Thanks and Regards, <br>
  <b>Team 12-jyotirlingas</b></p> 
        </div>
        
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
              
      <div align="center">
          <a href="" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
           
          </a>
      </div>
      
            </td>
          </tr>
        </tbody>
      </table></div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
       <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">2023 @12-jyotirlingas| All Rights Reserved</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
  
          </td>
        </tr>
        </tbody>
        </table>
      </body>
      
      </html>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')
        }
      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: email,
        subject: "KYC STATUS",
        // text: body,
        html: html,

      };
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error==>>", error);
      throw error;
    }

  },
    sendMailSendNFt: async (email, body) => {
    try {
      let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        
          <style type="text/css">
            table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
      @media only screen and (min-width: 670px) {
        .u-row {
          width: 650px !important;
        }
        .u-row .u-col {
          vertical-align: top;
        }
      
        .u-row .u-col-100 {
          width: 650px !important;
        }
      
      }
      
      @media (max-width: 670px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
        }
        .u-row {
          width: calc(100% - 40px) !important;
        }
        .u-col {
          width: 100% !important;
        }
        .u-col > div {
          margin: 0 auto;
        }
      }
      body {
        margin: 0;
        padding: 0;
      }
      
      table,
      tr,
      td {
        vertical-align: top;
        border-collapse: collapse;
      }
      
      p {
        margin: 0;
      }
      
      .ie-container table,
      .mso-container table {
        table-layout: fixed;
      }
      
      * {
        line-height: inherit;
      }
      
      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      
      </style>
        
        
      
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  
        <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
        <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
          
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://res.cloudinary.com/dpiw7uxv9/image/upload/v1677656315/zikjloc2mzahzgfqycdk.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;max-width: 300px;" width="100%"/>
            
          </td>
        </tr>
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span style="font-size: 24px; line-height: 40.8px; color: #000000;"><strong>&nbsp;NFT&nbsp;Status! </strong></span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;"></br></br>
          <p style="font-size: 14px; line-height: 140%;">Hi ${body.name}</p>
      <p style="font-size: 14px; line-height: 140%;">Your NFT nftId: ${body.nftId} is ${body.title} by you to receiver receiverId: ${body.receiverId} on Plateform 12-jyotirlingas .</p></br>
     <p>Thanks and Regards, <br>
  <b>Team 12-jyotirlingas</b></p> 
        </div>
        
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
              
      <div align="center">
          <a href="" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
           
          </a>
      </div>
      
            </td>
          </tr>
        </tbody>
      </table></div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
       <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">2023 @12-jyotirlingas| All Rights Reserved</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
  
          </td>
        </tr>
        </tbody>
        </table>
      </body>
      
      </html>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')
        }
      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: email,
        subject: "KYC STATUS",
        // text: body,
        html: html,

      };
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error==>>", error);
      throw error;
    }

  },

}


