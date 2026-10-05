import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy and analytics information for the ORB Korean Medicine Clinic website.',
  alternates: { canonical: '/en/privacy', languages: { ko: '/privacy', en: '/en/privacy' } },
};

export default function EnglishPrivacyPage() {
  return (
    <main className="site-shell policy-page" lang="en">
      <SiteHeader locale="en" compact />
      <article className="policy-content">
        <p className="eyebrow">PRIVACY</p>
        <h1>Privacy notice</h1>
        <p className="policy-date">Effective October 2, 2026</p>
        <section>
          <h2>Information collected on this website</h2>
          <p>This website does not operate a consultation form or user account system. Reservations open in Naver Booking, and phone inquiries use your device&apos;s calling function.</p>
        </section>
        <section>
          <h2>Website analytics</h2>
          <p>Google Analytics 4 is used to understand visits and improve the website. Information such as device environment, pages viewed, and referral source may be processed under Google&apos;s policies.</p>
        </section>
        <section>
          <h2>External services</h2>
          <p>When you open Naver Booking or Naver, Kakao, or Google Maps, the privacy policy of that service applies.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>For website privacy inquiries, call ORB Korean Medicine Clinic Magok at 02-6959-5982.</p>
        </section>
        <Link className="back-link" href="/en">← Back to home</Link>
      </article>
    </main>
  );
}
