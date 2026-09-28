(function () {
  const locales = ["en", "ar"];
  const translations = {
    en: {
      meta: { title: "Massari | Discover your path", description: "A bilingual, illustrative quiz for exploring future-sector interests." },
      ui: {
        skip: "Skip to main experience",
        brandKicker: "PATHS TO POSSIBILITY",
        footer: "Massari is an independent, illustrative exploration tool. It is not an official assessment, government product, or career recommendation.",
        languageLabel: "Choose language",
        themeToLight: "Switch to light theme", themeToDark: "Switch to dark theme", themeLight: "Light", themeDark: "Dark", themeLightSelected: "Light theme selected.", themeDarkSelected: "Dark theme selected.",
        overviewEyebrow: "A small journey of discovery", overviewTitle: "Discover a path that fits you", overviewLead: "Answer 10 short questions and explore the future sector in Saudi Arabia that may best match your interests and strengths.", overviewSupport: "Takes less than a minute", overviewStart: "Start exploring my path", overviewDisclaimer: "Massari is an independent exploration tool. Results are for reflection and discovery, not an official assessment or career recommendation.",
        pathEyebrow: "Your journey starts with your interests", pathTitle: "Every choice shapes part of your path", pathLead: "We connect your answers to your interests, then show you a sector to explore and example roles related to it.", pathBack: "Back to overview", pathStart: "Begin the questions", pathNotice: "There are no right answers. Choose what feels most like you.",
        welcomeTag: "10 short questions", welcomeTitle: "Discover a path that fits <em>you</em>", welcomeLead: "Follow the route in what interests you and discover a sector worth exploring.", notice: "This quiz uses neutral illustrative descriptions and roles. It is not official guidance.", start: "Start the quiz", privacy: "Your choices stay in this browser tab. Nothing is saved or sent.", heroLabel: "YOUR PATH", heroOutcome: "Explore your\ndirection",
        questionKicker: "QUESTION {current} / {total}", questionTitle: "Discover your path", questionCount: "Question {current} of {total}", progressLabel: "Quiz progress", progressText: "Question {current} of {total}", answerPrompt: "Choose the answer that feels most like you", back: "Back", next: "Next", seeResult: "See my result",
        analysisEyebrow: "YOUR PATH IS TAKING SHAPE", analysisTitle: "Connecting the points", analysisLead: "Your choices are forming an illustrative direction to explore.", analysisStage1: "Reading your choices…", analysisStage2: "Connecting your interests to opportunities…", analysisStage3: "Exploring paths that fit you…", analysisStage4: "Preparing your result…", analysisProgressLabel: "Preparing your result", analysisProgressText: "Analysis {current}% complete", analysisSkip: "Show result now",
        resultTag: "YOUR PATH", resultTitle: "A destination to explore", resultLead: "Based on the choices you made in this quick reflection.", resultKicker: "YOUR PATH / A SECTOR TO EXPLORE", scoreLabel: "Illustrative match score", points: "points", jobsLabel: "Two example roles", tie: "More than one sector shared the highest score. This result uses the quiz’s listed sector order to choose one direction.",
        chartKicker: "YOUR FULL PICTURE", chartTitle: "Scores across all sectors", chartSummary: "Your strongest score is <strong>{score} points</strong> in {sector}.", download: "Download my result", downloading: "Creating image…", downloaded: "Downloaded", downloadFailure: "Could not download", retry: "Try again", resultDisclaimer: "These sectors, example roles, and scores are illustrative examples only. Replace the data files with approved content if needed.",
        statusLanguage: "English selected.", statusIntroTwo: "How Massari works.", statusStart: "Quiz started. Question 1 of {total}.", statusAnswer: "Answer selected. You can continue when ready.", statusQuestion: "Question {current} of {total}.", statusAnalysis: "Preparing your illustrative result.", statusAnalysisComplete: "Result ready.", statusResult: "Result ready. Your best match is {sector}.", statusReset: "Quiz reset. You can start again.", statusDownloaded: "Your result image was downloaded.", errorResult: "We could not create your result. Please check your answers and try again.", errorDownload: "The result image could not be downloaded.",
        cardBrand: "MASSARI · PATHS TO POSSIBILITY", cardMatch: "A destination to explore", cardScore: "Illustrative score: {score} points", cardJobs: "Example career directions", cardDisclaimer: "Illustrative content only — not official guidance or career advice.", cardFilename: "massari-result"
      },
      sectors: {}, questions: {}
    },
    ar: {
      meta: { title: "مساري | اكتشف مسارك", description: "اختبار ثنائي اللغة لاستكشاف الاهتمامات في قطاعات المستقبل بصورة توضيحية." },
      ui: {
        skip: "انتقل إلى المحتوى الرئيسي",
        brandKicker: "مسارات نحو الفرص",
        footer: "مساري أداة مستقلة للتأمل والاستكشاف. ليس تقييمًا رسميًا أو منتجًا حكوميًا أو توصية مهنية.",
        languageLabel: "اختر اللغة",
        themeToLight: "التبديل إلى المظهر الفاتح", themeToDark: "التبديل إلى المظهر الداكن", themeLight: "فاتح", themeDark: "داكن", themeLightSelected: "تم اختيار المظهر الفاتح.", themeDarkSelected: "تم اختيار المظهر الداكن.",
        overviewEyebrow: "رحلة قصيرة لاكتشاف ما يناسبك", overviewTitle: "اكتشف المسار الذي يناسبك", overviewLead: "أجب عن 10 أسئلة قصيرة، واكتشف القطاع الذي قد ينسجم مع اهتماماتك ومهاراتك في قطاعات المستقبل في السعودية.", overviewSupport: "يستغرق أقل من دقيقة", overviewStart: "ابدأ اكتشاف مساري", overviewDisclaimer: "مساري أداة استكشافية مستقلة. النتيجة للتأمل والاستكشاف وليست تقييمًا رسميًا أو توصية مهنية.",
        pathEyebrow: "رحلتك تبدأ باهتماماتك", pathTitle: "كل اختيار يرسم جزءًا من مسارك", pathLead: "نربط إجاباتك باهتماماتك، ثم نعرض لك قطاعًا يمكنك استكشافه وأمثلة لأدوار مرتبطة به.", pathBack: "العودة إلى البداية", pathStart: "ابدأ الأسئلة", pathNotice: "لا توجد إجابات صحيحة أو خاطئة؛ اختر ما يشبهك أكثر.",
        welcomeTag: "10 أسئلة قصيرة", welcomeTitle: "اكتشف مسارًا <em>يشبهك</em>", welcomeLead: "تتبّع ما يهمك واكتشف قطاعًا يستحق الاستكشاف.", notice: "يستخدم هذا الاختبار أوصافًا وأمثلة وظيفية توضيحية ومحايدة، وليس إرشادًا رسميًا.", start: "ابدأ الاختبار", privacy: "تبقى اختياراتك في علامة التبويب هذه فقط. لا يتم حفظ أي شيء أو إرساله.", heroLabel: "مسارك", heroOutcome: "اكتشف\nاتجاهك",
        questionKicker: "السؤال {current} من {total}", questionTitle: "اكتشف مسارك", questionCount: "السؤال {current} من {total}", progressLabel: "تقدّم الاختبار", progressText: "السؤال {current} من {total}", answerPrompt: "اختر الإجابة الأقرب إليك", back: "السابق", next: "التالي", seeResult: "اعرض نتيجتي",
        analysisEyebrow: "مسارك يتّضح الآن", analysisTitle: "نصل نقاط اهتمامك", analysisLead: "تتكوّن من اختياراتك وجهة توضيحية يمكنك استكشافها.", analysisStage1: "نقرأ اختياراتك…", analysisStage2: "نربط اهتماماتك بالفرص المناسبة…", analysisStage3: "نستكشف المسارات الأقرب لك…", analysisStage4: "نجهّز نتيجتك…", analysisProgressLabel: "جارٍ إعداد نتيجتك", analysisProgressText: "اكتمل التحليل بنسبة {current}%", analysisSkip: "اعرض النتيجة الآن",
        resultTag: "مسارك", resultTitle: "وجهة تستحق الاستكشاف", resultLead: "استنادًا إلى اختياراتك في هذا التأمل السريع.", resultKicker: "مسارك / قطاع يمكنك استكشافه", scoreLabel: "درجة توافق توضيحية", points: "نقطة", jobsLabel: "مثالان لأدوار مرتبطة به", tie: "تساوى أكثر من قطاع في أعلى درجة. اختار الاختبار هذه النتيجة وفق ترتيب القطاعات المعروض فيه.",
        chartKicker: "صورتك الكاملة", chartTitle: "درجاتك في جميع القطاعات", chartSummary: "أعلى درجاتك هي <strong>{score} نقطة</strong> في قطاع {sector}.", download: "نزّل نتيجتي", downloading: "جارٍ إنشاء الصورة…", downloaded: "تم التنزيل", downloadFailure: "تعذّر التنزيل", retry: "أعد المحاولة", resultDisclaimer: "هذه القطاعات والأدوار النموذجية والدرجات أمثلة توضيحية فقط. يمكنك استبدال ملفات البيانات بمحتوى معتمد عند الحاجة.",
        statusLanguage: "تم اختيار العربية.", statusIntroTwo: "تعرّف إلى طريقة عمل مساري.", statusStart: "بدأ الاختبار. السؤال 1 من {total}.", statusAnswer: "تم اختيار الإجابة. يمكنك المتابعة عندما تكون مستعدًا.", statusQuestion: "السؤال {current} من {total}.", statusAnalysis: "جارٍ إعداد نتيجتك التوضيحية.", statusAnalysisComplete: "النتيجة جاهزة.", statusResult: "النتيجة جاهزة. أنسب مسار لك هو {sector}.", statusReset: "تمت إعادة ضبط الاختبار. يمكنك البدء من جديد.", statusDownloaded: "تم تنزيل صورة نتيجتك.", errorResult: "تعذّر إنشاء نتيجتك. تحقّق من إجاباتك ثم حاول مرة أخرى.", errorDownload: "تعذّر تنزيل صورة النتيجة.",
        cardBrand: "مساري · مسارات نحو الفرص", cardMatch: "وجهة تستحق الاستكشاف", cardScore: "درجة توضيحية: {score} نقطة", cardJobs: "اتجاهات وظيفية نموذجية", cardDisclaimer: "محتوى توضيحي فقط — ليس إرشادًا رسميًا أو نصيحة مهنية.", cardFilename: "massari-result"
      },
      sectors: {
        tourism: { name: "السياحة", description: "مثال توضيحي: قد يناسب من يحبون الترحيب بالزوار، واكتشاف الأماكن، وصناعة تجارب ضيافة لا تُنسى.", jobs: ["منسق تجربة الزوار", "مخطط الوجهات والأنشطة"] },
        technology: { name: "التقنية", description: "مثال توضيحي: قد يناسب من يستمتعون بحل المشكلات، وبناء أدوات مفيدة، وفهم الأنظمة الرقمية.", jobs: ["مطور برمجيات مبتدئ", "منسق منتجات رقمية"] },
        health: { name: "الصحة", description: "مثال توضيحي: قد يناسب من يهتمون بالعافية، ويصغون للآخرين، ويسعون إلى دعم الناس والمجتمعات.", jobs: ["منسق صحة مجتمعية", "مساعد تجربة المرضى"] },
        finance: { name: "المالية", description: "مثال توضيحي: قد يناسب من يستمتعون بالتخطيط، وقراءة الأنماط، واتخاذ قرارات مدروسة بالاعتماد على المعلومات.", jobs: ["مساعد تخطيط مالي", "محلل بيانات أعمال"] },
        "culture-entertainment": { name: "الثقافة والترفيه", description: "مثال توضيحي: قد يناسب من يحبون الإبداع، ورواية القصص، وصنع تجارب وفعاليات تجمع الناس.", jobs: ["مساعد إنتاج فعاليات", "منسق محتوى إبداعي"] }
      },
      questions: {
        "ideal-project": { text: "أي نوع من المشاريع يبدو أكثر إثارة لك؟", answers: { explore: "تصميم تجربة ترحيبية للزوار", build: "بناء أداة رقمية مفيدة", support: "ابتكار شيء يعزّز العافية", create: "إنتاج فعالية إبداعية لا تُنسى" } },
        weekend: { text: "في عطلة نهاية أسبوع حرة، ما الذي تستمتع به أكثر؟", answers: { discover: "اكتشاف مكان جديد أو تجربة محلية", tinker: "تجربة تطبيق أو جهاز أو مهارة رقمية جديدة", care: "المشاركة في نشاط يخدم العافية أو المجتمع", make: "صناعة الفن أو الموسيقى أو حضور عرض" } },
        strength: { text: "ما القوة التي يلاحظها الناس فيك غالبًا؟", answers: { host: "جعل الناس يشعرون بالترحيب", detail: "التنظيم والانتباه إلى التفاصيل", empathy: "الإصغاء باهتمام", imagination: "تحويل الأفكار الأصيلة إلى واقع" } },
        "team-role": { text: "في فريق، أي دور يبدو طبيعيًا لك أكثر؟", answers: { guide: "توجيه المجموعة والحفاظ على تفاعل الجميع", invent: "تجربة الأدوات وتحسين طريقة العمل", "check-in": "الحرص على أن يشعر الجميع بالدعم", energize: "إضافة الحماس والأفكار واللمسة الإبداعية" } },
        success: { text: "أي نتيجة تجعلك تشعر بأكبر قدر من الفخر؟", answers: { visitors: "أن يغادر الزوار بذكرى جميلة", tool: "أن تجعل أداة جديدة المهمة أسهل", wellbeing: "أن يشعر شخص ما بدعم أفضل", audience: "أن يشعر الجمهور بالإلهام أو الترفيه" } },
        learn: { text: "ما الذي يثير فضولك لتتعلم عنه أكثر؟", answers: { places: "كيفية تصميم تجارب محلية ذات معنى", insights: "كيفية اتخاذ قرارات باستخدام البيانات", wellness: "كيفية دعم المجتمعات للعافية", stories: "كيفية وصل القصص والإعلام والفعاليات بالناس" } },
        workplace: { text: "أي بيئة عمل تبدو أكثر جاذبية لك؟", answers: { destination: "مكان حيوي يأتي إليه الناس للاستكشاف", studio: "مساحة تعاونية لتجربة أفكار جديدة", community: "بيئة تركز على الناس وتبني الثقة", stage: "بيئة إبداعية مليئة بالأفكار والتعبير" } },
        challenge: { text: "أي تحدٍ تختار أن تحلّه؟", answers: { welcome: "مساعدة القادمين الجدد على الاستكشاف بثقة", simplify: "تبسيط مهمة معقدة بالتقنية", access: "جعل الخدمات المفيدة أسهل للفهم", connection: "ابتكار تجربة تجمع الناس معًا" } },
        feedback: { text: "أي نوع من الملاحظات يحفزك أكثر؟", answers: { memorable: "«جعلت هذه التجربة لا تُنسى.»", smart: "«خطتك منحتنا وضوحًا حقيقيًا.»", caring: "«جعلتني أشعر بأنني مرئي ومدعوم.»", inspiring: "«عملك جعل الناس يشعرون بشيء.»" } },
        future: { text: "عندما تتخيل عملك في المستقبل، ما الأهم بالنسبة لك؟", answers: { connections: "ربط الناس بالأماكن والتجارب", direction: "مساعدة الناس على اتخاذ خيارات واثقة", impact: "دعم حياة ومجتمعات أكثر صحة", expression: "مشاركة أفكار تحرك الناس وتمتعهم" } }
      }
    }
  };

  function getPath(object, path) { return path.split(".").reduce((value, key) => value && value[key], object); }
  function validateTranslations(sectors, questions) {
    const englishKeys = Object.keys(translations.en.ui).sort();
    locales.forEach((locale) => {
      if (!translations[locale] || !translations[locale].ui) throw new Error(`Missing ${locale} interface translations.`);
      const keys = Object.keys(translations[locale].ui).sort();
      if (keys.join("|") !== englishKeys.join("|")) throw new Error(`${locale} UI keys do not match English UI keys.`);
      keys.forEach((key) => { if (typeof translations[locale].ui[key] !== "string" || !translations[locale].ui[key].trim()) throw new Error(`Missing ${locale} UI translation: ${key}`); });
    });
    if (sectors && questions) {
      sectors.forEach((sector) => { const item = translations.ar.sectors[sector.id]; if (!item || !item.name || !item.description || !Array.isArray(item.jobs) || item.jobs.length !== 2) throw new Error(`Missing Arabic sector translation: ${sector.id}`); });
      questions.forEach((question) => { const item = translations.ar.questions[question.id]; if (!item || !item.text) throw new Error(`Missing Arabic question translation: ${question.id}`); question.answers.forEach((answer) => { if (!item.answers || !item.answers[answer.id]) throw new Error(`Missing Arabic answer translation: ${question.id}.${answer.id}`); }); });
    }
    return true;
  }

  const api = { locales, translations, getPath, validateTranslations };
  if (typeof window !== "undefined") window.MASSARI_TRANSLATIONS = api;
  if (typeof module !== "undefined") module.exports = api;
})();
