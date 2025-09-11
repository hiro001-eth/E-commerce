import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  TrendingUp,
  Grid3X3,
  List,
  ShoppingCart 
} from "lucide-react";
import ProductCard from "@/components/product-card";
import WishlistButton from "@/components/wishlist-button";
import { formatCurrency } from "@/lib/currency";
import type { ProductDTO, CategoryDTO, User } from "@shared/schema";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductDTO[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<CategoryDTO[]>({
    queryKey: ["/api/categories"],
  });

  const { data: authData } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Extract unique brands and colors for filters
  const uniqueBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brands) as string[];
  }, [products]);

  const uniqueColors = useMemo(() => {
    const colors = new Set(products.flatMap(p => p.colors || []));
    return Array.from(colors);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
      
      const price = parseFloat(product.discountPrice || product.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      const matchesBrand = selectedBrands.length === 0 || 
                          (product.brand && selectedBrands.includes(product.brand));
      
      const matchesColors = selectedColors.length === 0 || 
                           (product.colors && product.colors.some(color => selectedColors.includes(color)));
      
      const rating = parseFloat(product.rating || "0");
      const matchesRating = rating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesColors && matchesRating;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.discountPrice || a.price);
          const priceB = parseFloat(b.discountPrice || b.price);
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.discountPrice || a.price);
          const priceB = parseFloat(b.discountPrice || b.price);
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
        break;
      case "popular":
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime());
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, priceRange, selectedBrands, selectedColors, minRating]);

  const handleBrandFilter = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleColorFilter = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setMinRating(0);
    setSortBy("newest");
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg animate-pulse-delayed" style={{animationDelay: `${i * 100}ms`}}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-all duration-300 ease-in-out">
      {/* Hero Section with animations */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border animate-gradient">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">
              Discover Amazing Products
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in-up animation-delay-200">
              Find everything you need from trusted vendors
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto relative animate-fade-in-up animation-delay-400">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
            <Input
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 focus:border-primary transition-all duration-300 hover:shadow-lg focus:shadow-xl"
              data-testid="input-search-products"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Advanced Filters Sidebar */}
          <div className={`lg:w-80 space-y-6 ${showFilters ? 'block animate-slide-in-left' : 'hidden lg:block lg:animate-slide-in-left'}`}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Category</h4>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category" className="transition-all duration-200 hover:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range with animations */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Price Range</h4>
                <div className="px-3">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full transition-all duration-200"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span className="animate-number-change">{formatCurrency(priceRange[0])}</span>
                    <span className="animate-number-change">{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              {uniqueBrands.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium">Brand</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {uniqueBrands.map(brand => (
                      <div key={brand} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50 transition-colors duration-200">
                        <input
                          type="checkbox"
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandFilter(brand)}
                          className="rounded border-gray-300 transition-all duration-200 hover:scale-110"
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter with animations */}
              {uniqueColors.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium">Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map(color => (
                      <Badge
                        key={color}
                        variant={selectedColors.includes(color) ? "default" : "outline"}
                        className="cursor-pointer capitalize transition-all duration-200 hover:scale-105 hover:shadow-md"
                        onClick={() => handleColorFilter(color)}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter with animations */}
              <div className="space-y-3">
                <h4 className="font-medium">Minimum Rating</h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                      className={`p-1 rounded transition-all duration-200 hover:scale-110 ${
                        rating <= minRating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current animate-star-fill" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Enhanced Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden transition-all duration-200 hover:scale-105"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
                <p className="text-muted-foreground animate-fade-in">
                  <span className="animate-number-change">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="transition-all duration-200"
                    data-testid="button-grid-view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="transition-all duration-200"
                    data-testid="button-list-view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 transition-all duration-200 hover:border-primary" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products with animations */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="text-6xl text-muted-foreground mb-4 animate-bounce-gentle">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or clear all filters
                </p>
                <Button onClick={clearAllFilters} variant="outline" className="transition-all duration-200 hover:scale-105">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`
                ${viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                  : "space-y-4"
                }
              `}>
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {viewMode === "grid" ? (
                      <ProductCard product={product} />
                    ) : (
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in-right">
                        <div className="flex gap-6">
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={product.images?.[0] || '/api/placeholder/200/200'}
                              alt={product.name}
                              className="w-32 h-32 object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-lg font-semibold hover:text-primary transition-colors duration-200">{product.name}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm">{product.rating || "0"}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({product.reviewCount || 0})
                                </span>
                              </div>
                              {product.brand && (
                                <Badge variant="outline" className="animate-fade-in">{product.brand}</Badge>
                              )}
                              {product.colors && product.colors.length > 0 && (
                                <div className="flex gap-1">
                                  {product.colors.slice(0, 3).map(color => (
                                    <div
                                      key={color}
                                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: color.toLowerCase() }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price) ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-primary animate-price-change">
                                      {formatCurrency(product.discountPrice)}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through">
                                      {formatCurrency(product.price)}
                                    </span>
                                    <Badge variant="destructive" className="animate-pulse">
                                      {Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice)) / parseFloat(product.price)) * 100)}% OFF
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-xl font-bold animate-price-change">
                                    {formatCurrency(product.price)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <WishlistButton productId={product.id} size="sm" />
                                <Button size="sm" className="transition-all duration-200 hover:scale-105">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations Section with animations */}
            {filteredProducts.length > 0 && searchTerm && (
              <div className="mt-12 animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  You might also like
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products
                    .filter(p => !filteredProducts.includes(p))
                    .slice(0, 4)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in-up transition-all duration-300 hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced CSS for smooth animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes starFill {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }

        @keyframes priceChange {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes numberChange {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-bounce-gentle {
          animation: bounceGentle 2s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-star-fill:hover {
          animation: starFill 0.3s ease-out;
        }

        .animate-price-change {
          animation: priceChange 0.3s ease-out;
        }

        .animate-number-change {
          animation: numberChange 0.3s ease-out;
        }

        .animate-pulse-delayed {
          animation-duration: 1.5s;
          animation-iteration-count: infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}