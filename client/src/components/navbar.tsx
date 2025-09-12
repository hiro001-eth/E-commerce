import { Store, ShoppingCart, Menu, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserDTO as UserType } from "@shared/schema";

interface NavbarProps {
  user?: UserType;
  onCartToggle: () => void;
}

export default function Navbar({ user, onCartToggle }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get cart items count
  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartItemsCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out successfully",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDashboardPath = () => {
    if (!user) return "/auth";
    return `/dashboard/${user.role}`;
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover-lift" data-testid="link-home">
            <Store className="text-2xl text-primary mr-3 smooth-transition hover:scale-110" />
            <span className="text-2xl font-bold text-primary">DOKAN</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`text-foreground hover:text-primary smooth-transition ${location === "/" ? "text-primary font-medium" : ""}`}
              data-testid="link-home-nav"
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              className={`text-foreground hover:text-primary smooth-transition ${location === "/shop" ? "text-primary font-medium" : ""}`}
              data-testid="link-shop"
            >
              Shop
            </Link>
            <Link 
              href="/about" 
              className={`text-foreground hover:text-primary smooth-transition ${location === "/about" ? "text-primary font-medium" : ""}`}
              data-testid="link-about"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-foreground hover:text-primary smooth-transition ${location === "/contact" ? "text-primary font-medium" : ""}`}
              data-testid="link-contact"
            >
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCartToggle}
                className="relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardPath()} data-testid="link-dashboard">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild data-testid="button-login">
                <Link href="/auth">Login</Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
