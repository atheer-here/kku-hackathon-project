(function () {
  const sectors = [
    {
      id: "tourism",
      name: "Tourism",
      icon: "compass",
      color: "#2a78d6",
      description: "Illustrative example: a fit for people who enjoy welcoming visitors, sharing places, and creating memorable experiences.",
      jobs: ["Visitor experience coordinator", "Destination activities planner"]
    },
    {
      id: "technology",
      name: "Technology",
      icon: "spark",
      color: "#eb6834",
      description: "Illustrative example: a fit for people who like solving problems, building useful tools, and exploring how things work.",
      jobs: ["Junior software developer", "Digital product coordinator"]
    },
    {
      id: "health",
      name: "Health",
      icon: "heart",
      color: "#1baf7a",
      description: "Illustrative example: a fit for people who care about wellbeing, listen carefully, and want to support others.",
      jobs: ["Community health coordinator", "Patient experience assistant"]
    },
    {
      id: "finance",
      name: "Finance",
      icon: "chart",
      color: "#eda100",
      description: "Illustrative example: a fit for people who enjoy planning, spotting patterns, and making careful decisions with information.",
      jobs: ["Financial planning assistant", "Business data analyst"]
    },
    {
      id: "culture-entertainment",
      name: "Culture and Entertainment",
      icon: "star",
      color: "#4a3aa7",
      description: "Illustrative example: a fit for people who love creativity, stories, shared moments, and bringing ideas to life.",
      jobs: ["Event production assistant", "Creative content coordinator"]
    }
  ];

  if (typeof window !== "undefined") window.SECTOR_DATA = sectors;
  if (typeof module !== "undefined") module.exports = sectors;
})();
