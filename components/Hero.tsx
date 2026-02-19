import Link from "next/link"
import { Button } from "@/components/ui/Button"

export function Hero() {
    return (
        <div className="relative isolate overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                    <div className="mt-24 sm:mt-32 lg:mt-16">
                        <a href="#" className="inline-flex space-x-6">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/10">
                                New Arrivals
                            </span>
                            <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-muted-foreground">
                                <span>Just in time for summer</span>
                            </span>
                        </a>
                    </div>
                    <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Elevate Your Lifestyle with Buynic
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Discover a curated collection of premium essentials designed to enhance your daily life. Quality, style, and functionality in every product.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Link href="/shop">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Shop Now
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="ghost" size="lg" className="h-12 px-8 text-base">
                                Learn more <span aria-hidden="true">→</span>
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                            <img
                                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070"
                                alt="Buynic Lifestyle"
                                width={2432}
                                height={1442}
                                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
