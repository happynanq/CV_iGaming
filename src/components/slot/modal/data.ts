
export type CVBlock =
  | { type: "header"; text: string; subtitle?: string }
  | { type: "summary"; text: string }
  | { type: "section"; text: string }
  | { type: "experience"; text: string; period?: string; company?: string }
  | { type: "skills"; text: string; category?: string }
  | { type: "achievements"; text: string; period?: string }
  | { type: "education"; text: string; period?: string }
  | { type: "contact"; text: string; url?: string };

export const cvContent: CVBlock[] = [
  // HEADER
  {
    type: "header",
    text: "Kirill Aleksandrov",
    subtitle: "Frontend Developer · React · TypeScript",
  },
  {
    type: "contact",
    text: "Email",
    url: "mailto:happynanq@gmail.com",
  },
  {
    type: "contact",
    text: "GitHub",
    url: "https://github.com/happynanq",
  },
  {
    type: "contact",
    text: "Telegram",
    url: "https://t.me/untitleness",
  },

  // SUMMARY
  {
    type: "summary",
    text: "Frontend Developer specializing in React and TypeScript, with experience building interactive web applications, browser-based games, and complex UI logic. Skilled in API integration, state management, game rendering, animation systems, and frontend performance optimization.",
  },

  // EXPERIENCE
  {
    type: "section",
    text: "Experience",
  },
  {
    type: "experience",
    company: "Game Provider Studio",
    period: "2025–2026",
    text: "Built a slot game frontend from scratch using React and TypeScript. The game became a core part of the product, which reached an investment round within three months.",
  },
  {
    type: "experience",
    company: "Game Provider Studio",
    period: "2025–2026",
    text: "Implemented core slot mechanics, including the reel system, spin states, game flow, and interactive gameplay features.",
  },
  {
    type: "experience",
    company: "Game Provider Studio",
    period: "2025–2026",
    text: "Integrated PixiJS and Spine to build the game scene, animations, and visual effects for a rich interactive experience.",
  },
  {
    type: "experience",
    company: "Game Provider Studio",
    period: "2025–2026",
    text: "Optimized rendering performance, reducing CPU utilization on a MacBook Pro with an M4 Pro chip from approximately 80% to 15%. Eliminated overheating and FPS drops during gameplay on Android devices.",
  },
  {
    type: "experience",
    company: "Game Provider Studio",
    period: "2025–2026",
    text: "Implemented responsive game scaling and integrated backend APIs, asynchronous requests, and application state management.",
  },
  {
    type: "experience",
    company: "Game Provider Studio",
    period: "2025–2026",
    text: "Contributed to team development through task decomposition, code reviews, shared component development, and Git Flow. Helped onboard developers and explain the frontend architecture.",
  },
  {
    type: "experience",
    company: "Brainbush",
    period: "2025",
    text: "Developed React and TypeScript interfaces, built reusable components, implemented user flows, fixed bugs, and integrated REST APIs within an existing application architecture.",
  },
  {
    type: "experience",
    company: "Freelance / Client Projects",
    period: "2020–2025",
    text: "Developed full-stack applications from requirements to delivery, implementing frontend and backend functionality, authentication, REST APIs, and database integration.",
  },

  // SKILLS
  {
    type: "section",
    text: "Technical Skills",
  },
  {
    type: "skills",
    category: "Frontend",
    text: "React, TypeScript, JavaScript, Redux Toolkit, Zustand, React Query, React Router, Tailwind CSS, PixiJS, HTML, CSS, wagmi",
  },
  {
    type: "skills",
    category: "Graphics & Animation",
    text: "PixiJS, Spine, GSAP, Howler",
  },
  {
    type: "skills",
    category: "Backend",
    text: "Node.js, Express, REST APIs, PostgreSQL, MongoDB, JWT",
  },
  {
    type: "skills",
    category: "Tools & Architecture",
    text: "Git, Docker, Nginx, Vite, Next.js, Feature-Sliced Design (FSD)",
  },
  {
    type: "skills",
    category: "Languages",
    text: "English — B2 (Upper-Intermediate)",
  },

  // ACHIEVEMENTS
  {
    type: "section",
    text: "Achievements",
  },
  {
    type: "achievements",
    period: "2025",
    text: "Prize-winning placements in programming hackathons.",
  },
  {
    type: "achievements",
    period: "2024–2025",
    text: "Winner of the ICPC Northern Eurasia Region Quarterfinals.",
  },
  {
    type: "achievements",
    period: "2024–2025",
    text: "Third-degree diploma at the ICPC Northern Eurasia Finals, Siberian Group.",
  },
  {
    type: "achievements",
    period: "2021–2025",
    text: "Prize-winning placements in regional programming olympiads.",
  },

  // EDUCATION
  {
    type: "section",
    text: "Education",
  },
  {
    type: "education",
    period: "2023–2027",
    text: "Siberian Federal University — Applied Mathematics and Computer Science.",
  },
  {
    type: "education",
    period: "2021–2023",
    text: "SibFU Physics and Mathematics School.",
  },
  {
    type: "education",
    period: "2022",
    text: "NlogN Programming Camp.",
  },
  {
    type: "education",
    period: "2019–2020",
    text: "SibFU ZENSH — Physics and Mathematics Program.",
  },
];

export const winContentByType: Record<string, { title: string; blocks: CVBlock[] }> = {
  experience: {
    title: "Experience",
    blocks: cvContent.filter((block) => block.type === "experience"),
  },
  engineering: {
    title: "Engineering",
    blocks: cvContent.filter(
      (block) =>
        block.type === "skills" &&
        ["Frontend", "Backend", "Tools & Architecture"].includes(
          block.category ?? "",
        ),
    ),
  },
  graphics: {
    title: "Graphics",
    blocks: cvContent.filter(
      (block) =>
        block.type === "skills" && block.category === "Graphics & Animation",
    ),
  },
  about: {
    title: "About",
    blocks: cvContent.filter(
      (block) => block.type === "summary" || block.type === "education",
    ),
  },
  contact: {
    title: "Contact",
    blocks: cvContent.filter((block) => block.type === "contact"),
  },
  highlights: {
    title: "Highlights",
    blocks: cvContent.filter((block) => block.type === "achievements"),
  },
};
