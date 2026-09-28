// Massari questions: 12 situational prompts, 4 answers each.
// Scoring: p = primary sector (+2), s = secondary sector (+1), t = trait signal.
// Balance: per question 4 distinct p, the 2 absent sectors each appear once as s, 4 distinct traits;
// overall every sector is p x8 and s x8, so every sector's max score is 20 (tests/content.test.js).
// Trait design: each sector owns one trait PAIR, 4 primary answers per trait:
// tourism people+ideas, technology ideas+data, health people+hands,
// finance people+data, culture ideas+hands, energy hands+data.
// Arabic: no 2nd-person verbs toward the reader (they are gendered); use -ك, nominal sentences,
// first-person labels or third-person subjects.
(function () {
  // A(id, icon, p, s, t, [label en, ar], [whisper en, ar], [signal en, ar])
  function A(id, icon, p, s, t, label, whisper, signal) {
    const bi = (x) => ({ en: x[0], ar: x[1] });
    return { id, icon, label: bi(label), whisper: bi(whisper), signal: bi(signal), p, s, t };
  }

  const questions = [
    {
      id: "week-highlight",
      theme: { en: "What fuels you", ar: "ما يشعل حماسك" },
      prompt: {
        en: "Thursday night, the work week is done. Which moment from it still gives you a buzz?",
        ar: "ليلة الجمعة، وأسبوع العمل انتهى. أيّ لحظة منه ما زالت تُشعل حماسك؟"
      },
      answers: [
        A("sunday-sketch", "lightbulb-filament", "technology", "energy", "ideas",
          ["My Sunday sketch now switches off the AC when we leave", "فكرة خربشتُها يوم الأحد صارت تطفئ المكيّف حين نغادر"],
          ["A Sunday sketch, now running.", "خربشة الأحد صارت تعمل."],
          ["You get a kick out of turning a rough idea into something that works.", "تستهويك لحظة تحوّل الفكرة الأولية إلى شيء يعمل فعلًا."]),
        A("better-deal", "handshake", "finance", "tourism", "people",
          ["I negotiated a better deal and everyone left happy", "فاوضتُ على صفقة أفضل وخرج الجميع راضين"],
          ["A deal where nobody loses.", "صفقة لا خاسر فيها."],
          ["You enjoy finding the terms that work for everyone at the table.", "يسعدك الوصول إلى شروط ترضي كل الأطراف على الطاولة."]),
        A("asked-the-price", "hand-palm", "culture", "finance", "hands",
          ["Something I made by hand had strangers asking the price", "شيء صنعتُه بيدي جعل الغرباء يسألون عن سعره"],
          ["Handmade, and people noticed.", "صنعة يد لفتت الأنظار."],
          ["You love making something with your hands that other people want to own.", "يمتعك أن تصنع يداك شيئًا يتمنّى الآخرون اقتناءه."]),
        A("called-the-storm", "cloud-lightning", "energy", "health", "data",
          ["My little weather station called the dust storm early", "محطة الطقس الصغيرة التي ركّبتُها تنبّأت بالعاصفة الترابية مبكرًا"],
          ["The sky, in numbers.", "السماء عندك أرقام تُقرأ."],
          ["You like reading the environment through data and seeing change before others do.", "يشدّك رصد البيئة بالبيانات، ورؤية التغيّر قبل غيرك."])
      ]
    },
    {
      id: "cant-let-go",
      theme: { en: "The itch", ar: "ما لا يغيب عن البال" },
      prompt: {
        en: "Which of these would stay on your mind until something was done about it?",
        ar: "أيّ هذه المواقف يظلّ عالقًا في الذهن حتى يُعالَج؟"
      },
      answers: [
        A("same-form", "files", "technology", "finance", "data",
          ["Typing the same details into five different forms", "تعبئة البيانات نفسها في خمسة نماذج مختلفة"],
          ["Wasted steps? Not on your watch.", "الخطوات الزائدة لا مكان لها عندك."],
          ["You can't stand a process that wastes people's time, and you want to redesign it.", "الإجراءات التي تهدر وقت الناس تستفزّك، ويشغلك كيف يُعاد تصميمها."]),
        A("tired-friend", "hand-heart", "health", "culture", "people",
          ["A friend who's been exhausted for weeks and shrugs it off", "صديق مُنهَك منذ أسابيع، وكلما سُئل قال: «عادي»"],
          ["You hear what 'I'm fine' hides.", "ما تخفيه كلمة «عادي» لا يفوتك."],
          ["You pick up on how people are really doing, even when they say they're fine.", "لا تفوتك أحوال الناس الحقيقية، حتى حين يقولون إنهم بخير."]),
        A("forgotten-street", "book-open-text", "culture", "tourism", "ideas",
          ["An old street full of stories that everyone drives past", "حيّ قديم مليء بالحكايات يمرّ به الجميع دون التفات"],
          ["Old walls talk to you.", "للجدران القديمة حديث معك."],
          ["You see hidden stories in places and want others to feel them too.", "للأماكن عندك حكايات خفية، ويشغلك أن يشعر بها الآخرون أيضًا."]),
        A("park-litter", "trash", "energy", "health", "hands",
          ["The park left covered in litter after every weekend", "الحديقة التي تمتلئ بالمخلّفات بعد كل عطلة"],
          ["Shared spaces are yours too.", "المكان العام مكانك أيضًا."],
          ["You feel responsible for shared spaces, and you'd rather fix than complain.", "للمكان المشترك حقّ عليك، والإصلاح عندك يسبق الشكوى."])
      ]
    },
    {
      id: "plan-collapses",
      theme: { en: "Plan B", ar: "حين تتعثّر الخطة" },
      prompt: {
        en: "An hour before a big group outing, the whole plan falls apart. What's your first move?",
        ar: "قبل ساعة من طلعة الشلّة، انهارت الخطة بالكامل. ما أول خطوة؟"
      },
      answers: [
        A("new-plan", "arrows-split", "technology", "culture", "ideas",
          ["Pitching a completely different plan nobody thought of", "اقتراح خطة مختلفة تمامًا لم تخطر على بال أحد"],
          ["Plot twist: you had a Plan C.", "مفاجأة: الخطة الثالثة جاهزة أصلًا."],
          ["When things break, you invent a new route instead of mourning the old one.", "حين تنكسر الخطة، يتّجه تفكيرك إلى طريق جديد بدل البكاء على القديم."]),
        A("check-people", "users-three", "health", "tourism", "people",
          ["Checking everyone's okay and lifting the mood again", "الاطمئنان على الجميع وتعديل مزاج الشلّة"],
          ["The one everyone leans on.", "سند الشلّة وقت الشدّة."],
          ["Under pressure, your first instinct is to steady the people around you.", "تحت الضغط، يذهب اهتمامك أولًا إلى تهدئة من حولك."]),
        A("save-bookings", "calendar-x", "finance", "energy", "data",
          ["Checking which bookings we can still move or get back", "مراجعة الحجوزات: ما الذي يمكن تأجيله أو استرداده"],
          ["Calm numbers in the chaos.", "أرقام هادئة وسط الفوضى."],
          ["In a mess, you calmly work out what's lost and what can still be saved.", "وسط الفوضى، يبقى ذهنك هادئًا يحسب الخسارة وما يمكن إنقاذه."]),
        A("sort-logistics", "toolbox", "energy", "technology", "hands",
          ["Grabbing the keys and sorting the car, gear and supplies", "أخذ المفاتيح والتكفّل بالسيارة والعُدّة والأغراض"],
          ["Keys in hand before anyone asks.", "المفاتيح في يدك قبل أن يطلب أحد."],
          ["You fix problems on the ground, with whatever tools are at hand.", "المشكلات عندك تُحلّ في الميدان، وبما يتوفّر من أدوات."])
      ]
    },
    {
      id: "good-day",
      theme: { en: "A good day", ar: "يوم يستحق التكرار" },
      prompt: {
        en: "Picture a workday you'd happily live on repeat. What fills most of it?",
        ar: "يوم عمل يطيب لك أن يتكرّر كل يوم: ما الذي يملأ معظم ساعاته؟"
      },
      answers: [
        A("sensor-pattern", "chart-scatter", "technology", "energy", "data",
          ["Digging through sensor data until a pattern finally shows", "التنقيب في بيانات الحسّاسات حتى يظهر النمط أخيرًا"],
          ["Patterns don't hide from you.", "الأنماط لا تختبئ منك."],
          ["You enjoy the slow hunt through data until the answer shows itself.", "يمتعك البحث المتأنّي في البيانات حتى تتكشّف الإجابة."]),
        A("hands-on-care", "first-aid-kit", "health", "tourism", "hands",
          ["Hands-on care for one person after another, all day", "رعاية عملية بيديّ لشخص بعد آخر، طوال اليوم"],
          ["Care you can see and touch.", "رعاية تُرى وتُلمَس."],
          ["You want your help to be practical and physical, one person at a time.", "يهمّك أن تكون مساعدتك عملية ومحسوسة، لشخص تلو الآخر."]),
        A("client-desk", "chats-circle", "finance", "health", "people",
          ["Sitting with clients and talking a big decision through", "الجلوس مع العملاء ومناقشة قرار كبير معهم"],
          ["The one people consult first.", "أول من يُستشار."],
          ["You like being the person others sit down with before a big decision.", "يسعدك أن يلجأ إليك الناس قبل القرارات الكبيرة."]),
        A("rough-concept", "pencil-simple-line", "culture", "finance", "ideas",
          ["Turning a rough concept into sketches, scenes or a script", "تحويل فكرة خام إلى رسومات أو مشاهد أو نص"],
          ["Concept to canvas.", "من الفكرة إلى اللوحة."],
          ["You enjoy shaping a rough concept until others can see and feel it.", "يمتعك تشكيل الفكرة الخام حتى يراها الآخرون ويشعروا بها."])
      ]
    },
    {
      id: "thank-you",
      theme: { en: "Gratitude", ar: "رسالة شكر" },
      prompt: {
        en: "Four thank-you messages land on your phone. Which one would you screenshot and keep?",
        ar: "وصلت إلى جوالك أربع رسائل شكر. أيّها تستحق لقطة شاشة تبقى للذكرى؟"
      },
      answers: [
        A("the-getaway", "map-trifold", "tourism", "health", "ideas",
          ["“The getaway you planned left us all feeling brand new.”", "«الرحلة التي رتّبتها لنا أعادت إلينا نشاطنا.»"],
          ["You design how a trip feels.", "تصميم إحساس الرحلة موهبتك."],
          ["You like designing experiences people leave feeling better than when they came.", "يستهويك تصميم تجارب يغادرها الناس وهم أفضل حالًا مما جاؤوا."]),
        A("first-investor", "hand-coins", "finance", "technology", "people",
          ["“Thanks to you, our startup landed its first investor.”", "«بفضلك، حصلت شركتنا الناشئة على أول مستثمر.»"],
          ["A bridge between idea and backer.", "جسرٌ بين الفكرة ومن يموّلها."],
          ["You enjoy bringing the right people and the right money together.", "يسعدك الجمع بين الأشخاص المناسبين والتمويل المناسب."]),
        A("busiest-booth", "storefront", "culture", "finance", "hands",
          ["“The stand you built made our booth the busiest there.”", "«الركن الذي بنيته جعل جناحنا الأكثر زحامًا.»"],
          ["Built to draw a crowd.", "بُني ليجذب الجموع."],
          ["You like building physical things that pull people in.", "بناء أشياء ملموسة تجذب الناس متعةٌ خاصة عندك."]),
        A("bill-leak", "gauge", "energy", "finance", "data",
          ["“Your readings showed exactly where our bill was leaking.”", "«قراءاتك كشفت بدقّة من أين تتسرّب فاتورتنا.»"],
          ["Proof, not guesses.", "دليل لا تخمين."],
          ["You like measuring how things run until the waste has nowhere to hide.", "يشدّك قياس سير الأشياء حتى لا يبقى للهدر مكان يختبئ فيه."])
      ]
    },
    {
      id: "learn-fast",
      theme: { en: "Learning", ar: "أسلوب التعلّم" },
      prompt: {
        en: "You have one week to learn something completely new. How do you actually go about it?",
        ar: "أمامك أسبوع واحد لتعلّم شيء جديد كليًا. ما الطريقة التي تنجح معك فعلًا؟"
      },
      answers: [
        A("learn-beside", "users", "tourism", "health", "people",
          ["Tagging along with someone who does it, asking questions", "مرافقة من يتقنه وطرح الأسئلة عليه طوال الوقت"],
          ["Learning is social for you.", "التعلّم عندك تجربة مشتركة."],
          ["You learn fastest next to a real person who already does it.", "أسرع تعلّم عندك يكون بجوار شخص يمارس الأمر فعلًا."]),
        A("simulator-drill", "hand-pointing", "health", "technology", "hands",
          ["Drilling it on a simulator until my hands know it by heart", "التدرّب على جهاز محاكاة حتى تحفظ يداي الخطوات"],
          ["Reps until it's reflex.", "تكرار حتى يصير فطرة."],
          ["You learn by drilling with your hands until the skill becomes second nature.", "التعلّم عندك تدريب عملي باليد حتى تصبح المهارة طبعًا ثانيًا."]),
        A("remix", "pen-nib", "culture", "tourism", "ideas",
          ["Soaking up great examples, then making my own version", "التشبّع بأمثلة ملهمة ثم صنع نسخة خاصة بي"],
          ["Inspired, then original.", "إلهام، ثم بصمة خاصة."],
          ["You absorb what inspires you, then turn it into something that's yours.", "ما يلهمك يتحوّل على يديك إلى شيء يحمل بصمتك."]),
        A("fundamentals", "list-checks", "energy", "finance", "data",
          ["Studying the basics step by step, then testing myself", "دراسة الأساسيات خطوة بخطوة ثم اختبار نفسي"],
          ["Foundations first, always.", "الأساس أولًا، دائمًا."],
          ["You trust a solid method: foundations first, then proof you've got it.", "للمنهج المتين مكانة عندك: الأساس أولًا، ثم الدليل على الإتقان."])
      ]
    },
    {
      id: "four-offers",
      theme: { en: "Safe or bold", ar: "الأمان أم المغامرة" },
      prompt: {
        en: "Four job offers arrive on the same day. Which one makes your heart beat faster?",
        ar: "أربعة عروض عمل وصلت في يوم واحد. أيّها يسرّع نبض قلبك؟"
      },
      answers: [
        A("new-city", "suitcase-rolling", "tourism", "culture", "ideas",
          ["Creating new experiences in a new city every season", "وظيفة أبتكر فيها تجارب جديدة في مدينة جديدة كل موسم"],
          ["Restless in the best way.", "شغف التنقّل يليق بك."],
          ["New places and the chance to reinvent them energise you more than routine ever could.", "الأماكن الجديدة وفرصة ابتكار تجاربها تمنحك طاقة لا يمنحها الروتين."]),
        A("counted-on", "shield-check", "health", "energy", "hands",
          ["A steady, hands-on role where people count on me daily", "وظيفة ثابتة وعملية يعتمد عليّ فيها الناس يوميًا"],
          ["The steady pair of hands.", "اليد الثابتة التي يُعتمد عليها."],
          ["You want to be the steady pair of hands people rely on.", "يهمّك أن يجد الناس فيك اليد الثابتة التي يُعتمد عليها."]),
        A("long-clients", "briefcase", "finance", "health", "people",
          ["A secure role built on long-term client relationships", "وظيفة مستقرة تقوم على علاقات طويلة الأمد مع العملاء"],
          ["Trust, built over years.", "ثقة تُبنى على مهل."],
          ["You'd rather earn people's trust over years than chase quick wins.", "كسب ثقة الناس على مدى سنوات أحبّ إليك من المكاسب السريعة."]),
        A("desert-first", "wind", "energy", "technology", "data",
          ["Monitoring a first-of-its-kind project deep in the desert", "مراقبة مشروع هو الأول من نوعه في قلب الصحراء"],
          ["The frontier, measured.", "الريادة… بالأرقام."],
          ["You're drawn to brand-new, uncertain projects, as long as you can measure what's really happening.", "تشدّك المشاريع الجديدة غير المضمونة، ما دام قياس ما يحدث فعلًا ممكنًا."])
      ]
    },
    {
      id: "free-saturday",
      theme: { en: "Saturday", ar: "مشروع السبت" },
      prompt: {
        en: "A free Saturday and a small project of your own. Which one do you start?",
        ar: "سبتٌ بلا التزامات، ووقت لمشروع صغير يخصّك. أيّ مشروع يستحق البداية؟"
      },
      answers: [
        A("desert-route", "path", "tourism", "culture", "ideas",
          ["Plan a desert trip for friends with a surprise at every stop", "تخطيط كشتة للأصدقاء فيها مفاجأة عند كل محطة"],
          ["Every stop, a surprise.", "في كل محطة مفاجأة."],
          ["You love designing an outing so every stop feels like a small surprise.", "يسعدك رسم الطلعة بحيث تحمل كل محطة فيها مفاجأة صغيرة."]),
        A("walking-group", "person-simple-walk", "health", "culture", "people",
          ["Start a morning walking group with the neighbours", "تأسيس مجموعة مشي صباحية مع الجيران"],
          ["Momentum, but make it social.", "حركة… والناس معك."],
          ["You like getting people moving together, and keeping them at it.", "يسعدك أن يتحرّك الناس معًا، وأن يستمرّوا."]),
        A("online-shop", "calculator", "finance", "technology", "data",
          ["Price out a small online shop to see if it would pay", "دراسة تكاليف متجر إلكتروني صغير لمعرفة جدواه"],
          ["Numbers before the leap.", "الأرقام قبل القفزة."],
          ["You like checking the numbers before you jump, so the idea stands on solid ground.", "يهمّك التحقّق من الأرقام قبل الإقدام، لتقف الفكرة على أرض صلبة."]),
        A("upcycle", "armchair", "culture", "energy", "hands",
          ["Turn old furniture from Grandpa's house into something new", "تحويل أثاث قديم من بيت الجدّ إلى قطعة جديدة"],
          ["Old wood, new life.", "خشب قديم، وحياة جديدة."],
          ["You enjoy giving old things a second life with your own hands.", "يمتعك منح الأشياء القديمة حياة ثانية بيديك."])
      ]
    },
    {
      id: "tie-breaker",
      theme: { en: "Deciding", ar: "لحظة القرار" },
      prompt: {
        en: "Two options look equally good, and you have to choose tonight. What tips the balance?",
        ar: "خياران متكافئان، والقرار مطلوب الليلة. ما الذي يرجّح الكفّة؟"
      },
      answers: [
        A("how-it-feels", "smiley", "tourism", "health", "people",
          ["How it will feel for the people it affects", "وقعه على مشاعر من يمسّهم القرار"],
          ["People first, then the plan.", "الناس أولًا، ثم الخطة."],
          ["You weigh decisions by how they'll land with the people involved.", "تُوزن القرارات عندك بوقعها على الناس."]),
        A("more-doors", "door-open", "technology", "culture", "ideas",
          ["Which one opens more interesting doors later", "أيّهما يفتح أبوابًا أكثر إثارة لاحقًا"],
          ["Always playing the long game.", "عينك دائمًا على المدى البعيد."],
          ["You choose the path that leaves the most room to invent later.", "الخيار الذي يترك مساحة أوسع للابتكار لاحقًا هو الأقرب إليك."]),
        A("cost-risk", "scales", "finance", "energy", "data",
          ["A quick comparison of cost, risk and payoff", "مقارنة سريعة بين التكلفة والمخاطرة والعائد"],
          ["Cost, risk, return. Done.", "تكلفة، مخاطرة، عائد… وانتهى."],
          ["You trust a clear comparison of cost, risk and return.", "المقارنة الواضحة بين التكلفة والمخاطرة والعائد محلّ ثقتك."]),
        A("try-both", "flask", "energy", "technology", "hands",
          ["Trying a small version of each and seeing what holds", "تجربة نسخة مصغّرة من كلٍّ منهما ومعرفة أيّهما يصمد"],
          ["Test it, then trust it.", "التجربة أولًا، ثم الثقة."],
          ["You'd rather test in the real world than guess on paper.", "التجربة الفعلية أحبّ إليك من التخمين على الورق."])
      ]
    },
    {
      id: "ten-years",
      theme: { en: "Legacy", ar: "الأثر الباقي" },
      prompt: {
        en: "Ten years from now, which mark would make you quietly proud?",
        ar: "بعد عشر سنوات، أيّ أثر سيملؤك فخرًا؟"
      },
      answers: [
        A("guests-friends", "coffee", "tourism", "health", "people",
          ["Visitors who came as guests and left as friends", "زوّار جاؤوا ضيوفًا ورحلوا أصدقاء"],
          ["Guests in, friends out.", "يأتون ضيوفًا ويرحلون أصدقاء."],
          ["You'd measure success in the people who felt cared for along the way.", "مقياس النجاح عندك هو عدد من شعروا بالاهتمام على الطريق."]),
        A("invisible-tool", "cube", "technology", "energy", "ideas",
          ["A tool I designed that people use daily without noticing", "أداة صمّمتُها يستخدمها الناس يوميًا دون أن ينتبهوا"],
          ["Invisible, essential.", "خفيّ، لكن لا غنى عنه."],
          ["You'd love to design the quiet systems everyone depends on.", "حلمك تصميم الأنظمة الخفية التي يعتمد عليها الجميع."]),
        A("right-calls", "trend-up", "finance", "technology", "data",
          ["Calls I made on the numbers that ten years proved right", "قرارات بنيتُها على الأرقام وأثبتت السنوات صوابها"],
          ["Proven right by time.", "والأيام أثبتت صوابك."],
          ["You want your judgement measured by results that hold up over years.", "يهمّك أن يُقاس حكمك بنتائج تصمد سنوات."]),
        A("people-travel", "map-pin-line", "culture", "tourism", "hands",
          ["Something I made by hand that people travel to see", "عمل صنعتُه بيدي يقصده الناس من بعيد ليروه"],
          ["Made to be visited.", "صُنع ليُزار."],
          ["You want to make something real and lasting that people seek out.", "حلمك عمل ملموس يدوم ويقصده الناس."])
      ]
    },
    {
      id: "work-setting",
      theme: { en: "Setting", ar: "مكان العمل" },
      prompt: {
        en: "Forget job titles for a second. Where would you want your workday to happen?",
        ar: "بعيدًا عن المسمّيات الوظيفية: أين يطيب لك أن يمضي يوم عملك؟"
      },
      answers: [
        A("fresh-venue", "confetti", "tourism", "culture", "ideas",
          ["A buzzing venue where every season needs a fresh idea", "مكان نابض بالحياة يحتاج كل موسم إلى فكرة جديدة"],
          ["Fresh every season.", "كل موسم بفكرة جديدة."],
          ["You want a workplace that keeps asking you for fresh ideas.", "يناسبك مكان عمل يطلب منك أفكارًا جديدة باستمرار."]),
        A("two-screens", "desktop", "technology", "finance", "data",
          ["A calm desk, two screens and one hard problem", "مكتب هادئ وشاشتان ومسألة صعبة واحدة"],
          ["Deep focus suits you.", "التركيز العميق بيئتك."],
          ["You come alive in quiet focus with a hard problem in front of you.", "التركيز الهادئ أمام مسألة صعبة يوقظ أفضل ما فيك."]),
        A("one-by-one", "door", "health", "tourism", "people",
          ["A calm room where people come to me one by one for help", "غرفة هادئة يأتيني فيها الناس واحدًا تلو الآخر طلبًا للعون"],
          ["One person at a time.", "شخص واحد في كل مرة."],
          ["You'd rather give each person your full attention than juggle a crowd.", "منح كل شخص انتباهك الكامل أحبّ إليك من إدارة الزحام."]),
        A("open-sky", "hard-hat", "energy", "technology", "hands",
          ["Out on site under open sky, tools in hand", "في الميدان وفي الهواء الطلق، والأدوات في يدي"],
          ["Office walls? No thanks.", "المكتب لا يتّسع لك."],
          ["You'd rather be out on site than behind a desk.", "الميدان أحبّ إليك من المكتب."])
      ]
    },
    {
      id: "open-budget",
      theme: { en: "Budget", ar: "ميزانية مفتوحة" },
      prompt: {
        en: "The municipality gives your neighbourhood a budget to improve one thing. Where does it go?",
        ar: "خصّصت البلدية لحيّكم ميزانية لتحسين شيء واحد فقط، والقرار بيدك. أين تُصرف؟"
      },
      answers: [
        A("weekend-market", "tent", "tourism", "finance", "people",
          ["An empty lot turned into a lively weekend market", "أرض فضاء تتحوّل إلى سوق شعبي يعجّ بالناس في الإجازة"],
          ["Instant gathering spot.", "مكان يجمع الناس فورًا."],
          ["You like creating places where people gather and want to linger.", "يستهويك صنع أماكن يجتمع فيها الناس ويطيب لهم البقاء."]),
        A("flood-sensors", "cloud-rain", "technology", "energy", "data",
          ["Sensors that show which streets flood when it rains", "حسّاسات تكشف الشوارع التي تغرق عند المطر"],
          ["See the problem before it hits.", "رؤية المشكلة قبل وقوعها."],
          ["You reach for data to see a problem before it hits.", "البيانات عندك وسيلة لرؤية المشكلة قبل وقوعها."]),
        A("shaded-track", "barbell", "health", "culture", "hands",
          ["A shaded walking track with an outdoor gym", "مسار مشي مظلّل مع أجهزة رياضية في الهواء الطلق"],
          ["Moving streets, happy streets.", "حيّ يتحرّك، حيّ يبتسم."],
          ["You'd invest in what gets people moving and feeling better.", "الاستثمار فيما يحرّك الناس ويحسّن أحوالهم هو اختيارك."]),
        A("murals-stage", "paint-brush", "culture", "tourism", "ideas",
          ["Murals on the walls and a small stage for local talent", "جداريات تلوّن الحيّ ومسرح صغير للمواهب المحلية"],
          ["Streets as a canvas.", "الشارع لوحة، والجمهور جاهز."],
          ["You'd turn everyday places into stages for local talent.", "الأماكن اليومية في نظرك مسارح تنتظر مواهبها."])
      ]
    }
  ];
  if (typeof window !== "undefined") window.MASSARI_QUESTIONS = questions;
  if (typeof module !== "undefined") module.exports = questions;
})();
