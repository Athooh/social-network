import "@/styles/globals.css";

export const metadata = {
  title: "NoteBook",
  description: "A Facebook-like application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
