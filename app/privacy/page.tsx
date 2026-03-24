import Link from 'next/link'

const PRIMARY = '#9B8EC4'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: TEXT, background: BEIGE }}>

      {/* Nav */}
      <nav style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Link href="/landing" style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: TEXT, textDecoration: 'none' }}>
          🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
        </Link>
        <Link href="/landing" style={{ fontSize: 14, fontWeight: 700, color: TEXT_MUTED, textDecoration: 'none' }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 40, marginBottom: 8, color: TEXT }}>Privacy Policy</h1>
        <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 48 }}>Last updated: 22 March 2026</p>

        <div style={{ background: BEIGE_CARD, borderRadius: 20, padding: '40px 48px', border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>

          <Section title="1. Who we are">
            <p>Waypoint Education is operated by Jonatan Ekström, an individual based in Sweden. You can reach us at <a href="mailto:jonatan.ekstrom@gmail.com" style={{ color: PRIMARY }}>jonatan.ekstrom@gmail.com</a>.</p>
            <p>This Privacy Policy explains what personal data we collect when you use Waypoint Education, why we collect it, and how we use it. It applies to all users of our website and application.</p>
          </Section>

          <Section title="2. What data we collect">
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong>Account data:</strong> Your email address and password (stored as a secure hash) when you create an account.</li>
              <li><strong>Child profile data:</strong> Your child's first name, age or year of birth, learning style preferences, and teaching philosophy — provided by you to generate lesson plans.</li>
              <li><strong>Location data:</strong> City or country you enter manually to tailor location-based lessons. We do not collect GPS or device location.</li>
              <li><strong>Usage data:</strong> Pages visited, lesson plans generated, worksheets completed, and other interactions within the app, used to improve the service.</li>
              <li><strong>Communications:</strong> Any emails or messages you send us.</li>
            </ul>
          </Section>

          <Section title="3. How we use your data">
            <p>We use your personal data to:</p>
            <ul>
              <li>Provide, operate, and maintain the Waypoint Education service.</li>
              <li>Generate AI-powered lesson plans and worksheets tailored to your child.</li>
              <li>Send service-related communications such as account confirmations and support replies.</li>
              <li>Improve and develop new features based on anonymised usage patterns.</li>
              <li>Comply with our legal obligations under Swedish and EU law.</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal data to third parties, and we do not use it for advertising purposes.</p>
          </Section>

          <Section title="4. Legal basis for processing (GDPR)">
            <p>We process your personal data on the following legal bases under the General Data Protection Regulation (GDPR):</p>
            <ul>
              <li><strong>Contract performance:</strong> Processing necessary to provide the service you signed up for.</li>
              <li><strong>Legitimate interests:</strong> Improving the service and preventing fraud, where these interests are not overridden by your rights.</li>
              <li><strong>Consent:</strong> Where you have given us explicit consent, such as for optional communications. You may withdraw consent at any time.</li>
              <li><strong>Legal obligation:</strong> Where we are required by law to process your data.</li>
            </ul>
          </Section>

          <Section title="5. Children's data">
            <p>Waypoint Education is a service for parents and guardians. We do not knowingly collect personal data directly from children. The child profile data you provide (name, age, preferences) is entered by you as the parent or guardian and is processed solely to personalise lesson content for your family.</p>
            <p>If you believe we have inadvertently collected personal data about a child without parental consent, please contact us and we will delete it promptly.</p>
          </Section>

          <Section title="6. Third-party services">
            <p>We use the following third-party services to operate Waypoint Education:</p>
            <ul>
              <li><strong>Supabase:</strong> Database and authentication infrastructure. Data is stored on servers within the EU.</li>
              <li><strong>Anthropic (Claude):</strong> AI model used to generate lesson plans and worksheets. Prompts may include child age, location, and learning preferences but not names or identifying information unless you include them in free-text fields.</li>
              <li><strong>Vercel:</strong> Hosting and deployment infrastructure.</li>
            </ul>
            <p>Each of these providers has their own privacy policy and is bound by data processing agreements where required by GDPR.</p>
          </Section>

          <Section title="7. Data retention">
            <p>We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it longer by law.</p>
            <p>Anonymised, aggregated usage statistics may be retained indefinitely.</p>
          </Section>

          <Section title="8. Your rights">
            <p>Under the GDPR, you have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong>Rectification:</strong> Ask us to correct inaccurate data.</li>
              <li><strong>Erasure:</strong> Request that we delete your data ("right to be forgotten").</li>
              <li><strong>Restriction:</strong> Ask us to limit how we process your data.</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:jonatan.ekstrom@gmail.com" style={{ color: PRIMARY }}>jonatan.ekstrom@gmail.com</a>. We will respond within 30 days.</p>
            <p>You also have the right to lodge a complaint with the Swedish supervisory authority, <strong>Integritetsskyddsmyndigheten (IMY)</strong>, at <a href="https://www.imy.se" style={{ color: PRIMARY }} target="_blank" rel="noopener noreferrer">imy.se</a>.</p>
          </Section>

          <Section title="9. Cookies">
            <p>We use only essential cookies required for authentication and session management. We do not use tracking or advertising cookies. No cookie consent banner is required for essential cookies under Swedish law.</p>
          </Section>

          <Section title="10. Security">
            <p>We take reasonable technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. These include encrypted data transmission (HTTPS), hashed password storage, and access controls.</p>
            <p>No system is completely secure. If you become aware of a security concern related to our service, please notify us promptly at <a href="mailto:jonatan.ekstrom@gmail.com" style={{ color: PRIMARY }}>jonatan.ekstrom@gmail.com</a>.</p>
          </Section>

          <Section title="11. Changes to this policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by a prominent notice within the app. Continued use of the service after changes take effect constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="12. Contact">
            <p>For any questions or concerns about this Privacy Policy or how we handle your data, contact:</p>
            <p style={{ marginTop: 12 }}>
              <strong>Jonatan Ekström</strong><br />
              Waypoint Education<br />
              Sweden<br />
              <a href="mailto:jonatan.ekstrom@gmail.com" style={{ color: PRIMARY }}>jonatan.ekstrom@gmail.com</a>
            </p>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <div style={{ background: TEXT, padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
        <p style={{ color: '#9E9188', fontSize: 13, marginTop: 8, marginBottom: 12 }}>© 2026 Waypoint Education · The world is their classroom.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#2D2D2D', marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid #E8E2D9` }}>{title}</h2>
      <div style={{ fontSize: 15, lineHeight: 1.8, color: '#2D2D2D' }}>
        {children}
      </div>
    </div>
  )
}
