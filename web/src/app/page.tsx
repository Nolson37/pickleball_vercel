"use client"

import { useEffect } from "react"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Header } from "@/components/marketing/header"
import { Hero } from "@/components/marketing/hero"
import { Features } from "@/components/marketing/features"
import { Testimonials } from "@/components/marketing/testimonials"
import { RegistrationForm } from "@/components/marketing/registration-form"
import { Footer } from "@/components/marketing/footer"

// Get tracer for landing page
const tracer = trace.getTracer('page-landing', '1.0.0')

export default function Home() {
  // Trace page load
  useEffect(() => {
    tracer.startActiveSpan('page-home', (span) => {
      span.setAttributes({
        'page.route': '/',
        'page.title': 'Home',
        'page.type': 'landing',
        'user.authenticated': false,
        'page.marketing': true,
        'page.sections': ['hero', 'features', 'testimonials', 'registration']
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <RegistrationForm />
      </main>
      <Footer />
    </div>
  )
}
