import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import LoadingScreen from "@/components/loading-screen";
import Navbar from "@/components/navbar";
import CartSidebar from "@/components/cart-sidebar";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Shop from "@/pages/shop";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import ReturnPolicy from "@/pages/return-policy";
import Shipping from "@/pages/shipping";
import UserDashboard from "@/pages/user-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ProtectedRoute from "@/components/protected-route";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check authentication status
  const { data: authData } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <Navbar user={authData?.user} onCartToggle={toggleCart} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/shop" component={Shop} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/return-policy" component={ReturnPolicy} />
        <Route path="/shipping" component={Shipping} />
        
        <Route path="/dashboard/user">
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard/vendor">
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard/admin">
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
