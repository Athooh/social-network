import "@/styles/globals.css";

export const metadata = {
  title: "My Social Network",
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
