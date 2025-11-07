"use client"

import { useRouter } from "next/navigation"
import {
  Package,
  Shield,
  CheckCircle,
  Clock,
  Zap,
  Bell,
  BarChart3,
  Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen">

      <section className="pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium text-primary">
                Delivery Infrastructure for Modern Businesses
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Focus on Your Business,
              <br />
              We'll Handle the Deliveries
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete delivery solution for stores and companies. Start orders in seconds,
              track in real-time, and let our professional riders handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-base px-8"
                onClick={() => router.push("/start-order")}
              >
                Start Your First Order
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                onClick={() => router.push("/track-order")}
              >
                Track an Order
              </Button>
            </div>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Fast, Reliable
            </h2>
            <p className="text-muted-foreground text-lg">
              Three steps to complete delivery infrastructure
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Start Order"
              description="Enter pickup and delivery details through our simple interface. Takes less than 2 minutes."
              icon={<Package className="h-8 w-8" />}
            />
            <StepCard
              number="02"
              title="We Dispatch"
              description="Our system automatically assigns the nearest available rider to pick up your package."
              icon={<Shield className="h-8 w-8" />}
            />
            <StepCard
              number="03"
              title="Track & Deliver"
              description="Monitor real-time progress and get notifications. Your customer receives their order safely."
              icon={<CheckCircle className="h-8 w-8" />}
            />
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional delivery infrastructure without the overhead
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Real-Time Tracking"
              description="Track every delivery from pickup to doorstep with live GPS updates"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Reliable Riders"
              description="Vetted, professional delivery partners you can trust"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant Dispatch"
              description="Orders are assigned to riders within minutes"
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Smart Notifications"
              description="Keep your customers informed at every step"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics Dashboard"
              description="Insights into delivery performance and customer satisfaction"
            />
            <FeatureCard
              icon={<Headphones className="h-6 w-6" />}
              title="24/7 Support"
              description="Our team is always here to help when you need us"
            />
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="10,000+" label="Deliveries Completed" />
            <StatCard number="500+" label="Active Businesses" />
            <StatCard number="98%" label="On-Time Delivery Rate" />
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Scale Your Deliveries?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of businesses that trust Delivery Link with their delivery operations.
                No setup fees, no long-term contracts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-base px-8"
                  onClick={() => router.push("/start-order")}
                >
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8"
                  onClick={() => router.push("/track-order")}
                >
                  Track an Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}


function StepCard({ number, title, description, icon }: any) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5 -mr-4 -mt-4">
          {number}
        </div>
        <div className="relative z-10">
          <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="mb-3 inline-block p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatCard({ number, label }: any) {
  return (
    <div>
      <div className="text-4xl md:text-5xl font-bold mb-2">{number}</div>
      <div className="text-primary-foreground/80">{label}</div>
    </div>
  )
}
