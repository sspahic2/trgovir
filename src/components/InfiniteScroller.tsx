'use client';

import { JSX, useEffect, useRef, useState } from "react";

interface InfiniteScrollerProps<T> {
  fetchFn: (page: number) => Promise<{ items: T[]; total: number }>;
  renderItem: (item: T, index: number) => JSX.Element;
  pageSize?: number;
}

export default function InfiniteScroller<T>({
  fetchFn,
  renderItem,
  pageSize = 10
}: InfiniteScrollerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      const { items: newItems, total } = await fetchFn(page);
  
      setItems((prev) => {
        const seen = new Set(prev.map((x: any) => (x as any).id));
        const uniqueNew = newItems.filter((x: any) => !seen.has(x.id));
        return [...prev, ...uniqueNew];
      });
  
      setHasMore(items.length + newItems.length < total); // or use [...prev, ...uniqueNew].length
      setLoading(false);
    };
  
    load();
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.disconnect();
    };
  }, [hasMore, loading]);

  return (
    <div>
      {items.map(renderItem)}
      {hasMore && (
        <div ref={loaderRef} className="text-center py-4 text-gray-500">
          Loading...
        </div>
      )}
    </div>
  );
}
