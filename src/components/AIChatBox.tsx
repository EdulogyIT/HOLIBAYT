import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const AIChatBox = () => {
  const { t, currentLang } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const getWelcomeMessage = () => {
    switch (currentLang) {
      case 'AR':
        return "مرحبا! أنا مساعد هولي بايت الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنني الإجابة على أسئلة حول شراء أو استئجار أو الإقامة القصيرة في الجزائر.";
      case 'EN':
        return "Hello! I'm Holibayt AI assistant. How can I help you today? I can answer questions about buying, renting, or short-stay properties in Algeria.";
      case 'FR':
      default:
        return "Bonjour ! Je suis l'assistant IA de Holibayt. Comment puis-je vous aider aujourd'hui ? Je peux répondre aux questions sur l'achat, la location ou les séjours courts en Algérie.";
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>("");

  // Initialize messages with welcome message and update when language changes
  useEffect(() => {
    if (!isInitialized) {
      // Initial load - just set welcome message
      setMessages([{
        id: 1,
        text: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date()
      }]);
      setIsInitialized(true);
    } else {
      // Language change - update only the welcome message without clearing history
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isBot || prev.indexOf(msg) > 0);
        return [{
          id: 1,
          text: getWelcomeMessage(),
          isBot: true,
          timestamp: new Date()
        }, ...filteredMessages];
      });
    }
  }, [currentLang]); // Re-run when language changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    const userMessage: Message = {
      id: Date.now(),
      text: currentInput,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call the AI chat edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.isBot ? 'assistant' : 'user',
            content: m.text
          })),
          language: currentLang
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.message,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling AI chat:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
      
      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now() + 1,
        text: currentLang === 'AR' 
          ? "عذرا، حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بمستشارينا للحصول على المساعدة."
          : currentLang === 'EN'
          ? "Sorry, an error occurred. Please try again or contact our advisors for assistance."
          : "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter nos conseillers pour obtenir de l'aide.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-primary text-primary-foreground rounded-full w-14 h-14 shadow-elegant hover:shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
          title="Chat with AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 ${isMinimized ? 'h-16' : 'h-96'} shadow-elegant transition-all duration-300`}>
        <CardHeader className="p-4 bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-inter">
                {currentLang === 'AR' ? 'مساعد هولي بايت الذكي' : currentLang === 'EN' ? 'Holibayt AI Assistant' : 'Assistant IA Holibayt'}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isBot
                          ? 'bg-card text-card-foreground border'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.isBot && <Bot className="h-4 w-4 flex-shrink-0 mt-1" />}
                        {!message.isBot && <User className="h-4 w-4 flex-shrink-0 mt-1" />}
                        <p className="text-sm font-inter">{message.text}</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card text-card-foreground border p-3 rounded-lg max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentLang === 'AR' ? 'اسأل عن العقارات...' : currentLang === 'EN' ? 'Ask about properties...' : 'Posez des questions sur les propriétés...'}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="bg-gradient-primary"
                  disabled={!inputValue.trim()}
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
