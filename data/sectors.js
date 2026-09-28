// Massari sectors: six Vision 2030 fields, fixed order. Illustrative content, not official career advice.
(function () {
  const sectors = [
    {
      id: "tourism",
      color: "#A2401F",
      colorDark: "#F0936B",
      icon: "compass-rose",
      photo: {
        file: "assets/photos/tourism.webp",
        alt: {
          en: "Qasr al-Farid, the lone rock-cut Nabataean facade at Hegra, AlUla",
          ar: "قصر الفريد، الواجهة النبطية المنحوتة في الصخر بالحِجر في العُلا"
        },
        credit: { author: "Ahmad AlHasanat", license: "CC BY-SA 4.0", source: "commons.wikimedia.org/wiki/File:Mada%27in_Saleh_2017.jpg" }
      },
      traits: { people: 0.9, ideas: 0.8, data: 0.25, hands: 0.35 },
      name: { en: "Tourism & Hospitality", ar: "السياحة والضيافة" },
      tagline: {
        en: "Turning places into memories people carry home",
        ar: "أماكن تتحوّل إلى ذكريات يحملها الزوّار معهم"
      },
      description: {
        en: "From Hegra in AlUla to the islands of the Red Sea, the Kingdom is opening its doors to the world, and every visit needs someone who makes it feel effortless. This path suits people who read a room fast, stay calm when plans shift and love designing experiences that show others what makes a place special.",
        ar: "من واجهات الحِجر في العُلا إلى جزر البحر الأحمر، تفتح المملكة أبوابها للعالم، وكل زيارة تحتاج من يجعلها سلسة لا تُنسى. مسار يناسب سرعة التقاط مزاج الآخرين، والهدوء حين تتبدّل الخطط، ومتعة تصميم تجارب تكشف للزوّار سرّ المكان."
      },
      roles: [
        { en: "Guest experience coordinator", ar: "تنسيق تجربة الضيوف" },
        { en: "Licensed tour guide", ar: "الإرشاد السياحي المرخّص" },
        { en: "Hotel operations coordinator", ar: "تنسيق العمليات الفندقية" }
      ],
      skills: [
        { en: "Customer experience design", ar: "تصميم تجربة العميل" },
        { en: "English plus one more language (e.g. Chinese or French)", ar: "الإنجليزية ولغة أخرى معها، كالصينية أو الفرنسية" },
        { en: "Hospitality and reservation systems", ar: "أنظمة الضيافة والحجوزات" }
      ]
    },
    {
      id: "technology",
      color: "#2A4FA0",
      colorDark: "#8FB1FF",
      icon: "cpu",
      photo: {
        file: "assets/photos/technology.webp",
        alt: {
          en: "Riyadh skyline at dusk, with Kingdom Centre and Al Faisaliah towers lit up",
          ar: "أفق الرياض عند الغسق، وبرجا المملكة والفيصلية يتلألآن بالأضواء"
        },
        credit: { author: "B.alotaby", license: "CC BY-SA 4.0", source: "commons.wikimedia.org/wiki/File:Riyadh_Skyline.jpg" }
      },
      traits: { people: 0.25, ideas: 0.85, data: 0.9, hands: 0.4 },
      name: { en: "Technology & Innovation", ar: "التقنية والابتكار" },
      tagline: {
        en: "Building the systems a whole country runs on",
        ar: "أنظمة يقوم عليها وطن بأكمله"
      },
      description: {
        en: "Government services, payments and whole cities across the Kingdom now run on software, data and networks that specialists design, build and keep running. This path suits people who enjoy breaking a problem into pieces, pick up new tools constantly and like shipping things others use every day.",
        ar: "الخدمات الحكومية والمدفوعات ومدن بأكملها في المملكة باتت تعمل ببرمجيات وبيانات وشبكات يصمّمها ويبنيها ويشغّلها أهل الاختصاص. مسار يناسب متعة تفكيك المشكلة إلى أجزاء، وتعلّم الأدوات الجديدة باستمرار، والرضا بإطلاق حلول يستخدمها الناس كل يوم."
      },
      roles: [
        { en: "Web and app developer", ar: "تطوير الويب والتطبيقات" },
        { en: "Data analyst", ar: "تحليل البيانات" },
        { en: "Cybersecurity (SOC) analyst", ar: "رصد التهديدات في الأمن السيبراني" }
      ],
      skills: [
        { en: "Programming in Python or JavaScript", ar: "البرمجة بلغة Python أو JavaScript" },
        { en: "Querying data with SQL", ar: "الاستعلام عن البيانات وتحليلها بلغة SQL" },
        { en: "Networking and security basics", ar: "أساسيات الشبكات والأمن السيبراني" }
      ]
    },
    {
      id: "health",
      color: "#0B6E5E",
      colorDark: "#5CC8B8",
      icon: "heartbeat",
      photo: {
        file: "assets/photos/health.webp",
        alt: {
          en: "Layered green-and-ochre ridges of the Sarawat Mountains in Asir, fading into blue haze",
          ar: "سلاسل جبال السروات في عسير تتدرّج بين الخضرة والبنّي الترابي، وتذوب في زرقة الأفق"
        },
        credit: { author: "Richard Mortel", license: "CC BY 2.0", source: "commons.wikimedia.org/wiki/File:Sarawat_Mountains,_Asir_Region,_Saudi_Arabia_(6).jpg" }
      },
      traits: { people: 0.9, ideas: 0.3, data: 0.45, hands: 0.85 },
      name: { en: "Health & Wellbeing", ar: "الصحة والعافية" },
      tagline: {
        en: "Keeping people well, not only treating them",
        ar: "رعاية تحفظ العافية قبل أن تعالج المرض"
      },
      description: {
        en: "Healthcare in the Kingdom is shifting from hospital beds toward prevention, virtual clinics and healthier everyday life. This path suits people who stay steady under pressure, notice when someone is not okay and like care they can give with their own hands.",
        ar: "تتّجه الرعاية الصحية في المملكة من أسرّة المستشفيات نحو الوقاية والعيادات الافتراضية وأنماط حياة يومية أصحّ. مسار يناسب الثبات تحت الضغط، وملاحظة تعب الآخرين قبل أن يُفصحوا عنه، وحبّ الرعاية العملية باليد."
      },
      roles: [
        { en: "Registered nurse", ar: "التمريض" },
        { en: "Clinical laboratory specialist", ar: "المختبرات الطبية" },
        { en: "Community health educator", ar: "التثقيف الصحي المجتمعي" }
      ],
      skills: [
        { en: "First aid and basic life support", ar: "الإسعافات الأولية والإنعاش القلبي الرئوي (CPR)" },
        { en: "Reading health data with care", ar: "قراءة البيانات الصحية وتفسيرها بعناية" },
        { en: "Calm, clear patient communication", ar: "التواصل الهادئ والواضح مع المرضى" }
      ]
    },
    {
      id: "finance",
      color: "#7C5A10",
      colorDark: "#E9C46A",
      icon: "chart-line-up",
      photo: {
        file: "assets/photos/finance.webp",
        alt: {
          en: "Looking up at the faceted Public Investment Fund Tower in King Abdullah Financial District",
          ar: "برج صندوق الاستثمارات العامة بواجهاته متعددة الأوجه في مركز الملك عبدالله المالي، مصوَّرًا من الأسفل"
        },
        credit: { author: "Kolaiel", license: "CC0 1.0", source: "commons.wikimedia.org/wiki/File:KAFD_58.jpg" }
      },
      traits: { people: 0.75, ideas: 0.4, data: 0.95, hands: 0.15 },
      name: { en: "Finance & Investment", ar: "المال والاستثمار" },
      tagline: {
        en: "Careful decisions whose value compounds over time",
        ar: "قرارات متأنّية يتضاعف أثرها مع الوقت"
      },
      description: {
        en: "Riyadh is becoming a regional hub for investment, fintech and new businesses, and all of it rests on people who read numbers honestly. This path suits people who are patient with detail, calm about risk and enjoy helping others make decisions backed by evidence.",
        ar: "تتحوّل الرياض إلى مركز إقليمي للاستثمار والتقنية المالية والشركات الناشئة، وكل ذلك يقوم على من يقرأ الأرقام بأمانة. مسار يناسب الصبر على التفاصيل، والهدوء أمام المخاطر، ومتعة مساعدة الناس على اتخاذ قرارات تستند إلى دليل."
      },
      roles: [
        { en: "Financial analyst", ar: "التحليل المالي" },
        { en: "Internal auditor", ar: "التدقيق الداخلي" },
        { en: "Fintech operations specialist", ar: "عمليات التقنية المالية" }
      ],
      skills: [
        { en: "Spreadsheets and financial modelling", ar: "الجداول الحسابية والنمذجة المالية" },
        { en: "Accounting fundamentals", ar: "أساسيات المحاسبة" },
        { en: "Risk and compliance basics", ar: "أساسيات إدارة المخاطر والامتثال" }
      ]
    },
    {
      id: "culture",
      color: "#8A2F5E",
      colorDark: "#E99AC4",
      icon: "mask-happy",
      photo: {
        file: "assets/photos/culture.webp",
        alt: {
          en: "Mud-brick palaces of At-Turaif in historic Diriyah",
          ar: "قصور الطين في حيّ الطريف التاريخي بالدرعية"
        },
        credit: { author: "Radosław Botev", license: "CC BY 3.0 PL", source: "commons.wikimedia.org/wiki/File:At-Turaif_District_in_ad-Dir%27iyah_(6).jpg" }
      },
      traits: { people: 0.5, ideas: 0.95, data: 0.2, hands: 0.8 },
      name: { en: "Culture & Entertainment", ar: "الثقافة والترفيه" },
      tagline: {
        en: "Stories, stages and screens made right here",
        ar: "حكايات ومسارح وشاشات تُصنع هنا"
      },
      description: {
        en: "Film, music, heritage, gaming and live events are among the Kingdom's fastest-growing fields, with new venues and festivals every season. This path suits people who think in images and stories, like making things with their hands, enjoy building one idea together with a team and are not shy about putting their work in front of an audience.",
        ar: "السينما والموسيقى والتراث والألعاب الإلكترونية والفعاليات من أسرع المجالات نموًّا في المملكة، مع مسارح ومهرجانات جديدة كل موسم. مسار يناسب التفكير بالصور والحكايات، وحبّ الصنعة باليد، ومتعة صناعة فكرة واحدة مع الفريق، والجرأة على عرض العمل أمام الجمهور."
      },
      roles: [
        { en: "Content producer", ar: "إنتاج المحتوى" },
        { en: "Museum and heritage coordinator", ar: "تنسيق المتاحف والمواقع التراثية" },
        { en: "Live event production coordinator", ar: "تنسيق إنتاج الفعاليات" }
      ],
      skills: [
        { en: "Visual storytelling and editing", ar: "السرد البصري والمونتاج" },
        { en: "Production planning and budgeting", ar: "تخطيط الإنتاج وإعداد ميزانيته" },
        { en: "Heritage research and documentation", ar: "البحث في التراث وتوثيقه" }
      ]
    },
    {
      id: "energy",
      color: "#3E6B1A",
      colorDark: "#A9D66E",
      icon: "sun-horizon",
      photo: {
        file: "assets/photos/energy.webp",
        alt: {
          en: "Sun setting beyond the cliffs of the Edge of the World near Riyadh",
          ar: "الشمس تغيب خلف جروف «حافة العالم» قرب الرياض"
        },
        credit: { author: "S0lL0 TRAVELER", license: "CC BY-SA 4.0", source: "commons.wikimedia.org/wiki/File:Edge_of_the_World.jpg" }
      },
      traits: { people: 0.2, ideas: 0.45, data: 0.85, hands: 0.9 },
      name: { en: "Energy & Sustainability", ar: "الطاقة والاستدامة" },
      tagline: {
        en: "Powering the Kingdom today and tomorrow",
        ar: "طاقة تشغّل المملكة اليوم وغدًا"
      },
      description: {
        en: "Alongside oil and gas, the Kingdom is building some of the world's largest solar, wind and green hydrogen projects, and it needs people on site as much as in the control room. This path suits people who like hands-on problems, trust what they can measure and want their work to last for decades.",
        ar: "إلى جانب النفط والغاز، تبني المملكة من أكبر مشاريع الطاقة الشمسية والرياح والهيدروجين الأخضر في العالم، وتحتاج كفاءات في الميدان بقدر حاجتها إليها في غرف التحكم. مسار يناسب حبّ المشكلات العملية، والثقة بما يمكن قياسه، والرغبة في أثر يمتد لعقود."
      },
      roles: [
        { en: "Renewable plant technician", ar: "تشغيل محطات الطاقة المتجددة وصيانتها" },
        { en: "Environmental compliance specialist", ar: "الامتثال البيئي" },
        { en: "Energy efficiency analyst", ar: "تحليل كفاءة الطاقة" }
      ],
      skills: [
        { en: "Electrical and mechanical basics", ar: "أساسيات الكهرباء والميكانيكا" },
        { en: "Health, safety and environment (HSE)", ar: "الصحة والسلامة والبيئة (HSE)" },
        { en: "Measuring and reporting sustainability", ar: "قياس الاستدامة وإعداد تقاريرها" }
      ]
    }
  ];
  if (typeof window !== "undefined") window.MASSARI_SECTORS = sectors;
  if (typeof module !== "undefined") module.exports = sectors;
})();
