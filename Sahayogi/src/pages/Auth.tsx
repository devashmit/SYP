import { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, Heart, HandHelping } from 'lucide-react';
import sahayogiLogo from '@/assets/Logo.svg';
import authBg from '@/assets/auth.png';

const Auth = () => {
  const { signIn, signUp, authStatus, isAdmin } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for active tab to allow switching via links
  const [activeTab, setActiveTab] = useState(location.pathname === '/auth/signup' ? 'signup' : 'signin');

  // Already authenticated → redirect away (never show login to logged-in user)
  if (authStatus === 'authenticated') {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/feed'} replace />;
  }

  // Default tab based on current URL path
  // const defaultTab = location.pathname === '/auth/signup' ? 'signup' : 'signin'; // This is now handled by activeTab state

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    else toast.success('Welcome back!');
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const newErrors: Record<string, string> = {};
    if (!name || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) newErrors.email = 'Please provide a valid email address';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Welcome to Sahayogi.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      {/* Left panel - Branding and Visuals */}
      <div className="w-full lg:w-[55%] h-[50vh] lg:min-h-screen lg:sticky lg:top-0 relative overflow-hidden bg-[#B32025]">
        <img
          src={authBg}
          alt="Sahayogi branding"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
          {/* Tab nav links */}
          <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
             <Link to="/">
               <img src={sahayogiLogo} alt="Sahayogi Logo" className="h-8 w-auto object-contain max-w-[150px]" />
             </Link>
          </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm animate-scale-in">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground mb-1">
                {activeTab === 'signin' ? 'Welcome Back' : 'Join Our Community'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'signin' 
                  ? 'Sign in to your account to continue.' 
                  : 'Create an account to start your journey with us.'}
              </p>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={(val) => setActiveTab(val as 'signin' | 'signup')}
              className="space-y-5"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl p-0.5 bg-muted/40 border border-border/40 h-auto">
                <TabsTrigger
                  value="signin"
                  className="rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-medium transition-all duration-300"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-medium transition-all duration-300"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create account
                </TabsTrigger>
              </TabsList>

              {/* Sign In */}
              <TabsContent value="signin" className="animate-in fade-in duration-300">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-xs font-medium text-foreground/70">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="h-10 pl-10 pr-4 rounded-xl bg-muted/30 border-border/60 focus:border-primary focus:ring-primary/10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="text-xs font-medium text-foreground/70">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className="h-10 pl-10 pr-10 rounded-xl bg-muted/30 border-border/60 focus:border-primary focus:ring-primary/10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20 active:scale-95 transition-all text-sm mt-1"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/60"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2 text-muted-foreground/60">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full h-11 rounded-xl border-border/60 bg-white hover:bg-muted/50 text-foreground/70 font-medium text-sm gap-2 transition-all active:scale-[0.98]"
                      onClick={() => toast.info('Google login feature coming soon!')}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                      Google
                    </Button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('signup')}
                      className="text-primary font-semibold hover:underline"
                    >
                      Join today
                    </button>
                  </p>
                </div>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup" className="animate-in fade-in duration-300">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs font-medium text-foreground/70">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className={`h-10 pl-10 pr-4 rounded-xl bg-muted/30 focus:border-primary text-sm ${errors.name ? 'border-red-500' : 'border-border/60'}`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-medium text-foreground/70">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`h-10 pl-10 pr-4 rounded-xl bg-muted/30 focus:border-primary text-sm ${errors.email ? 'border-red-500' : 'border-border/60'}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-medium text-foreground/70">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        className={`h-10 pl-10 pr-10 rounded-xl bg-muted/30 focus:border-primary text-sm ${errors.password ? 'border-red-500' : 'border-border/60'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirmPassword" className="text-xs font-medium text-foreground/70">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signup-confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        className={`h-10 pl-10 pr-10 rounded-xl bg-muted/30 focus:border-primary text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-border/60'}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/10 active:scale-95 transition-all text-sm mt-1"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Already a member?{' '}
                    <button 
                      onClick={() => setActiveTab('signin')}
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-[10px] text-muted-foreground/60 mt-4">
            By continuing, you agree to our{' '}
            <span className="text-primary/70 cursor-pointer hover:underline">Terms</span> &{' '}
            <span className="text-primary/70 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
