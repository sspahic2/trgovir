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
  pageSize = 50
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
        const merged = [...prev, ...uniqueNew];
        setHasMore(merged.length < total);
        return merged;
      });

      setLoading(false);
    };

    load();
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
  
    const currentRef = loaderRef.current;
    if (currentRef) observer.observe(currentRef);
  
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading]);  

  return (
    <div>
      {items.map(renderItem)}
      {items.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">No more data.</div>
      )}
      {hasMore && (
        <div ref={loaderRef} className="text-center py-4 text-gray-500">
          Loading.
        </div>
      )}
    </div>
  );
}
