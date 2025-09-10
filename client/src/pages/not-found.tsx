import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear timer before navigation to prevent state updates
          clearInterval(timer);
          // Use setTimeout to ensure navigation happens after state update
          setTimeout(() => setLocation("/"), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-16 pb-12 px-8 text-center">
          {/* 404 Animation */}
          <div className="relative mb-8">
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              404
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-ping"></div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for seems to have wandered off.
          </p>
          
          <p className="text-base text-gray-500 mb-8">
            Don't worry, even the best explorers get lost sometimes!
          </p>

          {/* Auto-redirect countdown */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 font-medium">
              🚀 Automatically redirecting to home page in
            </p>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {countdown} second{countdown !== 1 ? 's' : ''}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((8 - countdown) / 8) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoHome}
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go Home Now
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 px-8 py-3 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Button>
          </div>

          {/* Footer Message */}
          <p className="mt-8 text-sm text-gray-400">
            Lost? Try our search or head back to the homepage where all the good stuff lives! 🏠
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
