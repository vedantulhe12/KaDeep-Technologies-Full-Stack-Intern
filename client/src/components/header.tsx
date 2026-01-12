import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Heart, Menu, User, MapPin, ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const categories = [
  { name: "All", value: "" },
  { name: "Electronics", value: "electronics" },
  { name: "Fashion", value: "fashion" },
  { name: "Home & Kitchen", value: "home" },
  { name: "Books", value: "books" },
  { name: "Sports", value: "sports" },
  { name: "Beauty", value: "beauty" },
  { name: "Toys", value: "toys" },
];

const navLinks = [
  { name: "Today's Deals", href: "/products?deals=true" },
  { name: "Best Sellers", href: "/products?featured=true" },
  { name: "New Arrivals", href: "/products" },
  { name: "Customer Service", href: "/" },
];

export function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Trim and ensure search query is properly encoded
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) params.set("search", trimmedQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    
    const queryString = params.toString();
    const url = `/products${queryString ? `?${queryString}` : ""}`;
    
    console.log(`🔍 Frontend search: "${trimmedQuery}" -> ${url}`);
    setLocation(url);
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-sidebar">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="flex flex-col gap-4 mt-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">ShopHub</span>
              </Link>
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2 text-muted-foreground">Categories</p>
                {categories.slice(1).map((cat) => (
                  <Link
                    key={cat.value}
                    href={`/products?category=${cat.value}`}
                    className="block py-2 hover-elevate rounded-md px-2"
                    data-testid={`link-mobile-category-${cat.value}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <div className="border-t pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block py-2 hover-elevate rounded-md px-2"
                    data-testid={`link-mobile-${link.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-1 shrink-0" data-testid="link-logo">
          <span className="text-xl font-bold text-primary hidden sm:inline">ShopHub</span>
          <span className="text-xl font-bold text-primary sm:hidden">SH</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1 text-sm text-sidebar-foreground shrink-0 hover-elevate rounded-md px-2 py-1 cursor-pointer">
          <MapPin className="h-4 w-4" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Deliver to</span>
            <span className="font-semibold">New York 10001</span>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex-1 flex items-center max-w-2xl mx-auto"
        >
          <div className="flex w-full rounded-md overflow-visible">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="rounded-r-none border-r-0 shrink-0 gap-1 hidden sm:flex"
                  data-testid="button-category-dropdown"
                >
                  <span className="max-w-20 truncate text-xs">
                    {selectedCategory ? categories.find(c => c.value === selectedCategory)?.name : "All"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    data-testid={`dropdown-category-${cat.value || "all"}`}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-none flex-1 min-w-0 sm:rounded-l-none"
              data-testid="input-search"
            />
            <Button
              type="submit"
              className="rounded-l-none shrink-0"
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex flex-col items-start gap-0 h-auto py-2"
                  data-testid="button-account"
                >
                  <span className="text-xs text-muted-foreground">Hello, {user.username}</span>
                  <span className="text-sm font-semibold flex items-center gap-1">
                    Account {user.role === 'admin' && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/orders')}>
                  <Settings className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="hidden md:flex flex-col items-start gap-0 h-auto py-2"
              onClick={() => setLocation('/login')}
              data-testid="button-signin"
            >
              <span className="text-xs text-muted-foreground">Hello, Sign in</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                Account <ChevronDown className="h-3 w-3" />
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            className="hidden md:flex flex-col items-start gap-0 h-auto py-2"
            onClick={() => setLocation("/orders")}
            data-testid="button-orders"
          >
            <span className="text-xs text-muted-foreground">Returns</span>
            <span className="text-sm font-semibold">& Orders</span>
          </Button>

          <Link href="/wishlist">
            <Button
              variant="ghost"
              className="relative flex items-center gap-1"
              data-testid="button-wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </Badge>
              )}
              <span className="hidden sm:inline font-semibold">Wishlist</span>
            </Button>
          </Link>

          <Link href="/cart">
            <Button
              variant="ghost"
              className="relative flex items-center gap-1"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
              <span className="hidden sm:inline font-semibold">Cart</span>
            </Button>
          </Link>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1 px-4 h-10 bg-sidebar-accent text-sidebar-accent-foreground overflow-x-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0 gap-1" data-testid="button-all-menu">
              <Menu className="h-4 w-4" />
              <span>All</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {categories.map((category) => (
              <DropdownMenuItem key={category.value} asChild>
                <Link 
                  href={category.value ? `/products?category=${category.value}` : '/products'}
                  className="w-full cursor-pointer"
                  data-testid={`all-menu-${category.value || "all"}`}
                >
                  {category.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-sm"
              data-testid={`link-nav-${link.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              {link.name}
            </Button>
          </Link>
        ))}
        <Link href="/products?category=electronics">
          <Button variant="ghost" size="sm" className="shrink-0 text-sm" data-testid="link-nav-electronics">
            Electronics
          </Button>
        </Link>
        <Link href="/products?category=fashion">
          <Button variant="ghost" size="sm" className="shrink-0 text-sm" data-testid="link-nav-fashion">
            Fashion
          </Button>
        </Link>
        <Link href="/products?category=home">
          <Button variant="ghost" size="sm" className="shrink-0 text-sm" data-testid="link-nav-home">
            Home & Kitchen
          </Button>
        </Link>
      </nav>
    </header>
  );
}
