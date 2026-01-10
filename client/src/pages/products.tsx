import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, SlidersHorizontal, Grid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { StarRating } from "@/components/star-rating";
import type { Product, Category } from "@shared/schema";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Avg. Customer Review" },
  { value: "newest", label: "Newest Arrivals" },
];

const ratingFilters = [4, 3, 2, 1];

export default function ProductsPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isPrime, setIsPrime] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const searchQuery = params.get("search") || "";
  const categoryParam = params.get("category") || "";
  const dealsParam = params.get("deals") === "true";
  const featuredParam = params.get("featured") === "true";

  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [
      "/api/products",
      {
        search: searchQuery,
        category: selectedCategories.join(",") || categoryParam,
        deals: dealsParam,
        featured: featuredParam,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating: selectedRating,
        isPrime,
        sortBy,
      },
    ],
  });

  const filteredProducts = products || [];

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedRating(null);
    setIsPrime(false);
    setPriceRange([0, 1000]);
    setLocation("/products");
  };

  const activeFiltersCount =
    selectedCategories.length +
    (selectedRating ? 1 : 0) +
    (isPrime ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {categories?.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.id]);
                  } else {
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== category.id)
                    );
                  }
                }}
                data-testid={`checkbox-category-${category.id}`}
              />
              <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={1000}
            step={10}
            className="mb-4"
            data-testid="slider-price-range"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Customer Rating</h3>
        <div className="space-y-2">
          {ratingFilters.map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left transition-colors ${
                selectedRating === rating ? "bg-accent" : "hover-elevate"
              }`}
              data-testid={`button-rating-${rating}`}
            >
              <StarRating rating={rating} size="sm" />
              <span className="text-sm">& Up</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Shipping</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="prime"
            checked={isPrime}
            onCheckedChange={(checked) => setIsPrime(checked === true)}
            data-testid="checkbox-prime"
          />
          <Label htmlFor="prime" className="text-sm cursor-pointer">
            Prime Eligible
          </Label>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
          data-testid="button-clear-filters"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {categoryParam
                ? categories?.find((c) => c.id === categoryParam)?.name || "Products"
                : searchQuery
                ? `Search: "${searchQuery}"`
                : dealsParam
                ? "Deals"
                : featuredParam
                ? "Featured Products"
                : "All Products"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="sticky top-28">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterContent />
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1" data-testid="text-results-title">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : categoryParam
                  ? categories?.find((c) => c.id === categoryParam)?.name
                  : dealsParam
                  ? "Deals of the Day"
                  : featuredParam
                  ? "Featured Products"
                  : "All Products"}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                {filteredProducts.length} results
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2" data-testid="button-mobile-filters">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="gap-1">
                  {categories?.find((c) => c.id === cat)?.name}
                  <button
                    onClick={() =>
                      setSelectedCategories(selectedCategories.filter((c) => c !== cat))
                    }
                    data-testid={`button-remove-category-${cat}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedRating && (
                <Badge variant="secondary" className="gap-1">
                  {selectedRating}+ Stars
                  <button onClick={() => setSelectedRating(null)} data-testid="button-remove-rating">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {isPrime && (
                <Badge variant="secondary" className="gap-1">
                  Prime
                  <button onClick={() => setIsPrime(false)} data-testid="button-remove-prime">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Badge variant="secondary" className="gap-1">
                  ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 1000])} data-testid="button-remove-price">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search term
                </p>
                <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
