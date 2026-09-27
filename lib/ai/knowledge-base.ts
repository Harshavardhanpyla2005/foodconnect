/**
 * FoodConnect AI Helpline — Internal Knowledge Base
 *
 * This is the authoritative, curated knowledge source for the FoodConnect AI.
 * All answers must be grounded here — the AI must never hallucinate.
 */

export const FOODCONNECT_SYSTEM_PROMPT = `You are the FoodConnect AI Helpline — a specialized, helpful assistant for the FoodConnect platform operating in Visakhapatnam (Vizag), India.

## YOUR IDENTITY
- You are "FoodConnect AI Helpline", NOT a general-purpose AI.
- You help donors, NGOs, volunteers, visitors, and administrators understand and use FoodConnect.
- You answer questions about the FoodConnect platform, food donation workflows, community needs, impact transparency, and user roles.

## CORE MISSION
FoodConnect is an open digital coordination platform that connects surplus food from commercial donors with verified community needs through NGOs in Visakhapatnam. It does NOT physically distribute food — it coordinates the network, tracks the workflow, and makes approved impact records transparent.

## YOUR CAPABILITIES
1. Answer questions about FoodConnect platform, workflows, and features.
2. When user data is provided (in [LIVE DATA] sections), use it accurately to answer personal queries.
3. Guide users to the correct dashboards, actions, and next steps.

## RULES YOU MUST NEVER BREAK
- NEVER invent donation status, GPS locations, quantities, beneficiary counts, or impact numbers.
- NEVER claim a delivery happened unless [LIVE DATA] confirms it.
- NEVER claim evidence was approved unless [LIVE DATA] shows admin approval.
- NEVER expose private donor addresses, phone numbers, beneficiary personal info, or other users' private records.
- NEVER claim there are OTPs, handover PINs, or SMS verification steps — FoodConnect does NOT use these.
- NEVER say "AI API key missing" or expose infrastructure errors to users.
- If information is unavailable: say "I don't have enough information to verify that from FoodConnect's current records." then guide the user to where they can check.

## RESPONSE STYLE
- Concise, friendly, professional, humanitarian, action-oriented.
- Use numbered steps for workflows.
- Keep responses SHORT unless the user asks for detail.
- Use plain language — no jargon.

## ABOUT FOODCONNECT

### Platform Overview
FoodConnect is a Zero Hunger (UN SDG 2) initiative digitizing surplus food coordination in Visakhapatnam. Key participants:
- Donors: Restaurants, hotels, caterers, event organizers, businesses, individuals with surplus food.
- NGOs: Verified community organizations that receive and distribute food to people in need.
- Volunteers: Individuals who physically collect and transport food from donors to NGOs.
- Admins: FoodConnect operations staff who review evidence and maintain transparency.

### User Roles

DONOR: Registers, creates food donations, views matching/collection status, tracks impact.
NGO: Registers (needs admin verification), creates food needs, accepts matched donations, records community distribution, uploads evidence.
VOLUNTEER: Registers, claims available pickup tasks, travels to donor, collects food, transports to NGO, submits handoff proof.
ADMIN: Monitors operations, reviews distribution evidence, approves for public transparency.

### Complete Donation Workflow
1. Donor registers and creates a donation.
2. System matches to suitable NGO needs.
3. NGO accepts the matched donation.
4. Volunteer claims the collection task.
5. Volunteer travels to donor (GPS tracking active).
6. Pickup occurs at donor location.
7. Volunteer transports food to NGO.
8. Volunteer submits handoff proof (photo + GPS + notes).
9. Donation marked "Delivered to NGO".
10. NGO distributes food to community.
11. NGO submits distribution evidence.
12. Admin reviews evidence.
13. Approved impact becomes publicly visible at /impact.

IMPORTANT: No OTPs, PINs, or SMS verification. No additional NGO confirmation needed after volunteer delivers.

### Matching Factors
1. Food type compatibility
2. Dietary category compatibility (veg/non-veg/halal)
3. Quantity vs. need fit
4. Location/distance within Vizag
5. Timing and urgency

### GPS / Live Tracking
Volunteers use "Use My Location" button during active pickups. Donors and NGOs see the delivery map. GPS stops when collection is delivered. Only relevant parties can view location data.

### Evidence & Transparency
Handoff proof: volunteer photo + GPS + notes. Distribution evidence: NGO photos + quantities + beneficiary count. Admin approves before public display. Only verified records appear at /impact.

### Food Details Donors Provide
Food category (veg/non-veg/both), food type, quantity, preparation time, safe-consumption deadline, storage requirements, packaging, allergens/notes, pickup location, food photo.
Food safety responsibility remains with the donor — FoodConnect does not certify food safety.

### NGO Need Lifecycle
Draft → Active → Partially Fulfilled → Fulfilled → Closed / Expired

### Dashboards
- Donor: /dashboard/donor
- NGO: /dashboard/ngo
- Volunteer: /dashboard/volunteer
- Admin: /dashboard/admin

### Registration URLs
- Donor: /register?role=donor
- NGO: /register?role=ngo
- Volunteer: /register?role=volunteer

When you receive [LIVE DATA], use it precisely. Do not extrapolate beyond what the data shows.
When you receive [PAGE CONTEXT], use it to give relevant suggestions.
When you receive [USER ROLE], tailor your response to that role.`

export const KNOWLEDGE_FAQS: Array<{ patterns: string[]; answer: string }> = [
  {
    patterns: ["what is foodconnect", "about foodconnect", "tell me about", "what does foodconnect do", "explain foodconnect"],
    answer: `FoodConnect is a Zero Hunger (UN SDG 2) digital coordination platform in Visakhapatnam.

It connects surplus food donors with verified NGOs serving communities in need — through a transparent, tracked workflow.

Key participants:
• 🥗 **Donors** — provide surplus food (restaurants, hotels, caterers, businesses)
• 🏢 **NGOs** — coordinate distribution to communities in need
• 🚚 **Volunteers** — collect and transport food
• 🔍 **Admins** — verify evidence for public transparency

FoodConnect coordinates the network and makes approved impact records publicly visible.`,
  },
  {
    patterns: ["how do i donate", "donate food", "create donation", "i want to donate", "donating food"],
    answer: `To donate food on FoodConnect:

1. Register at /register?role=donor as a Donor
2. Sign in → Donor Dashboard
3. Create a donation — add food type, quantity, prep time, safe-consumption deadline, storage info, and pickup location
4. Submit — FoodConnect identifies suitable NGO needs
5. An NGO accepts your donation
6. A volunteer claims the pickup and collects from you
7. Track the collection in real time on your dashboard

Your surplus food helps communities in Visakhapatnam. 🙏`,
  },
  {
    patterns: ["ngo create need", "food need", "community need", "create a need", "how can ngo", "ngo register"],
    answer: `NGOs on FoodConnect maintain active food needs for genuine community requirements.

To create a need:
1. Register at /register?role=ngo (requires admin verification)
2. NGO Dashboard → Create Need
3. Specify: food type, quantity, dietary preference, urgency, beneficiary category, area, deadline
4. FoodConnect matches your need with suitable donations
5. Accept a matched donation
6. Volunteer delivers food to your facility
7. Upload distribution evidence (photos, quantities, beneficiary count)
8. Admin reviews → approved impact becomes publicly visible

Need lifecycle: **Draft → Active → Partially Fulfilled → Fulfilled → Closed**`,
  },
  {
    patterns: ["how does collection work", "volunteer pickup", "how does pickup", "collection process", "how are pickups"],
    answer: `The collection process on FoodConnect:

1. NGO accepts a donation → collection task is created
2. Volunteer sees it on their Dispatch Board and claims it
3. Volunteer travels to the donor (GPS tracking activates)
4. Food is collected at the donor location
5. Volunteer transports food to the NGO facility
6. Volunteer submits handoff proof — photo, GPS, notes
7. Collection is marked "Delivered to NGO" ✅

No OTP, PIN, or extra confirmation step is needed.`,
  },
  {
    patterns: ["gps", "live tracking", "track", "tracking", "location", "where is volunteer", "real time"],
    answer: `FoodConnect includes live delivery tracking:

• Volunteers tap "Use My Location" during active pickups
• This shares their GPS position to the delivery map
• Donors see their collection being tracked
• NGOs can monitor incoming deliveries
• The map shows: donor 📍, NGO 🏢, volunteer 🚚

GPS data is only collected during active (non-delivered) collections.
Location data is only accessible to the relevant donor, NGO, and volunteer.`,
  },
  {
    patterns: ["impact", "verified", "transparency", "evidence", "distribution record", "how is impact", "public record"],
    answer: `FoodConnect's impact verification process:

1. NGO distributes food to community beneficiaries
2. NGO submits evidence — photos, quantities distributed, beneficiary count
3. Admin reviews for completeness and authenticity
4. Approved records become publicly visible at /impact

What you see on the impact page is always admin-verified — never estimated or invented.

The transparency page shows: total meals rescued, communities served, evidence photos, and verified beneficiary counts.`,
  },
  {
    patterns: ["how do i register", "sign up", "create account", "join foodconnect", "get started"],
    answer: `Registering on FoodConnect:

• Donor: /register?role=donor
• NGO: /register?role=ngo *(admin verification required)*
• Volunteer: /register?role=volunteer

After registration, you'll go to your role-specific dashboard.`,
  },
  {
    patterns: ["volunteer", "how does volunteering", "become volunteer", "volunteer work", "how do i volunteer"],
    answer: `Volunteers are the backbone of food delivery on FoodConnect.

1. Register at /register?role=volunteer
2. Sign in → Volunteer Dashboard (Dispatch Board)
3. View available collection tasks
4. Claim a pickup
5. Travel to the donor (use GPS tracking)
6. Collect the food
7. Transport to NGO facility
8. Submit handoff proof — photo, GPS, notes ✅

Volunteers can track their active pickup in real time.`,
  },
  {
    patterns: ["sdg", "zero hunger", "un sustainable", "un goal", "sdg 2"],
    answer: `FoodConnect supports UN Sustainable Development Goal 2: Zero Hunger.

By digitizing and tracking the entire food rescue cycle:

• Reduces food waste from commercial sources
• Channels surplus food to communities in need in Visakhapatnam
• Creates transparent, verifiable impact records
• Shows that technology can accelerate humanitarian action

All verified impact data is publicly accessible at /impact.`,
  },
  {
    patterns: ["what happens after delivery", "after food reaches ngo", "after volunteer delivers", "after handoff", "post delivery"],
    answer: `After the volunteer delivers food to the NGO:

1. Volunteer submits handoff proof (photo + GPS + notes)
2. Collection is marked "Delivered to NGO" ✅
3. NGO distributes food to community beneficiaries
4. NGO uploads distribution evidence (photos, quantities, beneficiary count)
5. Admin reviews the evidence
6. Approved impact becomes publicly visible at /impact

The full chain from donor → volunteer → NGO → community is traceable and transparent.`,
  },
  {
    patterns: ["matching", "how does matching work", "how are ngos matched", "why was this ngo", "match system"],
    answer: `FoodConnect's matching considers:

1. Food type compatibility
2. Dietary preferences (veg/non-veg/halal)
3. Quantity vs. need fit
4. Geographic proximity within Vizag
5. Timing and urgency (Immediate, High, Flexible)

When a donor submits a donation, FoodConnect surfaces the best-matched NGO needs. The NGO then accepts or declines.`,
  },
  {
    patterns: ["food safety", "safe to eat", "food quality", "certified", "allergen"],
    answer: `FoodConnect is a coordination platform — not a food safety certifier.

Food safety responsibility remains with the donor and operational participants. Donors are expected to:
• Provide accurate preparation time and safe-consumption deadlines
• Ensure proper storage and packaging
• Only donate food that is safe for consumption

FoodConnect records the details provided but does not inspect or certify food.`,
  },
  {
    patterns: ["admin", "admin role", "what does admin do", "admin dashboard"],
    answer: `FoodConnect Admins are operations staff who:

• Monitor all donor, NGO, volunteer, and collection activity
• Review distribution evidence submitted by NGOs
• Approve or flag evidence — only approved records appear publicly
• Handle suspicious or incomplete records
• Manage NGO registration verification

Admin accounts are managed internally. Admins access /dashboard/admin.`,
  },
  {
    patterns: ["contact", "help", "support", "who do i contact", "how to get help", "phone", "email"],
    answer: `For help with FoodConnect:

• You're already talking to the FoodConnect AI Helpline 😊
• How it works: /how-it-works
• Find NGOs: /ngos
• View impact: /impact
• Register: /register
• Sign in: /login

For operational issues, contact the FoodConnect operations team through your dashboard.`,
  },
]
