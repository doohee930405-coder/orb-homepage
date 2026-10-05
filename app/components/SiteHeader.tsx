import Link from 'next/link';
import { clinic, type Locale } from '../lib/clinic';
import TrackedLink from './TrackedLink';

export default function SiteHeader({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const isEnglish = locale === 'en';
  const home = isEnglish ? '/en' : '/';

  return (
    <header className={`site-header${compact ? ' site-header-compact' : ''}`}>
      <a className="brand-mark" href={home} aria-label={isEnglish ? 'ORB home' : '오브한의원 홈'}>
        <span>ORB</span>
      </a>
      <nav className="desktop-nav" aria-label={isEnglish ? 'Main navigation' : '주요 메뉴'}>
        <a href={`${home}#diagnostic`}>{isEnglish ? 'Diagnostics' : '진단 기술'}</a>
        <a href={`${home}#treatments`}>{isEnglish ? 'Treatments' : '진료 분야'}</a>
        <a href={`${home}#space`}>{isEnglish ? 'Space' : '공간'}</a>
        <a href={`${home}#directions`}>{isEnglish ? 'Directions' : '오시는 길'}</a>
        <Link href="/columns">{isEnglish ? 'Columns' : '칼럼'}</Link>
      </nav>
      <div className="header-utilities">
        <a href={isEnglish ? '/' : '/en'} hrefLang={isEnglish ? 'ko' : 'en'}>
          {isEnglish ? 'KR' : 'EN'}
        </a>
        <TrackedLink
          className="header-booking"
          href={clinic.naverBookingUrl}
          target="_blank"
          rel="noreferrer"
          eventName="booking_click"
          eventLabel={isEnglish ? 'Header reservation' : '헤더 예약'}
        >
          {isEnglish ? 'Reserve' : '예약하기'}
        </TrackedLink>
      </div>
    </header>
  );
}
