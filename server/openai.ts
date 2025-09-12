import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available and valid
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (apiKey && apiKey.length > 10) {
  try {
    openai = new OpenAI({ apiKey: apiKey });
    console.log("OpenAI client initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize OpenAI client:", error);
    openai = null;
  }
} else {
  console.log("OpenAI API key not found or invalid - chatbot will use fallback responses");
}

export interface ChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  message: string;
  suggestedLinks: Array<{
    text: string;
    url: string;
    description?: string;
  }>;
}

// Knowledge base for the chatbot
const DOKAN_KNOWLEDGE = {
  routes: {
    "/auth": "Login or create account",
    "/dashboard/user": "User dashboard - view orders, profile",
    "/dashboard/vendor": "Vendor dashboard - manage products, orders",
    "/dashboard/admin": "Admin dashboard - system management",
    "/shop": "Browse and search products",
    "/faq": "Frequently asked questions",
    "/vendor-guide": "Complete guide to becoming a vendor",
    "/contact": "Contact support team",
    "/about": "Learn about Dokan marketplace",
    "/privacy": "Privacy policy",
    "/terms": "Terms of service",
    "/return-policy": "Return and refund policy",
    "/shipping": "Shipping information"
  },
  
  faqs: [
    {
      question: "How do I create an account?",
      answer: "Click 'Sign Up' in the navigation, fill in your details, and choose between user or vendor account. You'll receive a confirmation email.",
      links: [{ text: "Sign Up", url: "/auth", description: "Create your account" }]
    },
    {
      question: "I can't log in to my account",
      answer: "Make sure you're using the correct email and password. Try clearing your browser cache or use the password reset option if needed.",
      links: [
        { text: "Login Page", url: "/auth", description: "Try logging in again" },
        { text: "Contact Support", url: "/contact", description: "Get help from our team" }
      ]
    },
    {
      question: "How do I become a vendor?",
      answer: "First create a user account, then apply for vendor status in your dashboard. Provide business information and get approved within 3-5 days.",
      links: [
        { text: "Vendor Guide", url: "/vendor-guide", description: "Complete vendor application guide" },
        { text: "Create Account", url: "/auth", description: "Start by creating an account" }
      ]
    },
    {
      question: "How do I track my order?",
      answer: "Log into your account and go to your dashboard to view all orders and their current status. You'll also receive email updates.",
      links: [
        { text: "User Dashboard", url: "/dashboard/user", description: "View your orders" },
        { text: "Login", url: "/auth", description: "Access your account" }
      ]
    },
    {
      question: "What is the return policy?",
      answer: "You can return most items within 30 days of delivery. Items must be in original condition. Contact the vendor or use your dashboard to start a return.",
      links: [
        { text: "Return Policy", url: "/return-policy", description: "Full return policy details" },
        { text: "User Dashboard", url: "/dashboard/user", description: "Start a return" }
      ]
    },
    {
      question: "How do I add products as a vendor?",
      answer: "Once approved as a vendor, go to your vendor dashboard and click 'Add Product'. Upload images, set pricing, and add detailed descriptions.",
      links: [
        { text: "Vendor Dashboard", url: "/dashboard/vendor", description: "Manage your products" },
        { text: "Vendor Guide", url: "/vendor-guide", description: "Learn about vendor features" }
      ]
    }
  ]
};

function findRelevantContent(query: string): Array<{
  text: string;
  url: string;
  description?: string;
}> {
  const lowerQuery = query.toLowerCase();
  const suggestions: Array<{ text: string; url: string; description?: string; }> = [];
  
  // Check routes
  Object.entries(DOKAN_KNOWLEDGE.routes).forEach(([path, description]) => {
    if (lowerQuery.includes(path.slice(1)) || description.toLowerCase().includes(lowerQuery.split(' ')[0])) {
      suggestions.push({ text: description, url: path });
    }
  });
  
  // Check FAQs
  DOKAN_KNOWLEDGE.faqs.forEach(faq => {
    if (faq.question.toLowerCase().includes(lowerQuery) || 
        faq.answer.toLowerCase().includes(lowerQuery) ||
        lowerQuery.split(' ').some(word => faq.question.toLowerCase().includes(word))) {
      faq.links.forEach(link => suggestions.push(link));
    }
  });
  
  // Default helpful links based on common queries
  if (lowerQuery.includes('login') || lowerQuery.includes('sign in') || lowerQuery.includes('account')) {
    suggestions.push({ text: "Login Page", url: "/auth", description: "Access your account" });
  }
  
  if (lowerQuery.includes('vendor') || lowerQuery.includes('sell')) {
    suggestions.push({ text: "Vendor Guide", url: "/vendor-guide", description: "Learn about selling on Dokan" });
  }
  
  if (lowerQuery.includes('order') || lowerQuery.includes('purchase')) {
    suggestions.push({ text: "User Dashboard", url: "/dashboard/user", description: "View your orders" });
  }
  
  if (lowerQuery.includes('help') || lowerQuery.includes('support') || lowerQuery.includes('contact')) {
    suggestions.push({ text: "Contact Support", url: "/contact", description: "Get help from our team" });
    suggestions.push({ text: "FAQ", url: "/faq", description: "Find quick answers" });
  }
  
  // Remove duplicates and limit to 3 suggestions
  const uniqueSuggestions = suggestions
    .filter((item, index, arr) => arr.findIndex(i => i.url === item.url) === index)
    .slice(0, 3);
  
  return uniqueSuggestions;
}

export async function getChatResponse(request: ChatRequest): Promise<ChatResponse> {
  const { message, history = [] } = request;
  
  // Find relevant links based on the user's message
  const suggestedLinks = findRelevantContent(message);
  
  // If OpenAI is not available, provide fallback response
  if (!openai) {
    const fallbackResponse = getFallbackResponse(message);
    return {
      message: fallbackResponse,
      suggestedLinks: suggestedLinks.length > 0 ? suggestedLinks : [
        { text: "Contact Support", url: "/contact", description: "Get help from our team" },
        { text: "FAQ", url: "/faq", description: "Find quick answers" }
      ]
    };
  }
  
  try {
    // Build context from knowledge base
    const relevantFAQs = DOKAN_KNOWLEDGE.faqs
      .filter(faq => 
        message.toLowerCase().includes(faq.question.toLowerCase().split(' ')[0]) ||
        faq.question.toLowerCase().includes(message.toLowerCase().split(' ')[0])
      )
      .slice(0, 3);
    
    const systemPrompt = `You are a helpful AI assistant for Dokan, a multi-vendor e-commerce marketplace platform. 

DOKAN PLATFORM OVERVIEW:
- Multi-vendor marketplace where vendors can sell products and users can buy
- Users can create user or vendor accounts
- Vendors need approval (3-5 days) before selling
- Features: file uploads, order tracking, reviews, secure payments
- Running on localhost for development

AVAILABLE ROUTES:
${Object.entries(DOKAN_KNOWLEDGE.routes).map(([path, desc]) => `- ${path}: ${desc}`).join('\n')}

RELEVANT FAQs:
${relevantFAQs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

GUIDELINES:
1. Be helpful, friendly, and concise
2. Provide specific, actionable advice
3. Reference relevant pages/features when appropriate
4. For technical issues, suggest contacting support
5. Always offer to help further
6. Don't make up information - stick to what you know about Dokan
7. If you don't know something, say so and suggest contacting support

Respond in a natural, conversational way. Focus on solving the user's problem.`;

    // Prepare conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-4).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency in localhost environment
      messages: messages as any,
      max_tokens: 300,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't process your request right now. Please try again or contact our support team.";

    return {
      message: assistantMessage,
      suggestedLinks
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response with basic help
    const fallbackResponse = getFallbackResponse(message);
    
    return {
      message: fallbackResponse,
      suggestedLinks: suggestedLinks.length > 0 ? suggestedLinks : [
        { text: "Contact Support", url: "/contact", description: "Get help from our team" },
        { text: "FAQ", url: "/faq", description: "Find quick answers" }
      ]
    };
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for common queries and provide relevant responses
  if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes("can't log in")) {
    return "If you're having trouble logging in, make sure you're using the correct email and password. You can also try clearing your browser cache. If you still need help, visit our contact page.";
  }
  
  if (lowerMessage.includes('vendor') || lowerMessage.includes('sell') || lowerMessage.includes('become')) {
    return "To become a vendor on Dokan, you'll need to create an account first, then apply for vendor status in your dashboard. Check out our vendor guide for complete instructions.";
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('purchase')) {
    return "You can track your orders by logging into your account and visiting your user dashboard. There you'll see all your orders and their current status.";
  }
  
  if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
    return "You can return most items within 30 days of delivery. Check our return policy for full details or start a return from your dashboard.";
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('add') || lowerMessage.includes('upload')) {
    return "Vendors can add products from their vendor dashboard. You'll need to be approved as a vendor first. Check the vendor guide for detailed instructions.";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
    return "I'm here to help! You can browse our FAQ for quick answers or contact our support team directly if you need more assistance.";
  }
  
  // Default response
  return "I'm here to help you with Dokan marketplace! I can assist with account issues, vendor applications, orders, returns, and general navigation. What would you like to know?";
}