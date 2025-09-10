import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Minimize2, Send, Bot, User, ExternalLink, HelpCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: Array<{
    text: string;
    url: string;
    description?: string;
  }>;
}

interface ChatResponse {
  message: string;
  suggestedLinks: Array<{
    text: string;
    url: string;
    description?: string;
  }>;
}

const QUICK_ACTIONS = [
  { text: "Can't login to my account", query: "help me with login issues" },
  { text: "How to become a vendor?", query: "how do I apply to become a vendor" },
  { text: "Order status", query: "how do I check my order status" },
  { text: "Return policy", query: "what is your return policy" },
];

export default function AIChatbot() {
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('ai-chatbot-minimized');
    return saved === 'true';
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ai-chatbot-messages');
    try {
      return saved ? JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ai-chatbot-messages', JSON.stringify(messages));
  }, [messages]);

  // Save minimized state to localStorage
  useEffect(() => {
    localStorage.setItem('ai-chatbot-minimized', isMinimized.toString());
  }, [isMinimized]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiRequest("POST", "/api/ai/chat", { 
        message,
        history: messages.slice(-5) // Send last 5 messages for context
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "-assistant",
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        links: data.suggestedLinks
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "-error",
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact support if the issue persists.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    chatMutation.mutate(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai-chatbot-messages');
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full shadow-lg"
          data-testid="button-open-chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Bot className="w-5 h-5 mr-2 text-primary" />
            Dokan AI Assistant
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMinimized(true)}
              data-testid="button-minimize-chatbot"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Online • Here to help with your questions
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">Hi! I'm your AI assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I can help with account issues, vendor applications, orders, and general questions about the platform.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick actions:</p>
              {QUICK_ACTIONS.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto py-2 px-3"
                  onClick={() => handleQuickAction(action.query)}
                  data-testid={`button-quick-action-${index}`}
                >
                  {action.text}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {message.links && message.links.length > 0 && (
                        <div className="space-y-1">
                          {message.links.map((link, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => window.open(link.url.startsWith('/') ? window.location.origin + link.url : link.url, '_blank')}
                              data-testid={`link-suggestion-${index}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {link.text}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex mr-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex-shrink-0 mt-4 space-y-2">
          {messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-xs"
                data-testid="button-clear-chat"
              >
                Clear conversation
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={chatMutation.isPending}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || chatMutation.isPending}
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}