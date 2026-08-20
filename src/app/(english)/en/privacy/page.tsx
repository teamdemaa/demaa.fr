import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPageLayout, { LegalSection as PrivacySection } from "@/components/LegalPageLayout";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { LEGAL } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/en/privacy",
    languages: {
      en: "/en/privacy",
      fr: "/politique-de-confidentialite",
    },
  },
  description: "How Demaa collects, uses and protects personal data.",
  robots: { follow: false, index: false },
  title: "Privacy policy - Demaa",
};

export default function EnglishPrivacyPage() {
  if (!isEnglishBetaEnabled()) notFound();

  return (
    <LegalPageLayout
      localeCode="en"
      title="Privacy"
      titleAccent="policy"
      description="This page explains what data Demaa collects, why it is used and how you can exercise your rights."
    >
      <PrivacySection title="1. Data controller">
        <p>
          The data controller is <strong>{LEGAL.legalEntityName}</strong>, a French sole trader operating under the <strong>{LEGAL.brandName}</strong> brand.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Email:</strong> {LEGAL.email}</li>
          <li><strong>Phone:</strong> {LEGAL.phone}</li>
          <li><strong>SIREN:</strong> {LEGAL.siren}</li>
          <li><strong>VAT number:</strong> {LEGAL.vatNumber}</li>
          <li><strong>Address:</strong> {LEGAL.address}</li>
        </ul>
      </PrivacySection>

      <PrivacySection title="2. Data we collect">
        <p>Depending on the Demaa features you use, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>your name, email address, phone number, company and business activity;</li>
          <li>your member language preference and, when provided, your company&apos;s market, country and currency context;</li>
          <li>the situation, requests and business information you submit to create or edit an action plan;</li>
          <li>saved plans, their content language and creation market;</li>
          <li>monthly Key figures and Strategy cycle answers belonging to your company;</li>
          <li>messages and drafts sent through Talk to us, together with their language and attribution context;</li>
          <li>service requests, the selected service or package and the context in which the request was made;</li>
          <li>Stripe customer and subscription status information when you use a paid offer, but never your full card number;</li>
          <li>technical, security, audience and attribution data, subject to your consent where required.</li>
        </ul>
      </PrivacySection>

      <PrivacySection title="3. Why we use this data">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Provide requested features:</strong> create, save and retrieve plans, company data, conversations and service requests.</li>
          <li><strong>Generate an action plan:</strong> process the situation you submit after authentication. No plan is generated before your Demaa session is created.</li>
          <li><strong>Support and pre-contractual discussions:</strong> answer questions, qualify a service request and organise the next step.</li>
          <li><strong>Payments and subscriptions:</strong> manage eligible paid services and confirm subscription status on the server.</li>
          <li><strong>Security, maintenance and analytics:</strong> protect and improve the service, with prior consent for optional analytics or advertising trackers.</li>
        </ul>
        <p>
          Key figures and Strategy answers are company data and are not sent to the AI action-plan generation service.
        </p>
      </PrivacySection>

      <PrivacySection title="4. Providers and recipients">
        <p>Only authorised Demaa personnel and providers needed to operate the service may access relevant data. These providers include:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Vercel</strong> for hosting and audience measurement;</li>
          <li><strong>Google Firebase, Firestore and Firebase Authentication</strong> for identity, secure sessions and application data;</li>
          <li><strong>Stripe</strong> for secure payments, billing and fraud prevention;</li>
          <li><strong>Resend</strong> for requested emails and contact management;</li>
          <li><strong>Vercel AI Gateway and Demaa&apos;s selected model provider, including OpenAI</strong>, for action-plan generation;</li>
          <li><strong>Slack</strong> for internal request notifications;</li>
          <li><strong>Google Analytics and Meta Pixel</strong> only when the corresponding consent has been given.</li>
        </ul>
      </PrivacySection>

      <PrivacySection title="5. Retention">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Contact, service and conversation records:</strong> up to three years after the last useful exchange, unless a legal obligation requires otherwise.</li>
          <li><strong>Saved plans:</strong> up to three years after their last update, then deletion or anonymisation.</li>
          <li><strong>Interrupted generation requests:</strong> up to 30 days for recovery and technical diagnosis.</li>
          <li><strong>Text prepared before authentication:</strong> up to two hours in the browser session, and removed earlier after creation or cancellation.</li>
          <li><strong>Company, membership and member language preference:</strong> while the relevant account or company exists, subject to legal retention duties.</li>
          <li><strong>Key figures and Strategy cycles:</strong> retained with the company, including archived cycles, until the company is effectively deleted.</li>
          <li><strong>Cookie choices:</strong> up to 180 days, or until the consent version changes.</li>
          <li><strong>Billing data:</strong> for the contractual relationship and applicable accounting and evidential periods.</li>
        </ul>
      </PrivacySection>

      <PrivacySection title="6. Your rights">
        <p>
          Subject to applicable law, you may request access, rectification, deletion, restriction, objection or portability, and may withdraw consent at any time when processing relies on consent.
        </p>
        <p>
          Contact <strong>{LEGAL.email}</strong> to exercise these rights. You may also lodge a complaint with the French data protection authority, the CNIL.
        </p>
      </PrivacySection>

      <PrivacySection title="7. International transfers">
        <p>
          Some providers may process data outside the European Union, including in the United States. Where required, transfers rely on recognised safeguards such as European Commission standard contractual clauses.
        </p>
      </PrivacySection>

      <PrivacySection title="8. Cookies and local storage">
        <p>
          Demaa uses necessary browser storage to provide the product and optional analytics or marketing trackers according to your choices. Optional trackers are not loaded before consent where consent is required.
        </p>
        <p>
          Before authentication, the situation prepared for an action plan and a technical request identifier may be held temporarily in session storage. No generated plan is stored there.
        </p>
      </PrivacySection>

      <PrivacySection title="9. Updates">
        <p>
          This policy may change to reflect updates to the product, its providers or applicable legal requirements.
        </p>
      </PrivacySection>
    </LegalPageLayout>
  );
}
