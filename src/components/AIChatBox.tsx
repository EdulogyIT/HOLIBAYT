import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: string; // store as ISO for persistence
}

const LS_KEYS = {
  OPEN: "hb_chat_open",
  MINIMIZED: "hb_chat_minimized",
  MSGS: "hb_chat_messages",
};

const AIChatBox = () => {
  const { currentLang } = useLanguage();
  const { toast } = useToast();

  // UI state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getWelcomeMessage = () => {
    switch (currentLang) {
      case "AR":
        return "مرحبا! أنا مساعد هولي بايت الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنني الإجابة على أسئلة حول شراء أو استئجار أو الإقامة القصيرة في الجزائر.";
      case "EN":
        return "Hello! I'm Holibayt AI assistant. How can I help you today? I can answer questions about buying, renting, or short-stay properties in Algeria.";
      case "FR":
      default:
        return "Bonjour ! Je suis l'assistant IA de Holibayt. Comment puis-je vous aider aujourd'hui ? Je peux répondre aux questions sur l'achat, la location ou les séjours courts en Algérie.";
    }
  };

  /* ---------------------------
   * Restore from localStorage
   * --------------------------*/
  useEffect(() => {
    try {
      const savedOpen = localStorage.getItem(LS_KEYS.OPEN);
      const savedMin = localStorage.getItem(LS_KEYS.MINIMIZED);
      const savedMsgs = localStorage.getItem(LS_KEYS.MSGS);

      if (savedOpen) setIsOpen(savedOpen === "1");
      if (savedMin) setIsMinimized(savedMin === "1");

      if (savedMsgs) {
        const parsed: Message[] = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setIsInitialized(true);
          return;
        }
      }

      // First-time init → seed welcome message
      const welcome: Message = {
        id: 1,
        text: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
      setIsInitialized(true);
    } catch {
      // If anything fails, at least show welcome
      const welcome: Message = {
        id: 1,
        text: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
      setIsInitialized(true);
    }
  }, []);

  // Persist messages + UI state
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LS_KEYS.MSGS, JSON.stringify(messages));
    } catch {}
  }, [messages, isInitialized]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.OPEN, isOpen ? "1" : "0");
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.MINIMIZED, isMinimized ? "1" : "0");
  }, [isMinimized]);

  /* ---------------------------
   * Language change: refresh *only* the welcome (id=1) text.
   * Do not clear history.
   * --------------------------*/
  useEffect(() => {
    if (!isInitialized) return;
    setMessages((prev) => {
      if (!prev.length) {
        return [
          {
            id: 1,
            text: getWelcomeMessage(),
            isBot: true,
            timestamp: new Date().toISOString(),
          },
        ];
      }
      const next = [...prev];
      const idx = next.findIndex((m) => m.id === 1 && m.isBot);
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          text: getWelcomeMessage(),
          timestamp: new Date().toISOString(),
        };
      } else {
        next.unshift({
          id: 1,
          text: getWelcomeMessage(),
          isBot: true,
          timestamp: new Date().toISOString(),
        });
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);

  // Smooth scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isMinimized]);

  // Global event to open from teaser or any button:
  useEffect(() => {
    const openHandler = () => {
      setIsOpen(true);
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    document.addEventListener("holibayt:open-chat" as any, openHandler);
    return () =>
      document.removeEventListener("holibayt:open-chat" as any, openHandler);
  }, []);

  // Keyboard: Esc minimizes / closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsMinimized(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  /* ---------------------------
   * Send message
   * --------------------------*/
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text: trimmed,
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const historyPayload = [...messages, userMessage].map((m) => ({
        role: m.isBot ? "assistant" : "user",
        content: m.text,
      }));

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: historyPayload,
          language: currentLang,
        },
      });

      if (error) throw error;

      const replyText: string =
        (data && (data.message as string)) ||
        (currentLang === "AR"
          ? "تمت المعالجة."
          : currentLang === "FR"
          ? "Traitement terminé."
          : "Processed.");

      const botMessage: Message = {
        id: Date.now() + 1,
        text: replyText,
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("AI chat error:", err);
      toast({
        title: currentLang === "AR" ? "خطأ" : currentLang === "FR" ? "Erreur" : "Error",
        description:
          currentLang === "AR"
            ? "فشل في الحصول على الرد. حاول مرة أخرى."
            : currentLang === "FR"
            ? "Échec de la réponse. Veuillez réessayer."
            : "Failed to get a response. Please try again.",
        variant: "destructive",
      });

      const fallbackMessage: Message = {
        id: Date.now() + 1,
        text:
          currentLang === "AR"
            ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل مع مستشارينا."
            : currentLang === "FR"
            ? "Désolé, une erreur s'est produite. Réessayez ou contactez nos conseillers."
            : "Sorry, an error occurred. Please try again or contact our advisors.",
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------------------------
   * Render
   * --------------------------*/
  if (!isOpen) {
    // Floating FAB when minimized/closed
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="rounded-full w-14 h-14 shadow-elegant hover:shadow-lg transition-all duration-300 hover:scale-110 bg-emerald-700 text-white"
          size="icon"
          title={
            currentLang === "AR"
              ? "الدردشة مع المساعد"
              : currentLang === "FR"
              ? "Discuter avec l'assistant"
              : "Chat with AI Assistant"
          }
          type="button"
        >
          <Bot className="h-6 w-6" />
        </Button>
        <span className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={`w-80 ${
          isMinimized ? "h-16" : "h-96"
        } shadow-elegant transition-all duration-300`}
        role="dialog"
        aria-modal="true"
        aria-label={
          currentLang === "AR"
            ? "مساعد هولي بايت الذكي"
            : currentLang === "FR"
            ? "Assistant IA Holibayt"
            : "Holibayt AI Assistant"
        }
      >
        <CardHeader className="p-4 bg-white border-b rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-inter text-slate-900">
                {currentLang === "AR"
                  ? "مساعد هولي بايت الذكي"
                  : currentLang === "FR"
                  ? "Assistant IA Holibayt"
                  : "Holibayt AI Assistant"}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-600 hover:bg-slate-100"
                onClick={() => setIsMinimized(!isMinimized)}
                type="button"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-600 hover:bg-slate-100"
                onClick={() => {
                  setIsOpen(false); // close -> FAB remains
                }}
                type="button"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80 bg-white">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const timeLabel = new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isBot ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isBot
                            ? "bg-slate-50 text-slate-900 border"
                            : "bg-emerald-700 text-white"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.isBot ? (
                            <Bot className="h-4 w-4 flex-shrink-0 mt-1" />
                          ) : (
                            <User className="h-4 w-4 flex-shrink-0 mt-1" />
                          )}
                          <p className="text-sm font-inter whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                        <p className="text-[11px] opacity-70 mt-1">{timeLabel}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 text-slate-900 border p-3 rounded-lg max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    currentLang === "AR"
                      ? "اسأل عن العقارات..."
                      : currentLang === "FR"
                      ? "Posez des questions sur les propriétés..."
                      : "Ask about properties..."
                  }
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="bg-emerald-700 hover:bg-emerald-800"
                  disabled={!inputValue.trim() || isTyping}
                  type="button"
                  aria-label="Send"
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIChatBox;
