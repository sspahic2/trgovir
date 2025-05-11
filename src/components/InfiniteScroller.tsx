'use client';

import { JSX, useEffect, useRef } from 'react';

interface InfiniteScrollerProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
}

export default function InfiniteScroller<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading = false,
}: InfiniteScrollerProps<T>) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    });

    const currentRef = loaderRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div>
      {items.map((item, index) => renderItem(item, index))}

      <div ref={loaderRef} className="text-center py-4 text-gray-500">
        {loading ? 'Loading...'  : ''}
      </div>
    </div>
  );
}
