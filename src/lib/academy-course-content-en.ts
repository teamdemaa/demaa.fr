import {
  getAcademyFundamentals,
  type AcademyAction,
  type AcademyContentDefinition,
  type AcademyLesson,
} from "@/lib/academy-course-content";

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
  lessons: readonly EnglishLessonSeed[];
  promise: string;
  quiz: readonly [EnglishQuizSeed, EnglishQuizSeed, EnglishQuizSeed];
  recap: readonly [string, string, string, string];
  shortTitle: string;
  slug: string;
  title: string;
}>;

function toEnglishVisualData(
  lesson: EnglishLessonSeed,
  visualType: AcademyLesson["visual"]["type"],
) {
  const steps = lesson.steps.map((title, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title,
  }));

  if (visualType === "comparison") {
    return {
      leftLabel: "Starting point",
      leftText: lesson.title,
      operator: "→",
      rightLabel: "Decision point",
      rightText: lesson.takeaway,
    };
  }
  if (visualType === "timeline") {
    return {
      steps: lesson.steps.map((label, index) => ({
        label,
        timing: `Step ${index + 1}`,
      })),
    };
  }
  if (visualType === "calculation") {
    return {
      result: { label: lesson.steps[0], value: "1" },
      cash: {
        available: lesson.steps[1],
        payments: lesson.steps[2],
        lowPoint: lesson.takeaway,
      },
      formula: lesson.title,
    };
  }
  if (visualType === "metrics") {
    return {
      horizon: "the selected period",
      inputs: [...lesson.steps],
      output: lesson.takeaway,
    };
  }
  if (visualType === "pipeline") {
    return { steps: [...lesson.steps] };
  }
  return { steps };
}

function toLesson(
  seed: EnglishLessonSeed,
  canonicalLesson: AcademyLesson,
  index: number,
  lessonCount: number,
): AcademyLesson {
  return {
    id: canonicalLesson.id,
    type: canonicalLesson.type,
    eyebrow: `Lesson ${index + 1} of ${lessonCount}`,
    title: seed.title,
    body: seed.body,
    visual: {
      type: canonicalLesson.visual.type,
      data: toEnglishVisualData(seed, canonicalLesson.visual.type),
    },
    takeaway: seed.takeaway,
  };
}

function toEnglishAction(action: AcademyAction | null): AcademyAction | null {
  if (!action) return null;
  if (action.resourceId === "pilotage-marketing-vente") {
    return {
      ...action,
      title: "Marketing and sales tracker",
      description: "A simple workspace for enquiries, qualification, proposals, follow-ups and decisions.",
      ctaLabel: "Open the tracker",
    };
  }
  return {
    ...action,
    title: "Levier",
    description: "A simple operating dashboard for activity, key figures and decisions.",
    ctaLabel: "Get Levier",
  };
}

function createEnglishCourse(seed: EnglishCourseSeed): AcademyContentDefinition {
  const canonical = getAcademyFundamentals().find(
    (content) => content.identity.slug === seed.slug,
  );
  if (!canonical) {
    throw new Error(`Unknown canonical Academy course: ${seed.slug}`);
  }
  if (canonical.lessons.length !== seed.lessons.length) {
    throw new Error(
      `Incomplete English Academy projection for ${seed.slug}: expected ${canonical.lessons.length} lessons, received ${seed.lessons.length}.`,
    );
  }
  if (canonical.quiz.questions.length !== seed.quiz.length) {
    throw new Error(`Incomplete English Academy quiz projection for ${seed.slug}.`);
  }

  return {
    version: "1.0",
    kind: "course",
    status: "ready",
    editorial: {
      courseId: seed.slug,
      contentVersion: "1.0",
      localeCode: "en",
      marketCodes: ["fr-fr", "global-en-beta"],
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
        image: canonical.identity.card.image,
        imageAlt: `Illustration for ${seed.shortTitle}.`,
      },
    },
    outline: seed.lessons.slice(0, 3).map((lesson) => ({
      title: lesson.title,
      description: lesson.takeaway,
    })),
    lessons: seed.lessons.map((lesson, index) =>
      toLesson(lesson, canonical.lessons[index], index, canonical.lessons.length),
    ),
    recap: {
      title: "The course in four points",
      points: [...seed.recap],
    },
    quiz: {
      title: "Check your understanding",
      questions: seed.quiz.map((item, index) => {
        const canonicalQuestion = canonical.quiz.questions[index];
        const correctChoiceId = canonicalQuestion.correctChoiceId;
        const wrongChoiceId = canonicalQuestion.choices.find(
          (choice) => choice.id !== correctChoiceId,
        )?.id;
        if (!wrongChoiceId) {
          throw new Error(`Invalid canonical Academy quiz for ${seed.slug}.`);
        }
        return {
          id: canonicalQuestion.id,
          question: item.question,
          choices: [
            { id: correctChoiceId, label: item.answer },
            { id: wrongChoiceId, label: item.wrong },
          ],
          correctChoiceId,
          explanation: item.explanation,
        };
      }),
    },
    action: toEnglishAction(canonical.action),
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
      { title: "Invoicing is not the same as getting paid", body: "The work may be complete and the invoice sent, but the customer can pay weeks later. Payroll, rent, suppliers and subscriptions still leave the bank account during that delay.", steps: ["Complete the work", "Send the invoice", "Receive the payment"], takeaway: "An invoice protects the bank balance only after the money has been collected." },
      { title: "The same project can show a profit and a cash shortfall", body: "A project can generate a healthy accounting result while the business still has to fund delivery before the customer pays. The lowest projected balance reveals the temporary funding gap.", steps: ["Estimate the project profit", "Date the outgoing payments", "Find the lowest cash point"], takeaway: "Profit on paper and the lowest bank balance can move in opposite directions." },
      { title: "Working capital is money advanced before collection", body: "This timing gap is working capital. Service businesses mainly fund unpaid customer invoices, while retailers can also fund stock before it is sold.", steps: ["Pay delivery costs", "Fund the waiting period", "Collect the customer payment"], takeaway: "Working capital measures what the business must finance while it waits to be paid." },
      { title: "More sales can initially mean less cash", body: "When sales grow without shorter payment terms, the business may have to fund more work before collecting. Growth can therefore increase the temporary cash requirement.", steps: ["Win more orders", "Advance more delivery costs", "Collect later"], takeaway: "Growth must be financed until customer payments arrive." },
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
      { title: "Profit appears only after every cost", body: "Revenue is only the start of the calculation. Purchases, production, subcontracting, payroll, premises, software, insurance, interest and taxes all have to be deducted before the final result is known.", steps: ["Start with revenue", "Deduct variable costs", "Deduct fixed costs"], takeaway: "Revenue starts the calculation; profit is found at the bottom." },
      { title: "A large revenue figure can produce a small profit", body: "A business can sell one hundred thousand euros, spend sixty thousand on delivery and thirty-five thousand on fixed costs, and retain only five thousand in profit.", steps: ["100,000 in revenue", "95,000 in total costs", "5,000 in profit"], takeaway: "What matters is not only what is sold, but what remains after all costs." },
      { title: "Selling more can reduce profit", body: "An additional contract may increase revenue but still destroy value when urgent subcontracting, overtime and corrections cost more than the sale brings in.", steps: ["Add the new sale", "Measure its full cost", "Check the result"], takeaway: "A large unprofitable sale is still a bad sale for the business." },
      { title: "Fixed costs set the threshold", body: "Rent, salaries, software and other recurring commitments continue even when sales slow down. Your break-even point is the revenue required to cover them at your normal margin.", steps: ["List recurring costs", "Use a realistic margin", "Estimate break-even revenue"], takeaway: "Break-even turns a vague sales goal into a financial minimum." },
      { title: "Track margin, break-even and actual profit", body: "Review margin in euros and as a percentage for each important offer. Calculate monthly break-even, then compare it with the actual result. Keep cash in a separate view because it answers a different question.", steps: ["Track margin", "Track break-even", "Track actual profit"], takeaway: "Revenue shows volume; margin and profit support decisions." },
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
      { title: "A price above purchase cost can still lose money", body: "A sale must also pay commissions, customer time and a fair share of company overhead. The price floor is the level below which each sale destroys value instead of creating it.", steps: ["Direct purchase cost", "Delivery and selling time", "Allocated overhead"], takeaway: "Comparing price only with purchase cost gives an incomplete picture." },
      { title: "Compare amounts on the same tax basis", body: "When sales tax or VAT is recoverable, compare the price before tax with recoverable costs before tax. Tax collected for the authorities is not business income.", steps: ["Choose the tax basis", "Align revenue and costs", "Calculate consistently"], takeaway: "A reliable calculation always compares amounts on the same basis." },
      { title: "Cover four families of cost", body: "Include direct purchases, other variable costs such as delivery, the real time spent at a coherent rate, and a realistic share of recurring overhead.", steps: ["Direct purchases", "Time and variable costs", "Allocated overhead"], takeaway: "Ignoring time or overhead often means working for free." },
      { title: "Use a realistic volume assumption", body: "Dividing fixed costs by an optimistic sales volume creates a false profitable price. Use a volume the business can reasonably deliver and sell, then test what happens when it is lower.", steps: ["Estimate realistic volume", "Allocate fixed costs", "Stress-test the assumption"], takeaway: "The overhead share rises whenever actual volume falls below the assumption." },
      { title: "Include percentage commissions in the formula", body: "When a commission is calculated as a percentage of selling price, divide the other costs by the percentage retained after commission. Do not add the commission as an arbitrary fixed amount.", steps: ["Add all other costs", "Deduct the commission rate", "Calculate the true floor"], takeaway: "A percentage commission must be built into the price formula." },
      { title: "Move from the floor to the commercial price", body: "The price floor covers no uncertainty, investment or growth. Add a safety margin and compare the result with the market. If the price cannot sell, redesign the offer or its economics instead of hiding costs.", steps: ["Calculate the floor", "Add the required margin", "Test the offer and market"], takeaway: "The floor is only where the business stops losing money." },
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
      { title: "Marketing and sales form one path", body: "A post, a referral, a campaign and a rushed proposal do not yet form a system. The system describes the path from first discovery to a clear sales outcome, with stages and a few operating rules.", steps: ["Create discovery", "Build a conversation", "Reach a sales decision"], takeaway: "The system makes the complete path to a sale visible and repeatable." },
      { title: "Define who to attract before choosing tools", body: "Choose the priority customer, the important problem and the result the business can genuinely produce. Without this clarity, messages remain vague and every sales conversation starts from zero.", steps: ["Choose the customer", "Name the priority problem", "Define the useful result"], takeaway: "Positioning gives the system a specific customer, problem and result." },
      { title: "Choose few channels and one next step", body: "One main channel and, if useful, one supporting channel are enough to begin. Search, referrals, outreach or content should each lead to one clear action.", steps: ["Choose the main channel", "Offer one next step", "Measure entry into the system"], takeaway: "The goal is not to be everywhere, but to make entry measurable." },
      { title: "Centralise every opportunity", body: "A well-maintained spreadsheet can work before a complex CRM. Record the source, need, owner, current stage and dated next action for every opportunity.", steps: ["Record the source and need", "Assign an owner", "Date the next action"], takeaway: "An opportunity without a dated next action usually disappears." },
      { title: "Qualify before proposing, then move the opportunity", body: "Check the need, urgency, scope, decision-maker and constraints. Move each request through a simple path from new to qualified, proposed, won or lost.", steps: ["Qualify the fit", "Choose the next stage", "Reach a clear outcome"], takeaway: "Marketing creates opportunities; sales moves them towards a decision." },
      { title: "Review a few numbers every week", body: "Count qualified requests, useful conversations, proposals and customers. Use those figures to locate the weakest transition, then choose one improvement for the week.", steps: ["Count each important stage", "Find the largest loss", "Improve one transition"], takeaway: "Metrics help decide where to act, not promise an ideal conversion rate." },
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
      { title: "An enquiry is not yet a sale", body: "An enquiry is an opportunity to assess. Sending a proposal before understanding the need means doing unpaid work on an assumption, while turning the first exchange into an interrogation can drive good prospects away.", steps: ["Acknowledge the request", "Check whether it deserves time", "Choose the next step"], takeaway: "The first goal is to decide whether a useful conversation should happen." },
      { title: "Respond quickly without writing the proposal", body: "Acknowledge the request the same day when possible. Restate what you understood, ask for the key missing information and explain the next step.", steps: ["Acknowledge quickly", "Confirm your understanding", "Set the next step"], takeaway: "A prompt response creates clarity without proposing a solution too early." },
      { title: "Qualify five essential points", body: "Confirm the desired result, reason for urgency, actual scope, decision-maker and time or budget constraints. You do not need a perfect brief, only enough evidence that the request can move forward seriously.", steps: ["Result and urgency", "Scope and decision-maker", "Time and budget constraints"], takeaway: "Qualification protects sales time before a proposal is produced." },
      { title: "Understand the situation before presenting the business", body: "Explore the current situation, the concrete problem, what success would change, what has already been tried and what is blocking the decision. Then restate the priority and constraints.", steps: ["Understand the current situation", "Clarify the desired change", "Restate the priority"], takeaway: "A good restatement prevents unsuitable or unnecessary proposals." },
      { title: "Make the proposal easy to decide and follow up cleanly", body: "Connect the solution to the desired result, then state scope, stages, timing, price and exclusions. End with a dated decision point and close the request after a second unanswered follow-up.", steps: ["Make the proposal clear", "Agree a decision date", "Follow up and close"], takeaway: "Without a dated next step, even a strong proposal can remain undecided." },
      { title: "Measure the path and accept no-sale outcomes", body: "Track how many requests are declined or redirected, discussed, proposed and won. This reveals where sales time is spent and where requests are lost.", steps: ["Count requests", "Count proposals", "Count wins and closed losses"], takeaway: "A healthy sales process also declines or closes unsuitable projects." },
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
      { title: "Delegation is neither disappearing nor controlling everything", body: "Saying ‘handle it’ and vanishing brings the work back as questions and corrections. Approving every detail also prevents ownership. Delegation means assigning a result within a clear frame.", steps: ["Define the result", "Set the boundaries", "Agree visibility"], takeaway: "Autonomy grows only when the result and limits are explicit." },
      { title: "Start with frequent, explainable and correctable work", body: "Scheduling, recurring reporting or organising a customer file are good first delegations. Keep highly sensitive or irreversible decisions until the frame and available skills are proven.", steps: ["Choose frequent work", "Check it can be explained", "Keep the risk correctable"], takeaway: "A first delegation should free time without transferring uncontrolled risk." },
      { title: "Describe an observable result", body: "State the deliverable, date, recipient, quality criteria and non-negotiable constraints. A visible result lets you review the output without prescribing every gesture.", steps: ["Name the deliverable", "Define quality", "Set the deadline"], takeaway: "An observable result makes completion and quality verifiable." },
      { title: "Transfer the context and means needed to decide", body: "Explain why the work matters, who is affected, what has already been decided and which examples are good or poor. Provide the access, contacts, information and tools needed to act.", steps: ["Explain the purpose", "Share useful examples", "Provide access and tools"], takeaway: "The right context reduces questions without transferring the whole company history." },
      { title: "Define decision zones and alert thresholds", body: "State what can be decided independently, what needs approval and what can be decided then reported. Add concrete alerts for delay, budget, customer complaint or safety risk.", steps: ["Decide independently", "Ask before acting", "Decide then report"], takeaway: "Autonomy is freedom to decide within known limits." },
      { title: "Review outcomes and improve the frame", body: "Use a small number of checkpoints and indicators. When the outcome disappoints, inspect the result, context, tools, skill and missing alerts before automatically taking the work back.", steps: ["Review evidence", "Find the cause", "Improve the frame"], takeaway: "Control should come from visibility and feedback, not constant intervention." },
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
      { title: "An offer is not a list of services", body: "A list describes what the business can do. An offer helps a specific customer solve a specific situation with a result, scope and way of working. The more assembly the customer must do, the harder the decision becomes.", steps: ["Name the customer", "Name the situation", "Present one coherent route"], takeaway: "A good offer reduces the customer’s work of understanding and deciding." },
      { title: "Choose a situation the customer recognises", body: "Describe who faces the problem, what is happening now, why it matters and when a decision is needed. A concrete situation lets the right customer recognise themselves quickly.", steps: ["Identify who", "Describe what is happening", "Explain why action is needed"], takeaway: "A recognisable situation makes relevance immediately clearer." },
      { title: "Promise an observable result without promising the impossible", body: "Describe what will be different after delivery without guaranteeing outcomes the business cannot control. You can promise an installed system, a prepared decision or a documented process.", steps: ["Name the useful change", "Define evidence of completion", "Keep the promise controllable"], takeaway: "A credible promise describes a verifiable change the provider can produce." },
      { title: "Define what is included, excluded and complete", body: "State deliverables, stages, review rounds, customer contributions and exclusions. Clear limits protect the relationship, timing and margin.", steps: ["List deliverables", "Assign responsibilities", "State exclusions"], takeaway: "Scope clarity is part of the value, not administrative detail." },
      { title: "Connect price to scope and a simple decision", body: "Present the price with what it covers, payment terms and clearly separated options. End with one visible next step: approve, book a conversation or choose an option by an agreed date.", steps: ["Connect price and scope", "Separate genuine options", "Ask for one decision"], takeaway: "Price is easier to understand when it is tied to a real scope and next step." },
      { title: "Test understanding before adding arguments", body: "Show the offer to three people close to the target and ask who it is for, what problem it solves, what is delivered and what happens next. Simplify before adding more proof or options.", steps: ["Ask for a restatement", "Find the unclear point", "Simplify the offer"], takeaway: "An offer is clear when the customer can restate it without help." },
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
      { title: "Delivery begins when the service is sold", body: "The customer relies on the promised result, scope and schedule before signing. If these change silently during production, delivery feels disorganised even when the technical work is good.", steps: ["Confirm the sold result", "Carry over the scope", "Protect the agreed timeline"], takeaway: "Good delivery visibly keeps the promise made before signature." },
      { title: "Start by removing uncertainty", body: "At kick-off, confirm the expected result, people involved, required information, stages, dates and communication channel. The customer should know what the team needs and when.", steps: ["Confirm the result and roles", "Collect the inputs", "Agree dates and communication"], takeaway: "A clear start turns commercial commitments into shared working rules." },
      { title: "Standardise stages, not every gesture", body: "Define the main stages that recur across engagements: collection, diagnosis, production, validation and handover. Expertise remains adaptable inside that shared path.", steps: ["Collect and diagnose", "Produce and review", "Hand over and close"], takeaway: "A repeatable structure frees expertise instead of restricting it." },
      { title: "Validate before mistakes become expensive", body: "Place approval points before decisions that are hard to reverse, such as scope confirmation, first direction, intermediate version or launch. State who approves what and by when.", steps: ["Choose the risk point", "Name the approver", "Set the deadline"], takeaway: "A useful approval happens before change becomes slow or expensive." },
      { title: "Turn scope changes into visible decisions", body: "When a request falls outside scope, restate it and explain the impact on time, price or priorities. The customer can replace an item, add an option or keep the original plan.", steps: ["Name the new request", "Show its impact", "Ask for a decision"], takeaway: "A scope change must become a decision, not invisible free work." },
      { title: "Close by confirming the result and what comes next", body: "Summarise what was delivered, decisions made, access or documents transferred and what still needs attention. A clear close separates completed work from maintenance or a future engagement.", steps: ["Confirm completion", "Transfer ownership", "Agree the next step"], takeaway: "A proper close makes value visible and prevents an endless engagement." },
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
