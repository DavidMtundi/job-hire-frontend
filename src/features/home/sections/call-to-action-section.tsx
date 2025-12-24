
import Link from 'next/link'
import { Button } from '~/components/ui/button'

export const CallToActionSection = () => {
  return (
    <section className="py-20 px-4 bg-primary/80 text-primary-foreground">
      <div className="container mx-auto text-center max-w-3xl space-y-4">
        <h2 className="text-4xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-xl mb-8">
          Join thousands of professionals who found their dream jobs through our platform
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">
              Create Free Account
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/jobs">
              Browse All Jobs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
