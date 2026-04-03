"use client";

import { useState } from "react";
import { Send, CheckCircle2, User, Briefcase, Mail, Phone } from "lucide-react";

export default function ConsultationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    sector: "",
    email: "",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formData.company || formData.name,
          sector: formData.sector,
          email: formData.email,
          source: `Consultation — ${formData.name} — ${formData.phone}`
        })
      });
    } catch (err) {
      console.error("Consultation submission failed", err);
    }
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="p-10 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-xl font-black text-brand-blue mb-2 tracking-tight">Demande envoyée !</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Un expert vous contactera très prochainement pour planifier votre appel.
        </p>
        <button
          onClick={onSuccess}
          className="px-8 py-3 bg-brand-blue text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-coral transition-all"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
          <input
            required
            type="text"
            placeholder="Prénom & Nom"
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all text-brand-blue text-sm font-medium placeholder:text-gray-300"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="relative group">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            placeholder="Nom d'entreprise"
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all text-brand-blue text-sm font-medium placeholder:text-gray-300"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
      </div>

      <div className="relative group">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
        <input
          required
          type="email"
          placeholder="votre@email.com"
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all text-brand-blue text-sm font-medium placeholder:text-gray-300"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="relative group">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
        <input
          required
          type="tel"
          placeholder="06 XX XX XX XX"
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all text-brand-blue text-sm font-medium placeholder:text-gray-300"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="relative group">
        <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
        <textarea
          placeholder="Décrivez brièvement votre situation (optionnel)"
          rows={3}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all text-brand-blue text-sm font-medium placeholder:text-gray-300 resize-none"
          value={formData.sector}
          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand-blue text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-brand-coral transition-all active:scale-[0.98] shadow-lg shadow-brand-blue/10"
      >
        Demander ma consultation gratuite <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
