'use client';

import { clinic, type Locale } from '../lib/clinic';
import TrackedLink from './TrackedLink';

export default function SiteHeader({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const isEnglish = locale === 'en';
  const home = isEnglish ? '/en' : '/';

  const navLinks = [
    { href: `${home}#diagnostic`, label: isEnglish ? 'Treatment Method' : '치료 방식' },
    { href: `${home}#treatments`, label: isEnglish ? 'Treatments' : '진료 분야' },
    { href: `${home}#space`, label: isEnglish ? 'Space' : '공간' },
    { href: `${home}#directions`, label: isEnglish ? 'Directions' : '오시는 길' },
    { href: '/columns', label: isEnglish ? 'Columns' : '칼럼' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#')) {
      const hash = href.split('#')[1];
      const target = document.getElementById(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${hash}`);
      }
    }
  };

  return (
    <header className={`site-header${compact ? ' site-header-compact' : ''}`}>
      <div className="header-top-row">
        <a className="brand-mark" href={home} aria-label={isEnglish ? 'ORB home' : '오브한의원 홈'}>
          <span>ORB</span>
        </a>
        <nav className="desktop-nav" aria-label={isEnglish ? 'Main navigation' : '주요 메뉴'}>
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
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
      </div>

      {/* Mobile Tab Navigation (768px 이하 가로 1열 탭) */}
      <nav className="mobile-tab-nav" aria-label={isEnglish ? 'Mobile navigation tabs' : '모바일 메뉴'}>
        <div className="mobile-tab-scroll">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mobile-tab-link"
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
