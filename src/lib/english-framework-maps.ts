type Stage = { title: string; items: readonly string[] };
export const englishApop: readonly Stage[] = [
  { title: "Audience", items: ["Who faces this problem?", "Define the segments to test", "Describe the context and the problem", "Identify signs of demand"] },
  { title: "Positioning", items: ["What promise do we want to make?", "Define the desired outcome", "Describe the alternatives people use today", "Clarify the value and the difference"] },
  { title: "Offer", items: ["What do we sell? At what price?", "Define the product and support", "Set out the price and terms", "Identify the evidence we need"] },
  { title: "Promotion", items: ["How do we reach our customers?", "Choose channels suited to the audience", "Define the role of content, networks and partners", "Plan the first distribution tests"] },
];
export const englishProjectApop: Record<string, readonly Stage[]> = {
  jago: [
    { title: "Audience", items: ["Who faces this problem?", "Shops, grocers, resellers and online retailers", "African products in bulk, recurring needs", "Compare volumes and purchase frequency across shops"] },
    { title: "Positioning", items: ["What promise do we want to make?", "Make sourcing African products easier", "Suppliers matched to the request", "Managed commercial relationship and order support"] },
    { title: "Offer", items: ["What do we sell? At what price?", "Product, quantity, frequency and destination", "Clear prices and terms, order follow-up", "Supplier subscription and terms to test"] },
    { title: "Promotion", items: ["How do we reach our customers?", "Our network of shops and grocers", "Introductions between shop owners", "Partnerships with retail networks"] },
  ],
  dumaan: [
    { title: "Audience", items: ["Who faces this problem?", "Families and busy working people first", "West African meals at home", "Test some preparations with restaurants and caterers"] },
    { title: "Positioning", items: ["What promise do we want to make?", "Make everyday meals easier to prepare", "Take care of the most time-consuming steps", "Keep the flavours and the pleasure of cooking"] },
    { title: "Offer", items: ["What do we sell? At what price?", "Ready-to-cook pastels, vegetables and dish bases", "Frozen food preparations for families", "Range, portions and prices to test"] },
    { title: "Promotion", items: ["How do we reach our customers?", "Signature “What’s for dinner?” video", "Advertising from the start", "Tastings and local word of mouth"] },
  ],
  tiimora: [
    { title: "Audience", items: ["Who faces this problem?", "Accounting firms with 3 to 20 employees", "Requests, documents, reminders and deadlines", "Two pilot firms to observe real use"] },
    { title: "Positioning", items: ["What promise do we want to make?", "Centralise the firm’s operational follow-up", "Alongside existing accounting tools", "Fewer reminders, better visibility"] },
    { title: "Offer", items: ["What do we sell? At what price?", "Client requests and deadlines", "Test price: €199 per month", "Supported setup, fee to validate"] },
    { title: "Promotion", items: ["How do we reach our customers?", "Practical LinkedIn content and resources", "LinkedIn advertising from the start", "Consultants, trainers and accounting firm networks"] },
  ],
};
export const englishPlans: Record<string, readonly Stage[]> = {
  tiimora: [
    { title: "Attract", items: ["Useful LinkedIn content, LinkedIn advertising", "Consultant partnerships, introductions"] },
    { title: "Convert", items: ["Practical resource, 30-minute process review", "Tailored demo, clear offer"] },
    { title: "Retain", items: ["Guided onboarding, answers to questions", "Usage follow-up, gradual expansion"] },
  ],
  jago: [
    { title: "Attract", items: ["Shop owner network, introductions", "Partnerships with retail networks"] },
    { title: "Convert", items: ["Product requirements, quantity, destination", "Priced offer, supported order"] },
    { title: "Retain", items: ["Order follow-up, problem resolution", "Plan the next replenishment"] },
  ],
  dumaan: [
    { title: "Attract", items: ["Signature “What’s for dinner?” video, advertising", "Tastings, local word of mouth"] },
    { title: "Convert", items: ["Clear menu, portions and prices", "First order, delivery explained"] },
    { title: "Retain", items: ["Preparation tips, answers to questions", "Feedback after meals, repeat order"] },
  ],
};
export const englishGenericPlan: readonly Stage[] = [
  { title: "Attract", items: ["How do we reach the right people?", "Define the content, channels and partners", "Choose the first actions and their frequency"] },
  { title: "Convert", items: ["What next step should we offer?", "Define a clear offer and useful evidence", "Map the journey: request, demo or order"] },
  { title: "Retain", items: ["How do we give people a reason to return?", "Plan onboarding and answers to questions", "Define usage, satisfaction and repeat-purchase follow-up"] },
];
export const englishTransverse: Record<string, readonly [string, string]> = {
  tiimora: ["Process examples, use cases", "Introductions between firms, testimonials"],
  jago: ["Product availability, sourcing advice", "Introductions between shop owners"],
  dumaan: ["Weekly menus, meal ideas", "Word of mouth, referrals"],
  demaa: ["How can we stay useful before, during and after a purchase? Define the content and moments of contact.", "How can we encourage referrals? Define opportunities to gather reviews and make introductions."],
};
