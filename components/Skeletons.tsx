import { Skeleton } from "@/components/ui/skeleton"

export const PostSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <div className="flex items-center mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="ml-4 space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-4" />
    <Skeleton className="h-40 w-full mb-4" />
    <div className="flex justify-between">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
)

export const IndicacaoSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-4" />
    <div className="flex items-center mb-4">
      <Skeleton className="h-5 w-24 mr-2" />
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-5" />
        ))}
      </div>
    </div>
    <Skeleton className="h-4 w-1/3 mb-2" />
    <Skeleton className="h-4 w-1/4 mb-4" />
    <div className="flex justify-between">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
)

export const NewPostSkeleton = () => (
  <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4 mb-6">
    <Skeleton className="h-24 w-full mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
)

