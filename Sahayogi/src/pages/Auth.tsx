import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const { signIn, signUp, authStatus, isAdmin } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Already authenticated → redirect away (never show login to logged-in user)
  if (authStatus === 'authenticated') {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/feed'} replace />;
  }

  // Default tab based on current URL path
  const defaultTab = location.pathname === '/auth/signup' ? 'signup' : 'signin';

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
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    const { error } = await signUp(email, password, username, 'donor');
    if (error) toast.error(error.message);
    else toast.success('Account created! Welcome to Sahayogi.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Left panel */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <img
          src="/sahayogi-logo.png"
          alt="Sahayogi Community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40" />

        <div className="absolute inset-0 flex flex-col justify-center p-14 text-white z-10">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary font-bold text-sm shadow-lg">
              S
            </div>
            <span className="font-semibold text-lg">Sahayogi</span>
          </Link>

          <h2 className="text-3xl font-bold mb-3 tracking-tight leading-tight">
            One community.<br />Many hearts.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            "Maya ra Sahayog" — joining hands to build a more resilient Nepal, one connection at a time.
          </p>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex gap-6 text-white/60 text-xs">
              <div>
                <div className="text-2xl font-bold text-white mb-0.5">4,200+</div>
                <div>Lives impacted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-0.5">890</div>
                <div>Active causes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-0.5">12L+</div>
                <div>Rs raised</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg">
                S
              </div>
              <span className="font-semibold text-base text-foreground">Sahayogi</span>
            </Link>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm animate-scale-in">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground mb-1">Welcome</h1>
              <p className="text-sm text-muted-foreground">Sign in or create an account to continue.</p>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-5">
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
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20 active:scale-95 transition-all text-sm mt-1"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup" className="animate-in fade-in duration-300">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-username" className="text-xs font-medium text-foreground/70">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signup-username"
                        name="username"
                        type="text"
                        placeholder="your_username"
                        required
                        className="h-10 pl-10 pr-4 rounded-xl bg-muted/30 border-border/60 focus:border-primary text-sm"
                      />
                    </div>
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
                        required
                        className="h-10 pl-10 pr-4 rounded-xl bg-muted/30 border-border/60 focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-medium text-foreground/70">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="h-10 pl-10 pr-10 rounded-xl bg-muted/30 border-border/60 focus:border-primary text-sm"
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
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/10 active:scale-95 transition-all text-sm mt-1"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
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