export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-green animate-bounce-slow">
          🌿
        </div>
        <div className="flex items-center gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading AgroMart...</p>
      </div>
    </div>
  )
}
