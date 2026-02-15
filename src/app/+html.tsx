import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Load Montserrat from Google Fonts for web */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,500;0,600;0,700;1,300;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'Montserrat-Light';
                src: local('Montserrat Light'), local('Montserrat-Light');
                font-weight: 300;
                font-style: normal;
              }
              @font-face {
                font-family: 'Montserrat-LightItalic';
                src: local('Montserrat Light Italic'), local('Montserrat-LightItalic');
                font-weight: 300;
                font-style: italic;
              }
              @font-face {
                font-family: 'Montserrat-Medium';
                src: local('Montserrat Medium'), local('Montserrat-Medium');
                font-weight: 500;
                font-style: normal;
              }
              @font-face {
                font-family: 'Montserrat-MediumItalic';
                src: local('Montserrat Medium Italic'), local('Montserrat-MediumItalic');
                font-weight: 500;
                font-style: italic;
              }
              @font-face {
                font-family: 'Montserrat-SemiBold';
                src: local('Montserrat SemiBold'), local('Montserrat-SemiBold');
                font-weight: 600;
                font-style: normal;
              }
              @font-face {
                font-family: 'Montserrat-SemiBoldItalic';
                src: local('Montserrat SemiBold Italic'), local('Montserrat-SemiBoldItalic');
                font-weight: 600;
                font-style: italic;
              }
              @font-face {
                font-family: 'Montserrat-Bold';
                src: local('Montserrat Bold'), local('Montserrat-Bold');
                font-weight: 700;
                font-style: normal;
              }
              @font-face {
                font-family: 'Montserrat-BoldItalic';
                src: local('Montserrat Bold Italic'), local('Montserrat-BoldItalic');
                font-weight: 700;
                font-style: italic;
              }
              /* Fallback to Google Fonts Montserrat */
              * {
                font-family: 'Montserrat-Medium', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
              }
            `,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
