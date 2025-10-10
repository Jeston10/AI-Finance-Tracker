"use client"

import { ThreeDScene } from "@/components/three-d-scene"
import { FeatureCard } from "@/components/feature-card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import React from "react"
import { useApp } from "@/lib/contexts/app-context"

export default function HomePage() {
  const { isLoading } = useApp()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }
  const testimonials = [
    {
      quote: "This finance tracker has revolutionized how I manage my money. The AI insights are incredibly accurate!",
      author: "Jane Doe",
      image: "/JaneDoe.jpg",
    },
    {
      quote: "Finally, a personal finance app that understands my needs. The 3D visualizations make it so engaging.",
      author: "John Smith",
      image: "/JohnSmith.jpg",
    },
    {
      quote: "I love the budgeting suggestions and the ability to connect all my bank accounts in one place.",
      author: "Emily White",
      image: "/EmilyWhite.jpg",
    },
    {
      quote: "The transaction tracking is seamless, and the categorization saves me so much time.",
      author: "Michael Brown",
      image: "/MichaelBrown.jpg",
    },
    {
      quote: "I've never felt more in control of my finances. Highly recommend this app!",
      author: "Sarah Johnson",
      image: "/SarahJohnson.jpg",
    },
  ]

  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: false }))

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground">
        <div className="absolute inset-0">
          <ThreeDScene />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Master Your Finances with AI
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-balance text-primary-foreground/90">
            Unlock intelligent insights, effortless budgeting, and seamless transaction tracking with our cutting-edge
            AI-powered personal finance tracker.
          </p>
          <div className="mt-10 flex gap-4">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link href="/transactions">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-background text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
            Powerful Features at Your Fingertips
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience a new way to manage your money with our innovative tools.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Smart Categorization"
              description="AI automatically categorizes your expenses for effortless tracking."
              iconImage="/smart-categorization.svg"
              iconAlt="Smart Categorization Icon"
            />
            <FeatureCard
              title="Financial Forecasting"
              description="Predict future trends and plan your savings with advanced AI models."
              iconImage="/financial-forecasting.svg"
              iconAlt="Financial Forecasting Icon"
            />
            <FeatureCard
              title="Personalized Budgeting"
              description="Receive intelligent budget suggestions tailored to your spending habits."
              iconImage="/personalized-budgeting.svg"
              iconAlt="Personalized Budgeting Icon"
            />
            <FeatureCard
              title="Bank Connectivity"
              description="Securely connect all your bank accounts for a unified financial view."
              iconImage="/bank-connectivity.svg"
              iconAlt="Bank Connectivity Icon"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="w-full py-20 bg-muted text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">What Our Users Say</h2>
          <p className="mt-4 text-center text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from people who have transformed their financial lives.
          </p>
          <div className="mt-12">
            <Carousel
              plugins={[plugin.current]}
              className="w-full max-w-5xl mx-auto"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="overflow-hidden p-0">
                        <div className="relative aspect-square w-full h-full">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.author}
                            fill
                            className="object-cover w-full h-full"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white text-sm font-medium leading-relaxed mb-1">{`\"${testimonial.quote}\"`}</p>
                            <p className="text-white/90 text-xs font-medium">- {testimonial.author}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>
    </main>
  )
}
