import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Star, MapPin, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Marketplace() {
  const { isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const { data: creatives = [], isLoading } = trpc.creative.search.useQuery({
    category: selectedCategory || undefined,
    location: selectedLocation || undefined,
    limit: 20,
  });

  const categories = [
    "Photography",
    "Videography",
    "Makeup Artist",
    "Stylist",
    "Hair Stylist",
    "Event Planning",
    "Graphic Design",
    "Content Creator",
  ];

  const filteredCreatives = useMemo(() => {
    return creatives.filter((creative) => {
      const matchesSearch = !searchQuery || 
        creative.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creative.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [creatives, searchQuery]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to browse creatives</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view the marketplace</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Find Creative Professionals</h1>
          
          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              className="whitespace-nowrap"
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-48 mb-4" />
                <Skeleton className="h-6 mb-2" />
                <Skeleton className="h-4 mb-4" />
                <Skeleton className="h-10" />
              </Card>
            ))}
          </div>
        ) : filteredCreatives.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">No creatives found</h2>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreatives.map((creative) => (
              <Link key={creative.id} href={`/creative/${creative.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                  {creative.coverImage && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={creative.coverImage} 
                        alt={creative.businessName || "Creative"}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      {creative.profileImage && (
                        <img 
                          src={creative.profileImage}
                          alt={creative.businessName || "Creative"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{creative.businessName || "Creative"}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{creative.averageRating}</span>
                          <span className="text-xs text-gray-500">({creative.totalReviews})</span>
                        </div>
                      </div>
                    </div>

                    {creative.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {creative.location}
                      </div>
                    )}

                    {creative.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {creative.bio}
                      </p>
                    )}

                    {creative.categories && (
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {JSON.parse(creative.categories || "[]").slice(0, 2).map((cat: string) => (
                          <span key={cat} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {creative.basePrice && (
                        <div className="text-sm font-semibold text-purple-600">
                          From ${(creative.basePrice / 100).toFixed(2)}
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      View Profile
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
