import React, { useState, useEffect } from "react";
import axios from "axios";
import IssueCard from "./IssueCard";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-3">
          Something went wrong loading this issue card.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function IssueFeed({ userLocation, calculateLocationScore }) {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (p) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/feed/trending?page=${p}&limit=12`
      );
      if (res.data.status === "success") {
        const newItems = res.data.data.issues || [];
        if (newItems.length === 0 && p === 1) {
          setHasMore(false);
        }
        setIssues((prev) => [...prev, ...newItems]);
        const total = res.data.data.total || 0;
        const limit = res.data.data.limit || 12;
        const loaded = p * limit;
        setHasMore(loaded < total);
      }
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  useEffect(() => {
    const sentinel = document.getElementById("feed-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading) {
            const next = page + 1;
            setPage(next);
            fetchPage(next);
          }
        });
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-extrabold mb-6 text-center text-red-600">
        🔥 Trending Issues
      </h2>

      {issues.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          🚀 No trending issues found. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {issues.map((issue) => {
            const isLocal = userLocation && calculateLocationScore ? 
              calculateLocationScore(issue, userLocation) > 0.5 : false;
            
            return (
              <ErrorBoundary key={issue._id}>
                <IssueCard issue={issue} isLocal={isLocal} />
              </ErrorBoundary>
            );
          })}
        </div>
      )}

      {loading && (
        <p className="text-center text-gray-500 mt-4">Loading more issues...</p>
      )}
      {!hasMore && issues.length > 0 && (
        <p className="text-center text-gray-500 mt-4">
          🎉 You’ve reached the end!
        </p>
      )}
      <div id="feed-sentinel" className="h-8"></div>
    </div>
  );
}
