'use client';
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MessageSquareDashed, Check, X, Flag, Sparkles } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          const allReviews: any[] = [];
          data.data.forEach((dest: any) => {
            if (dest.reviews) {
              dest.reviews.forEach((r: any) => allReviews.push({ ...r, destinationName: dest.name }));
            }
          });
          setReviews(allReviews.length > 0 ? allReviews : [
            { id: 1, user: 'Sarah Johnson', text: 'Amazing sunrise at Borobudur! The temple is breathtaking.', destinationName: 'Borobudur Temple', sentiment: 'Pending' },
            { id: 2, user: 'Mike Chen', text: 'Very crowded and noisy. Not recommended during peak hours.', destinationName: 'Malioboro Street', sentiment: 'Pending' },
            { id: 3, user: 'Ayu Lestari', text: 'Beautiful batik collection and friendly staff!', destinationName: 'Batik Winotosastro', sentiment: 'Pending' },
          ]);
        }
        setLoading(false);
      });
  }, []);

  const analyzeSentiment = async (review: any) => {
    setAnalyzing(review.id);
    try {
      const res = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText: review.text }),
      });
      const data = await res.json();
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, sentiment: data.sentiment || 'Positive', analysis: data.analysis } : r));
    } catch {
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, sentiment: 'Positive', analysis: 'Analysis unavailable.' } : r));
    }
    setAnalyzing(null);
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="reviews" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Review Moderation</h2>
            <span className="bg-danger/10 text-danger text-xs font-bold px-3 py-1 rounded-full">{reviews.length} Pending</span>
          </div>

          {loading ? (
            <p>Loading reviews...</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl shadow p-6 border-l-4 border-primary">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{review.destinationName}</p>
                      <p className="text-sm font-bold text-gray-800">{review.user}</p>
                      <p className="text-sm text-gray-600 mt-2">{review.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.sentiment !== 'Pending' ? (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${review.sentiment === 'Positive' ? 'bg-success/10 text-success' : review.sentiment === 'Negative' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                          {review.sentiment}
                        </span>
                      ) : (
                        <button onClick={() => analyzeSentiment(review)} disabled={analyzing === review.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition">
                          <Sparkles className="w-3 h-3" />
                          {analyzing === review.id ? 'Analyzing...' : 'Analyze'}
                        </button>
                      )}
                    </div>
                  </div>
                  {review.analysis && <p className="text-[10px] text-gray-500 mt-2 italic">{review.analysis}</p>}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20 transition"><Check className="w-3 h-3" /> Approve</button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20 transition"><X className="w-3 h-3" /> Reject</button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-bold hover:bg-warning/20 transition"><Flag className="w-3 h-3" /> Flag</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
