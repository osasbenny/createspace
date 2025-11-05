import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Star, MapPin, Calendar, MessageSquare, Download } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreativeProfile() {
  const [, params] = useRoute("/creative/:id");
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const creativeId = params?.id ? parseInt(params.id) : 0;

  const { data: creative, isLoading } = trpc.creative.getById.useQuery(
    { id: creativeId },
    { enabled: !!creativeId }
  );

  const { data: reviews = [] } = trpc.review.getCreativeReviews.useQuery(
    { creativeId },
    { enabled: !!creativeId }
  );

  const { data: portfolio = [] } = trpc.portfolio.getCreativePortfolio.useQuery(
    { creativeId },
    { enabled: !!creativeId }
  );

  const { data: deliverables = [] } = trpc.deliverable.getByBooking.useQuery(
    { bookingId: 0 },
    { enabled: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-64 mb-8" />
          <Skeleton className="h-32 mb-8" />
        </div>
      </div>
    );
  }

  if (!creative) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Creative not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {creative.coverImage && (
        <div className="h-64 bg-gray-300 overflow-hidden">
          <img 
            src={creative.coverImage}
            alt={creative.businessName || "Creative"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8 -mt-20 relative z-10">
          <div className="flex gap-6 mb-6">
            {creative.profileImage && (
              <img 
                src={creative.profileImage}
                alt={creative.businessName || "Creative"}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
              />
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{creative.businessName || "Creative Professional"}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{creative.averageRating}</span>
                  <span className="text-gray-600">({creative.totalReviews} reviews)</span>
                </div>
                
                {creative.isVerified && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Verified
                  </span>
                )}
              </div>

              {creative.location && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  {creative.location}
                </div>
              )}

              {creative.bio && (
                <p className="text-gray-700 mb-6">{creative.bio}</p>
              )}

              <div className="flex gap-3">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </Button>
                
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>

            {/* Pricing Card */}
            <Card className="p-6 bg-purple-50 border-purple-200">
              <h3 className="font-bold mb-4">Pricing</h3>
              {creative.basePrice && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="text-2xl font-bold text-purple-600">${(creative.basePrice / 100).toFixed(2)}</p>
                </div>
              )}
              {creative.hourlyRate && (
                <div>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="text-2xl font-bold text-purple-600">${(creative.hourlyRate / 100).toFixed(2)}/hr</p>
                </div>
              )}
            </Card>
          </div>

          {/* Categories */}
          {creative.categories && (
            <div className="flex gap-2 flex-wrap">
              {JSON.parse(creative.categories || "[]").map((cat: string) => (
                <span key={cat} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
            {portfolio.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <p>No portfolio items yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {portfolio.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition">
                    {item.imageUrl && (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img 
                          src={item.imageUrl}
                          alt={item.title || "Portfolio item"}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      {item.category && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Sidebar */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            {reviews.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                <p>No reviews yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex gap-1 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    {review.title && (
                      <h4 className="font-bold mb-1">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal - Placeholder */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Book {creative.businessName}</h2>
            <p className="text-gray-600 mb-6">Booking feature coming soon. Use the message button to inquire about availability.</p>
            <Button 
              className="w-full"
              onClick={() => setShowBookingModal(false)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
