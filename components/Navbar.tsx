"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, LogOut, Menu, X as XIcon, Search, CheckSquare, Square } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { cn } from "@/lib/utils"
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/legalContent"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false) // Mobile menu
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Legal Consent State
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null)

  const pathname = usePathname()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Reset agreement when opening modal
  useEffect(() => {
    if (showLoginModal) {
      setAgreedToTerms(false)
    }
  }, [showLoginModal])

  const handleLogin = async (role: 'customer' | 'admin') => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          //   role: role // Note: Custom query params might need specific handling or be stored in metadata post-login for role
        }
      }
    })
    // For MVP reuse, assuming the existing backend handles role logic via metadata or check
    // If the previous code sent 'role' in queryParams, it might be a custom implementation. 
    // I will try to respect the previous logic if possible, but 'role' in OAuth query params isn't standard.
    // The previous implementation:
    // queryParams: { role } 
    // I will stick to that to ensure backend compatibility if it relies on it.
  }

  // Use the exact previous login logic function structure to be safe with existing backend
  const loginWithRole = async (role: string) => {
    if (!agreedToTerms) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          role
        }
      }
    })
  }


  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" }, // We'll need a categories page or dropdown
    { name: "About", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ]

  // Add Orders if logged in
  if (user) {
    navLinks.push({ name: "Orders", href: "/orders" })
  }

  // Add Admin if logged in (simplistic check, ideally check role)
  // For now, let's just show it if they access /admin or we can check email/metadata if available
  // The prompt says "Admin access must remain restricted using authentication checks already implemented."
  // I will add a link to Admin for convenience if user logic permits, or just leave it to /admin access.
  // Let's add it to the list if the user seems to be an admin or just for easy access in this demo.
  // Actually, better to keep it clean. Users can login as admin.

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <img src="/logo.svg" alt="Buynic Logo" className="object-contain" />
                </div>
                <span className="text-xl font-bold tracking-tight">Buynic</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                // We need to use state for the input value, but since this is a targeted replace, 
                // I need to ensure I have access to the state variable.
                // It's safer to use uncontrolled input for this quick replace or I need to inject state first.
                // Actually, I should update the whole component logic first to include 'useRouter' and state.
                const form = e.currentTarget;
                const input = form.elements.namedItem('search') as HTMLInputElement;
                if (input.value.trim()) {
                  window.location.href = `/shop?q=${encodeURIComponent(input.value)}`;
                }
              }} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Search products..."
                />
              </form>
            </div>

            {/* Actions (Toggle & Auth) */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Hello, <span className="font-medium text-foreground">{user.user_metadata?.full_name || user.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginModal(true)}>
                  Login
                </Button>
              )}
            </div>

            {/* Mobile menu button & Mobile Theme Toggle */}
            <div className="-mr-2 flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-base font-medium",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t mt-2">
                {user ? (
                  <div className="space-y-2 px-3">
                    <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                ) : (
                  <div className="px-3">
                    <Button className="w-full" onClick={() => { setIsOpen(false); setShowLoginModal(true); }}>
                      Login
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Welcome Back"
        className="sm:max-w-[400px]"
      >
        <div className="flex flex-col gap-4 py-4">
          <p className="text-center text-muted-foreground text-sm mb-4">
            Please select how you would like to continue
          </p>

          {/* Legal Consent Checkbox */}
          <div className="flex items-start space-x-2 px-1 mb-2">
            <button
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={cn(
                "mt-0.5 flex-shrink-0 rounded border w-4 h-4 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                agreedToTerms ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"
              )}
            >
              {agreedToTerms && <CheckSquare className="h-3 w-3" />}
            </button>
            <div className="text-xs text-muted-foreground leading-tight">
              I agree to the <span onClick={() => setActiveLegalModal('terms')} className="text-primary cursor-pointer hover:underline font-medium">Terms of Service</span> and <span onClick={() => setActiveLegalModal('privacy')} className="text-primary cursor-pointer hover:underline font-medium">Privacy Policy</span>, and I accept full responsibility for my actions on this platform.
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start h-14"
            disabled={!agreedToTerms}
            onClick={() => loginWithRole('customer')}
          >
            <User className="mr-4 h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Customer Login</span>
              <span className="text-xs text-muted-foreground">Shop and track orders</span>
            </div>
          </Button>

          <Button
            variant="default"
            size="lg"
            className="w-full justify-start h-14"
            disabled={!agreedToTerms}
            onClick={() => loginWithRole('admin')}
          >
            <div className="bg-white/20 p-1 rounded mr-3">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Admin Login</span>
              <span className="text-xs opacity-90">Manage store and products</span>
            </div>
          </Button>
        </div>
      </Modal>

      {/* Legal Modals */}
      <Modal
        isOpen={activeLegalModal === 'privacy'}
        onClose={() => setActiveLegalModal(null)}
        title="Privacy Policy"
        className="max-w-3xl max-h-[85vh] overflow-y-auto"
      >
        <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">
          {PRIVACY_POLICY}
        </div>
      </Modal>

      <Modal
        isOpen={activeLegalModal === 'terms'}
        onClose={() => setActiveLegalModal(null)}
        title="Terms of Service"
        className="max-w-3xl max-h-[85vh] overflow-y-auto"
      >
        <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">
          {TERMS_OF_SERVICE}
        </div>
      </Modal>
    </>
  )
}
