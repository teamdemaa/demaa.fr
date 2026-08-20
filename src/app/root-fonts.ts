import localFont from "next/font/local";

const satoshi = localFont({
  src: [
    { path: "./fonts/satoshi-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/satoshi-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/satoshi-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["Avenir Next", "Avenir", "Segoe UI", "Arial", "sans-serif"],
});

const gambetta = localFont({
  src: [
    {
      path: "./fonts/gambetta-light-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/gambetta-regular-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-gambetta",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const rootFontClassName = `${satoshi.variable} ${gambetta.variable} h-full antialiased`;
