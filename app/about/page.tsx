import { CheckCircle2 } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="bg-background">
            <div className="relative isolate overflow-hidden bg-secondary/50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">About Buynic</h2>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            We are a dedicated team of curators and creators, passionate about bringing you the best products from around the world. Founded in 2024, Buynic was born out of a desire to make premium quality accessible to everyone.
                        </p>
                    </div>
                    <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-foreground sm:grid-cols-2 md:flex lg:gap-x-10">
                            <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-black dark:text-black bg-white rounded-full" /> Curated Collection</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-black dark:text-black bg-white rounded-full" /> Quality Assurance</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-black dark:text-black bg-white rounded-full" /> Customer First</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-black dark:text-black bg-white rounded-full" /> Sustainable Practices</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                        <p className="mt-4 text-muted-foreground">
                            To redefine the online shopping experience by offering a seamless blend of quality, style, and convenience. We believe that what you buy should not only look good but also last long and add value to your life.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">Our Promise</h3>
                        <p className="mt-4 text-muted-foreground">
                            We promise to always put our customers first. From the moment you land on our site to the day your package arrives (and beyond), we are committed to providing you with excellent service and support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
