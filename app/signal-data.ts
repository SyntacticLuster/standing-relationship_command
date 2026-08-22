export type Message = {
  id: string;
  author: string;
  email: string;
  sentAt: string;
  direction: "inbound" | "outbound";
  body: string[];
};

export type Thread = {
  id: string;
  contactId: string;
  sender: string;
  company: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  fullDate: string;
  unread: boolean;
  starred: boolean;
  priority: "high" | "normal";
  state: "inbox" | "waiting" | "snoozed" | "archived";
  owner: "me" | "them";
  tags: string[];
  accent: string;
  signal: string;
  summary: string;
  nextAction: string;
  messages: Message[];
};

export type Contact = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  lastTouch: string;
  relationship: number;
  status: "Active" | "Warm" | "New" | "Dormant";
  tags: string[];
  accent: string;
  note: string;
  facts: string[];
  openLoops: string[];
};

export const contacts: Contact[] = [
  {
    id: "nora-patel",
    name: "Nora Patel",
    initials: "NP",
    role: "Partner",
    company: "Northstar Ventures",
    email: "nora@northstar.example",
    phone: "+1 (415) 555-0194",
    location: "San Francisco, CA",
    lastTouch: "12 min ago",
    relationship: 86,
    status: "Active",
    tags: ["Investor", "High intent"],
    accent: "#d8ff67",
    note: "Direct, technically fluent, and allergic to vague claims. Lead with measured evidence.",
    facts: [
      "Evaluates infrastructure and developer tooling",
      "Prefers live product evidence over pitch decks",
      "Investment committee meets on Thursdays",
    ],
    openLoops: [
      "Send architecture note by tomorrow",
      "Confirm technical diligence session",
    ],
  },
  {
    id: "theo-brooks",
    name: "Theo Brooks",
    initials: "TB",
    role: "Founder",
    company: "Redline Systems",
    email: "theo@redline.example",
    phone: "+1 (646) 555-0131",
    location: "New York, NY",
    lastTouch: "1 hr ago",
    relationship: 72,
    status: "Warm",
    tags: ["Design partner", "Demo"],
    accent: "#80dcff",
    note: "Interested in autonomous build infrastructure for internal platform teams.",
    facts: [
      "Runs a twelve-person engineering organization",
      "Current release process averages nine days",
      "Security review is the likely buying constraint",
    ],
    openLoops: ["Book a 30-minute workflow mapping call"],
  },
  {
    id: "mira-chen",
    name: "Mira Chen",
    initials: "MC",
    role: "Program Director",
    company: "Launch Foundry",
    email: "mira@launchfoundry.example",
    phone: "+1 (617) 555-0177",
    location: "Boston, MA",
    lastTouch: "Yesterday",
    relationship: 64,
    status: "New",
    tags: ["Accelerator", "Application"],
    accent: "#c4a4ff",
    note: "Warm introduction. Wants the wedge and near-term commercial proof stated plainly.",
    facts: [
      "Focuses on technical founder-market fit",
      "Fall cohort decisions close next month",
    ],
    openLoops: ["Answer the traction follow-up"],
  },
  {
    id: "sasha-reid",
    name: "Sasha Reid",
    initials: "SR",
    role: "Host & Producer",
    company: "Systems at Scale",
    email: "sasha@systemsscale.example",
    phone: "+1 (312) 555-0148",
    location: "Chicago, IL",
    lastTouch: "Tue",
    relationship: 78,
    status: "Active",
    tags: ["Media", "Podcast"],
    accent: "#ffad7a",
    note: "Good chemistry. Keep answers concrete and avoid generic AI industry commentary.",
    facts: [
      "Audience is technical founders and operators",
      "Records remotely on Riverside",
      "Episodes run about forty minutes",
    ],
    openLoops: ["Send headshot and one-sentence bio"],
  },
  {
    id: "elena-ross",
    name: "Elena Ross",
    initials: "ER",
    role: "VP, Partnerships",
    company: "Alloy Works",
    email: "elena@alloyworks.example",
    phone: "+1 (206) 555-0162",
    location: "Seattle, WA",
    lastTouch: "Aug 18",
    relationship: 48,
    status: "Warm",
    tags: ["Partner", "Cloud credits"],
    accent: "#ff8bb7",
    note: "Exploring startup infrastructure partnerships. Needs a crisp estimate of workload and spend.",
    facts: [
      "Owns the startup partner program",
      "Can sponsor infrastructure credit reviews",
    ],
    openLoops: ["Return revised infrastructure forecast"],
  },
  {
    id: "malik-stone",
    name: "Malik Stone",
    initials: "MS",
    role: "Independent Operator",
    company: "Stone Advisory",
    email: "malik@stoneadvisory.example",
    phone: "+1 (716) 555-0180",
    location: "Buffalo, NY",
    lastTouch: "Aug 12",
    relationship: 39,
    status: "Dormant",
    tags: ["Advisor"],
    accent: "#8de8cf",
    note: "Strong enterprise network. Re-engage when the demo run is stable enough to share.",
    facts: ["Former enterprise sales leader", "Prefers concise email updates"],
    openLoops: [],
  },
];

export const initialThreads: Thread[] = [
  {
    id: "diligence-follow-up",
    contactId: "nora-patel",
    sender: "Nora Patel",
    company: "Northstar Ventures",
    initials: "NP",
    subject: "Re: technical diligence follow-up",
    preview: "The live run answered the orchestration question. I have two architecture follow-ups…",
    time: "12m",
    fullDate: "Today at 6:42 PM",
    unread: true,
    starred: true,
    priority: "high",
    state: "inbox",
    owner: "me",
    tags: ["Investor", "Needs reply"],
    accent: "#d8ff67",
    signal: "High intent",
    summary:
      "Nora is moving from product curiosity into technical diligence. She wants evidence that task memory remains attributable and that failed builds cannot surface as success.",
    nextAction: "Answer both architecture questions and attach the execution ledger.",
    messages: [
      {
        id: "nora-1",
        author: "Nora Patel",
        email: "nora@northstar.example",
        sentAt: "Today at 6:42 PM",
        direction: "inbound",
        body: [
          "Aaron — the live run answered the orchestration question. The failure visibility was especially useful.",
          "I have two architecture follow-ups before I circulate this internally: how is retained task knowledge scoped, and what prevents an unsuccessful packaging stage from being presented as a completed run?",
          "If you can send a short technical note and the execution ledger tomorrow, I can get it in front of the team before Thursday.",
        ],
      },
    ],
  },
  {
    id: "workflow-demo",
    contactId: "theo-brooks",
    sender: "Theo Brooks",
    company: "Redline Systems",
    initials: "TB",
    subject: "Workflow demo for the platform team",
    preview: "Wednesday at 2:00 works. Can you show the recovery path after a failed build?",
    time: "1h",
    fullDate: "Today at 5:31 PM",
    unread: true,
    starred: false,
    priority: "high",
    state: "inbox",
    owner: "me",
    tags: ["Design partner"],
    accent: "#80dcff",
    signal: "Demo requested",
    summary:
      "Theo has agreed to a workflow demo and is evaluating operational recovery, not code generation quality.",
    nextAction: "Confirm Wednesday at 2:00 and tailor the demo around repair evidence.",
    messages: [
      {
        id: "theo-1",
        author: "You",
        email: "aaron@orbitsuite.cloud",
        sentAt: "Yesterday at 4:18 PM",
        direction: "outbound",
        body: [
          "Theo — I can walk your platform team through an end-to-end production run and the evidence surface behind it. Wednesday afternoon is open on my side.",
        ],
      },
      {
        id: "theo-2",
        author: "Theo Brooks",
        email: "theo@redline.example",
        sentAt: "Today at 5:31 PM",
        direction: "inbound",
        body: [
          "Wednesday at 2:00 works. Can you show the recovery path after a failed build, including what the operator sees and what remains in the audit trail?",
          "That is the part our platform lead will care about most.",
        ],
      },
    ],
  },
  {
    id: "accelerator-traction",
    contactId: "mira-chen",
    sender: "Mira Chen",
    company: "Launch Foundry",
    initials: "MC",
    subject: "One follow-up on traction",
    preview: "Could you separate what is live today from what is still on the near-term roadmap?",
    time: "Yesterday",
    fullDate: "Yesterday at 11:08 AM",
    unread: false,
    starred: false,
    priority: "normal",
    state: "inbox",
    owner: "me",
    tags: ["Application"],
    accent: "#c4a4ff",
    signal: "Qualification",
    summary:
      "Mira needs a clean boundary between current production capability and roadmap before finishing the application review.",
    nextAction: "Reply with a two-column live-now versus next-90-days summary.",
    messages: [
      {
        id: "mira-1",
        author: "Mira Chen",
        email: "mira@launchfoundry.example",
        sentAt: "Yesterday at 11:08 AM",
        direction: "inbound",
        body: [
          "Thanks for the thorough application. One follow-up: could you separate what is live today from what is still on the near-term roadmap?",
          "The current language makes the destination clear, but I want to be precise about the commercial product as it exists now.",
        ],
      },
    ],
  },
  {
    id: "podcast-assets",
    contactId: "sasha-reid",
    sender: "Sasha Reid",
    company: "Systems at Scale",
    initials: "SR",
    subject: "Recording confirmed — assets needed",
    preview: "We are locked for Friday. Send a headshot and one-sentence bio whenever you can.",
    time: "Tue",
    fullDate: "Tuesday at 3:16 PM",
    unread: false,
    starred: true,
    priority: "normal",
    state: "waiting",
    owner: "me",
    tags: ["Media", "Due Friday"],
    accent: "#ffad7a",
    signal: "Committed",
    summary:
      "The recording is confirmed. Only the host assets remain outstanding.",
    nextAction: "Send the approved headshot and a one-sentence founder bio.",
    messages: [
      {
        id: "sasha-1",
        author: "Sasha Reid",
        email: "sasha@systemsscale.example",
        sentAt: "Tuesday at 3:16 PM",
        direction: "inbound",
        body: [
          "We are locked for Friday. Send a headshot and a one-sentence bio whenever you can, and I will get the episode page staged.",
          "The conversation will focus on the shift from AI-assisted coding to autonomous software production.",
        ],
      },
    ],
  },
  {
    id: "credit-forecast",
    contactId: "elena-ross",
    sender: "Elena Ross",
    company: "Alloy Works",
    initials: "ER",
    subject: "Infrastructure credit review",
    preview: "The technical fit looks reasonable. I need the revised twelve-month forecast to open the review.",
    time: "Aug 18",
    fullDate: "August 18 at 9:24 AM",
    unread: false,
    starred: false,
    priority: "normal",
    state: "snoozed",
    owner: "them",
    tags: ["Partner", "Forecast"],
    accent: "#ff8bb7",
    signal: "Blocked on us",
    summary:
      "Elena can advance the credit review once the revised infrastructure forecast is returned.",
    nextAction: "Update the workload assumptions and send the twelve-month forecast.",
    messages: [
      {
        id: "elena-1",
        author: "Elena Ross",
        email: "elena@alloyworks.example",
        sentAt: "August 18 at 9:24 AM",
        direction: "inbound",
        body: [
          "The technical fit looks reasonable. I need the revised twelve-month infrastructure forecast to open the review on my side.",
          "Please separate baseline production usage from the higher-volume demonstration and evaluation workloads.",
        ],
      },
    ],
  },
];
