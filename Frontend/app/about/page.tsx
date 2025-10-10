"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/transactions')
  }

  const handleLearnMore = () => {
    router.push('/')
  }

  return (
    <main className="flex flex-col">
      {/* Full-screen Video Section with Overlay */}
      <section className="relative w-full h-screen overflow-hidden">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/AboutUs.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12 lg:p-16">
          {/* Top Section - Project Name */}
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-lg md:text-xl font-semibold tracking-wider uppercase mb-4">
                AI FINANCE TRACKER
              </h2>
            </div>
            
            {/* Logo placeholder - you can replace with your actual logo */}
            <div className="text-white">
              <div className="text-4xl md:text-6xl font-bold tracking-tight">
                AFT
              </div>
            </div>
          </div>
          
          {/* Center Section - Main Message */}
          <div className="flex-1 flex items-center">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                <span className="block">Intelligent Insights</span>
                <span className="block">Financial Freedom</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl">
                Every day, we harness the power of artificial intelligence to deliver personalized financial guidance. 
                Our sole focus is empowering users by providing smart categorization, accurate forecasting, and 
                intelligent budgeting solutions to help you achieve your financial goals with confidence.
              </p>
            </div>
          </div>
          
          {/* Bottom Section - Video Controls */}
          <div className="flex justify-end">
            <button className="bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-4 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Hero Text Section Below Video */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              About Our Finance Tracker
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Empowering financial freedom through intelligent AI-driven insights and cutting-edge technology.
            </p>
          </div>
        </div>
      </section>

      {/* Rest of the content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Mission and Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-lg">
                At AI Finance Tracker, our mission is to empower individuals to achieve financial freedom through
                intelligent, AI-driven insights. We believe that managing personal finances should be intuitive,
                insightful, and accessible to everyone. By leveraging cutting-edge artificial intelligence, we provide
                personalized budgeting, accurate forecasting, and smart categorization to help you make informed financial
                decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-foreground">Smart Categorization:</strong>
                    <span className="text-muted-foreground"> AI automatically organizes your transactions.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-foreground">Financial Forecasting:</strong>
                    <span className="text-muted-foreground"> Predict future spending and savings trends.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-foreground">Personalized Budgeting:</strong>
                    <span className="text-muted-foreground"> Receive tailored budget suggestions.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-foreground">Secure Bank Connectivity:</strong>
                    <span className="text-muted-foreground"> Connect all your accounts in one place.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-foreground">Interactive Analytics:</strong>
                    <span className="text-muted-foreground"> Visualize your financial health with intuitive charts.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vision Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                We envision a world where everyone has the tools and knowledge to confidently manage their money, grow their
                wealth, and achieve their financial aspirations. Our platform is continuously evolving, integrating the latest
                AI advancements to provide you with the most powerful and user-friendly financial management experience.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">AI Accuracy Rate</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Financial Future?</h3>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Join thousands of users who are already taking control of their finances with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleGetStarted}
                  className="bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors"
                >
                  Get Started Today
                </button>
                <button 
                  onClick={handleLearnMore}
                  className="border border-primary-foreground/30 text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
