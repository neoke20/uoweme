import fs from "fs/promises";
import Handlebars from "handlebars";
import path from "path";
import dayjs from "dayjs";

Handlebars.registerHelper("dateFormat", (date, format) =>
  dayjs(date).format(format)
);

export const getRenderBody = async (template: string, data: object) => {
  const emailTemplatePath = path.join(
    process.cwd(),
    "app",
    "email",
    "template"
  );
  const templatePath = path.join(emailTemplatePath, template);
  const templateText = await fs.readFile(templatePath, "utf-8");

  const compile = Handlebars.compile(templateText);
  const body = compile(data);

  // console.log(body);
  return body;
};
