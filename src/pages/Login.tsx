import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const Login = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!formData.email) {
            toast({
                title: "Email Required",
                description: "Please enter your email address in the field above to reset your password.",
                variant: "destructive",
            });
            return;
        }

        setIsResetting(true);
        try {
            await sendPasswordResetEmail(auth, formData.email);
            toast({
                title: "Reset Email Sent",
                description: `A password reset link has been sent to ${formData.email}. Check your inbox.`,
            });
        } catch (error: any) {
            console.error(error);
            let msg = "Could not send reset email.";
            if (error.code === "auth/user-not-found") msg = "No user found with this email.";
            if (error.code === "auth/invalid-email") msg = "Invalid email format.";

            toast({
                title: "Error",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setIsResetting(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;

            const adminDocRef = doc(db, "admin_users", user.uid);
            const adminDoc = await getDoc(adminDocRef);

            if (adminDoc.exists()) {
                const userData = adminDoc.data();

                if (userData.status === 'inactive') {
                    await auth.signOut();
                    throw new Error("Account Disabled");
                }

                toast({
                    title: "Welcome back!",
                    description: "You have successfully logged in.",
                });
                navigate("/");
            } else {
                await auth.signOut();
                throw new Error("Unauthorized access");
            }

        } catch (error: any) {
            console.error(error);
            let errorMessage = "Invalid credentials. Please try again.";

            if (error.message === "Unauthorized access") {
                errorMessage = "You do not have permission to access the dashboard.";
            } else if (error.message === "Account Disabled") {
                errorMessage = "Your account has been deactivated by an administrator.";
            }

            toast({
                title: "Login Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-sage-50 p-4">
            <div className="w-full max-w-md space-y-8 animate-fade-in rounded-2xl border border-border bg-white/80 p-8 shadow-card backdrop-blur-sm">

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 shadow-soft mb-4">
                        <img
                            src="/newlogo.png"
                            alt="MAnSA Logo"
                            className="h-10 w-10 object-contain"
                        />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your credentials to access the admin dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 mt-8">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@mansa.com"
                                className="pl-10"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={isResetting}
                                className="text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                            >
                                {isResetting ? "Sending..." : "Forgot password?"}
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="rose"
                        className="w-full h-11 text-base shadow-soft hover:shadow-hover transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <a href="#" className="font-semibold text-rose-600 hover:text-rose-700">
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;