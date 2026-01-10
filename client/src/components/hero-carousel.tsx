import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Holiday Deals",
    subtitle: "Up to 50% off electronics, home goods, and more",
    buttonText: "Shop Now",
    buttonLink: "/products?deals=true",
    bgGradient: "from-orange-500 via-orange-600 to-red-600",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Discover the latest trends in fashion and accessories",
    buttonText: "Explore",
    buttonLink: "/products?category=fashion",
    bgGradient: "from-purple-500 via-purple-600 to-indigo-600",
  },
  {
    id: 3,
    title: "Smart Home Collection",
    subtitle: "Transform your home with cutting-edge technology",
    buttonText: "Shop Electronics",
    buttonLink: "/products?category=electronics",
    bgGradient: "from-blue-500 via-blue-600 to-cyan-600",
  },
  {
    id: 4,
    title: "Free Shipping",
    subtitle: "On orders over $35 - no Prime membership required",
    buttonText: "Start Shopping",
    buttonLink: "/products",
    bgGradient: "from-green-500 via-green-600 to-teal-600",
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div
      className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={cn(
              "h-full w-full flex-shrink-0 bg-gradient-to-r",
              slide.bgGradient
            )}
          >
            <div className="h-full w-full flex items-center justify-center px-8 md:px-16">
              <div className="max-w-xl text-center text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 drop-shadow-md opacity-90">
                  {slide.subtitle}
                </p>
                <Link href={slide.buttonLink}>
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 font-semibold shadow-lg"
                    data-testid={`button-hero-${slide.id}`}
                  >
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-12 w-12"
        onClick={prevSlide}
        data-testid="button-carousel-prev"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-12 w-12"
        onClick={nextSlide}
        data-testid="button-carousel-next"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              index === currentSlide
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            )}
            onClick={() => setCurrentSlide(index)}
            data-testid={`button-carousel-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
