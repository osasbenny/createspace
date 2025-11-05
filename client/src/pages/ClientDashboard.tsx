import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Calendar, MessageSquare, Download, Star, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data: bookings = [] } = trpc.booking.getMyBookings.useQuery();
  const { data: transactions = [] } = trpc.payment.getTransactions.useQuery();
  const { data: conversations = [] } = trpc.messaging.getConversations.useQuery();

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming Bookings</p>
                <p className="text-3xl font-bold">{upcomingBookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold">{completedBookings.length}</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold">${(totalSpent / 100).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Messages</p>
                <p className="text-3xl font-bold">{conversations.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="bg-white rounded-lg shadow">
          <TabsList className="border-b">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="p-6">
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No bookings yet</p>
                  <Link href="/marketplace">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Browse Creatives
                    </Button>
                  </Link>
                </div>
              ) : (
                bookings.map((booking) => {
                  const status = booking.status || "pending";
                  const statusColor = 
                    status === "confirmed" ? "bg-green-100 text-green-800" :
                    status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    status === "completed" ? "bg-blue-100 text-blue-800" :
                    status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800";
                  
                  return (
                    <Card key={booking.id} className="p-6 border-l-4 border-purple-600">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold mb-2">{booking.serviceType}</h3>
                          <p className="text-gray-600">
                            {new Date(booking.bookingDate).toLocaleDateString()} at {booking.startTime}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>

                      {booking.description && (
                        <p className="text-gray-700 mb-4">{booking.description}</p>
                      )}

                      <div className="flex gap-2 mb-4">
                        <div className="text-sm">
                          <p className="text-gray-600">Total Price</p>
                          <p className="font-bold">${(booking.totalPrice / 100).toFixed(2)}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Deposit</p>
                          <p className="font-bold">${(booking.depositAmount / 100).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </Button>
                        {booking.status === "completed" && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Deliverables
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="p-6">
            <div className="space-y-4">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <Card key={conv.id} className="p-4 hover:shadow-md transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold mb-1">Conversation #{conv.id}</p>
                        <p className="text-sm text-gray-600">{conv.lastMessage}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="p-6">
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p>No payment history</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-left py-2 px-4">Amount</th>
                        <th className="text-left py-2 px-4">Method</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const txStatus = tx.status || "pending";
                        const statusColor = 
                          txStatus === "completed" ? "bg-green-100 text-green-800" :
                          txStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                          txStatus === "failed" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800";
                        
                        return (
                          <tr key={tx.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 capitalize">{tx.type}</td>
                            <td className="py-3 px-4 font-semibold">${(tx.amount / 100).toFixed(2)}</td>
                            <td className="py-3 px-4 capitalize">{tx.paymentMethod}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                                {txStatus.charAt(0).toUpperCase() + txStatus.slice(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Review feature coming soon</p>
              <p className="text-sm text-gray-500">You'll be able to leave reviews for completed bookings here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
