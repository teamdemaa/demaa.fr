"use client";

import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Copy, 
  CheckCircle2, 
  Pencil,
  Camera,
  ChevronDown
} from "lucide-react";

const FONT_OPTIONS = [
  {
    key: "poppins",
    label: "Poppins",
    stack: "'Poppins', Arial, sans-serif",
    className: "",
  },
  {
    key: "inter",
    label: "Inter",
    stack: "'Inter', Arial, sans-serif",
    className: "",
  },
  {
    key: "montserrat",
    label: "Montserrat",
    stack: "'Montserrat', Arial, sans-serif",
    className: "",
  },
  {
    key: "nunito",
    label: "Nunito",
    stack: "'Nunito', Arial, sans-serif",
    className: "",
  },
] as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function SignaturePro() {
  const [name, setName] = useState("Jean Dupont");
  const [title, setTitle] = useState("Directeur Commercial");
  const [company, setCompany] = useState("Demaa Plomberie");
  const [phone, setPhone] = useState("+33 6 12 34 56 78");
  const [email, setEmail] = useState("jean.dupont@demaa.fr");
  const [website, setWebsite] = useState("www.demaa.fr");
  const [address, setAddress] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<"with-image" | "text-only">("with-image");
  const [primaryColor, setPrimaryColor] = useState("#191b30");
  const [accentColor, setAccentColor] = useState("#f39d66");
  const [fontKey, setFontKey] = useState<(typeof FONT_OPTIONS)[number]["key"]>("poppins");
  const [copied, setCopied] = useState(false);

  const displayName = name.trim();
  const displayTitle = title.trim();
  const displayCompany = company.trim();
  const displayPhone = phone.trim();
  const displayEmail = email.trim();
  const displayWebsite = website.trim();
  const displayAddress = address.trim();
  const displayLinkedin = linkedin.trim();
  const selectedFont = FONT_OPTIONS.find((option) => option.key === fontKey) ?? FONT_OPTIONS[0];

  const buildSignatureHtml = () => {
    const safeName = escapeHtml(displayName || "Jean Dupont");
    const safeTitle = escapeHtml(displayTitle || "Directeur Commercial");
    const safeCompany = displayCompany ? escapeHtml(displayCompany) : "";
    const safePhone = displayPhone ? escapeHtml(displayPhone) : "";
    const safeEmail = displayEmail ? escapeHtml(displayEmail) : "";
    const safeWebsite = displayWebsite ? escapeHtml(displayWebsite) : "";
    const safeAddress = displayAddress ? escapeHtml(displayAddress) : "";
    const safeLinkedin = displayLinkedin ? escapeHtml(displayLinkedin) : "";
    const normalizedWebsiteHref = displayWebsite
      ? displayWebsite.startsWith("http")
        ? displayWebsite
        : `https://${displayWebsite}`
      : "";

    const rows = [
      safeCompany
        ? `
          <tr>
            <td style="padding:0 0 8px 0;font-size:14px;line-height:20px;color:${primaryColor};font-weight:700;">
              ${safeCompany}
            </td>
          </tr>`
        : "",
      safePhone
        ? `
          <tr>
            <td style="padding:0 0 8px 0;font-size:14px;line-height:20px;color:#5b6475;">
              <a href="tel:${escapeHtml(displayPhone)}" style="color:#5b6475;text-decoration:none;">${safePhone}</a>
            </td>
          </tr>`
        : "",
      safeEmail
        ? `
          <tr>
            <td style="padding:0 0 8px 0;font-size:14px;line-height:20px;color:#5b6475;">
              <a href="mailto:${escapeHtml(displayEmail)}" style="color:${primaryColor};text-decoration:none;">${safeEmail}</a>
            </td>
          </tr>`
        : "",
      safeWebsite
        ? `
          <tr>
            <td style="padding:0 0 8px 0;font-size:14px;line-height:20px;color:#5b6475;">
              <a href="${escapeHtml(normalizedWebsiteHref)}" style="color:${primaryColor};text-decoration:none;">${safeWebsite}</a>
            </td>
          </tr>`
        : "",
      safeAddress
        ? `
          <tr>
            <td style="padding:0;font-size:14px;line-height:20px;color:#5b6475;">
              ${safeAddress}
            </td>
          </tr>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    const linkedinBlock = safeLinkedin
      ? `
        <tr>
          <td colspan="2" style="padding-top:14px;">
            <a href="${safeLinkedin}" style="display:inline-block;background:${primaryColor};color:#ffffff;text-decoration:none;font-size:11px;line-height:11px;font-weight:700;padding:8px 12px;border-radius:999px;">
              LinkedIn
            </a>
          </td>
        </tr>`
      : "";

    const logoBlock = logo
      ? `
        <img
          src="${logo}"
          alt="Logo"
          width="72"
          height="72"
          style="display:block;width:72px;max-width:72px;height:72px;max-height:72px;object-fit:contain;border:0;outline:none;text-decoration:none;"
        />`
      : `
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td
              width="72"
              height="72"
              align="center"
              valign="middle"
              style="width:72px;height:72px;background:${primaryColor};color:#ffffff;font-size:18px;line-height:18px;font-weight:700;border-radius:10px;"
            >
              D
            </td>
          </tr>
        </table>`;

    if (signatureMode === "text-only") {
      return `
        <table
          cellpadding="0"
          cellspacing="0"
          border="0"
          role="presentation"
          style="border-collapse:collapse;font-family:${selectedFont.stack};font-size:14px;line-height:1.45;color:${primaryColor};width:auto;max-width:560px;"
        >
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:18px;line-height:24px;font-weight:700;color:${primaryColor};margin:0 0 2px 0;padding:0;">
                ${safeName}
              </div>
              <div style="font-size:14px;line-height:20px;font-weight:400;color:${accentColor};margin:0 0 4px 0;padding:0;">
                ${safeTitle}
              </div>
            </td>
            <td style="width:24px;"></td>
            <td style="vertical-align:top;border-left:2px solid ${accentColor};padding-left:18px;">
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
                ${rows}
                ${linkedinBlock}
              </table>
            </td>
          </tr>
        </table>
      `.trim();
    }

    return `
      <table
        cellpadding="0"
        cellspacing="0"
        border="0"
        role="presentation"
        style="border-collapse:collapse;font-family:${selectedFont.stack};font-size:14px;line-height:1.45;color:${primaryColor};width:auto;max-width:560px;"
      >
        <tr>
          <td width="96" style="width:96px;padding-right:24px;vertical-align:top;border-right:2px solid ${accentColor};">
            <div style="width:72px;text-align:center;">
              ${logoBlock}
            </div>
          </td>
          <td style="padding-left:18px;vertical-align:top;">
            <div style="font-size:18px;line-height:24px;font-weight:700;color:${primaryColor};margin:0 0 2px 0;padding:0;">
              ${safeName}
            </div>
            <div style="font-size:14px;line-height:20px;font-weight:400;color:${primaryColor};margin:0 0 12px 0;padding:0;">
              ${safeTitle}
            </div>
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
              ${rows}
              ${linkedinBlock}
            </table>
          </td>
        </tr>
      </table>
    `.trim();
  };

  const buildSignatureText = () => {
    const rows = [
      displayName || "Jean Dupont",
      displayTitle || "Directeur Commercial",
      displayCompany,
      displayPhone,
      displayEmail,
      displayWebsite,
      displayAddress,
      displayLinkedin,
    ].filter(Boolean);

    return rows.join("\n");
  };

  const copyToClipboard = async () => {
    const htmlContent = buildSignatureHtml();
    const textContent = buildSignatureText();

    try {
      const type = "text/html";
      const blob = new Blob([htmlContent], { type });
      const data = [new ClipboardItem({ [type]: blob, "text/plain": new Blob([textContent], { type: "text/plain" }) })];
      
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy signature", err);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const infoRows = [
    {
      key: "company",
      value: company.trim(),
      href: null,
      icon: (
        <Briefcase
          className="w-3.5 h-3.5"
          style={{ color: accentColor }}
          strokeWidth={1.8}
        />
      ),
      strong: true,
    },
    {
      key: "phone",
      value: phone.trim(),
      href: phone.trim() ? `tel:${phone.trim()}` : null,
      icon: (
        <Phone className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={1.8} />
      ),
      strong: false,
    },
    {
      key: "email",
      value: email.trim(),
      href: email.trim() ? `mailto:${email.trim()}` : null,
      icon: (
        <Mail className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={1.8} />
      ),
      strong: false,
    },
    {
      key: "website",
      value: website.trim(),
      href: website.trim()
        ? website.startsWith("http")
          ? website.trim()
          : `https://${website.trim()}`
        : null,
      icon: (
        <Globe className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={1.8} />
      ),
      strong: false,
    },
    {
      key: "address",
      value: address.trim(),
      href: null,
      icon: (
        <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={1.8} />
      ),
      strong: false,
    },
  ].filter((row) => row.value);

  return (
    <div className="min-h-screen md:h-screen bg-[#FFF9F8] flex flex-col overflow-y-auto md:overflow-hidden text-[#191b30] soft-scroll">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full overflow-y-auto md:overflow-hidden soft-scroll">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] pl-12 md:pl-24 lg:pl-40 pr-6 flex flex-col justify-center space-y-7 md:border-r border-brand-coral/5 py-12 soft-scroll">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue tracking-tight">
              Signature <span className="text-brand-coral">Mail Pro</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              Créez une signature e-mail élégante et professionnelle en un clic. 
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="inline-flex items-center gap-1 p-1 bg-white border border-brand-coral/10 rounded-xl shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
                  <button
                    type="button"
                    onClick={() => setSignatureMode("with-image")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      signatureMode === "with-image"
                        ? "bg-brand-blue text-white"
                        : "text-gray-400 hover:text-brand-blue"
                    }`}
                  >
                    Avec image
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("text-only")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      signatureMode === "text-only"
                        ? "bg-brand-blue text-white"
                        : "text-gray-400 hover:text-brand-blue"
                    }`}
                  >
                    Sans image
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" aria-label="Nom complet" placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" aria-label="Poste occupé" placeholder="Poste occupé" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>
            </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" aria-label="Nom de l'entreprise" placeholder="Nom de l'entreprise" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" aria-label="Téléphone" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="email" aria-label="Email pro" placeholder="Email pro" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" aria-label="Adresse physique" placeholder="Adresse physique" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" aria-label="Site web" placeholder="Site web" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" aria-label="LinkedIn" placeholder="LinkedIn (optionnel)" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border border-brand-coral/10 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-medium shadow-[0_4px_12px_rgba(16,24,40,0.04)] placeholder:text-brand-blue/25 placeholder:font-medium" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(0,1.25fr)]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 bg-white border border-brand-coral/10 rounded-xl px-4 py-3 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    aria-label="Couleur principale"
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-semibold tracking-[0.02em] text-gray-500">{primaryColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 bg-white border border-brand-coral/10 rounded-xl px-4 py-3 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    aria-label="Couleur d'accent"
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-semibold tracking-[0.02em] text-gray-500">{accentColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="relative flex items-center gap-3 bg-white border border-brand-coral/10 rounded-xl px-4 py-3 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-coral/8 text-[11px] font-semibold text-brand-coral">
                    Aa
                  </div>
                  <select
                    value={fontKey}
                    onChange={(e) => setFontKey(e.target.value as (typeof FONT_OPTIONS)[number]["key"])}
                    aria-label="Police"
                    className={`appearance-none bg-transparent pr-8 text-[15px] font-semibold text-brand-blue outline-none w-full ${selectedFont.className}`}
                  >
                    {FONT_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue/45" />
                </div>
              </div>
            </div>

            {signatureMode === "with-image" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-dashed border-brand-coral/20 rounded-xl hover:border-brand-coral/40 cursor-pointer transition-all shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
                  <Camera className="w-4 h-4 text-brand-coral" />
                  <span className="text-xs font-bold text-gray-500">Logo / image (optionnel)</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logo && (
                  <button
                    onClick={() => setLogo(null)}
                    className="w-10 h-10 flex items-center justify-center text-brand-coral bg-brand-coral/10 rounded-xl hover:bg-brand-coral/15 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-6 md:pr-24 lg:pr-40 relative py-12 md:py-8">
          
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
            {/* PREVIEW CARD */}
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(10,29,54,0.06)] border border-brand-coral/10 p-8 md:p-12 mb-8">
              <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-400 opacity-50" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-50" />
                <div className="w-3 h-3 rounded-full bg-green-400 opacity-50" />
                <span className="ml-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Aperçu Signature</span>
              </div>

              {/* RENDERED SIGNATURE (Copy Target) */}
              <div 
                className="bg-white p-4"
                style={{ fontFamily: selectedFont.stack, fontSize: "14px", lineHeight: "1.5" }}
              >
                <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: "-webkit-baseline-middle", fontSize: "14px", fontFamily: selectedFont.stack }}>
                  <tbody>
                    {signatureMode === "with-image" ? (
                      <tr>
                        <td style={{ verticalAlign: "top", paddingRight: "25px", borderRight: `2px solid ${accentColor}` }}>
                          <div style={{ width: "80px", textAlign: "center" }}>
                            {logo ? (
                              <Image src={logo} alt="Logo" width={72} height={72} unoptimized style={{ width: "72px", height: "72px", objectFit: "contain" }} />
                            ) : (
                              <div
                                style={{
                                  width: "72px",
                                  height: "72px",
                                  borderRadius: "12px",
                                  backgroundColor: primaryColor,
                                  color: "#ffffff",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "18px",
                                  fontWeight: "700",
                                }}
                              >
                                D
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ verticalAlign: "top", paddingLeft: "15px" }}>
                          {name.trim() && (
                            <h3 style={{ margin: "0", fontSize: "18px", color: primaryColor, fontWeight: "bold" }}>
                              {name.trim()}
                            </h3>
                          )}
                          {title.trim() && (
                            <p style={{ margin: "2px 0 12px 0", fontSize: "14px", color: accentColor, fontWeight: 400 }}>
                              {title.trim()}
                            </p>
                          )}
                          
                          <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: "-webkit-baseline-middle", fontSize: "13px", color: "#666" }}>
                            <tbody>
                              {infoRows.map((row) => (
                                <tr key={row.key} style={{ height: "24px" }}>
                                  <td style={{ paddingRight: "10px", verticalAlign: "middle" }}>
                                    <span
                                      style={{
                                        width: "22px",
                                        height: "22px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "999px",
                                        backgroundColor: `${accentColor}14`,
                                      }}
                                    >
                                      {row.icon}
                                    </span>
                                  </td>
                                  <td
                                    style={{
                                      color: row.strong ? primaryColor : "#5b6475",
                                      fontWeight: row.strong ? 700 : 400,
                                    }}
                                  >
                                    {row.href ? (
                                      <a href={row.href} style={{ color: primaryColor, textDecoration: "none" }}>
                                        {row.value}
                                      </a>
                                    ) : (
                                      row.value
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          
                          {linkedin.trim() && (
                            <div style={{ marginTop: "15px" }}>
                              <a href={linkedin} style={{ backgroundColor: primaryColor, color: "#fff", padding: "5px 12px", borderRadius: "14px", textDecoration: "none", fontSize: "10px", fontWeight: "bold" }}>
                                LinkedIn
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td style={{ verticalAlign: "top", paddingRight: "22px" }}>
                          {name.trim() && (
                            <h3 style={{ margin: "0", fontSize: "18px", color: primaryColor, fontWeight: "bold" }}>
                              {name.trim()}
                            </h3>
                          )}
                          {title.trim() && (
                            <p style={{ margin: "2px 0 4px 0", fontSize: "14px", color: primaryColor, fontWeight: 400 }}>
                              {title.trim()}
                            </p>
                          )}
                        </td>
                        <td style={{ verticalAlign: "top", paddingLeft: "18px", borderLeft: `2px solid ${accentColor}` }}>
                          <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: "-webkit-baseline-middle", fontSize: "13px", color: "#666" }}>
                            <tbody>
                              {infoRows.map((row) => (
                                <tr key={row.key} style={{ height: "24px" }}>
                                  <td style={{ paddingRight: "10px", verticalAlign: "middle" }}>
                                    <span
                                      style={{
                                        width: "22px",
                                        height: "22px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "999px",
                                        backgroundColor: `${accentColor}14`,
                                      }}
                                    >
                                      {row.icon}
                                    </span>
                                  </td>
                                  <td
                                    style={{
                                      color: row.strong ? primaryColor : "#5b6475",
                                      fontWeight: row.strong ? 700 : 400,
                                    }}
                                  >
                                    {row.href ? (
                                      <a href={row.href} style={{ color: primaryColor, textDecoration: "none" }}>
                                        {row.value}
                                      </a>
                                    ) : (
                                      row.value
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {linkedin.trim() && (
                            <div style={{ marginTop: "15px" }}>
                              <a href={linkedin} style={{ backgroundColor: primaryColor, color: "#fff", padding: "5px 12px", borderRadius: "14px", textDecoration: "none", fontSize: "10px", fontWeight: "bold" }}>
                                LinkedIn
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-4">
              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-3 py-5 bg-brand-blue text-white rounded-3xl text-sm font-bold hover:bg-brand-blue/95 shadow-2xl shadow-brand-blue/20 transition-all active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 opacity-70" />}
                {copied ? "SIGNATURE COPIÉE !" : "COPIER LA SIGNATURE"}
              </button>
              
              <div className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-brand-coral/10">
                <div className="w-10 h-10 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5 text-brand-coral" />
                </div>
                <p className="text-xs text-brand-blue/70 leading-relaxed font-medium">
                  <strong>Astuce Pro :</strong> Après avoir copié, allez dans les réglages de votre messagerie (Gmail, Outlook) et faites simplement <strong>Coller</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media (min-width: 768px) {
          body { overflow: hidden; }
        }
      `}</style>
    </div>
  );
}
