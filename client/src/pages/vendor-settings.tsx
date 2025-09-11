import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Store,
  CreditCard,
  Bell,
  Shield,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

const profileSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  storeDescription: z.string().max(500, "Description must be under 500 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  orderNotifications: z.boolean(),
  reviewNotifications: z.boolean(),
  promotionalEmails: z.boolean(),
});

const paymentSchema = z.object({
  paypalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  stripeAccountId: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ user: UserType }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: vendorSettings } = useQuery<any>({
    queryKey: ["/api/vendor/settings"],
    enabled: !!authData?.user,
  });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      storeName: (vendorSettings as any)?.storeName || "",
      storeDescription: (vendorSettings as any)?.storeDescription || "",
      contactEmail: (vendorSettings as any)?.contactEmail || authData?.user?.email || "",
      contactPhone: (vendorSettings as any)?.contactPhone || "",
      address: (vendorSettings as any)?.address || "",
      website: (vendorSettings as any)?.website || "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: (vendorSettings as any)?.emailNotifications ?? true,
      smsNotifications: (vendorSettings as any)?.smsNotifications ?? false,
      orderNotifications: (vendorSettings as any)?.orderNotifications ?? true,
      reviewNotifications: (vendorSettings as any)?.reviewNotifications ?? true,
      promotionalEmails: (vendorSettings as any)?.promotionalEmails ?? false,
    },
  });

  // Payment form
  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paypalEmail: (vendorSettings as any)?.paypalEmail || "",
      bankAccountNumber: (vendorSettings as any)?.bankAccountNumber || "",
      bankRoutingNumber: (vendorSettings as any)?.bankRoutingNumber || "",
      stripeAccountId: (vendorSettings as any)?.stripeAccountId || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm & { logo?: string }) =>
      apiRequest("PUT", "/api/vendor/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/settings"] });
      toast({
        title: "Profile updated",
        description: "Your store profile has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: NotificationForm) =>
      apiRequest("PUT", "/api/vendor/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/settings"] });
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (data: PaymentForm) =>
      apiRequest("PUT", "/api/vendor/payment", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/settings"] });
      toast({
        title: "Payment settings updated",
        description: "Your payment information has been saved securely.",
      });
    },
  });

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', files[0]);

    try {
      const response = await fetch('/api/upload/store-logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.logoPath);
        toast({
          title: "Logo uploaded",
          description: "Your store logo has been updated.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfileMutation.mutate({ ...data, logo: logoUrl || undefined });
  };

  const onSubmitNotifications = (data: NotificationForm) => {
    updateNotificationsMutation.mutate(data);
  };

  const onSubmitPayment = (data: PaymentForm) => {
    updatePaymentMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            Vendor Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your store profile, payments, and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-fade-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Store Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label>Store Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                        {logoUrl || (vendorSettings as any)?.logo ? (
                          <img
                            src={logoUrl || (vendorSettings as any)?.logo}
                            alt="Store logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e.target.files)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingLogo}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          {uploadingLogo ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Camera className="w-4 h-4 mr-2" />
                          )}
                          {uploadingLogo ? "Uploading..." : "Change Logo"}
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name *</Label>
                      <Input
                        id="storeName"
                        {...profileForm.register("storeName")}
                        placeholder="Enter your store name"
                        data-testid="input-store-name"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                      {profileForm.formState.errors.storeName && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.storeName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        {...profileForm.register("contactEmail")}
                        placeholder="store@example.com"
                        data-testid="input-contact-email"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                      {profileForm.formState.errors.contactEmail && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.contactEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        {...profileForm.register("contactPhone")}
                        placeholder="+1 (555) 123-4567"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        {...profileForm.register("website")}
                        placeholder="https://yourstore.com"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                      {profileForm.formState.errors.website && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.website.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Textarea
                      id="storeDescription"
                      {...profileForm.register("storeDescription")}
                      placeholder="Tell customers about your store..."
                      rows={4}
                      className="resize-none transition-all duration-200 focus:scale-[1.01]"
                    />
                    {profileForm.formState.errors.storeDescription && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.storeDescription.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      {...profileForm.register("address")}
                      placeholder="Enter your business address"
                      rows={3}
                      className="resize-none transition-all duration-200 focus:scale-[1.01]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Profile
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="payments" className="animate-fade-in-up">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                      <Input
                        id="stripeAccountId"
                        {...paymentForm.register("stripeAccountId")}
                        placeholder="acct_1234567890"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                      <p className="text-sm text-muted-foreground">
                        Connect your Stripe account for secure payment processing
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paypalEmail">PayPal Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        {...paymentForm.register("paypalEmail")}
                        placeholder="paypal@example.com"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Bank Account Information</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBankInfo(!showBankInfo)}
                        >
                          {showBankInfo ? (
                            <EyeOff className="w-4 h-4 mr-2" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          {showBankInfo ? "Hide" : "Show"} Bank Info
                        </Button>
                      </div>

                      {showBankInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                          <div className="space-y-2">
                            <Label htmlFor="bankAccountNumber">Account Number</Label>
                            <Input
                              id="bankAccountNumber"
                              type="password"
                              {...paymentForm.register("bankAccountNumber")}
                              placeholder="••••••••••"
                              className="transition-all duration-200 focus:scale-[1.02]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                            <Input
                              id="bankRoutingNumber"
                              {...paymentForm.register("bankRoutingNumber")}
                              placeholder="123456789"
                              className="transition-all duration-200 focus:scale-[1.02]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={updatePaymentMutation.isPending}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {updatePaymentMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Payment Settings
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="animate-fade-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive important updates via email
                        </p>
                      </div>
                      <Switch
                        {...notificationForm.register("emailNotifications")}
                        defaultChecked={notificationForm.getValues("emailNotifications")}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Get urgent alerts via text message
                        </p>
                      </div>
                      <Switch
                        {...notificationForm.register("smsNotifications")}
                        defaultChecked={notificationForm.getValues("smsNotifications")}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md">
                      <div>
                        <h4 className="font-medium">Order Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Be notified when you receive new orders
                        </p>
                      </div>
                      <Switch
                        {...notificationForm.register("orderNotifications")}
                        defaultChecked={notificationForm.getValues("orderNotifications")}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md">
                      <div>
                        <h4 className="font-medium">Review Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified when customers review your products
                        </p>
                      </div>
                      <Switch
                        {...notificationForm.register("reviewNotifications")}
                        defaultChecked={notificationForm.getValues("reviewNotifications")}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md">
                      <div>
                        <h4 className="font-medium">Promotional Emails</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive tips and marketing opportunities
                        </p>
                      </div>
                      <Switch
                        {...notificationForm.register("promotionalEmails")}
                        defaultChecked={notificationForm.getValues("promotionalEmails")}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateNotificationsMutation.isPending}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {updateNotificationsMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="animate-fade-in-up">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-medium">Password Security</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Last changed 30 days ago
                    </p>
                    <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                      Change Password
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium">Login Activity</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Review recent login attempts and active sessions
                    </p>
                    <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                      View Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}