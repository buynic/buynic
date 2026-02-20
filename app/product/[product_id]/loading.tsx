export default function ProductLoading() {
    return (
        <div className="bg-background min-h-screen py-10 md:py-20 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    {/* Image Area Skeleton */}
                    <div className="flex flex-col-reverse justify-center">
                        <div className="aspect-square w-full bg-secondary rounded-2xl"></div>
                        <div className="mt-6 w-full max-w-2xl sm:block lg:max-w-none">
                            <div className="grid grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex h-24 items-center justify-center rounded-md bg-secondary aspect-square"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Details Area Skeleton */}
                    <div className="mt-10 px-4 sm:px-0 lg:mt-0 space-y-6">
                        <div className="h-8 bg-secondary rounded w-3/4"></div>
                        <div className="h-6 bg-secondary rounded w-1/4"></div>
                        <div className="h-10 bg-secondary rounded w-1/3"></div>

                        <div className="mt-6 space-y-4">
                            <div className="h-4 bg-secondary rounded w-full"></div>
                            <div className="h-4 bg-secondary rounded w-full"></div>
                            <div className="h-4 bg-secondary rounded w-5/6"></div>
                        </div>

                        <div className="h-12 bg-secondary rounded w-full mt-10"></div>
                        <div className="h-12 bg-secondary rounded w-full mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
