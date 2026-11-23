import type { Metadata } from 'next'
import Link from 'next/link'
import PrintButton from "./print-button"

export const metadata: Metadata = {
  title: 'Worldschooling maths activity: Sharing fairly',
  description: 'Try a short worldschooling maths lesson with a hands-on market activity and a printable worksheet for early learners.',
  alternates: { canonical: '/sample-lesson' },
  openGraph: {
    title: 'Worldschooling maths activity: Sharing fairly',
    description: 'A hands-on maths lesson and printable worksheet for travelling families.',
    url: '/sample-lesson',
  },
}

export default function SampleLesson() {
  return (
    <main style={{ maxWidth: 720, margin: 'auto', padding: '3rem 1.5rem', lineHeight: 1.6 }}>
      <style>{`@media print { .sample-actions { display: none } }`}</style>
      <nav className="sample-actions"><Link href="/landing">← Waypoint Education</Link></nav>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 700 }}>Worldschooling maths: Sharing fairly</h1>
      <p>A hands-on sample lesson for ages 5–6. Allow about 10 minutes.</p>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 20 }}>Try it together</h2>
      <p>Set out three plates and twelve large counters, blocks or pieces of fruit. Pretend three customers at a market want to share equally. Ask your child to give one to each customer in turn until none are left.</p>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 20 }}>Worksheet</h2>
      <ol style={{ listStyle: 'decimal', paddingLeft: 24 }}>
        <li>Draw three baskets. Share six mangoes equally by drawing a mango in each basket in turn.</li>
        <li>Share nine mangoes equally between three baskets. How many go in each basket?</li>
        <li>Draw a way to share twelve mangoes between three baskets. Show how you know it is fair.</li>
      </ol>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 20 }}>What to look for</h2>
      <p>Check that every basket gets the same number and all the mangoes are used. The answers are two, three and four in each basket.</p>
      <p className="sample-actions" style={{ marginTop: 24 }}><PrintButton /> · <Link href="/landing#pricing">See Waypoint plans</Link></p>
    </main>
  )
}
