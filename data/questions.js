(function () {
  const questions = [
    {
      id: "ideal-project",
      text: "Which kind of project sounds most exciting to you?",
      answers: [
        { id: "explore", label: "Design a welcoming experience for visitors", scores: { tourism: 1 } },
        { id: "build", label: "Build a helpful digital tool", scores: { technology: 2 } },
        { id: "support", label: "Create something that improves wellbeing", scores: { health: 1 } },
        { id: "create", label: "Produce a memorable creative event", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "weekend",
      text: "On a free weekend, what would you most enjoy doing?",
      answers: [
        { id: "discover", label: "Discover a new place or local experience", scores: { tourism: 1 } },
        { id: "tinker", label: "Try a new app, device, or digital skill", scores: { technology: 2 } },
        { id: "care", label: "Help with a wellbeing or community activity", scores: { health: 1 } },
        { id: "make", label: "Make or enjoy music, art, or a performance", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "strength",
      text: "Which strength do people often notice in you?",
      answers: [
        { id: "host", label: "Making people feel welcome", scores: { tourism: 1 } },
        { id: "detail", label: "Being organized and detail-focused", scores: { finance: 3 } },
        { id: "empathy", label: "Listening with care", scores: { health: 1 } },
        { id: "imagination", label: "Bringing original ideas to life", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "team-role",
      text: "In a team, which role feels most natural?",
      answers: [
        { id: "guide", label: "Guide the group and keep everyone engaged", scores: { tourism: 1 } },
        { id: "invent", label: "Test tools and improve the process", scores: { technology: 2 } },
        { id: "check-in", label: "Make sure everyone feels supported", scores: { health: 1 } },
        { id: "energize", label: "Add energy, ideas, and a creative spark", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "success",
      text: "Which outcome would make you feel most proud?",
      answers: [
        { id: "visitors", label: "Visitors leave with a great memory", scores: { tourism: 1 } },
        { id: "tool", label: "A new tool makes a task easier", scores: { technology: 2 } },
        { id: "wellbeing", label: "Someone feels better supported", scores: { health: 1 } },
        { id: "audience", label: "An audience feels inspired or entertained", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "learn",
      text: "What would you be curious to learn more about?",
      answers: [
        { id: "places", label: "How to design meaningful local experiences", scores: { tourism: 1 } },
        { id: "insights", label: "How to make decisions using data", scores: { finance: 3 } },
        { id: "wellness", label: "How communities can support wellbeing", scores: { health: 1 } },
        { id: "stories", label: "How stories, media, and events connect people", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "workplace",
      text: "Which work setting sounds most appealing?",
      answers: [
        { id: "destination", label: "A lively place where people come to explore", scores: { tourism: 1 } },
        { id: "studio", label: "A collaborative space for testing new ideas", scores: { technology: 2 } },
        { id: "community", label: "A people-focused environment that builds trust", scores: { health: 1 } },
        { id: "stage", label: "A creative environment full of ideas and expression", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "challenge",
      text: "Which challenge would you choose to solve?",
      answers: [
        { id: "welcome", label: "Help newcomers feel confident exploring", scores: { tourism: 1 } },
        { id: "simplify", label: "Make a complicated task simpler with technology", scores: { technology: 2 } },
        { id: "access", label: "Make helpful services easier to understand", scores: { health: 1 } },
        { id: "connection", label: "Create an experience that brings people together", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "feedback",
      text: "What kind of feedback would motivate you most?",
      answers: [
        { id: "memorable", label: "“You made this experience unforgettable.”", scores: { tourism: 1 } },
        { id: "smart", label: "“Your plan gave us real clarity.”", scores: { finance: 3 } },
        { id: "caring", label: "“You made me feel seen and supported.”", scores: { health: 1 } },
        { id: "inspiring", label: "“Your work made people feel something.”", scores: { "culture-entertainment": 1 } }
      ]
    },
    {
      id: "future",
      text: "When you imagine your future work, what matters most?",
      answers: [
        { id: "connections", label: "Connecting people with places and experiences", scores: { tourism: 1 } },
        { id: "direction", label: "Helping people make confident choices", scores: { finance: 3 } },
        { id: "impact", label: "Supporting healthier lives and communities", scores: { health: 1 } },
        { id: "expression", label: "Sharing ideas that move and entertain people", scores: { "culture-entertainment": 1 } }
      ]
    }
  ];

  if (typeof window !== "undefined") window.QUESTION_DATA = questions;
  if (typeof module !== "undefined") module.exports = questions;
})();
