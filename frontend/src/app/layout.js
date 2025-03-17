import "@/styles/globals.css";
import { AuthProvider } from "@/context/authcontext";

export const metadata = {
  title: "NoteBook",
  description: "A Facebook-like application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
