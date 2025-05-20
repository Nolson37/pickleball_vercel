import { Header } from "@/components/marketing/header"
import { Hero } from "@/components/marketing/hero"
import { Features } from "@/components/marketing/features"
import { Testimonials } from "@/components/marketing/testimonials"
import { RegistrationForm } from "@/components/marketing/registration-form"
import { Footer } from "@/components/marketing/footer"

export default function Home() {
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
