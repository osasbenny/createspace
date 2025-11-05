import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { Star } from "lucide-react";
import { useRoute } from "wouter";

export default function ReviewPage() {
  const [, params] = useRoute("/review/:bookingId");
  const { user } = useAuth();
  const bookingId = params?.bookingId ? parseInt(params.bookingId) : 0;

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: booking } = trpc.booking.getById.useQuery(
    { id: bookingId },
    { enabled: !!bookingId }
  );

  const createReviewMutation = trpc.review.create.useMutation();

  const handleSubmit = async () => {
    if (!booking) return;

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        bookingId,
        creativeId: booking.creativeId,
        rating,
        title,
        comment,
      });
      // Reset form
      setRating(5);
      setTitle("");
      setComment("");
      // Show success message
      alert("Review submitted successfully!");
    } catch (error) {
      alert("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Leave a Review</h1>
          <p className="text-gray-600 mb-8">Share your experience with this creative professional</p>

          {/* Booking Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-600">Booking Details</p>
            <p className="font-semibold">{booking.serviceType}</p>
            <p className="text-sm text-gray-600">
              {new Date(booking.bookingDate).toLocaleDateString()} at {booking.startTime}
            </p>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <label className="block text-lg font-bold mb-4">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {rating === 5 && "Excellent!"}
              {rating === 4 && "Very Good"}
              {rating === 3 && "Good"}
              {rating === 2 && "Fair"}
              {rating === 1 && "Poor"}
            </p>
          </div>

          {/* Title */}
          <div className="mb-8">
            <label className="block text-lg font-bold mb-2">Review Title</label>
            <Input
              placeholder="e.g., Amazing photographer, highly recommended"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div className="mb-8">
            <label className="block text-lg font-bold mb-2">Your Review</label>
            <textarea
              placeholder="Share your experience. What did you like? Would you recommend this creative?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="font-semibold text-blue-900 mb-2">Tips for a helpful review:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about what you liked or didn't like</li>
              <li>• Mention the quality of the work and professionalism</li>
              <li>• Share whether you'd book again</li>
              <li>• Be honest and constructive</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmit}
              disabled={isSubmitting || !title || !comment}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>

          {/* Verification Badge */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-600">
              ✓ This review is verified as it's from a completed booking. Your review helps other clients make informed decisions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
