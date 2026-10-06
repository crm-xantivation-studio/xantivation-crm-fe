'use client';

import * as React from 'react';
import { useState, useId, useEffect } from 'react';
import { Eye, EyeOff, Clock, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/Providers';

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 80,
  cursor = '|',
  loop = false,
  deleteSpeed = 40,
  delay = 2000,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || '';

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse text-[var(--color-accent)]">{cursor}</span>
    </span>
  );
}

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-xs font-semibold leading-none text-[var(--color-fg)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      default: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 shadow-xs active:scale-[0.99]',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-tint)] text-[var(--color-fg)] shadow-xs',
      secondary: 'bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-border)]',
      ghost: 'hover:bg-[var(--color-surface)] text-[var(--color-fg)]',
      link: 'text-[var(--color-accent)] underline-offset-4 hover:underline p-0 h-auto font-bold',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-[11px]',
      lg: 'h-12 rounded-md px-6 text-sm',
      icon: 'h-8 w-8',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyle, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 sm:h-11 lg:h-12 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--color-fg)] shadow-xs transition-all placeholder:text-[var(--color-muted-fg)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-1.5 sm:gap-2">
        {label && <Label htmlFor={id} className="text-xs sm:text-sm font-semibold">{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? 'text' : 'password'} className={cn('pr-10', className)} ref={ref} {...props} />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-[var(--color-muted-fg)] transition-colors hover:text-[var(--color-fg)] focus-visible:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4 sm:size-5" aria-hidden="true" /> : <Eye className="size-4 sm:size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

function SignInForm({ onLoginSuccess }: { onLoginSuccess?: (email: string, pass: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess(email, password);
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-fg)]">Sign in to Xantivation</h1>
        <p className="text-balance text-xs sm:text-sm text-[var(--color-muted-fg)]">Enter your enterprise credentials to access CRM Intelligence</p>
      </div>
      <div className="grid gap-4 sm:gap-5">
        <div className="grid gap-1.5 sm:gap-2">
          <Label htmlFor="email" className="text-xs sm:text-sm font-semibold">Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@gmail.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="default" className="mt-2 w-full font-bold h-11 sm:h-12 text-xs sm:text-sm">Sign In to Dashboard</Button>
      </div>
    </form>
  );
}

function SignUpForm({ onRegisterSuccess }: { onRegisterSuccess?: (name: string, email: string, pass: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onRegisterSuccess) {
      onRegisterSuccess(name, email, password);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-fg)]">Create Enterprise Account</h1>
        <p className="text-balance text-xs sm:text-sm text-[var(--color-muted-fg)]">Join Xantivation CRM to automate your sales pipeline</p>
      </div>
      <div className="grid gap-4 sm:gap-5">
        <div className="grid gap-1.5 sm:gap-2">
          <Label htmlFor="name" className="text-xs sm:text-sm font-semibold">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Alex Morgan"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5 sm:gap-2">
          <Label htmlFor="email" className="text-xs sm:text-sm font-semibold">Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="default" className="mt-2 w-full font-bold h-11 sm:h-12 text-xs sm:text-sm">Create Account</Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  onSubmit,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  onSubmit?: (data: any) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] gap-4 sm:gap-5">
      {isSignIn ? (
        <SignInForm onLoginSuccess={(email, pass) => onSubmit?.({ email, password: pass })} />
      ) : (
        <SignUpForm onRegisterSuccess={(name, email, pass) => onSubmit?.({ name, email, password: pass })} />
      )}
      <div className="text-center text-xs sm:text-sm text-[var(--color-muted-fg)] mt-1">
        {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
        <Button variant="link" className="pl-1 font-bold text-[var(--color-accent)] text-xs sm:text-sm" onClick={onToggle}>
          {isSignIn ? 'Sign up' : 'Sign in'}
        </Button>
      </div>
      <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[var(--color-border)]">
        <span className="relative z-10 bg-[var(--color-bg)] px-2.5 text-[var(--color-muted-fg)] font-mono text-[10px] sm:text-xs">OR CONTINUE WITH</span>
      </div>
      <Button variant="outline" type="button" onClick={() => console.log('UI: Google button clicked')} className="h-10 sm:h-11 lg:h-12 text-xs sm:text-sm">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Continue with Google
      </Button>
    </div>
  );
}

interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
  defaultIsSignIn?: boolean;
  onSubmit?: (data: any, isSignIn: boolean) => void;
}

const defaultSignInContent = {
  image: {
    src: '/signin_signup_page/1.webp',
    alt: 'A beautiful interior design for sign-in',
  },
  quote: {
    text: 'Welcome Back! The journey continues.',
    author: 'EaseMize UI',
  },
};

const defaultSignUpContent = {
  image: {
    src: '/signin_signup_page/2.webp',
    alt: 'A vibrant, modern space for new beginnings',
  },
  quote: {
    text: 'Create an account. A new chapter awaits.',
    author: 'EaseMize UI',
  },
};

export function AuthUI({ signInContent = {}, signUpContent = {}, defaultIsSignIn = true, onSubmit }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(defaultIsSignIn);
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');

  const toggleForm = () => setIsSignIn((prev) => !prev);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    return () => clearInterval(timer);
  }, []);

  const logoSrc = theme === 'dark' ? '/White_Logo.png' : '/Black_Logo.png';

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-[var(--color-bg)] text-[var(--color-fg)] transition-colors duration-300">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* LEFT PANEL: Form Container with Header Logo & Clock */}
      <div className="flex flex-col justify-between p-6 sm:p-10 md:p-12 min-h-screen border-r border-[var(--color-border)] relative">
        {/* Brand Logo & Theme Toggle Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="Xantivation Logo" className="h-6 object-contain" />
            <span className="text-xs font-bold font-sans tracking-tight text-[var(--color-fg)]">
              XANTIVATION STUDIO
            </span>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Form Body Centered */}
        <div className="my-auto py-8 w-full">
          <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} onSubmit={(data) => onSubmit?.(data, isSignIn)} />
        </div>

        {/* Real-time Clock Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-[11px] font-mono text-[var(--color-muted-fg)]">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--color-accent)]" />
            <span>UTC+07:00</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-[var(--color-fg)] tracking-wider">
            <span>{currentTime || '12:00:00'}</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Visual Brand Showcase with Typewriter Quote */}
      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out overflow-hidden bg-[var(--color-bg)]"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-[var(--color-bg)] to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
          <blockquote className="space-y-2 text-center text-[var(--color-fg)]">
            <p className="text-lg font-medium">
              “
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />
              ”
            </p>
            <cite className="block text-sm font-light text-[var(--color-muted-fg)] not-italic">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
