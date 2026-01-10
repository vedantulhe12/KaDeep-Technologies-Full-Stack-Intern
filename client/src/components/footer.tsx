import { Link } from "wouter";

const footerLinks = {
  "Get to Know Us": [
    { name: "About ShopHub", href: "/" },
    { name: "Careers", href: "/" },
    { name: "Press Center", href: "/" },
    { name: "Investor Relations", href: "/" },
  ],
  "Make Money with Us": [
    { name: "Sell products on ShopHub", href: "/" },
    { name: "Become an Affiliate", href: "/" },
    { name: "Advertise Your Products", href: "/" },
    { name: "Self-Publish with Us", href: "/" },
  ],
  "ShopHub Payment Products": [
    { name: "ShopHub Rewards Card", href: "/" },
    { name: "Shop with Points", href: "/" },
    { name: "Reload Your Balance", href: "/" },
    { name: "Currency Converter", href: "/" },
  ],
  "Let Us Help You": [
    { name: "Your Account", href: "/" },
    { name: "Your Orders", href: "/orders" },
    { name: "Shipping Rates & Policies", href: "/" },
    { name: "Returns & Replacements", href: "/" },
    { name: "Customer Service", href: "/" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-sidebar border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`link-footer-${link.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2" data-testid="link-footer-logo">
              <span className="text-xl font-bold text-primary">ShopHub</span>
            </Link>
            <p className="text-xs text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} ShopHub.com, Inc. or its affiliates. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
