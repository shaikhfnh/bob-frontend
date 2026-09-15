export const translations = {
  nav: {
    home: { en: 'Home', ar: 'الرئيسية' },
    about: { en: 'About', ar: 'نبذة' },
    sessions: { en: 'Sessions', ar: 'الجلسات' },
    
    hosts: { en: 'Hosts', ar: 'المتحدثون' },
    register: { en: 'Register', ar: 'سجّل' },
  },

  hero: {
    title: {
      en: "At Boubyan, we don't just finance homes. We help you build them.",
      ar: 'في بوبيان، ما نموّل البيوت بس – نساعدك تبنيها',
    },
    subtitle: {
      en: 'Boubyan Home-Building Webinar Series',
      ar: 'ويبنار بوبيان للبنيان',
    },
  },

  separator: {
    title: { en: 'Free Educational Sessions', ar: 'دورة تعليمية مجانية' },
    subtitle: {
      en: 'Designed to support you throughout every stage of your home-building journey.',
      ar: 'تساعدكم في جميع مراحل البناء',
    },
  },

  about: {
    eyebrow: { en: 'More About the Program', ar: 'المزيد عن البرنامج' },
    title: { en: 'Boubyan Home-Building Webinar Series', ar: 'ويبنار بوبيان للبنيان' },
    statSessions: { en: 'Sessions', ar: 'جلسات' },
    statFree: { en: 'Free', ar: 'مجاني' },
    paragraph1: {
      en: 'We understand that building a home involves countless decisions and challenges, and that some mistakes can cost you valuable time and money.',
      ar: 'نعلم أن رحلة بناء المنزل مليئة بالقرارات والتحديات، وأن بعض الأخطاء قد تكلف الكثير من الوقت والمال.',
    },
    paragraph2: {
      en: 'At Boubyan Bank, our role goes beyond financing homes. We want to support you throughout your home-building journey. That is why we have created 12 completely free educational sessions, led by a selection of experienced experts and specialists across construction, execution, finishing, interior design and furnishing.',
      ar: 'وألن دورنا في بنك بوبيان لا يقتصر على تمويل المنازل، بل يمتد إلى دعمكم خلال رحلة البناء، أعددنا لكم 12 جلسة تعليمية مجانية بالكامل، يقدمها نخبة من الخبراء والمتخصصين في مجالات البناء والتنفيذ والتشطيب والتصميم والتأثيث.',
    },
    paragraph3: {
      en: 'The sessions are designed to provide you with practical knowledge and expert insight to help you prepare for every stage, make more informed decisions, and avoid costly mistakes along the way.',
      ar: 'تهدف هذه الجلسات إلى تزويدكم بالمعرفة والخبرة العملية التي تساعدكم على الاستعداد لكل مرحلة، واتخاذ قرارات أكثر وعياً، وتجنب الأخطاء التي قد تكون مكلفة مستقبلاً.',
    },
    paragraph4: {
      en: 'All sessions are completely free and open to everyone. Most will be available online, allowing you to attend and benefit wherever you are.',
      ar: 'جميع الجلسات مجانية ومتاحة للجميع، وسيقدم معظمها رقمياً، لتتمكنوا من حضورها والاستفادة منها أينما كنتم.',
    },
    cta: {
      en: 'Register for free and make knowledge the foundation of your home-building journey.',
      ar: 'سجلوا مجاناً، واجعلوا المعرفة أساساً لرحلة بناء منزلكم.',
    },
    ctaButton: { en: 'Register Now', ar: 'سجّل الآن' },
  },

  // Only static UI chrome lives here — actual session/speaker content
  // comes from the database via getSessions(), not from this file.
  experts: {
    eyebrow: { en: 'About Speakers', ar: 'عن المتحدثين' },
    title: { en: 'Meet the Experts', ar: 'تعرّفوا على الخبراء' },
    subtitle: {
      en: 'Learn directly from experienced professionals across the different stages of building, finishing and designing your home.',
      ar: 'تعلّموا مباشرة من متخصصين ذوي خبرة عبر مختلف مراحل البناء والتشطيب وتصميم منزلكم.',
    },
    sessionLabel: { en: 'Session', ar: 'الدورة' },
    guestSpeaker: { en: 'Guest Speaker', ar: 'متحدث ضيف' },
  },

  speaker: {
    min: { en: 'min', ar: 'دقيقة' },
    online: { en: 'Online', ar: 'عبر الإنترنت' },
    inPerson: { en: 'In Person', ar: 'حضورياً' },
    registrationRequired: { en: 'Registration Required', ar: 'التسجيل إلزامي' },
    limitedSeating: { en: 'Limited Seating', ar: 'أماكن محدودة' },
    registerNow: { en: 'Register Now', ar: 'سجّل الآن' },
  },

  faq: {
    eyebrow: { en: 'Questions', ar: 'أسئلة' },
    title: { en: 'Frequently asked questions', ar: 'الأسئلة الشائعة' },
    q1: { en: 'Are the sessions free to attend?', ar: 'هل الجلسات مجانية؟' },
    a1: { en: 'Yes — every session is completely free and open to everyone.', ar: 'نعم — كل الجلسات مجانية بالكامل ومتاحة للجميع.' },
    q2: { en: 'Do I need to attend all sessions?', ar: 'هل يجب حضور كل الجلسات؟' },
    a2: { en: 'No — each session stands on its own. Join whichever fit your stage.', ar: 'لا — كل جلسة قائمة بذاتها. احضر ما يناسب مرحلتك.' },
    q3: { en: "What's the difference between online and in-person?", ar: 'ما الفرق بين الحضور عن بعد والحضوري؟' },
    a3: { en: 'Online joins via link from anywhere. In-person is at a physical location, seats limited.', ar: 'الحضور عن بعد يكون عبر رابط من أي مكان. الحضور الشخصي يكون في موقع محدد وبمقاعد محدودة.' },
    q4: { en: 'Can I watch a recording if I miss a session?', ar: 'هل يمكنني مشاهدة التسجيل إذا فاتتني الجلسة؟' },
    a4: { en: 'Yes — every session is recorded and available afterward.', ar: 'نعم — كل جلسة تُسجّل وتكون متاحة لاحقاً.' },
  },

  // The full field set your actual Register.jsx calls — this is the version
  // that must win. The other shorter "register" block you had (firstName/
  // lastName/mobile/email/civilId/cta only) was an older, incompatible
  // draft — merging it back in would silently break the real form again.
  register: {
    reserveSpot: { en: 'Reserve Your Spot', ar: 'احجز مقعدك' },
    heading: { en: 'Register for the next session', ar: 'سجّل في الجلسة القادمة' },
    subheading: { en: "Choose how you'd like to join — online or offline.", ar: 'اختر طريقة الحضور — عن بعد أو حضورياً.' },
    freeTitle: { en: 'Free, always', ar: 'مجاني دائماً' },
    freeSub: { en: 'No cost, no obligation, ever.', ar: 'بدون أي تكلفة أو التزام.' },
    recordingTitle: { en: 'Recording included', ar: 'تسجيل الجلسة متوفر' },
    recordingSub: { en: 'Sent to you within 24 hours.', ar: 'يصلك خلال 24 ساعة.' },
    qaTitle: { en: 'Live Q&A', ar: 'أسئلة وأجوبة مباشرة' },
    qaSub: { en: 'Ask the host anything, in real time.', ar: 'اسأل المتحدث مباشرة.' },
    registeredStat: { en: 'People already registered', ar: 'شخص مسجّل بالفعل' },
    firstName: { en: 'First Name', ar: 'الاسم الأول' },
    lastName: { en: 'Last Name', ar: 'الاسم الأخير' },
    civilId: { en: 'Civil ID Number', ar: 'الرقم المدني' },
    mobile: { en: 'Mobile Number', ar: 'رقم الموبايل' },
    email: { en: 'Email', ar: 'البريد الإلكتروني' },
    session: { en: 'Session', ar: 'الجلسة' },
    format: { en: 'Format', ar: 'طريقة الحضور' },
    offlineOnly: { en: 'This session is offline only.', ar: 'هذه الجلسة حضورية فقط.' },
    onlineOnly: { en: 'This session is online only.', ar: 'هذه الجلسة عن بعد فقط.' },
    consent: { en: 'I agree to receive marketing emails about this and future sessions.', ar: 'أوافق على استلام رسائل تسويقية حول هذه الجلسة والجلسات القادمة.' },
    proceed: { en: 'Proceed', ar: 'متابعة' },
    submitting: { en: 'Submitting...', ar: 'جارٍ الإرسال...' },
    housingAuthorityQ: { en: 'Are you registered with the Public Authority for Housing Welfare?', ar: 'هل أنت مسجل بإسكان؟' },
    yes: { en: 'Yes', ar: 'نعم' },
    no: { en: 'No', ar: 'لا' },
    housingYearQ: { en: 'If yes, since which year?', ar: 'إذا نعم، من أي عام؟' },
    selectSession: { en: 'Select a session', ar: 'اختر جلسة' },
  },

  confirmation: {
    title: { en: "You're registered!", ar: 'تم تسجيلك بنجاح!' },
    body: { en: 'A confirmation email will be sent to you shortly.', ar: 'سيصلك بريد إلكتروني للتأكيد قريباً.' },
    noEmail: { en: "Didn't receive it?", ar: 'لم يصلك البريد؟' },
    contactUs: { en: 'Contact us here', ar: 'تواصل معنا هنا' },
    done: { en: 'Done', ar: 'تم' },
  },

  footer: {
    contact: { en: 'Contact', ar: 'تواصل معنا' },
    navigate: { en: 'Navigate', ar: 'روابط' },
    registerLink: { en: 'Register for a session', ar: 'سجّل في إحدى الجلسات' },
    rights: { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
      collab: {
  en: 'A free educational webinar series by Boubyan Bank, in collaboration with Farah Alhumaidhi, supporting you through every stage of home-building.',
  ar: 'سلسلة ويبنار تعليمية مجانية من بنك بوبيان، بالتعاون مع فرح الحميضي، تدعمكم في كل مرحلة من مراحل البناء.',
},
  },
  topics: {
  eyebrow: { en: "What You'll Learn", ar: 'ماذا ستتعلم' },
  title: { en: 'Topics Covered', ar: 'المحاور' },
},

};