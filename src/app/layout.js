import { Ubuntu } from "next/font/google";
import "./globals.css";
import Navbar from '../components/custom/'

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "MemesDreams",
  description: "Made by two hamsiap kia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.className} antialiased`}
      >
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
