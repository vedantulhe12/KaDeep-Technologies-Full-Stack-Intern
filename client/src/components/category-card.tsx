import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Laptop, 
  Shirt, 
  Home, 
  BookOpen, 
  Dumbbell, 
  Sparkles, 
  Gamepad2,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, typeof Laptop> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  books: BookOpen,
  sports: Dumbbell,
  beauty: Sparkles,
  toys: Gamepad2,
  gifts: Gift,
};

interface CategoryCardProps {
  name: string;
  icon: string;
  imageUrl?: string;
  className?: string;
}

export function CategoryCard({ name, icon, imageUrl, className }: CategoryCardProps) {
  const IconComponent = categoryIcons[icon] || Gift;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  return (
    <Link href={`/products?category=${slug}`}>
      <Card
        className={cn(
          "group overflow-visible h-full transition-all hover:shadow-md cursor-pointer hover-elevate",
          className
        )}
        data-testid={`card-category-${slug}`}
      >
        <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
          {imageUrl ? (
            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center">
              <IconComponent className="w-10 h-10 text-primary" />
            </div>
          )}
          <h3 className="font-semibold text-sm">{name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
