import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";

const raleway = Raleway({
	variable: "--font-raleway",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "deliverylink",
	description: "deliverylink",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${raleway.variable} antialiased`}
			>
				<Providers>
					<div className="grid grid-rows-[auto_1fr] h-svh">
						<Header />
			   <main className="pt-20">
              {children}
            </main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
