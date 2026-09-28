(function () {
  const locales = ["en", "ar"];
  const translations = {
    en: {
      meta: { title: "Massari | Find your direction", description: "A bilingual illustrative quiz for exploring sector interests." },
      ui: {
        skip: "Skip to quiz",
        brandKicker: "YOUR PATH, CLEARER",
        footer: "Massari is an independent, illustrative reflection tool. It is not an official assessment, government product, or career recommendation.",
        languageLabel: "Choose language",
        themeToLight: "Switch to light theme",
        themeToDark: "Switch to dark theme",
        themeLight: "Light",
        themeDark: "Dark",
        themeLightSelected: "Light theme selected.",
        themeDarkSelected: "Dark theme selected.",
        welcomeTag: "10 thoughtful questions",
        welcomeTitle: "Which direction feels <em>like you?</em>",
        welcomeLead: "Follow the connections in what interests you and discover a sector worth exploring.",
        notice: "This quiz uses neutral illustrative descriptions and roles. You can replace its content later; it is not official guidance.",
        start: "Start the quiz",
        privacy: "Your choices stay in this browser tab. Nothing is saved or sent.",
        heroLabel: "YOUR OUTCOME",
        heroOutcome: "Find your\ndirection",
        questionKicker: "QUESTION {current} / {total}",
        questionTitle: "Find your direction",
        questionCount: "Question {current} of {total}",
        progressLabel: "Quiz progress",
        progressText: "Question {current} of {total}",
        answerPrompt: "Choose the answer that feels most like you",
        back: "Back",
        next: "Next",
        seeResult: "See my result",
        resultTag: "YOUR QUIZ RESULT",
        resultTitle: "Your best match",
        resultLead: "Based on the choices you made in this quick reflection.",
        resultKicker: "A direction to explore",
        scoreLabel: "Best-match score",
        points: "points",
        jobsLabel: "Two example roles",
        tie: "More than one sector shared the highest score. This result uses the quiz’s listed sector order to choose one direction.",
        chartKicker: "Your full picture",
        chartTitle: "Scores across all sectors",
        chartSummary: "Your strongest score is <strong>{score} points</strong> in {sector}.",
        download: "Download my result",
        downloading: "Creating image…",
        downloaded: "Downloaded",
        downloadFailure: "Could not download",
        retry: "Try again",
        resultDisclaimer: "These sectors, example roles, and scores are illustrative examples only. Replace the data files with approved content if needed.",
        statusLanguage: "English selected.",
        statusStart: "Quiz started. Question 1 of {total}.",
        statusAnswer: "Answer selected. You can continue when ready.",
        statusQuestion: "Question {current} of {total}.",
        statusResult: "Result ready. Your best match is {sector}.",
        statusReset: "Quiz reset. You can start again.",
        statusDownloaded: "Your result image was downloaded.",
        errorResult: "We could not create your result. Please check your answers and try again.",
        errorDownload: "The result image could not be downloaded.",
        cardBrand: "MASSARI · YOUR PATH, CLEARER",
        cardMatch: "Your best match",
        cardScore: "Illustrative score: {score} points",
        cardJobs: "Example career directions",
        cardDisclaimer: "Illustrative content only — not official guidance or career advice.",
        cardFilename: "massari-result"
      },
      sectors: {},
      questions: {}
    },
    ar: {
      meta: { title: "مساري | اكتشف مسارك", description: "اختبار ثنائي اللغة لاستكشاف الاهتمامات المهنية بشكل توضيحي." },
      ui: {
        skip: "تجاوز إلى الاختبار",
        brandKicker: "طريقك، أوضح",
        footer: "مساري أداة مستقلة للتأمل والاستكشاف. ليس تقييمًا رسميًا أو منتجًا حكوميًا أو توصية مهنية.",
        languageLabel: "اختر اللغة",
        themeToLight: "التبديل إلى المظهر الفاتح",
        themeToDark: "التبديل إلى المظهر الداكن",
        themeLight: "فاتح",
        themeDark: "داكن",
        themeLightSelected: "تم اختيار المظهر الفاتح.",
        themeDarkSelected: "تم اختيار المظهر الداكن.",
        welcomeTag: "10 أسئلة قصيرة",
        welcomeTitle: "أي مسار <em>يشبهك؟</em>",
        welcomeLead: "تتبّع ما يهمك، واربط بين اهتماماتك، واكتشف قطاعًا يستحق الاستكشاف.",
        notice: "يستخدم هذا الاختبار أوصافًا وأمثلة وظيفية محايدة للتوضيح. يمكنك استبدال محتواه لاحقًا؛ وهو ليس إرشادًا رسميًا.",
        start: "ابدأ الاختبار",
        privacy: "تبقى اختياراتك في علامة التبويب هذه فقط. لا يتم حفظ أي شيء أو إرساله.",
        heroLabel: "نتيجتك",
        heroOutcome: "اكتشف\nمسارك",
        questionKicker: "السؤال {current} / {total}",
        questionTitle: "اكتشف مسارك",
        questionCount: "السؤال {current} من {total}",
        progressLabel: "تقدم الاختبار",
        progressText: "السؤال {current} من {total}",
        answerPrompt: "اختر الإجابة الأقرب إليك",
        back: "السابق",
        next: "التالي",
        seeResult: "اعرض نتيجتي",
        resultTag: "نتيجة اختبارك",
        resultTitle: "أنسب مسار لك",
        resultLead: "استنادًا إلى اختياراتك في هذا التأمل السريع.",
        resultKicker: "مسار يستحق الاستكشاف",
        scoreLabel: "درجة التوافق",
        points: "نقطة",
        jobsLabel: "مثالان لمسارات وظيفية",
        tie: "تساوى أكثر من قطاع في أعلى درجة. اختار الاختبار هذه النتيجة وفق ترتيب القطاعات المعروض فيه.",
        chartKicker: "الصورة الكاملة",
        chartTitle: "درجاتك عبر جميع القطاعات",
        chartSummary: "أعلى درجاتك هي <strong>{score} نقطة</strong> في قطاع {sector}.",
        download: "نزّل نتيجتي",
        downloading: "جارٍ إنشاء الصورة…",
        downloaded: "تم التنزيل",
        downloadFailure: "تعذّر التنزيل",
        retry: "أعد المحاولة",
        resultDisclaimer: "هذه القطاعات والأدوار النموذجية والدرجات أمثلة توضيحية فقط. يمكنك استبدال ملفات البيانات بمحتوى معتمد عند الحاجة.",
        statusLanguage: "تم اختيار العربية.",
        statusStart: "بدأ الاختبار. السؤال 1 من {total}.",
        statusAnswer: "تم اختيار الإجابة. يمكنك المتابعة عندما تكون مستعدًا.",
        statusQuestion: "السؤال {current} من {total}.",
        statusResult: "النتيجة جاهزة. أنسب مسار لك هو {sector}.",
        statusReset: "تمت إعادة ضبط الاختبار. يمكنك البدء من جديد.",
        statusDownloaded: "تم تنزيل صورة نتيجتك.",
        errorResult: "تعذّر إنشاء نتيجتك. تحقّق من إجاباتك ثم حاول مرة أخرى.",
        errorDownload: "تعذّر تنزيل صورة النتيجة.",
        cardBrand: "مساري · طريقك، أوضح",
        cardMatch: "أنسب مسار لك",
        cardScore: "درجة توضيحية: {score} نقطة",
        cardJobs: "اتجاهات وظيفية نموذجية",
        cardDisclaimer: "محتوى توضيحي فقط — ليس إرشادًا رسميًا أو نصيحة مهنية.",
        cardFilename: "massari-result"
      },
      sectors: {
        tourism: { name: "السياحة", description: "مثال توضيحي: مناسب لمن يستمتعون بالترحيب بالزوار، ومشاركة الأماكن، وصنع تجارب لا تُنسى.", jobs: ["منسق تجربة الزوار", "مخطط الأنشطة والوجهات"] },
        technology: { name: "التقنية", description: "مثال توضيحي: مناسب لمن يحبون حل المشكلات وبناء أدوات مفيدة واستكشاف طريقة عمل الأشياء.", jobs: ["مطور برمجيات مبتدئ", "منسق منتجات رقمية"] },
        health: { name: "الصحة", description: "مثال توضيحي: مناسب لمن يهتمون بالعافية، ويستمعون باهتمام، ويرغبون في دعم الآخرين.", jobs: ["منسق صحة مجتمعية", "مساعد تجربة المرضى"] },
        finance: { name: "المالية", description: "مثال توضيحي: مناسب لمن يستمتعون بالتخطيط واكتشاف الأنماط واتخاذ قرارات مدروسة بالمعلومات.", jobs: ["مساعد تخطيط مالي", "محلل بيانات أعمال"] },
        "culture-entertainment": { name: "الثقافة والترفيه", description: "مثال توضيحي: مناسب لمن يحبون الإبداع والقصص واللحظات المشتركة وتحويل الأفكار إلى واقع.", jobs: ["مساعد إنتاج فعاليات", "منسق محتوى إبداعي"] }
      },
      questions: {
        "ideal-project": { text: "أي نوع من المشاريع يبدو الأكثر إثارة بالنسبة لك؟", answers: { explore: "تصميم تجربة ترحيبية للزوار", build: "بناء أداة رقمية مفيدة", support: "ابتكار شيء يحسن العافية", create: "إنتاج فعالية إبداعية لا تُنسى" } },
        weekend: { text: "في عطلة نهاية أسبوع حرة، ما الذي تستمتع به أكثر؟", answers: { discover: "اكتشاف مكان جديد أو تجربة محلية", tinker: "تجربة تطبيق أو جهاز أو مهارة رقمية جديدة", care: "المساعدة في نشاط للعافية أو المجتمع", make: "صنع الموسيقى أو الفن أو الاستمتاع بعرض" } },
        strength: { text: "ما القوة التي يلاحظها الناس فيك غالبًا؟", answers: { host: "جعل الناس يشعرون بالترحيب", detail: "التنظيم والانتباه للتفاصيل", empathy: "الاستماع باهتمام", imagination: "تحويل الأفكار الأصلية إلى واقع" } },
        "team-role": { text: "في فريق، أي دور يبدو طبيعيًا لك أكثر؟", answers: { guide: "توجيه المجموعة والحفاظ على تفاعل الجميع", invent: "تجربة الأدوات وتحسين العملية", "check-in": "الحرص على أن يشعر الجميع بالدعم", energize: "إضافة الحماس والأفكار واللمسة الإبداعية" } },
        success: { text: "أي نتيجة تجعلك تشعر بأكبر قدر من الفخر؟", answers: { visitors: "أن يغادر الزوار بذكرى جميلة", tool: "أن تجعل أداة جديدة المهمة أسهل", wellbeing: "أن يشعر شخص ما بدعم أفضل", audience: "أن يشعر الجمهور بالإلهام أو الترفيه" } },
        learn: { text: "ما الذي يثير فضولك لتتعلم عنه أكثر؟", answers: { places: "كيفية تصميم تجارب محلية ذات معنى", insights: "كيفية اتخاذ قرارات باستخدام البيانات", wellness: "كيفية دعم المجتمعات للعافية", stories: "كيفية ربط القصص والإعلام والفعاليات بين الناس" } },
        workplace: { text: "أي بيئة عمل تبدو الأكثر جاذبية لك؟", answers: { destination: "مكان حيوي يأتي إليه الناس للاستكشاف", studio: "مساحة تعاونية لتجربة أفكار جديدة", community: "بيئة تركز على الناس وتبني الثقة", stage: "بيئة إبداعية مليئة بالأفكار والتعبير" } },
        challenge: { text: "أي تحدٍ تختار أن تحله؟", answers: { welcome: "مساعدة القادمين الجدد على الاستكشاف بثقة", simplify: "تبسيط مهمة معقدة بالتقنية", access: "جعل الخدمات المفيدة أسهل للفهم", connection: "ابتكار تجربة تجمع الناس معًا" } },
        feedback: { text: "أي نوع من الملاحظات يحفزك أكثر؟", answers: { memorable: "«جعلت هذه التجربة لا تُنسى.»", smart: "«خطتك منحتنا وضوحًا حقيقيًا.»", caring: "«جعلتني أشعر بأنني مرئي ومدعوم.»", inspiring: "«عملك جعل الناس يشعرون بشيء.»" } },
        future: { text: "عندما تتخيل عملك في المستقبل، ما الأهم بالنسبة لك؟", answers: { connections: "ربط الناس بالأماكن والتجارب", direction: "مساعدة الناس على اتخاذ خيارات واثقة", impact: "دعم حياة ومجتمعات أكثر صحة", expression: "مشاركة أفكار تحرك الناس وتمتعهم" } }
      }
    }
  };

  function getPath(object, path) {
    return path.split(".").reduce((value, key) => value && value[key], object);
  }

  function validateTranslations(sectors, questions) {
    locales.forEach((locale) => {
      if (!translations[locale] || !translations[locale].ui) throw new Error(`Missing ${locale} interface translations.`);
      ["skip", "welcomeTitle", "start", "resultTitle", "download", "cardBrand"].forEach((key) => {
        if (typeof translations[locale].ui[key] !== "string" || !translations[locale].ui[key].trim()) throw new Error(`Missing ${locale} UI translation: ${key}`);
      });
    });
    if (sectors && questions) {
      sectors.forEach((sector) => {
        const item = translations.ar.sectors[sector.id];
        if (!item || !item.name || !item.description || !Array.isArray(item.jobs) || item.jobs.length !== 2) throw new Error(`Missing Arabic sector translation: ${sector.id}`);
      });
      questions.forEach((question) => {
        const item = translations.ar.questions[question.id];
        if (!item || !item.text) throw new Error(`Missing Arabic question translation: ${question.id}`);
        question.answers.forEach((answer) => {
          if (!item.answers || !item.answers[answer.id]) throw new Error(`Missing Arabic answer translation: ${question.id}.${answer.id}`);
        });
      });
    }
    return true;
  }

  const api = { locales, translations, getPath, validateTranslations };
  if (typeof window !== "undefined") window.MASSARI_TRANSLATIONS = api;
  if (typeof module !== "undefined") module.exports = api;
})();
