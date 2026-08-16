import type { AcademyContentDefinition, AcademyLesson } from "@/lib/academy-course-content";

type EnglishLessonSeed = Readonly<{
  body: string;
  steps: readonly [string, string, string];
  takeaway: string;
  title: string;
}>;

type EnglishQuizSeed = Readonly<{
  answer: string;
  explanation: string;
  question: string;
  wrong: string;
}>;

type EnglishCourseSeed = Readonly<{
  category: string;
  durationMinutes: number;
  lessons: readonly [EnglishLessonSeed, EnglishLessonSeed, EnglishLessonSeed, EnglishLessonSeed];
  promise: string;
  quiz: readonly [EnglishQuizSeed, EnglishQuizSeed, EnglishQuizSeed];
  recap: readonly [string, string, string, string];
  shortTitle: string;
  slug: string;
  title: string;
}>;

function toLesson(seed: EnglishLessonSeed, index: number): AcademyLesson {
  return {
    id: `lesson-${index + 1}`,
    type: index === 0 ? "concept" : index === 3 ? "decision" : "method",
    eyebrow: `Lesson ${index + 1} of 4`,
    title: seed.title,
    body: seed.body,
    visual: {
      type: "steps",
      data: {
        steps: seed.steps.map((title, stepIndex) => ({
          number: String(stepIndex + 1).padStart(2, "0"),
          title,
        })),
      },
    },
    takeaway: seed.takeaway,
  };
}

function createEnglishCourse(seed: EnglishCourseSeed): AcademyContentDefinition {
  return {
    version: "1.0",
    kind: "course",
    status: "ready",
    editorial: {
      courseId: seed.slug,
      contentVersion: "en-1.0",
      localeCode: "en",
      marketCodes: ["global-en-beta"],
      publicationStatus: "published",
    },
    identity: {
      slug: seed.slug,
      title: seed.title,
      shortTitle: seed.shortTitle,
      category: seed.category,
      promise: seed.promise,
      audience: "Small business owners",
      durationMinutes: seed.durationMinutes,
      card: {
        section: "Business fundamentals",
        title: seed.shortTitle,
        meta: `${seed.durationMinutes} min · Knowledge quiz`,
        image: null,
        imageAlt: "",
      },
    },
    outline: seed.lessons.slice(0, 3).map((lesson) => ({
      title: lesson.title,
      description: lesson.takeaway,
    })),
    lessons: seed.lessons.map(toLesson),
    recap: {
      title: "The course in four points",
      points: [...seed.recap],
    },
    quiz: {
      title: "Check your understanding",
      questions: seed.quiz.map((item, index) => ({
        id: `question-${index + 1}`,
        question: item.question,
        choices: [
          { id: "correct", label: item.answer },
          { id: "wrong", label: item.wrong },
        ],
        correctChoiceId: "correct",
        explanation: item.explanation,
      })),
    },
    action: null,
  };
}

const ENGLISH_COURSE_SEEDS: readonly EnglishCourseSeed[] = [
  {
    slug: "piloter-sa-tresorerie",
    title: "Manage cash flow before it becomes urgent",
    shortTitle: "Cash flow",
    category: "Finance",
    durationMinutes: 8,
    promise: "Understand why a profitable business can run short of cash and spot pressure before it becomes urgent.",
    lessons: [
      { title: "Profit and cash are different", body: "Profit measures whether the business earned more than it spent over a period. Cash shows what is actually available in the bank today. A profitable sale can therefore create a short-term cash gap.", steps: ["Record the sale", "Pay operating costs", "Collect the customer payment"], takeaway: "A profitable business can still run out of available cash." },
      { title: "Timing creates the cash gap", body: "Invoices may be paid weeks after the work is delivered, while payroll, suppliers and subscriptions are paid earlier. The gap is working capital that the business must finance.", steps: ["Date expected receipts", "Date committed payments", "Find the lowest balance"], takeaway: "Cash pressure is often a timing problem before it is a profitability problem." },
      { title: "Use a rolling forecast", body: "A useful forecast starts with today’s balance and maps realistic receipts and payments over the next thirteen weeks. Update it every week rather than trying to predict the year perfectly.", steps: ["Start with the bank balance", "Add dated cash movements", "Review every week"], takeaway: "A short rolling forecast turns uncertainty into decisions." },
      { title: "Act before the low point", body: "Invoice promptly, request deposits where appropriate, follow up overdue payments and reschedule non-critical spending before the projected low point arrives.", steps: ["Invoice earlier", "Collect earlier", "Move optional spending"], takeaway: "The forecast matters only when it changes a decision early enough." },
    ],
    recap: ["Profit and cash answer different questions.", "Payment timing creates working-capital pressure.", "A thirteen-week forecast makes the low point visible.", "Earlier invoicing, collection and decisions protect cash."],
    quiz: [
      { question: "Which figure shows what the business can pay today?", answer: "Available cash", wrong: "Revenue invoiced this month", explanation: "Available cash reflects money that is actually accessible now." },
      { question: "Why can growth put pressure on cash?", answer: "More work may be funded before customers pay", wrong: "Growth automatically removes profit", explanation: "More sales can require more costs to be paid before receipts arrive." },
      { question: "What should a rolling cash forecast highlight?", answer: "The projected lowest balance and its date", wrong: "Only the largest customer invoice", explanation: "The lowest point shows when action may be required." },
    ],
  },
  {
    slug: "comprendre-chiffre-affaires-benefice",
    title: "Understand revenue, margin and profit",
    shortTitle: "Revenue and profit",
    category: "Finance",
    durationMinutes: 7,
    promise: "Read the few numbers that show whether sales are creating enough value for the business.",
    lessons: [
      { title: "Revenue is not earnings", body: "Revenue is the value sold before costs. It can grow while the business becomes less profitable if delivery, labour or acquisition costs rise faster.", steps: ["Measure revenue", "Subtract direct costs", "Review what remains"], takeaway: "Higher revenue is useful only when enough value remains after costs." },
      { title: "Contribution funds the business", body: "After direct costs, the remaining contribution pays fixed costs and then creates profit. Track this amount by offer, not only for the company as a whole.", steps: ["Group direct costs", "Calculate contribution", "Compare offers"], takeaway: "Contribution reveals which offers genuinely support the business." },
      { title: "Fixed costs set the threshold", body: "Rent, salaries, software and other recurring commitments continue even when sales slow down. Your break-even point is the revenue required to cover them at your normal margin.", steps: ["List recurring costs", "Use a realistic margin", "Estimate break-even revenue"], takeaway: "Break-even turns a vague sales goal into a financial minimum." },
      { title: "Review trends, not isolated months", body: "One month can be distorted by timing. Compare several months and investigate changes in revenue, contribution and fixed costs before reacting.", steps: ["Compare three months", "Explain the variation", "Choose one corrective action"], takeaway: "A trend with an explanation is more useful than a single number." },
    ],
    recap: ["Revenue measures sales before costs.", "Contribution shows what is left after direct costs.", "Fixed costs determine the break-even threshold.", "Trends reveal whether performance is improving."],
    quiz: [
      { question: "What remains after direct costs are deducted from revenue?", answer: "Contribution", wrong: "Cash balance", explanation: "Contribution is available to cover fixed costs and profit." },
      { question: "Can revenue rise while profit falls?", answer: "Yes, if costs or the sales mix deteriorate", wrong: "No, revenue growth always raises profit", explanation: "Revenue alone does not show how much value remains." },
      { question: "Why review several months together?", answer: "To distinguish a trend from timing noise", wrong: "To avoid explaining any variation", explanation: "A longer view makes isolated timing effects less misleading." },
    ],
  },
  {
    slug: "fixer-ses-prix-sans-vendre-a-perte",
    title: "Set prices without selling at a loss",
    shortTitle: "Pricing",
    category: "Finance",
    durationMinutes: 9,
    promise: "Set a defensible price that covers delivery, overhead and the value your business needs to retain.",
    lessons: [
      { title: "Know the full cost to serve", body: "Include direct purchases, delivery time, commissions and a fair share of recurring overhead. Missing one of these costs creates a false margin.", steps: ["Direct purchases", "Delivery time", "Allocated overhead"], takeaway: "A price floor starts with the complete cost to deliver." },
      { title: "Separate the floor from the target", body: "The floor prevents a loss. The target price must also fund commercial effort, improvement, risk and profit. Do not treat the floor as the normal selling price.", steps: ["Calculate the floor", "Add required margin", "Set the target"], takeaway: "The minimum viable price and the right commercial price are not the same." },
      { title: "Price the result and the scope", body: "Customers compare prices more fairly when the promised result, boundaries and responsibilities are explicit. A vague scope turns every price discussion into a negotiation.", steps: ["Name the result", "Define what is included", "State what is excluded"], takeaway: "Clear scope makes a price easier to understand and defend." },
      { title: "Test with real sales evidence", body: "Track acceptance, delivery effort and margin by offer. Adjust from evidence rather than lowering the price after one objection.", steps: ["Track acceptance", "Measure delivery effort", "Review margin"], takeaway: "Pricing improves through controlled evidence, not reactive discounting." },
    ],
    recap: ["The full delivery cost defines the floor.", "The target price must fund more than delivery.", "A clear result and scope make the price understandable.", "Acceptance and margin data guide future changes."],
    quiz: [
      { question: "What is the role of a price floor?", answer: "Prevent the offer from being sold at a loss", wrong: "Guarantee that every prospect buys", explanation: "The floor covers the full minimum cost of delivery." },
      { question: "Why state exclusions?", answer: "To protect scope and make comparisons clearer", wrong: "To make the offer deliberately confusing", explanation: "Boundaries reduce hidden work and misunderstandings." },
      { question: "What evidence should guide a price review?", answer: "Acceptance, effort and margin", wrong: "One isolated objection", explanation: "Several operational and commercial signals are more reliable than one reaction." },
    ],
  },
  {
    slug: "construire-systeme-marketing-vente",
    title: "Build a simple marketing and sales system",
    shortTitle: "Marketing and sales",
    category: "Growth",
    durationMinutes: 8,
    promise: "Connect visibility, trust, conversion and follow-up into one repeatable path to revenue.",
    lessons: [
      { title: "Start with one priority customer", body: "A system becomes coherent when it is designed for a specific customer, problem and buying context. Broad messages create activity without enough relevance.", steps: ["Choose the customer", "Name the urgent problem", "Define the buying context"], takeaway: "Specificity is the foundation of an efficient marketing system." },
      { title: "Give each channel one job", body: "A channel may create discovery, proof, conversation or conversion. Expecting every channel to do everything makes performance impossible to diagnose.", steps: ["Attract attention", "Build confidence", "Create a next step"], takeaway: "Clear channel roles make the system measurable and easier to improve." },
      { title: "Design the next step", body: "Every useful piece of content or outreach should lead to one appropriate action: a reply, a call, a diagnostic or a purchase. Remove competing calls to action.", steps: ["Match intent", "Offer one next step", "Capture the response"], takeaway: "Marketing creates value when it moves the right person forward." },
      { title: "Review the whole path", body: "Measure where qualified people enter, where they stop and what becomes revenue. Improve the weakest transition before adding more channels.", steps: ["Track qualified demand", "Find the drop-off", "Improve one transition"], takeaway: "Fixing a weak conversion step often beats generating more traffic." },
    ],
    recap: ["Focus the system on one priority customer.", "Give each channel a clear role.", "Offer one relevant next step.", "Improve the weakest transition in the path."],
    quiz: [
      { question: "What should define a marketing system first?", answer: "A priority customer and important problem", wrong: "The largest possible list of channels", explanation: "The customer and problem determine the right message and route." },
      { question: "Why give each channel one main job?", answer: "So its role and performance can be understood", wrong: "So the business never tests anything", explanation: "A clear role makes diagnosis and improvement possible." },
      { question: "What should be improved before adding traffic?", answer: "The weakest important transition", wrong: "Every channel at the same time", explanation: "Fixing the constraint improves the whole system more efficiently." },
    ],
  },
  {
    slug: "transformer-demande-en-client",
    title: "Turn enquiries into customers",
    shortTitle: "Enquiries to customers",
    category: "Sales",
    durationMinutes: 8,
    promise: "Respond, qualify and follow up consistently so that good enquiries do not disappear.",
    lessons: [
      { title: "Respond while intent is active", body: "A prompt, useful acknowledgement protects the opportunity and sets expectations. It does not need to solve everything immediately.", steps: ["Acknowledge quickly", "Confirm the need", "Set the next step"], takeaway: "Speed matters most when it creates a clear and useful next step." },
      { title: "Qualify before proposing", body: "Confirm the problem, desired result, timing, decision process and constraints. Qualification prevents unsuitable proposals and saves time for both sides.", steps: ["Understand the problem", "Confirm fit", "Map the decision"], takeaway: "A proposal should follow a fit decision, not replace it." },
      { title: "Make the proposal easy to decide", body: "Link the proposed work to the desired result, define the scope and explain what happens after acceptance. Remove avoidable ambiguity.", steps: ["Restate the result", "Define the scope", "Explain the start"], takeaway: "A clear proposal reduces decision effort without applying pressure." },
      { title: "Follow up with a reason", body: "Agree the next contact point and bring useful information when following up. A sequence of relevant follow-ups is more professional than repeated reminders.", steps: ["Agree a date", "Add useful context", "Close the loop"], takeaway: "Follow-up works best when it helps the buyer make a decision." },
    ],
    recap: ["Acknowledge enquiries promptly.", "Qualify the fit before proposing.", "Make scope and next steps easy to understand.", "Follow up with context and a clear close."],
    quiz: [
      { question: "What should an initial response achieve?", answer: "Acknowledge the enquiry and set a useful next step", wrong: "Deliver the whole service immediately", explanation: "The first response should protect momentum and clarify what happens next." },
      { question: "When should a proposal be prepared?", answer: "After the need and fit are understood", wrong: "Before asking any questions", explanation: "Qualification allows the proposal to reflect the actual decision." },
      { question: "What makes a follow-up useful?", answer: "Relevant context and an agreed next step", wrong: "Sending the same reminder every day", explanation: "Useful follow-up supports the buyer rather than adding pressure." },
    ],
  },
  {
    slug: "deleguer-sans-perdre-le-controle",
    title: "Delegate without losing control",
    shortTitle: "Delegation",
    category: "Operations",
    durationMinutes: 9,
    promise: "Transfer outcomes and decision boundaries so work can move forward without constant supervision.",
    lessons: [
      { title: "Delegate an outcome, not scattered tasks", body: "Define what good looks like, why it matters and when it is due. A list of isolated instructions leaves ownership with the manager.", steps: ["Name the outcome", "Define quality", "Set the deadline"], takeaway: "Ownership starts with a clear result, not a longer task list." },
      { title: "Set decision boundaries", body: "Explain what the person can decide, when they should inform you and what requires approval. Boundaries create autonomy without hidden risk.", steps: ["Decide independently", "Inform after action", "Ask before action"], takeaway: "Clear decision rights reduce both bottlenecks and surprises." },
      { title: "Transfer the minimum useful context", body: "Share examples, constraints, contacts and the source of truth. Avoid transferring every historical detail before work can start.", steps: ["Provide the standard", "Share key context", "Point to the source"], takeaway: "Useful context enables action; excessive context delays it." },
      { title: "Review through checkpoints", body: "Agree a small number of checkpoints based on risk and experience. Review the result and improve the system rather than taking the work back.", steps: ["Choose checkpoints", "Review evidence", "Improve the process"], takeaway: "Control should come from visibility and feedback, not constant intervention." },
    ],
    recap: ["Delegate a result with a quality standard.", "Make decision rights explicit.", "Transfer the context needed to act.", "Use checkpoints instead of permanent supervision."],
    quiz: [
      { question: "What creates genuine ownership?", answer: "A clear outcome and decision boundaries", wrong: "A long list of disconnected instructions", explanation: "The person needs to understand the result and what they can decide." },
      { question: "When should approval be required?", answer: "For decisions outside the agreed boundary", wrong: "For every small action", explanation: "Approval should protect meaningful risks without recreating the bottleneck." },
      { question: "What is the purpose of checkpoints?", answer: "Create visibility and feedback at the right moments", wrong: "Take the work back immediately", explanation: "Checkpoints preserve control while allowing ownership to develop." },
    ],
  },
  {
    slug: "construire-offre-facile-a-acheter",
    title: "Build an offer that is easy to buy",
    shortTitle: "Building a clear offer",
    category: "Offer",
    durationMinutes: 9,
    promise: "Turn expertise into a clear result, scope and buying decision for the right customer.",
    lessons: [
      { title: "Lead with the customer result", body: "Describe the change the customer wants, not only the activities you perform. The result should be concrete enough to recognise without promising what you cannot control.", steps: ["Name the current problem", "Describe the useful change", "Define evidence of progress"], takeaway: "Customers buy a useful change, delivered through your expertise." },
      { title: "Make the scope visible", body: "List the key stages, deliverables, responsibilities and exclusions. A visible scope improves trust and protects delivery.", steps: ["Define the stages", "Assign responsibilities", "State exclusions"], takeaway: "Scope clarity is part of the value, not administrative detail." },
      { title: "Reduce unnecessary choices", body: "Offer one recommended route for the main customer type. Add options only when they reflect genuinely different needs, not every possible preference.", steps: ["Choose the core route", "Limit meaningful options", "Recommend the fit"], takeaway: "A focused offer makes a good decision easier." },
      { title: "Align promise, price and proof", body: "The result, delivery model, price and evidence must support the same positioning. Misalignment creates doubt even when each element looks reasonable alone.", steps: ["Check the promise", "Check the economics", "Check the proof"], takeaway: "A coherent offer is more credible than a collection of strong claims." },
    ],
    recap: ["Lead with a concrete customer result.", "Make scope and responsibilities explicit.", "Limit choices to meaningful differences.", "Align the promise, price and proof."],
    quiz: [
      { question: "What should the offer communicate first?", answer: "The useful result for the customer", wrong: "Every internal task the provider performs", explanation: "The result gives the customer a reason to consider the delivery." },
      { question: "Why state exclusions?", answer: "To clarify the boundary and protect delivery", wrong: "To hide the main service", explanation: "Exclusions reduce assumptions and make responsibilities clearer." },
      { question: "What makes an offer coherent?", answer: "Promise, delivery, price and proof support the same position", wrong: "Each element targets a different customer", explanation: "Consistency makes the buying decision more credible." },
    ],
  },
  {
    slug: "livrer-prestation-sans-tout-reinventer",
    title: "Deliver consistently without reinventing the work",
    shortTitle: "Delivering consistently",
    category: "Operations",
    durationMinutes: 9,
    promise: "Create a repeatable delivery path that protects quality while leaving room for professional judgement.",
    lessons: [
      { title: "Map the delivery milestones", body: "Identify the few stages every successful engagement passes through, from start to closure. Focus on decisions and hand-offs rather than documenting every click.", steps: ["Start", "Produce and review", "Close"], takeaway: "A shared delivery path makes progress visible without overengineering the work." },
      { title: "Standardise recurring inputs", body: "Use consistent briefs, checklists and source locations for information that is needed every time. Missing inputs create avoidable rework.", steps: ["Request the right inputs", "Validate completeness", "Store one source of truth"], takeaway: "Standard inputs reduce variation before delivery begins." },
      { title: "Build quality into the process", body: "Define acceptance criteria and review points before work starts. Quality becomes more reliable when it is checked during delivery rather than only at the end.", steps: ["Define acceptance", "Review at the right stage", "Record the decision"], takeaway: "Early quality controls are cheaper than final-stage rework." },
      { title: "Close and improve deliberately", body: "Confirm completion, transfer what the customer needs and capture one improvement for the next delivery cycle. Closure protects both the relationship and the operating system.", steps: ["Confirm completion", "Transfer ownership", "Improve one standard"], takeaway: "A proper close turns each delivery into a better next delivery." },
    ],
    recap: ["Use a small set of shared delivery milestones.", "Standardise recurring inputs and sources.", "Check quality during the work.", "Close clearly and improve one standard."],
    quiz: [
      { question: "What should a delivery map focus on?", answer: "Milestones, decisions and hand-offs", wrong: "Every mouse click in every possible case", explanation: "The map should create useful visibility without becoming impossible to maintain." },
      { question: "When should acceptance criteria be defined?", answer: "Before or at the start of delivery", wrong: "Only after the customer rejects the work", explanation: "Early criteria guide production and reduce late rework." },
      { question: "What should happen at closure?", answer: "Confirm completion, transfer ownership and capture an improvement", wrong: "Leave the engagement open indefinitely", explanation: "A deliberate close protects clarity and feeds continuous improvement." },
    ],
  },
] as const;

const englishAcademyContent = ENGLISH_COURSE_SEEDS.map(createEnglishCourse);

export function getEnglishAcademyContent() {
  return englishAcademyContent;
}
