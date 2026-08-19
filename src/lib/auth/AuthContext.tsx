import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ProtectedActionCallback = () => void | Promise<void>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  actionPrompt: string;
  openAuthModal: (prompt?: string, onComplete?: ProtectedActionCallback) => void;
  closeAuthModal: () => void;
  executeProtectedAction: (
    action: ProtectedActionCallback,
    actionDescription?: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: AuthError | Error | null; user: User | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal and Action interception state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [actionPrompt, setActionPrompt] = useState("This action requires system authorization.");
  const pendingActionRef = useRef<ProtectedActionCallback | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[Auth] Error fetching session:", error.message);
        }
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("[Auth] Session initialization error:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback((prompt?: string, onComplete?: ProtectedActionCallback) => {
    if (prompt) {
      setActionPrompt(prompt);
    } else {
      setActionPrompt("This action requires system authorization.");
    }
    if (onComplete) {
      pendingActionRef.current = onComplete;
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    pendingActionRef.current = null;
  }, []);

  const executeProtectedAction = useCallback(
    async (action: ProtectedActionCallback, actionDescription?: string): Promise<void> => {
      // If the user is already authenticated in this session, execute immediately
      if (user) {
        try {
          await Promise.resolve(action());
        } catch (err) {
          console.error("[Auth] Error executing action:", err);
          toast.error("Action failed", {
            description: err instanceof Error ? err.message : "Could not complete operation",
          });
        }
        return;
      }

      // If not authenticated, save the action and prompt for authentication
      pendingActionRef.current = action;
      setActionPrompt(
        actionDescription
          ? `Authorization required to: ${actionDescription}`
          : "This action modifies system hardware or tracking state. Please authorize to proceed.",
      );
      setIsAuthModalOpen(true);
    },
    [user],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { error };
        }

        setSession(data.session);
        setUser(data.user);
        setIsAuthModalOpen(false);

        // Execute pending action automatically if one was requested!
        if (pendingActionRef.current) {
          const actionToRun = pendingActionRef.current;
          pendingActionRef.current = null;
          try {
            await Promise.resolve(actionToRun());
            toast.success("Authorization granted", {
              description: "System credentials verified. Action applied successfully.",
            });
          } catch (err) {
            console.error("[Auth] Error running queued action:", err);
            toast.error("Action could not be executed", {
              description: err instanceof Error ? err.message : "Error executing action",
            });
          }
        } else {
          toast.success("Authorized successfully", {
            description: "You have operator permissions for system controls.",
          });
        }

        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err : new Error("An unexpected error occurred during sign in."),
        };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName?: string,
    ): Promise<{ error: AuthError | Error | null; user: User | null }> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          ...(fullName?.trim() ? { options: { data: { full_name: fullName.trim() } } } : {}),
        });

        if (error) {
          return { error, user: null };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setIsAuthModalOpen(false);

          if (pendingActionRef.current) {
            const actionToRun = pendingActionRef.current;
            pendingActionRef.current = null;
            await Promise.resolve(actionToRun());
          }
        }

        return { error: null, user: data.user };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err
              : new Error("An unexpected error occurred during registration."),
          user: null,
        };
      }
    },
    [],
  );

  const signOut = useCallback(async (): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      setSession(null);
      setUser(null);
      return { error: null };
    } catch (err) {
      return {
        error:
          err instanceof Error ? err : new Error("An unexpected error occurred during sign out."),
      };
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: AuthError | Error | null }> => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) {
          return { error };
        }
        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err
              : new Error("An unexpected error occurred while requesting password reset."),
        };
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        actionPrompt,
        openAuthModal,
        closeAuthModal,
        executeProtectedAction,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
