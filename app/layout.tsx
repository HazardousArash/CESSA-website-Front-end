import { Vazirmatn } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import CyberBackground from "@/_components/cyber/CyberBackground";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata = {
  title: "CESSA | انجمن علمی مهندسی کامپیوتر",
  description: "جامعه نوآوری، تکنولوژی و ارتقاء مهندسی نرم‌افزار",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans">
        <ReduxProvider>
          <CyberBackground />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}