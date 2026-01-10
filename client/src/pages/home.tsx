import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { CategoryCard, CategoryCardSkeleton } from "@/components/category-card";
import type { Product, Category } from "@shared/schema";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $35",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team",
  },
];

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });

  const { data: dealProducts, isLoading: dealsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { deals: true }],
  });

  return (
    <div className="min-h-screen">
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/products">
              <Button variant="ghost" className="gap-2" data-testid="link-see-all-categories">
                See All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <CategoryCardSkeleton key={i} />
                ))
              : categories?.slice(0, 6).map((category) => (
                  <CategoryCard
                    key={category.id}
                    name={category.name}
                    icon={category.icon}
                    imageUrl={category.imageUrl || undefined}
                  />
                ))}
          </div>
        </section>

        <section>
          <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Deals of the Day</CardTitle>
              <p className="text-white/80">Limited time offers - Don't miss out!</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {dealsLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))
                  : dealProducts?.slice(0, 5).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true">
              <Button variant="ghost" className="gap-2" data-testid="link-see-all-featured">
                See All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : featuredProducts?.slice(0, 10).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="bg-sidebar rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join ShopHub Today</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Create an account to enjoy personalized recommendations, faster checkout, and exclusive deals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" data-testid="button-create-account">Create Account</Button>
            <Button size="lg" variant="outline" data-testid="button-sign-in">Sign In</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
