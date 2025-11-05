import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, APP_TITLE, APP_LOGO } from "@/const";
import { Link } from "wouter";
import { Star, Camera, MessageSquare, Zap, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <span className="text-xl font-bold text-white">{APP_TITLE}</span>
          </div>
          <div className="flex gap-4">
            <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="text-white hover:text-purple-400">Marketplace</Button>
            </a>
            <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer">
              <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Connect with Creative Professionals
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Book photographers, stylists, makeup artists, videographers, and more. Secure payments, 
            real-time messaging, and verified portfolios all in one platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8">
                Find Creatives
              </Button>
            </a>
            <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-white border-purple-500 hover:bg-purple-900/30 text-lg px-8">
                Become a Creative
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose CreateSpace?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-purple-500/20 p-6 hover:border-purple-500/50 transition">
            <Camera className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Verified Portfolios</h3>
            <p className="text-gray-400">Browse curated portfolios with real work samples, ratings, and verified reviews from past clients.</p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-6 hover:border-purple-500/50 transition">
            <Zap className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Easy Booking</h3>
            <p className="text-gray-400">Check availability, select your preferred time slot, and secure your booking with a simple deposit.</p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-6 hover:border-purple-500/50 transition">
            <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Direct Messaging</h3>
            <p className="text-gray-400">Communicate directly with creatives, share requirements, and coordinate project details in real-time.</p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-6 hover:border-purple-500/50 transition">
            <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Secure Payments</h3>
            <p className="text-gray-400">Pay deposits via Paystack or Stripe. Funds are held securely until project completion.</p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-6 hover:border-purple-500/50 transition">
            <Users className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Deliverables Hub</h3>
            <p className="text-gray-400">Securely upload and download final work. Track all project files in one organized space.</p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-6 hover:border-purple-500/50 transition">
            <Star className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Reviews & Ratings</h3>
            <p className="text-gray-400">Build trust through verified reviews. Rate your experience and help others find great creatives.</p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: "Browse", desc: "Search creatives by category, location, and budget" },
            { step: 2, title: "Connect", desc: "Message to discuss your project and requirements" },
            { step: 3, title: "Book", desc: "Select dates, pay deposit, and confirm booking" },
            { step: 4, title: "Collaborate", desc: "Receive deliverables and leave a review" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Creatives Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-white mb-6">For Creative Professionals</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">Build Your Brand</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✓ Create a stunning portfolio page</li>
                <li>✓ Showcase your best work with images and videos</li>
                <li>✓ Set your own pricing and availability</li>
                <li>✓ Build credibility with verified reviews</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">Grow Your Business</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✓ Get discovered by clients actively seeking your services</li>
                <li>✓ Manage bookings and payments automatically</li>
                <li>✓ Secure payment processing with deposits</li>
                <li>✓ Access AI tools to optimize your profile</li>
              </ul>
            </div>
          </div>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Start Earning Today
            </Button>
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">What Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Sarah M.", role: "Photographer", text: "CreateSpace helped me book 10+ clients in my first month. The platform is intuitive and secure." },
            { name: "James K.", role: "Client", text: "Found an amazing makeup artist through the marketplace. The booking process was seamless!" },
            { name: "Amara T.", role: "Videographer", text: "Love the direct messaging feature. I can discuss projects in detail before confirming bookings." },
          ].map((item, idx) => (
            <Card key={idx} className="bg-slate-800/50 border-purple-500/20 p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">"{item.text}"</p>
              <div>
                <p className="font-bold text-white">{item.name}</p>
                <p className="text-sm text-gray-400">{item.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-300 mb-8">Join thousands of creatives and clients already using CreateSpace</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8">
              Browse Creatives
            </Button>
          </a>
          <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="text-white border-purple-500 hover:bg-purple-900/30 text-lg px-8">
              Sign Up Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-white mb-4">{APP_TITLE}</p>
              <p className="text-gray-400 text-sm">The marketplace for creative professionals</p>
            </div>
            <div>
              <p className="font-bold text-white mb-4">For Clients</p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Browse Creatives</a></li>
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">How It Works</a></li>
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Pricing</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">For Creatives</p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Join Us</a></li>
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Grow Your Business</a></li>
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Resources</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Company</p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">About</a></li>
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Privacy</a></li>
                <li><a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
            <p className="text-sm mt-2">Designed by <a href="https://instagram.com/osas.codes" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Osagie Bernard E</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
