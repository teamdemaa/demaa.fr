"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, Send } from "lucide-react";
import { createPortal } from "react-dom";

export default function SubscriptionModal({ 
  toolName,
  isOpen,
  onClose
}: { 
  toolName: string,
  isOpen: boolean,
  onClose: () => void
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Simulate API call
      // In a real scenario, this would call /api/subscribe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // OPTIONAL: Send to WhatsApp in the background (will likely be blocked by popup blockers if not triggered by direct click)
      // For now, we follow the user requirement: "juste un message de succès"
      
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (typeof document === "undefined" || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-blue/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20"
      >
        
        {/* Header */}
        <div className="p-6 flex justify-end">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-brand-blue transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-12 pt-2 text-center">
          {status === "success" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-brand-blue mb-3">C&apos;est noté !</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Merci ! On vous prévient sur <span className="font-bold text-brand-blue">{email || "votre email"}</span> dès que <span className="text-brand-coral font-medium">{toolName}</span> est prêt.
              </p>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-coral transition-all active:scale-95"
              >
                Super, merci
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-brand-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-brand-coral" />
              </div>
              <h3 className="text-2xl font-bold text-brand-blue mb-2">Bientôt disponible</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Laissez-nous votre email pour être le premier à utiliser <span className="font-bold text-brand-blue">{toolName}</span> lors de son lancement.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="demaa-input px-6 py-4 rounded-2xl"
                    disabled={status === "loading"}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-coral transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:bg-brand-blue active:scale-95 shadow-lg shadow-brand-blue/10"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Notifiez-moi"
                  )}
                </button>
                
                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
                  Promis, pas de spam
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
