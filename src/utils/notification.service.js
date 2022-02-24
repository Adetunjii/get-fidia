const Mailgun = require("mailgun.js");
const formData = require("form-data");
const mailgun = new Mailgun(formData);
const dotenv = require("dotenv").config();

const mg = mailgun.client({username: "api", key: process.env.MAILGUN_API_KEY});

class EmailBuilder {
  constructor() {
    this.props = {};
  }

  setDomain(domain) {
    this.props["domain"] = domain;
    return this;
  }

  setFrom(from) {
    this.props["from"] = from;
    return this;
  }

  setReciepients(reciepient) {
    this.props["to"] = reciepient;
    return this;
  }

  setSubject(subject) {
    this.props["subject"] = subject;
    return this;
  }

  setTextMessage(message) {
    this.props["text"] = message;
    return this;
  }

  setHtmlMessage(message) {
    this.props["html"] = message;
    return this;
  }

  setTemplate(templateName) {
    this.props["template"] = templateName;
    return this;
  }

  setTemplateVariables(variables) {
    this.props["h:X-Mailgun-Variables"] = JSON.stringify(variables);
    return this;
  }

  build() {
    console.log(this.props);
    return this.props;
  }

  async send() {
    const options = this.build();

    console.log(options);
    return mg.messages.create(options.domain, options);
  }
}

const sendAccountVerificationEmail = async (payload) => {
  const emailBuilder = new EmailBuilder();
  emailBuilder
    .setDomain(process.env.MAILGUN_DOMAIN || payload.domain)
    .setFrom("GETFIDIA ACTIVATION <mailgun@sandbox-123.mailgun.org>")
    .setReciepients(payload.reciepients)
    .setSubject("Account Verification")
    .setTemplate("accountactivation" || payload.template)
    .setTextMessage("Please verify your email" || payload.textMessage)
    .setHtmlMessage(payload.htmlMessage)
    .setTemplateVariables(payload.templateVariables);

  return emailBuilder.send();
};

module.exports = {
  emailBuilder: new EmailBuilder(),
  sendAccountVerificationEmail,
};
