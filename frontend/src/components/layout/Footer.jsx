import { Link } from 'react-router-dom';
import Container from './Container';
import BrandLogo from '../common/BrandLogo';
import { ROUTES } from '../../constants/routes';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t('platform', 'Platform')]: [
      { label: t('how_it_works', 'How It Works'), href: '#how-it-works' },
      { label: t('security', 'Security'), href: '#security' },
      { label: 'Documentation', href: '#' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    Legal: [
      { label: t('privacy_link', 'Privacy Policy'), href: '#' },
      { label: t('terms_link', 'Terms of Service'), href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-cream-300/60 bg-cream-100">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <BrandLogo to={ROUTES.HOME} variant="dark" size="sm" />
              <p className="mt-3 text-sm text-charcoal-500 leading-relaxed max-w-xs">
                {t('footer_tagline', 'AI-powered document intelligence for faster, explainable loan processing.')}
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold text-charcoal-900 mb-4">{heading}</h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-cream-300/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-charcoal-400">
              © {new Date().getFullYear()} LoanSight AI. All rights reserved.
            </p>
            <p className="text-xs text-charcoal-400">
              {t('built_for_lending', 'Built for intelligent lending.')}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
