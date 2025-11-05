import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Briefcase, MapPin, DollarSign, Calendar, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GigBoard() {
  const { user } = useAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    deadline: "",
  });

  const { data: gigPosts = [] } = trpc.gig.listPosts.useQuery({
    limit: 50,
  });

  const createPostMutation = trpc.gig.createPost.useMutation();

  const handleCreatePost = async () => {
    if (!formData.title || !formData.description || !formData.budget) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseInt(formData.budget) * 100, // Convert to cents
        location: formData.location,
        deadline: formData.deadline,
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        budget: "",
        location: "",
        deadline: "",
      });
      setShowPostForm(false);
      alert("Gig posted successfully!");
    } catch (error) {
      alert("Failed to post gig");
    }
  };

  const categories = [
    "Photography",
    "Videography",
    "Makeup",
    "Styling",
    "Graphic Design",
    "Content Creation",
    "Event Planning",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gig Board</h1>
          {user?.userType === "client" && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={() => setShowPostForm(!showPostForm)}
            >
              <Plus className="w-4 h-4" />
              Post a Gig
            </Button>
          )}
        </div>

        {/* Post Form */}
        {showPostForm && user?.userType === "client" && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Post a New Gig</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Gig Title *</label>
                <Input
                  placeholder="e.g., Professional Headshot Photography"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  placeholder="Describe the gig in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Budget (USD) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <Input
                    placeholder="e.g., New York, NY"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deadline</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleCreatePost}
                >
                  Post Gig
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPostForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="bg-white rounded-lg shadow">
          <TabsList className="border-b">
            <TabsTrigger value="all">All Gigs</TabsTrigger>
            {user?.userType === "creative" && (
              <TabsTrigger value="applied">My Applications</TabsTrigger>
            )}
            {user?.userType === "client" && (
              <TabsTrigger value="posted">My Posted Gigs</TabsTrigger>
            )}
          </TabsList>

          {/* All Gigs Tab */}
          <TabsContent value="all" className="p-6">
            {gigPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No gigs available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {gigPosts.map((gig) => (
                  <Card key={gig.id} className="p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{gig.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{gig.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        gig.status === "open" ? "bg-green-100 text-green-800" :
                        gig.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        gig.status === "completed" ? "bg-gray-100 text-gray-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {(gig.status || "open").replace("_", " ").charAt(0).toUpperCase() + (gig.status || "open").slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {gig.category && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{gig.category}</span>
                        </div>
                      )}

                      {gig.budget && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold">${(gig.budget / 100).toFixed(2)}</span>
                        </div>
                      )}

                      {gig.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{gig.location}</span>
                        </div>
                      )}

                      {gig.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(gig.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {(gig.applicationsCount || 0) > 0 && (
                      <p className="text-sm text-gray-600 mb-4">
                        {gig.applicationsCount} application{(gig.applicationsCount || 0) !== 1 ? "s" : ""}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {user?.userType === "creative" && gig.status === "open" && (
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Apply for Gig
                        </Button>
                      )}
                      <Button variant="outline">View Details</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Applications Tab */}
          {user?.userType === "creative" && (
            <TabsContent value="applied" className="p-6">
              <div className="text-center py-12 text-gray-600">
                <p>You haven't applied to any gigs yet</p>
              </div>
            </TabsContent>
          )}

          {/* My Posted Gigs Tab */}
          {user?.userType === "client" && (
            <TabsContent value="posted" className="p-6">
              <div className="text-center py-12 text-gray-600">
                <p>You haven't posted any gigs yet</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
