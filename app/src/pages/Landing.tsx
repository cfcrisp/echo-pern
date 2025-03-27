import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  MessageSquare, 
  Lightbulb, 
  Users, 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  LineChart,
  LayoutDashboard,
  ChevronRight,
  CheckCircle,
  User,
  UserPlus
} from "lucide-react";
import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Form handlers
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    
    // Input validation
    if (!loginEmail.trim()) {
      setError("Email is required");
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!loginPassword) {
      setError("Password is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the API client to handle login
      const data = await apiClient.auth.login({
        email: loginEmail, 
        password: loginPassword
      });
      
      console.log('Login successful:', data);
      
      // Store login info in AuthContext
      // The API returns { token, user } or might directly include user properties
      if (data.user) {
        login(data.token, data.user);
      } else {
        // If the API returns user properties directly
        const { token, id, email, name, tenant_id, role } = data;
        login(token, { id, email, name, tenant_id, role });
      }
      
      // Then redirect to dashboard
      setLoginOpen(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    
    // Input validation
    if (!registerName.trim()) {
      setError("Name is required");
      return;
    }
    
    if (!registerEmail.trim()) {
      setError("Email is required");
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!registerPassword) {
      setError("Password is required");
      return;
    }
    
    if (registerPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the API client to handle registration
      const userData = await apiClient.auth.register({
        name: registerName,
        email: registerEmail,
        password: registerPassword
      });
      
      console.log('Registration successful:', userData);
      
      // Extract user info from response
      const { token, id, email, name, tenant_id, role } = userData;
      
      // Automatically log the user in after successful registration
      login(token, {
        id,
        email,
        name,
        tenant_id,
        role
      });
      
      // Then redirect to dashboard
      setRegisterOpen(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6 md:px-8 bg-background z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Echo
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-foreground/80 hover:text-foreground">
              Benefits
            </a>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}>
                <User className="h-4 w-4 mr-2" /> Log in
              </Button>
              <Button size="sm" onClick={() => setRegisterOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Register
              </Button>
            </div>
          </nav>
          <div className="md:hidden flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setLoginOpen(true)}>
              <User className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={() => setRegisterOpen(true)}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-8 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-12 items-center">
            <div className="w-full text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Amplify your customer <span className="text-primary">voice</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-3xl mx-auto">
                Transform feedback into meaningful product decisions that drive growth and customer satisfaction.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => setRegisterOpen(true)}
                >
                  Start turning feedback into outcomes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-w-3xl w-full border border-border rounded-xl overflow-hidden shadow-lg">
              <img 
                src="/screenshot-initiatives.png" 
                alt="Echo Initiatives Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-6 md:px-8 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Tools designed to help you collect, organize, and act on customer feedback efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="mb-4 bg-primary/10 rounded-lg p-3 w-fit">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Goal Tracking</h3>
                <p className="text-foreground/80">
                  Set clear objectives and track progress toward meaningful product improvements.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="mb-4 bg-primary/10 rounded-lg p-3 w-fit">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Feedback Collection</h3>
                <p className="text-foreground/80">
                  Gather insights from multiple channels in one organized location.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="mb-4 bg-primary/10 rounded-lg p-3 w-fit">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Idea Generation</h3>
                <p className="text-foreground/80">
                  Transform customer feedback into actionable product ideas.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="mb-4 bg-primary/10 rounded-lg p-3 w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Insights</h3>
                <p className="text-foreground/80">
                  Understand your customers better with organized profiles and feedback history.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="mb-4 bg-primary/10 rounded-lg p-3 w-fit">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analytics</h3>
                <p className="text-foreground/80">
                  Get insights into feedback trends and the impact of your product changes.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="mb-4 bg-primary/10 rounded-lg p-3 w-fit">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Initiative Planning</h3>
                <p className="text-foreground/80">
                  Plan and prioritize your roadmap based on customer input and business goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits/Outcomes Section */}
      <section id="benefits" className="py-16 md:py-24 px-6 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Outcomes You'll Achieve</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Echo helps product teams deliver measurable results that matter to your business and customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 border border-border rounded-xl p-6 bg-card/50">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <LineChart className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Measurable Growth</h3>
              <p className="text-foreground/80 text-center mb-4">
                Track the real impact of your customer-driven initiatives on key business metrics.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-green-100/50 dark:bg-green-900/20">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">+22%</p>
                  <p className="text-sm">Retention</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-100/50 dark:bg-blue-900/20">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+18</p>
                  <p className="text-sm">NPS Score</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-100/50 dark:bg-purple-900/20">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">+35%</p>
                  <p className="text-sm">Adoption</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-2 h-fit">
                    <LineChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Increased Customer Satisfaction</h3>
                    <p className="text-foreground/80">
                      By closing the feedback loop, customers feel heard and see their suggestions implemented.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 h-fit">
                    <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Higher Product Adoption</h3>
                    <p className="text-foreground/80">
                      Build features your customers actually want, leading to increased usage and adoption.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2 h-fit">
                    <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Reduced Development Waste</h3>
                    <p className="text-foreground/80">
                      Focus resources on initiatives that drive real value rather than speculative features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-8 bg-primary/5">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to amplify your customer's voice?</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Start turning feedback into meaningful product improvements today.
          </p>
          <Button 
            size="lg" 
            className="px-8"
            onClick={() => setRegisterOpen(true)}
          >
            Get started with Echo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-8 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Echo
              </span>
            </div>
            <p className="text-sm text-foreground/70">
              © {new Date().getFullYear()} Echo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log in to Echo</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                placeholder="your@email.com" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required 
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                required 
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
            </DialogFooter>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => {
                  setLoginOpen(false);
                  setRegisterOpen(true);
                  setError("");
                }}
                disabled={isSubmitting}
              >
                Register
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create your account</DialogTitle>
            <DialogDescription>
              Join Echo to start collecting and utilizing customer feedback.
              <span className="block mt-1 text-xs text-muted-foreground">
                Your company will be automatically identified from your email domain.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 py-4">
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input 
                placeholder="Your name" 
                value={registerName} 
                onChange={(e) => setRegisterName(e.target.value)} 
                required 
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                placeholder="your@email.com" 
                value={registerEmail} 
                onChange={(e) => setRegisterEmail(e.target.value)} 
                required 
                disabled={isSubmitting}
              />
              <FormMessage>
                <span className="text-xs text-muted-foreground">
                  Your organization will be determined from your email domain
                </span>
              </FormMessage>
            </FormItem>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password" 
                value={registerPassword} 
                onChange={(e) => setRegisterPassword(e.target.value)} 
                required 
                disabled={isSubmitting}
                minLength={6}
              />
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <Input 
                type="password" 
                value={registerConfirmPassword} 
                onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
                required 
                disabled={isSubmitting}
                minLength={6}
              />
              <FormMessage />
            </FormItem>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </DialogFooter>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => {
                  setRegisterOpen(false);
                  setLoginOpen(true);
                  setError("");
                }}
                disabled={isSubmitting}
              >
                Log in
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 