"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, Building2, Briefcase, Mail, BadgePercent } from "lucide-react";

export default function TeamLeadModal({
  isOpen,
  onClose,
  title = "Rejoignez la Team Demaa",
  description = "Bénéficiez de Tarifs négociés pour votre activité et d'un accompagnement sur mesure."
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    sector: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;
      if (!webhookUrl) throw new Error("Slack webhook URL not configured");

      const payload = {
        text: `📬 Nouvelle demande Team Demaa`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Entreprise* : ${formData.company}\n*Secteur* : ${formData.sector || "_non renseigné_"}\n*Email* : ${formData.email}`
            }
          },
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: `⏰ ${new Date().toLocaleString("fr-FR")}` }]
          }
        ]
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Slack notification failed", err);
    }
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-blue/5 backdrop-blur-[1px] z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-[310px] rounded-[1.2rem] shadow-[0_10px_30px_rgba(25,27,48,0.06)] overflow-hidden pointer-events-auto relative border border-gray-100/50"
            >
              <button
                onClick={onClose}
                className="absolute top-3.5 right-3.5 p-1 rounded-full hover:bg-gray-50 text-gray-200 hover:text-brand-blue transition-colors z-10"
              >
                <X className="w-3 h-3" />
              </button>

              {!isSubmitted ? (
                <div className="p-6">
                  <div className="mb-5 text-center px-2">
                    <div className="w-8 h-8 bg-brand-blue/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <BadgePercent className="w-4 h-4 text-brand-blue/60" />
                    </div>
                    <h2 className="text-[15px] font-black text-brand-blue tracking-tight leading-tight mb-1">
                      {title}
                    </h2>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      {description}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="relative group">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        required
                        type="text"
                        placeholder="Nom de l'entreprise"
                        className="w-full pl-8 pr-3 py-2 bg-gray-50/30 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue/10 focus:border-brand-blue/20 transition-all text-brand-blue text-[11px] font-medium placeholder:text-gray-200"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>

                    <div className="relative group">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        required
                        type="text"
                        placeholder="Secteur d'activité"
                        className="w-full pl-8 pr-3 py-2 bg-gray-50/30 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue/10 focus:border-brand-blue/20 transition-all text-brand-blue text-[11px] font-medium placeholder:text-gray-200"
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      />
                    </div>

                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        required
                        type="email"
                        placeholder="votre@email.com"
                        className="w-full pl-8 pr-3 py-2 bg-gray-50/30 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue/10 focus:border-brand-blue/20 transition-all text-brand-blue text-[11px] font-medium placeholder:text-gray-200"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-coral transition-all active:scale-[0.98] mt-4"
                    >
                      REJOINDRE <Send className="w-2 h-2" />
                    </button>
                    <p className="text-[8px] text-center text-gray-300 mt-3 leading-relaxed font-bold uppercase tracking-widest opacity-40">
                      Privilèges exclusifs Demaa
                    </p>
                  </form>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center"
                >
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <h3 className="text-sm font-black text-brand-blue mb-1 tracking-tight">C'est envoyé !</h3>
                  <p className="text-gray-400 text-[10px] leading-relaxed mb-6">
                    Merci <span className="font-bold text-brand-blue">{formData.company}</span>. <br />
                    Nous revenons vers vous.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-1.5 bg-gray-50 text-brand-blue/30 hover:text-brand-blue font-bold text-[9px] uppercase tracking-widest rounded-md hover:bg-gray-100 transition-all"
                  >
                    OK
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
