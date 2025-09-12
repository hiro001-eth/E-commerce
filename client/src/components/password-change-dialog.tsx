import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Lock, Shield } from "lucide-react";

const forceChangePasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ForceChangePasswordForm = z.infer<typeof forceChangePasswordSchema>;

interface PasswordChangeDialogProps {
  open: boolean;
  user: any;
  onSuccess: (user: any) => void;
}

export function PasswordChangeDialog({ open, user, onSuccess }: PasswordChangeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ForceChangePasswordForm>({
    resolver: zodResolver(forceChangePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ForceChangePasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/force-change-password", {
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Password Updated",
        description: data.message || "Your password has been changed successfully.",
      });
      onSuccess(data.user);
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForceChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <DialogTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Security Alert: Password Change Required
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p>For your security, you must change your password before continuing.</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Password Requirements:</p>
              <ul className="mt-1 text-yellow-700 dark:text-yellow-300 text-xs space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character (@$!%*?&)</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="newPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter your new secure password"
              {...form.register("newPassword")}
              data-testid="input-new-password"
              className="mt-1"
            />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              {...form.register("confirmPassword")}
              data-testid="input-confirm-new-password"
              className="mt-1"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={changePasswordMutation.isPending}
            data-testid="button-change-password"
          >
            {changePasswordMutation.isPending ? (
              <>
                <Lock className="w-4 h-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Update Password & Continue
              </>
            )}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center mt-4 p-3 bg-muted rounded-md">
          <p>This is a one-time security requirement. After updating your password, you'll have full access to your account.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}