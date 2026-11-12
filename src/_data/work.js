// Your work page. Edit freely: add entries, reorder, change categories.
//
// Each entry:
//   title  bold text
//   years  optional, shown gray in parentheses
//   link   optional; a URL, or a page on your site like "/work/umd-loop-mars-rover/"
//   tags   which category buttons it appears under
//
// Sources: your current bensaenz.com and what you've told me about your work.
// Fill in the blank years and check everything against your LinkedIn.
export default {
  // The category buttons, in order. "all" is added automatically; empty ones are hidden.
  categories: ["software", "research", "robotics", "people", "teaching"],

  sections: [
    {
      heading: "now",
      entries: [
        { title: "Building CSS Atlas, a platform for UMD's College Success Scholars", tags: ["software", "people"] },
        { title: "Software for underrepresented groups in STEM, and astrophysics simulations", tags: ["software", "research"] },
      ],
    },
    {
      heading: "work",
      entries: [
        { title: "Program Coordinator & Lead Developer, College Success Scholars (UMD)", years: "", tags: ["people", "software"] },
        { title: "Software Engineering Intern, Comcast", years: "", tags: ["software"] },
        { title: "Founding Engineer, Valley AI (MIT AI Venture Studio × Harvard Innovation Labs)", years: "", tags: ["software", "research"] },
        { title: "Database Consultant, CPERA (UMD)", years: "2026", tags: ["software"] },
        { title: "Team Leader, College Success Scholars", years: "", tags: ["people", "teaching"] },
        { title: "STEM Tutor", years: "", tags: ["teaching"] },
        { title: "Integration Sub-Team Member, UMD Loop", years: "2024", link: "/work/umd-loop-mars-rover/", tags: ["robotics"] },
      ],
    },
    {
      heading: "projects",
      entries: [
        { title: "CSS Atlas", years: "", tags: ["software", "people"] },
        { title: "SAIL", years: "", tags: ["software"] },
        { title: "SleepSense", years: "2026", link: "https://expo.umd.edu/projects/spring-2026/sleepsense", tags: ["research", "software"] },
        { title: "Aether Gravitational Lensing", years: "2024", link: "/work/aether-gravitational-lensing/", tags: ["research"] },
        { title: "UMD Loop Mars Rover", years: "2024", link: "/work/umd-loop-mars-rover/", tags: ["robotics"] },
        { title: "Adversarial attacks on LLaVA", years: "", tags: ["research"] },
        { title: "CircleUp", years: "", tags: ["software"] },
        { title: "Distributed load-testing platform", years: "", tags: ["software"] },
      ],
    },
    {
      heading: "recognition",
      entries: [
        { title: "Top Gold, MIT AI Venture Studio (Valley AI)", years: "", tags: ["software", "research"] },
        { title: "AmazonNEXT Scholar", years: "", tags: ["software"] },
        { title: "48% improvement in robotic propulsion optimization", years: "", tags: ["robotics"] },
        { title: "100% student satisfaction rate as a STEM Tutor", years: "", tags: ["teaching"] },
        { title: "Presented research to 100+ attendees", years: "", tags: ["research"] },
      ],
    },
  ],
};
