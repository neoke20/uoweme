// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";
import { destroySession, getSession } from "./session.server";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const action = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

const bittersweet: MantineColorsTuple = [
  "#ffeae7",
  "#ffd5ce",
  "#ffa89b",
  "#ff7964",
  "#fe5237",
  "#fe3819",
  "#ff2a09",
  "#e41c00",
  "#cb1500",
  "#b10500",
];

const platinum: MantineColorsTuple = [
  "#ecf8f8",
  "#e4ebeb",
  "#c8d4d4",
  "#abbdbd",
  "#91a9a8",
  "#809d9c",
  "#769696",
  "#648282",
  "#557575",
  "#426565",
];

const charcoal: MantineColorsTuple = [
  "#f2f4f7",
  "#e4e5e8",
  "#c5c9d1",
  "#a4acbb",
  "#8792a9",
  "#76829d",
  "#6b7a99",
  "#5b6886",
  "#4f5d78",
  "#42506c",
];

const payneGray: MantineColorsTuple = [
  "#f0f6fb",
  "#e5e9ea",
  "#cbcfd1",
  "#aeb5b7",
  "#959fa2",
  "#859195",
  "#7c8a8e",
  "#68777c",
  "#5a6a70",
  "#475d63",
];

const vermilion: MantineColorsTuple = [
  "#ffe9e8",
  "#ffd4cf",
  "#fba8a1",
  "#f7786d",
  "#f35042",
  "#f13726",
  "#f12817",
  "#d61a0c",
  "#c01307",
  "#a80302",
];

const theme = createTheme({
  colors: {
    bittersweet,
    platinum,
    charcoal,
    payneGray,
    vermilion,
  },
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <ScrollRestoration />
          <Scripts />
          <Outlet />
        </MantineProvider>
      </body>
    </html>
  );
}
