// Generic Loading Skeleton Component
export function LoadingSkeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} 
      aria-busy="true"
      role="status"
      aria-label="Loading...">
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Title Skeleton
export function TitleSkeleton() {
  return <LoadingSkeleton className="h-8 w-1/2" />;
}

// Text Skeleton
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton 
          key={i} 
          className={i === lines - 1 ? 'h-4 w-4/5' : 'h-4 w-full'} 
        />
      ))}
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 5, cardSize = 'default' }: { count?: number; cardSize?: 'small' | 'default' | 'large' }) {
  const height = cardSize === 'small' ? 'h-20' : cardSize === 'large' ? 'h-64' : 'h-44';

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ height: height.match(/\d+/)?.[0] || '176px' }} />
      ))}
    </div>
  );
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  return (
    <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse`} />
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <LoadingSkeleton 
              key={colIdx} 
              className="h-4 flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
