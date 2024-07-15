import FormData from "form-data";
import type { MailgunClientOptions, MessagesSendResult } from "mailgun.js";
import Mailgun from "mailgun.js";
// eslint-disable-next-line
export const getMailClient: any = () => {
  const options: MailgunClientOptions = {
    username: "api",
    key: process.env.MAILGUN_API_KEY ? process.env.MAILGUN_API_KEY : "",
  };
  return new Mailgun(FormData).client(options);
};

type SendEmailParams = {
  to: string | null | undefined;
  subject: string;
  body: string;
};

export const sendEmail = async ({
  to,
  subject,
  body,
}: SendEmailParams): Promise<MessagesSendResult> => {
  const isConsole = process.env.MAILGUN_CONSOLE === "true" ? true : false;
  if (isConsole) {
    return {
      status: 200,
    };
  } else {
    const mailClient = getMailClient();
    const data = {
      from: process.env.MAILGUN_FROM
        ? process.env.MAILGUN_FROM
        : "Youowme <neoke20@gmail.com>",
      to: to,
      subject: subject,
      text: body,
      "h:Reply-To": "info@tabitsuku.jp",
    };
    return await mailClient.messages.create(
      process.env.MAILGUN_DOMAIN
        ? process.env.MAILGUN_DOMAIN
        : "mg.youoweme.netilfy.app",
      data
    );
  }
};
