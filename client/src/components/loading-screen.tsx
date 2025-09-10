import { Store } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-animation">
          <Store className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-primary">DOKAN</h1>
          <p className="text-muted-foreground mt-2">Multi-Vendor E-Commerce Platform</p>
        </div>
      </div>
    </div>
  );
}
