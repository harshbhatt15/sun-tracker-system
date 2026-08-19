import { useState, type FormEvent } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
  User,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthRequiredModal() {
  const { isAuthModalOpen, closeAuthModal, actionPrompt, signIn, signUp, resetPassword } =
    useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>(
    {},
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAuthModal();
      setAuthError(null);
      setErrors({});
      setMode("signin");
      setResetSent(false);
    }
  };

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (mode !== "forgot") {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (mode === "signup" && !fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          setAuthError(
            error.message === "Invalid login credentials"
              ? "Invalid email or password. Please verify operator credentials."
              : error.message || "Failed to authenticate.",
          );
          setIsSubmitting(false);
          return;
        }
        // Success: AuthContext automatically closes modal and runs pending action!
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setAuthError(error.message || "Failed to create account.");
          setIsSubmitting(false);
          return;
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          setAuthError(error.message || "Failed to send reset link.");
          setIsSubmitting(false);
          return;
        }
        setResetSent(true);
        setIsSubmitting(false);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="card-surface sm:max-w-[440px] border-border p-6 shadow-2xl backdrop-blur-md">
        <DialogHeader className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg shadow"
              style={{ backgroundImage: "var(--gradient-solar)" }}
            >
              <ShieldCheck className="h-5 w-5 text-primary-foreground sun-glow" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg font-bold tracking-tight text-foreground">
                {mode === "forgot"
                  ? "Reset Operator Password"
                  : mode === "signup"
                    ? "Register Operator Account"
                    : "Authorization Required"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {mode === "forgot"
              ? "Enter your account email to receive a password reset link."
              : mode === "signup"
                ? "Create an authorized account to access system controls."
                : actionPrompt}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Selector Tabs (Sign In vs Sign Up) */}
        {mode !== "forgot" && (
          <div className="grid grid-cols-2 rounded-lg bg-background/60 p-1 border border-border mt-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setAuthError(null);
                setErrors({});
              }}
              className={`cursor-pointer rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setAuthError(null);
                setErrors({});
              }}
              className={`cursor-pointer rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/15 p-3 text-xs text-destructive mt-2"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="flex-1 leading-snug">{authError}</div>
          </div>
        )}

        {/* Reset Email Sent Confirmation */}
        {mode === "forgot" && resetSent ? (
          <div className="space-y-4 py-3 text-center">
            <div className="rounded-lg bg-success/15 border border-success/30 p-4 text-xs text-success">
              <CheckCircle2 className="mx-auto mb-1.5 h-5 w-5" />
              <p className="font-semibold text-sm">Reset instructions sent</p>
              <p className="mt-1 text-muted-foreground">
                If an account exists for <strong>{email}</strong>, instructions have been sent.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => {
                setMode("signin");
                setResetSent(false);
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 mt-2">
            {/* Full Name for Sign Up */}
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="authName" className="text-xs font-medium text-muted-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="authName"
                    type="text"
                    placeholder="Operator Name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.fullName;
                          return next;
                        });
                      }
                    }}
                    className={`pl-9 h-9 text-sm ${errors.fullName ? "border-destructive" : ""}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.fullName}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="authEmail" className="text-xs font-medium text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="authEmail"
                  type="email"
                  placeholder="operator@suntrack.pro"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  className={`pl-9 h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            {mode !== "forgot" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="authPassword"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Password
                  </Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setAuthError(null);
                      }}
                      className="cursor-pointer text-[11px] text-primary hover:underline hover:text-solar transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="authPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.password;
                          return next;
                        });
                      }
                    }}
                    className={`pl-9 pr-9 h-9 text-sm ${errors.password ? "border-destructive" : ""}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (mode === "forgot") {
                    setMode("signin");
                    setAuthError(null);
                  } else {
                    closeAuthModal();
                  }
                }}
                disabled={isSubmitting}
              >
                {mode === "forgot" ? "Back" : "Cancel"}
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : mode === "forgot" ? (
                  <>
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Send Reset Link</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>{mode === "signin" ? "Authenticate & Apply" : "Register & Apply"}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="border-t border-border/40 pt-3 text-center">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-solar" /> Authorized operators only. Actions
            are logged.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
