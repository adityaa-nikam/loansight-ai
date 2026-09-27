import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Brain,
  Clock,
  FileSearch,
  CheckCircle2,
  Zap,
  Lock,
  Eye,
  BarChart3,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import HeroVisualization from '../components/ui/HeroVisualization';
import { ROUTES } from '../constants/routes';
import { useLanguage } from '../context/LanguageContext';

export default function Landing() {
  const { t } = useLanguage();

  const trustItems = [
    { icon: Shield, label: t('trust_security', 'Bank-grade security') },
    { icon: Brain, label: t('trust_ai', 'AI-powered analysis') },
    { icon: Clock, label: t('trust_speed', '90% faster processing') },
  ];

  const howSteps = [
    {
      step: '01',
      title: t('step_1_title', 'Submit Application'),
      description: t('step_1_desc', 'Enter basic loan details and create your application in minutes.'),
    },
    {
      step: '02',
      title: t('step_2_title', 'Upload Documents'),
      description: t('step_2_desc', 'Upload salary slips, bank statements, and identity documents.'),
    },
    {
      step: '03',
      title: t('step_3_title', 'AI Analysis'),
      description: t('step_3_desc', 'Automated document verification, extraction, and cross-validation.'),
    },
    {
      step: '04',
      title: t('step_4_title', 'Decision'),
      description: t('step_4_desc', 'Explainable risk assessment and officer-assisted final decision.'),
    },
  ];

  const capabilities = [
    {
      icon: FileSearch,
      title: t('cap_doc_title', 'Document Intelligence'),
      description: t('cap_doc_desc', 'Automatic classification, OCR extraction, and structured data capture from financial documents.'),
    },
    {
      icon: CheckCircle2,
      title: t('cap_cross_title', 'Cross-Validation'),
      description: t('cap_cross_desc', 'Verify consistency across salary slips, bank statements, and tax documents automatically.'),
    },
    {
      icon: Zap,
      title: t('cap_extract_title', 'Instant Extraction'),
      description: t('cap_extract_desc', 'AI-powered parsing delivers structured financial data in seconds, not hours.'),
    },
    {
      icon: BarChart3,
      title: t('cap_risk_title', 'Risk Assessment'),
      description: t('cap_risk_desc', 'Comprehensive financial health analysis with explainable scoring methodology.'),
    },
  ];

  const securityItems = [
    { icon: Lock, title: t('sec_enc_title', 'Encrypted at Rest'), desc: t('sec_enc_desc', 'AES-256 document encryption') },
    { icon: Eye, title: t('sec_ai_title', 'Explainable AI'), desc: t('sec_ai_desc', 'Transparent decision reasoning') },
    { icon: Shield, title: t('sec_audit_title', 'Audit Trails'), desc: t('sec_audit_desc', 'Complete processing history') },
    { icon: CheckCircle2, title: t('sec_comp_title', 'Compliance'), desc: t('sec_comp_desc', 'RBI regulatory alignment') },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cream-200 rounded-full text-xs font-medium text-charcoal-600 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-success-600"></span>
                {t('now_accepting_apps', 'Now accepting applications')}
              </div>

              <h1 className="text-balance">
                <span className="block text-charcoal-900">{t('hero_title_1', 'Intelligent lending.')}</span>
                <span className="block text-charcoal-400 mt-1">{t('hero_title_2', 'Clearer decisions.')}</span>
              </h1>

              <p className="mt-6 text-lg text-charcoal-500 leading-relaxed max-w-lg">
                {t('hero_subtitle', 'AI-powered document intelligence for faster, explainable loan processing. From application to approval with confidence.')}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link to={ROUTES.APPLY}>
                  <Button size="lg">
                    {t('start_application', 'Start Application')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#platform">
                  <Button variant="secondary" size="lg">
                    {t('explore_platform', 'Explore Platform')}
                  </Button>
                </a>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <HeroVisualization />
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Indicators */}
      <div className="border-y border-cream-300/60 bg-white/50">
        <Container>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 py-6">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5 text-sm text-charcoal-500">
                  <Icon className="w-4 h-4 text-charcoal-400" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </Container>
      </div>

      {/* How It Works */}
      <Section id="how-it-works">
        <Container>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-3">
              {t('process_label', 'Process')}
            </p>
            <h2 className="text-charcoal-900 text-balance">{t('how_title', 'How LoanSight Works')}</h2>
            <p className="mt-4 text-charcoal-500 max-w-2xl mx-auto">
              {t('how_sub', 'A streamlined journey from application to decision, powered by intelligent document analysis.')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((item) => (
              <Card key={item.step} className="relative">
                <span className="text-3xl font-bold text-cream-300">{item.step}</span>
                <h3 className="text-base font-semibold text-charcoal-900 mt-3">{item.title}</h3>
                <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Capabilities */}
      <Section id="platform" className="bg-white/40">
        <Container>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-3">
              {t('capabilities_label', 'Capabilities')}
            </p>
            <h2 className="text-charcoal-900 text-balance">{t('capabilities_title', 'Core Platform Intelligence')}</h2>
            <p className="mt-4 text-charcoal-500 max-w-2xl mx-auto">
              {t('capabilities_sub', 'Purpose-built for financial document analysis and loan decision support.')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} glass className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cream-200 shrink-0">
                    <Icon className="w-5 h-5 text-charcoal-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-charcoal-900">{cap.title}</h3>
                    <p className="text-sm text-charcoal-500 mt-1.5 leading-relaxed">{cap.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Security */}
      <Section id="security">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-3">
                {t('sec_trust_label', 'Trust & Transparency')}
              </p>
              <h2 className="text-charcoal-900 text-balance">
                {t('sec_title', 'Secure by design. Explainable by principle.')}
              </h2>
              <p className="mt-4 text-charcoal-500 leading-relaxed">
                {t('sec_desc', 'Every decision is auditable. Every analysis is traceable. LoanSight AI is built on the principles of transparency, security, and responsible lending.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="p-4">
                    <Icon className="w-5 h-5 text-charcoal-600 mb-2.5" />
                    <p className="text-sm font-semibold text-charcoal-900">{item.title}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{item.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-charcoal-900">
        <Container>
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-cream-50 text-balance">
              {t('cta_title', 'Ready to modernize your lending process?')}
            </h2>
            <p className="mt-4 text-charcoal-300 leading-relaxed">
              {t('cta_desc', 'Start your first application today and experience intelligent document processing.')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to={ROUTES.APPLY}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="!bg-cream-50 !text-charcoal-900 hover:!bg-white"
                >
                  {t('start_application', 'Start Application')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="!text-charcoal-300 hover:!text-cream-50 hover:!bg-charcoal-800"
                >
                  {t('sign_in', 'Sign In')}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
