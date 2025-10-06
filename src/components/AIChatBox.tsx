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

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const AIChatBox = () => {
  const { t, currentLang } = useLanguage();
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
    lastUserMessageRef.current = currentInput;

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(currentInput);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    const responses = {
      FR: {
        buy: "Je peux vous aider à trouver des propriétés à vendre ! Notre section achat propose des appartements, villas et propriétés commerciales à travers l'Algérie. Quel type de propriété recherchez-vous et dans quelle ville ?",
        rent: "Parfait ! Nous avons de nombreuses propriétés de location disponibles. Recherchez-vous une location à long terme ou à court terme ? Quelle ville vous intéresse - Alger, Oran, Constantine ou Annaba ?",
        stay: "Excellent choix ! Pour les séjours courts, pouvez-vous me dire dans quelle ville vous souhaitez séjourner (Alger, Oran, Constantine ou Annaba) ?",
        stayFollowup: "Merci ! Combien de nuits prévoyez-vous de rester ?",
        price: "Les prix des propriétés varient selon l'emplacement et le type. À Alger, les appartements commencent à partir de 8M DZD, tandis qu'à Oran vous pouvez trouver d'excellentes options à partir de 5M DZD. Souhaitez-vous des prix spécifiques pour une zone particulière ?",
        location: "Nous couvrons les principales villes algériennes : Alger (capitale), Oran (côte ouest), Constantine (est) et Annaba (nord-est). Chaque ville a ses caractéristiques uniques. Quelle ville vous intéresse le plus ?",
        contact: "Vous pouvez parler à nos conseillers experts via notre page Contacter un Conseiller ! Nous offrons un support téléphonique (+213 21 123 456), email (support@holibayt.com), ou chat en direct. Ils sont disponibles 24/7.",
        hello: "Bonjour ! Bienvenue sur Holibayt. Je suis là pour vous aider à trouver la propriété parfaite en Algérie. Cherchez-vous à acheter, louer, ou avez-vous besoin d'un séjour court ?",
        default: "Je comprends que vous recherchez une assistance immobilière. Je peux vous aider avec l'achat, la location ou les séjours courts en Algérie. Pourriez-vous me dire plus sur ce que vous recherchez ? Vous pouvez aussi contacter nos conseillers humains pour une assistance détaillée !"
      },
      EN: {
        buy: "I can help you find properties for sale! Our buy section features apartments, villas, and commercial properties across Algeria. What type of property are you looking for and in which city?",
        rent: "Great! We have many rental properties available. Are you looking for a long-term rental or short-term? Which city interests you - Alger, Oran, Constantine, or Annaba?",
        stay: "Perfect choice! For short stays, can you tell me which city you'd like to stay in (Alger, Oran, Constantine, or Annaba)?",
        stayFollowup: "Thank you! How many nights are you planning to stay?",
        price: "Property prices vary by location and type. In Alger, apartments start from 8M DZD, while in Oran you can find great options from 5M DZD. Would you like specific pricing for a particular area?",
        location: "We cover major Algerian cities: Alger (capital), Oran (west coast), Constantine (east), and Annaba (northeast). Each city has unique characteristics. Which location interests you most?",
        contact: "You can speak to our expert advisors through our Contact Advisor page! We offer phone support (+213 21 123 456), email (support@holibayt.com), or live chat. They're available 24/7.",
        hello: "Hello! Welcome to Holibayt. I'm here to help you find the perfect property in Algeria. Are you looking to buy, rent, or need a short stay?",
        default: "I understand you're looking for property assistance. I can help you with buying, renting, or short stays in Algeria. Could you tell me more about what you're looking for? You can also contact our human advisors for detailed assistance!"
      },
      AR: {
        buy: "يمكنني مساعدتك في العثور على عقارات للبيع! قسم الشراء لدينا يضم شقق وفيلات وعقارات تجارية في جميع أنحاء الجزائر. ما نوع العقار الذي تبحث عنه وفي أي مدينة؟",
        rent: "رائع! لدينا العديد من العقارات المتاحة للإيجار. هل تبحث عن إيجار طويل الأمد أم قصير الأمد؟ أي مدينة تهمك - الجزائر، وهران، قسنطينة أم عنابة؟",
        stay: "اختيار ممتاز! للإقامات القصيرة، هل يمكنك إخباري في أي مدينة ترغب في الإقامة (الجزائر، وهران، قسنطينة أم عنابة)؟",
        stayFollowup: "شكرا! كم ليلة تخطط للإقامة؟",
        price: "أسعار العقارات تختلف حسب الموقع والنوع. في الجزائر العاصمة، تبدأ الشقق من 8 مليون دج، بينما في وهران يمكنك العثور على خيارات رائعة من 5 مليون دج. هل تريد أسعار محددة لمنطقة معينة؟",
        location: "نحن نغطي المدن الجزائرية الرئيسية: الجزائر (العاصمة)، وهران (الساحل الغربي)، قسنطينة (الشرق) وعنابة (الشمال الشرقي). كل مدينة لها خصائصها الفريدة. أي موقع يهمك أكثر؟",
        contact: "يمكنك التحدث مع مستشارينا الخبراء من خلال صفحة اتصل بمستشار! نحن نقدم دعم هاتفي (+213 21 123 456)، بريد إلكتروني (support@holibayt.com)، أو محادثة مباشرة. متاحون 24/7.",
        hello: "مرحبا! مرحبا بك في هولي بايت. أنا هنا لمساعدتك في العثور على العقار المثالي في الجزائر. هل تبحث عن شراء أو استئجار أو تحتاج إقامة قصيرة؟",
        default: "أفهم أنك تبحث عن مساعدة عقارية. يمكنني مساعدتك في الشراء أو الإيجار أو الإقامات القصيرة في الجزائر. هل يمكنك إخباري المزيد عما تبحث عنه؟ يمكنك أيضا الاتصال بمستشارينا البشريين للحصول على مساعدة مفصلة!"
      }
    };

    const langResponses = responses[currentLang] || responses.FR;
    
    // Check if previous message was about stay/nights to provide follow-up
    const prevMsg = lastUserMessageRef.current.toLowerCase();
    const hasNightsInfo = /\d+\s*(night|nuit|ليلة)/i.test(input);
    const hasCityInfo = /(alger|oran|constantine|annaba|الجزائر|وهران|قسنطينة|عنابة)/i.test(input);
    
    if (input.includes("buy") || input.includes("purchase") || input.includes("acheter") || input.includes("شراء")) {
      return langResponses.buy;
    }
    
    if (input.includes("rent") || input.includes("rental") || input.includes("louer") || input.includes("إيجار")) {
      return langResponses.rent;
    }
    
    if (input.includes("short") || input.includes("stay") || input.includes("hotel") || input.includes("séjour") || input.includes("إقامة")) {
      // If they mentioned city but not nights, ask for nights
      if (hasCityInfo && !hasNightsInfo) {
        return langResponses.stayFollowup;
      }
      return langResponses.stay;
    }
    
    // If they give nights info and previous was about stay
    if (hasNightsInfo && (prevMsg.includes("stay") || prevMsg.includes("séjour") || prevMsg.includes("إقامة") || prevMsg.includes("night"))) {
      return currentLang === 'FR' 
        ? "Parfait ! Vous pouvez maintenant visiter notre page 'Séjours Courts' pour trouver les meilleures options correspondant à votre séjour. Ou contactez nos conseillers pour une assistance personnalisée !"
        : currentLang === 'EN'
        ? "Perfect! You can now visit our 'Short Stay' page to find the best options for your stay. Or contact our advisors for personalized assistance!"
        : "ممتاز! يمكنك الآن زيارة صفحة 'الإقامة القصيرة' للعثور على أفضل الخيارات لإقامتك. أو اتصل بمستشارينا للحصول على مساعدة شخصية!";
    }
    
    // If they give city info
    if (hasCityInfo && !hasNightsInfo && (prevMsg.includes("stay") || prevMsg.includes("séjour") || prevMsg.includes("إقامة"))) {
      return langResponses.stayFollowup;
    }
    
    if (input.includes("price") || input.includes("cost") || input.includes("prix") || input.includes("سعر")) {
      return langResponses.price;
    }
    
    if (input.includes("location") || input.includes("city") || input.includes("area") || input.includes("ville") || input.includes("مدينة")) {
      return langResponses.location;
    }
    
    if (input.includes("contact") || input.includes("advisor") || input.includes("help") || input.includes("conseiller") || input.includes("مساعدة")) {
      return langResponses.contact;
    }
    
    if (input.includes("hello") || input.includes("hi") || input.includes("hey") || input.includes("bonjour") || input.includes("salut") || input.includes("مرحبا")) {
      return langResponses.hello;
    }
    
    return langResponses.default;
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
          onClick={() => window.location.href = '/messages'}
          className="bg-gradient-primary text-primary-foreground rounded-full w-14 h-14 shadow-elegant hover:shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
          title="Live Chat with Support"
        >
          <MessageCircle className="h-6 w-6" />
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