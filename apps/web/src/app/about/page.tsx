"use client"

import { useRouter } from "next/navigation"
import {
  Target,
  Eye,
  Users,
  Award,
  TrendingUp,
  Globe,
  Heart,
  Lightbulb
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen">

      <section className="pt-32 pb-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Revolutionizing Last-Mile Delivery
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              We're building the infrastructure that powers seamless deliveries for businesses across the region,
              so they can focus on what they do best while we handle the logistics.
            </p>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Delivery Link was born from a simple observation: businesses were spending too much time,
                  money, and energy managing their own delivery operations when they should be focused on
                  growing their core business.
                </p>
                <p>
                  We saw stores struggling with unreliable delivery partners, companies building expensive
                  in-house logistics teams, and customers waiting longer than necessary for their orders.
                  We knew there had to be a better way.
                </p>
                <p>
                  Today, we're proud to be the delivery infrastructure that hundreds of businesses rely on.
                  From local shops to growing e-commerce brands, we handle millions of deliveries with the
                  same care and professionalism every single time.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">10K+</div>
                  <div className="text-sm opacity-90">Deliveries</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary text-secondary-foreground">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-sm opacity-90">Businesses</div>
                </CardContent>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-sm opacity-90">Riders</div>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">98%</div>
                  <div className="text-sm text-muted-foreground">On-Time Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg text-primary">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To empower businesses of all sizes with world-class delivery infrastructure,
                  enabling them to provide exceptional customer experiences without the complexity
                  and cost of managing logistics themselves.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg text-primary">
                  <Eye className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the most trusted delivery partner across the region, known for reliability,
                  innovation, and exceptional service. We envision a future where every business can
                  offer same-day delivery as easily as they manage their inventory.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon={<Award className="h-6 w-6" />}
              title="Excellence"
              description="We set high standards and consistently deliver on our promises"
            />
            <ValueCard
              icon={<Heart className="h-6 w-6" />}
              title="Customer First"
              description="Every decision we make prioritizes the success of our partners"
            />
            <ValueCard
              icon={<Lightbulb className="h-6 w-6" />}
              title="Innovation"
              description="We constantly improve and adapt to serve our clients better"
            />
            <ValueCard
              icon={<Users className="h-6 w-6" />}
              title="Integrity"
              description="We operate with transparency, honesty, and accountability"
            />
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Businesses Choose Us
            </h2>
            <p className="text-muted-foreground text-lg">
              We're more than just a delivery service
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ReasonCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Scalable Infrastructure"
              description="From 10 deliveries a day to 1,000, our platform grows with your business without you lifting a finger."
            />
            <ReasonCard
              icon={<Globe className="h-8 w-8" />}
              title="Wide Coverage"
              description="We deliver across the entire region with a network of trained riders ready to serve your customers."
            />
            <ReasonCard
              icon={<Award className="h-8 w-8" />}
              title="Proven Reliability"
              description="With a 98% on-time delivery rate, your customers get their orders when promised, every time."
            />
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built by a Dedicated Team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our team combines expertise in logistics, technology, and customer service to create
              a delivery experience that businesses and customers love.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4 w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Operations Team</h3>
                <p className="text-sm text-muted-foreground">
                  Ensuring every delivery runs smoothly 24/7
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4 w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                  <Lightbulb className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tech Team</h3>
                <p className="text-sm text-muted-foreground">
                  Building the platform that powers seamless deliveries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4 w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Support Team</h3>
                <p className="text-sm text-muted-foreground">
                  Always here to help when you need us
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Deliveries?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join the growing network of businesses that trust Delivery Link with their most important asset: customer satisfaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-base px-8"
                  onClick={() => router.push("/dashboard/start-order")}
                >
                  Start Your First Order
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8"
                  onClick={() => router.push("/contact")}
                >
                  Get in Touch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function ValueCard({ icon, title, description }: any) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function ReasonCard({ icon, title, description }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
