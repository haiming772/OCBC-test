import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Use the profile page to request an SMS OTP in this mock experience, or contact our hotline for live banking.'
  },
  {
    question: 'What browsers are supported?',
    answer: 'Latest Chrome, Edge, and Safari with cookies enabled.'
  },
  {
    question: 'Is this a real banking site?',
    answer: 'No, this is a demo for showcasing accessibility and flows.'
  }
];

export default function SupportPage() {
  return (
    <div>
      <PageHeader title="Support" description="Find quick answers or contact us" />
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.question} title={faq.question}>
            <p className="text-sm text-gray-600">{faq.answer}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6" title="Need more help?">
        <p className="text-sm text-gray-600">
          Call our hotline at <span className="font-semibold">1800 363 3333</span> or email{' '}
          <a
            href="mailto:support@accesspilot.local"
            className="text-[color:var(--ocbc-red)]"
            data-testid="link-support-email"
          >
            support@accesspilot.local
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
