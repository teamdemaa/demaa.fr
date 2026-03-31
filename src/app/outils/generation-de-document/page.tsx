"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Send, Copy, FileDown, Loader2, User, Bot, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function DocGeneratorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant juridique. Quel type de document souhaitez-vous créer aujourd'hui ? (Ex: Contrat de prestation, Statuts, Accord de confidentialité...)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: assistantContent }];
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue lors de la génération. Veuillez réessayer." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple feedback if needed later
  };

  const downloadPDF = async (title: string, content: string) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    // Clean content from markers
    const cleanContent = content
      .replace(/---DOCUMENT---/g, "")
      .replace(/---QUESTIONS---/g, "\n\n--- QUESTIONS À RÉPONDRE ---\n")
      .replace(/---DOCUMENT_FINAL---/g, "");

    const splitText = doc.splitTextToSize(cleanContent, 180);
    doc.setFontSize(10);
    doc.text(splitText, 15, 20);
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  const parseMessage = (content: string) => {
    if (content.includes("---DOCUMENT---") || content.includes("---DOCUMENT_FINAL---")) {
      const parts = content.split(/---QUESTIONS---|---DOCUMENT_FINAL---|---DOCUMENT---/).filter(Boolean);
      return (
        <div className="space-y-4">
          {content.includes("---DOCUMENT---") || content.includes("---DOCUMENT_FINAL---") ? (
            <div className="relative group">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed text-gray-800">
                {parts[0].trim()}
              </div>
              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => copyToClipboard(parts[0].trim())}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors shadow-sm"
                  title="Copier"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => downloadPDF("Document_Juridique", parts[0].trim())}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-brand-coral transition-colors shadow-sm"
                  title="Télécharger PDF"
                >
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
          {content.includes("---QUESTIONS---") && (
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="font-bold text-brand-blue mb-2 italic">Questions pour finaliser :</p>
              <div className="whitespace-pre-wrap">{parts[content.includes("---DOCUMENT---") ? 1 : 0]?.trim()}</div>
            </div>
          )}
        </div>
      );
    }
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          <div className="flex flex-col h-[80vh] border border-gray-100 rounded-3xl shadow-2xl overflow-hidden bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 bg-white flex justify-between items-center px-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-coral/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-brand-coral" />
                </div>
                <h1 className="font-bold text-brand-blue">Assistant Juridique IA</h1>
              </div>
              <button 
                onClick={() => setMessages([messages[0]])}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Nouvelle discussion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${m.role === "user" ? "bg-brand-blue" : "bg-gray-100"}`}>
                      {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-blue" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-brand-blue text-white rounded-tr-none shadow-md" : "bg-white border border-gray-100 text-brand-blue rounded-tl-none shadow-sm"}`}>
                      {parseMessage(m.content)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-brand-blue" />
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-none flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-50 bg-white">
              <form 
                onSubmit={handleSubmit}
                className="relative flex items-end gap-3"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Décrivez le document souhaité ou répondez aux questions..."
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 pr-14 focus:outline-none focus:ring-4 focus:ring-brand-coral/10 focus:border-brand-coral transition-all text-sm md:text-base text-brand-blue placeholder-gray-400 resize-none overflow-hidden min-h-[56px]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2.5 bg-brand-blue text-white rounded-xl hover:bg-brand-coral disabled:opacity-30 disabled:hover:bg-brand-blue transition-all shadow-lg active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-bold">
                Propulsé par Claude 3.5 Sonnet
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
