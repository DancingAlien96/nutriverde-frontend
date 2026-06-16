// Diccionario de traducciones del sitio público (EN por defecto / ES).
// El contenido en vivo del backend (servicios al agendar) NO se traduce aquí.

export interface ServiceItem {
  slug: string;
  image: string;
  name: string;
  description: string;
  duration: string;
  price: string; // "Q0" oculta el precio en la tarjeta
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatar: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Dict {
  nav: { sobreMi: string; servicios: string; comoFunciona: string; testimonios: string; faq: string };
  header: { tagline: string; agendar: string; agendarShort: string; openMenu: string };
  hero: {
    titleLead: string;
    titleEmphasis: string;
    paragraph: string;
    italic: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageAlt: string;
  };
  services: {
    eyebrow: string;
    titleLead: string;
    titleEmphasis: string;
    subtitle: string;
    online: string;
    minutes: string;
    perfectLabel: string;
    cards: Record<string, { description: string; perfectIfYou: string }>;
    banner: { question: string; text: string; cta: string };
    features: {
      key: "leaf" | "person" | "heart" | "globe" | "pin";
      label: string;
    }[];
  };
  howItWorks: { eyebrow: string; titleLead: string; titleEmphasis: string; steps: StepItem[] };
  testimonials: { eyebrow: string; titleLead: string; titleEmphasis: string; subtitle: string; items: TestimonialItem[] };
  faq: { eyebrow: string; titleLead: string; titleEmphasis: string; subtitle: string; items: FaqItem[] };
  about: {
    eyebrow: string;
    greeting: string;
    name: string;
    role: string;
    paragraphs: { text: string; hl?: boolean }[][];
    features: { key: "leaf" | "plan" | "heart"; label: string }[];
    photoAlt: string;
  };
  footer: { tagline: string; location: string; worldwide: string; rights: string };
  agendar: {
    page: {
      eyebrow: string;
      title: string;
      subtitle: string;
      back: string;
      troublePrefix: string;
      troubleLink: string;
      errorTitle: string;
      errorBody: string;
      backHome: string;
    };
    steps: { service: string; data: string; payment: string; schedule: string };
    buttons: {
      back: string;
      continue: string;
      submitting: string;
      submit: string;
      skip: string;
    };
    service: { title: string; subtitle: string; monthly: string; min: string };
    region: { title: string; gt: string; intl: string; hint: string };
    data: {
      title: string;
      subtitle: string;
      fullName: string;
      fullNamePh: string;
      email: string;
      emailPh: string;
      docType: string;
      docFallback: string;
      docHelpSuffix: string;
      phone: string;
      phonePh: string;
      timezone: string;
      goal: string;
      goalPh: string;
      conditions: string;
      conditionsPh: string;
    };
    documents: Record<
      "DPI" | "CURP" | "PASSPORT" | "OTHER",
      { label: string; placeholder: string; hint: string }
    >;
    payment: {
      title: string;
      subtitle: string;
      summary: string;
      monthly: string;
      min: string;
      depositTitle: string;
      bankLabel: string;
      bankValue: string;
      accountLabel: string;
      nameLabel: string;
      depositTitleIntl: string;
      methodLabel: string;
      methodValue: string;
    };
    schedule: {
      title: string;
      note: string;
      min: string;
      availableOn: string;
      searching: string;
      none: string;
      tentative: string;
      yourTime: string;
    };
    success: {
      title: string;
      tentative: string;
      guatemala: string;
      yourTime: string;
      nextStepsTitle: string;
      step1: string;
      step2WithSchedule: string;
      step2NoSchedule: string;
      step3: string;
      backHome: string;
    };
    errors: { missingReceipt: string; unknown: string };
    fileDrop: {
      changeHint: string;
      uploadTitle: string;
      uploadHint: string;
    };
  };
  calendar: {
    weekdays: string[];
    months: string[];
    prevMonth: string;
    nextMonth: string;
    available: string;
    full: string;
    blocked: string;
    fullBadge: string;
    blockedBadge: string;
  };
  dateLocale: string;
}

const AVATARS = {
  mariaJose:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  anaLucia:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  sofia:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
};


const en: Dict = {
  nav: {
    sobreMi: "About me",
    servicios: "Services",
    comoFunciona: "How it works",
    testimonios: "Testimonials",
    faq: "FAQ",
  },
  header: {
    tagline: "Build habits. Live fully.",
    agendar: "Book my appointment",
    agendarShort: "Book",
    openMenu: "Open menu",
  },
  hero: {
    titleLead: "Take the first step toward your",
    titleEmphasis: "wellbeing.",
    paragraph:
      "Personalized nutrition to help you build healthy habits and live a fuller, more balanced life.",
    italic: "I'm here to support you.",
    ctaPrimary: "Book my appointment",
    ctaSecondary: "How it works",
    imageAlt: "A balanced, nutritious meal on a calm table",
  },
  services: {
    eyebrow: "Services",
    titleLead: "Nutrition services",
    titleEmphasis: "designed around you",
    subtitle:
      "Every consultation is personalized to your lifestyle, preferences, and health objectives.",
    online: "Online",
    minutes: "minutes",
    perfectLabel: "Perfect if you:",
    cards: {
      "consulta-inicial": {
        description:
          "A comprehensive assessment of your health, lifestyle, and goals to create a personalized nutrition plan just for you.",
        perfectIfYou:
          "Are looking for personalized guidance and a plan tailored to your needs.",
      },
      "consulta-seguimiento": {
        description:
          "Review your progress, adjust your plan, and overcome any challenges to keep you moving forward.",
        perfectIfYou:
          "Have an existing plan and want to track progress and make adjustments.",
      },
      "coaching-nutricional": {
        description:
          "Build sustainable habits, improve your relationship with food, and create lasting lifestyle changes.",
        perfectIfYou:
          "Want ongoing support and accountability to build long-term healthy habits.",
      },
      "nutricion-deportiva": {
        description:
          "Optimize your performance, recovery, and results with a nutrition plan designed for your training and competition goals.",
        perfectIfYou:
          "Are an athlete or active individual looking to improve performance.",
      },
    },
    banner: {
      question: "Not sure which service is right for you?",
      text: "Get in touch and I'd be happy to help you choose the best option.",
      cta: "Contact me",
    },
    features: [
      { key: "leaf", label: "Evidence-based approach" },
      { key: "person", label: "Personalized nutrition plans" },
      { key: "heart", label: "Sustainable habits for lasting results" },
      { key: "globe", label: "Online consultations" },
      { key: "pin", label: "Worldwide support" },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    titleLead: "Your consultation,",
    titleEmphasis: "step by step",
    steps: [
      {
        number: "01",
        title: "Fill out the form",
        description:
          "Enter your basic details, tell us your goal, and upload your payment receipt. It only takes 3 minutes.",
      },
      {
        number: "02",
        title: "We confirm your payment",
        description:
          "We manually verify your receipt and confirm by email within 24 hours.",
      },
      {
        number: "03",
        title: "Choose your time",
        description:
          "Access the available time slots and pick the one that best fits your schedule.",
      },
      {
        number: "04",
        title: "Your online consultation",
        description:
          "We meet by video call. You'll get the link in advance along with a reminder.",
      },
      {
        number: "05",
        title: "Receive your plan",
        description:
          "After the consultation, you'll get your personalized nutrition plan as a PDF, straight to your inbox.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Testimonials",
    titleLead: "What my",
    titleEmphasis: "patients say",
    subtitle:
      "Real stories from people who have reached their goals and transformed their habits.",
    items: [
      {
        name: "María José Rodríguez",
        location: "Guatemala City",
        quote:
          "I started without much hope, but the personalized follow-up at Plenha Nutrition completely changed my relationship with food. The plan was real and tailored to my pace of life. I lost 8 kg in 3 months while feeling full of energy!",
        rating: 5,
        avatar: AVATARS.mariaJose,
      },
      {
        name: "Ana Lucía Pérez",
        location: "Antigua Guatemala",
        quote:
          "The online consultation is so convenient. I loved how organized the process was: I filled out the form, uploaded my payment, and in less than 24 hours my appointment was confirmed.",
        rating: 5,
        avatar: AVATARS.anaLucia,
      },
      {
        name: "Sofía Alvarado",
        location: "Mexico",
        quote:
          "I was looking for someone who would truly understand me and not just hand me a generic diet. Here I found a plan adapted to my culture, my budget, and my lifestyle.",
        rating: 5,
        avatar: AVATARS.sofia,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    titleLead: "Frequently asked",
    titleEmphasis: "questions",
    subtitle:
      "If you have a question that isn't here, message us directly and we'll gladly help.",
    items: [
      {
        question: "Are the consultations really online?",
        answer:
          "Yes. Consultations are 100% online by video call (Google Meet or Zoom). You'll receive the link by email before your appointment with clear instructions.",
      },
      {
        question: "What do I need for my consultation?",
        answer:
          "A stable internet connection, a device with a camera and microphone, and, if possible, your recent lab results. We'll send you an intake form to learn about your history and goals.",
      },
      {
        question: "How long does the consultation last?",
        answer:
          "The Initial Consultation, Nutrition Coaching, and Sports Nutrition last 60 minutes. The Follow-up Consultation lasts 45 minutes.",
      },
      {
        question: "Will I receive a meal plan?",
        answer:
          "Yes. After the consultation you'll receive a personalized plan as a PDF, tailored to your tastes, budget, and goals, with hydration and supplementation recommendations if needed.",
      },
      {
        question: "Can I book if I'm outside Guatemala?",
        answer:
          "Of course! The platform automatically adjusts to your time zone. We see patients from Mexico, the United States, Spain, and several Central American countries.",
      },
    ],
  },
  about: {
    eyebrow: "About me",
    greeting: "Hi, I'm",
    name: "Dulce Menzel",
    role: "Registered Nutritionist and Founder of PLENHA.",
    paragraphs: [
      [
        {
          text: "I believe nutrition should be practical, personalized, and sustainable—not restrictive.",
        },
      ],
      [
        { text: "My mission is to help you build " },
        { text: "healthy habits", hl: true },
        { text: " that fit your lifestyle and support your " },
        { text: "long-term wellbeing", hl: true },
        { text: " through evidence-based nutrition and compassionate guidance." },
      ],
      [
        {
          text: "At PLENHA, every plan is designed around your goals, preferences, and daily routine—because ",
        },
        { text: "lasting results", hl: true },
        { text: " come from habits you can truly maintain." },
      ],
    ],
    features: [
      { key: "leaf", label: "Evidence-based approach" },
      { key: "plan", label: "Personalized nutrition plans" },
      { key: "heart", label: "Sustainable habits for lasting results" },
    ],
    photoAlt: "Dulce Menzel, nutritionist",
  },
  footer: {
    tagline: "Build habits. Live fully.",
    location: "Guatemala",
    worldwide: "Online consultations worldwide.",
    rights: "Plenha Nutrition. All rights reserved.",
  },
  agendar: {
    page: {
      eyebrow: "Book a consultation",
      title: "Let's begin together",
      subtitle:
        "Four simple steps: choose your service, tell us about yourself, upload your receipt and, if you'd like, pick a time.",
      back: "Back",
      troublePrefix: "Having trouble?",
      troubleLink: "Write to us",
      errorTitle: "We couldn't load the services",
      errorBody:
        "Check your connection or try again in a few minutes. If the problem persists, email us at hola@plenhanutrition.com.",
      backHome: "Back to home",
    },
    steps: { service: "Service", data: "Your details", payment: "Payment", schedule: "Time" },
    buttons: {
      back: "Back",
      continue: "Continue",
      submitting: "Sending…",
      submit: "Submit request",
      skip: "Skip and submit",
    },
    service: {
      title: "Choose your service",
      subtitle: "Select the type of consultation that best fits you.",
      monthly: "Monthly",
      min: "min",
    },
    region: {
      title: "Where are you booking from?",
      gt: "Guatemala",
      intl: "Other country",
      hint: "We charge in Quetzales (Q) in Guatemala and in US dollars (US$) for other countries.",
    },
    data: {
      title: "Tell us about yourself",
      subtitle:
        "We need your details to coordinate the consultation and send you the plan.",
      fullName: "Full name *",
      fullNamePh: "e.g. María González",
      email: "Email *",
      emailPh: "you@email.com",
      docType: "Document type *",
      docFallback: "Document",
      docHelpSuffix: "Lets us recognize you in future consultations.",
      phone: "Phone / WhatsApp",
      phonePh: "+502 0000 0000",
      timezone: "Time zone",
      goal: "What's your goal? *",
      goalPh:
        "e.g. Lose 5 kg in 3 months, improve my energy, manage my diabetes…",
      conditions: "Do you have any medical condition or allergy?",
      conditionsPh: "Diabetes, hypertension, allergies, dietary restrictions…",
    },
    documents: {
      DPI: { label: "DPI (Guatemala)", placeholder: "1234 56789 0123", hint: "13 digits." },
      CURP: {
        label: "CURP (Mexico)",
        placeholder: "GOMR980613HDFLRD09",
        hint: "18 alphanumeric characters.",
      },
      PASSPORT: {
        label: "Passport",
        placeholder: "P12345678",
        hint: "5 to 15 alphanumeric characters.",
      },
      OTHER: { label: "Other document", placeholder: "Number or code", hint: "Any official ID." },
    },
    payment: {
      title: "Upload your payment receipt",
      subtitle:
        "Pay by transfer or deposit and upload the receipt. We verify manually within 24 hours.",
      summary: "Summary",
      monthly: "Monthly",
      min: "min",
      depositTitle: "Deposit details (Guatemala):",
      bankLabel: "Bank:",
      bankValue: "(to configure) — complete in production",
      accountLabel: "Account:",
      nameLabel: "Name:",
      depositTitleIntl: "International payment (USD):",
      methodLabel: "Method:",
      methodValue: "PayPal / Wise (to configure)",
    },
    schedule: {
      title: "Choose your time (optional)",
      note: "Once we approve your payment we'll confirm this time. If you leave it blank, we'll send you a link to choose it later.",
      min: "min",
      availableOn: "Available times ·",
      searching: "Looking for times…",
      none: "No times available that day.",
      tentative: "Tentative time:",
      yourTime: "your time",
    },
    success: {
      title: "We received your request!",
      tentative: "Tentative time",
      guatemala: "Guatemala",
      yourTime: "your time",
      nextStepsTitle: "Next steps",
      step1: "We review your receipt (within 24 hours).",
      step2WithSchedule:
        "We confirm your payment and your time; then we send you the final confirmation.",
      step2NoSchedule: "We email you a link to choose your time.",
      step3: "You receive the video-call link before the appointment.",
      backHome: "Back to home",
    },
    errors: { missingReceipt: "The receipt is missing.", unknown: "Unknown error" },
    fileDrop: {
      changeHint: "Click to change",
      uploadTitle: "Click to upload your receipt",
      uploadHint: "JPG, PNG, WebP, HEIC or PDF — up to 10 MB",
    },
  },
  calendar: {
    weekdays: ["M", "T", "W", "T", "F", "S", "S"],
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    prevMonth: "Previous month",
    nextMonth: "Next month",
    available: "Available",
    full: "Full",
    blocked: "Blocked",
    fullBadge: "full",
    blockedBadge: "blkd",
  },
  dateLocale: "en-US",
};

const es: Dict = {
  nav: {
    sobreMi: "Sobre mí",
    servicios: "Servicios",
    comoFunciona: "Cómo funciona",
    testimonios: "Testimonios",
    faq: "FAQ",
  },
  header: {
    tagline: "Crea hábitos. Vive plenamente.",
    agendar: "Agendar mi cita",
    agendarShort: "Agendar",
    openMenu: "Abrir menú",
  },
  hero: {
    titleLead: "Da el primer paso hacia tu",
    titleEmphasis: "bienestar.",
    paragraph:
      "Nutrición personalizada para ayudarte a crear hábitos saludables y vivir una vida más plena y equilibrada.",
    italic: "Estoy aquí para acompañarte.",
    ctaPrimary: "Agendar mi cita",
    ctaSecondary: "Cómo funciona",
    imageAlt: "Una comida equilibrada y nutritiva sobre una mesa serena",
  },
  services: {
    eyebrow: "Servicios",
    titleLead: "Servicios de nutrición",
    titleEmphasis: "diseñados para ti",
    subtitle:
      "Cada consulta se personaliza según tu estilo de vida, preferencias y objetivos de salud.",
    online: "Online",
    minutes: "minutos",
    perfectLabel: "Perfecto si:",
    cards: {
      "consulta-inicial": {
        description:
          "Una evaluación integral de tu salud, estilo de vida y objetivos para crear un plan de nutrición personalizado solo para ti.",
        perfectIfYou:
          "Buscas orientación personalizada y un plan adaptado a tus necesidades.",
      },
      "consulta-seguimiento": {
        description:
          "Revisamos tus avances, ajustamos tu plan y resolvemos cualquier dificultad para que sigas progresando.",
        perfectIfYou:
          "Ya tienes un plan y quieres dar seguimiento y hacer ajustes.",
      },
      "coaching-nutricional": {
        description:
          "Construye hábitos sostenibles, mejora tu relación con la comida y logra cambios duraderos en tu estilo de vida.",
        perfectIfYou:
          "Quieres acompañamiento continuo para crear hábitos saludables a largo plazo.",
      },
      "nutricion-deportiva": {
        description:
          "Optimiza tu rendimiento, recuperación y resultados con un plan diseñado para tu entrenamiento y objetivos de competencia.",
        perfectIfYou:
          "Eres atleta o persona activa que busca mejorar su rendimiento.",
      },
    },
    banner: {
      question: "¿No sabes cuál servicio es para ti?",
      text: "Escríbeme y con gusto te ayudo a elegir la mejor opción.",
      cta: "Escríbeme",
    },
    features: [
      { key: "leaf", label: "Enfoque basado en evidencia" },
      { key: "person", label: "Planes de nutrición personalizados" },
      { key: "heart", label: "Hábitos sostenibles para resultados duraderos" },
      { key: "globe", label: "Consultas online" },
      { key: "pin", label: "Soporte en todo el mundo" },
    ],
  },
  howItWorks: {
    eyebrow: "Cómo funciona",
    titleLead: "Tu consulta,",
    titleEmphasis: "paso a paso",
    steps: [
      {
        number: "01",
        title: "Completa el formulario",
        description:
          "Llena tus datos básicos, cuéntanos tu objetivo y sube tu comprobante de pago. Solo toma 3 minutos.",
      },
      {
        number: "02",
        title: "Confirmamos tu pago",
        description:
          "Verificamos tu comprobante manualmente y te confirmamos por correo en máximo 24 horas.",
      },
      {
        number: "03",
        title: "Elige tu horario",
        description:
          "Accedes a los horarios disponibles y seleccionas el que mejor se adapte a tu agenda.",
      },
      {
        number: "04",
        title: "Tu consulta online",
        description:
          "Nos conectamos por videollamada. Recibes el link con anticipación junto con un recordatorio.",
      },
      {
        number: "05",
        title: "Recibe tu plan",
        description:
          "Tras la consulta, recibes tu plan nutricional personalizado en PDF directamente en tu correo.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Testimonios",
    titleLead: "Experiencias de",
    titleEmphasis: "mis pacientes",
    subtitle:
      "Historias reales de personas que han alcanzado sus objetivos y transformado sus hábitos.",
    items: [
      {
        name: "María José Rodríguez",
        location: "Guatemala City",
        quote:
          "Comencé sin mucha esperanza, pero el seguimiento personalizado de Plenha Nutrition cambió por completo mi relación con la comida. El plan fue real y adaptado a mi ritmo de vida. ¡Bajé 8 kilos en 3 meses sintiéndome con energía!",
        rating: 5,
        avatar: AVATARS.mariaJose,
      },
      {
        name: "Ana Lucía Pérez",
        location: "Antigua Guatemala",
        quote:
          "La consulta online es muy cómoda. Me encantó que el proceso fue súper organizado: llené el formulario, subí mi pago y en menos de 24 horas ya tenía mi cita confirmada.",
        rating: 5,
        avatar: AVATARS.anaLucia,
      },
      {
        name: "Sofía Alvarado",
        location: "México",
        quote:
          "Estaba buscando a alguien que me entendiera y no solo me diera una dieta genérica. Aquí encontré un plan adaptado a mi cultura, mi presupuesto y mi estilo de vida.",
        rating: 5,
        avatar: AVATARS.sofia,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    titleLead: "Preguntas",
    titleEmphasis: "frecuentes",
    subtitle:
      "Si tienes alguna duda que no está aquí, escríbenos directamente y te ayudamos con gusto.",
    items: [
      {
        question: "¿Las consultas son realmente online?",
        answer:
          "Sí. Las consultas son 100% online por videollamada (Google Meet o Zoom). Recibirás el enlace por correo electrónico antes de la cita con instrucciones claras.",
      },
      {
        question: "¿Qué necesito para mi consulta?",
        answer:
          "Una conexión estable a internet, un dispositivo con cámara y micrófono, y de ser posible tus análisis de laboratorio recientes. Te enviamos un formulario inicial para conocer tu historial y objetivos.",
      },
      {
        question: "¿Cuánto dura la consulta?",
        answer:
          "La Consulta Inicial, el Coaching Nutricional y la Nutrición Deportiva duran 60 minutos. La Consulta de Seguimiento dura 45 minutos.",
      },
      {
        question: "¿Recibiré un plan de alimentación?",
        answer:
          "Sí. Tras la consulta recibes un plan personalizado en PDF, adaptado a tus gustos, presupuesto y objetivos, con recomendaciones de hidratación y suplementación si es necesario.",
      },
      {
        question: "¿Puedo agendar si estoy fuera de Guatemala?",
        answer:
          "¡Claro! La plataforma ajusta automáticamente tu zona horaria. Atendemos pacientes desde México, Estados Unidos, España y varios países de Centroamérica.",
      },
    ],
  },
  about: {
    eyebrow: "Sobre mí",
    greeting: "Hola, soy",
    name: "Dulce Menzel",
    role: "Nutricionista colegiada y fundadora de PLENHA.",
    paragraphs: [
      [
        {
          text: "Creo que la nutrición debe ser práctica, personalizada y sostenible—no restrictiva.",
        },
      ],
      [
        { text: "Mi misión es ayudarte a crear " },
        { text: "hábitos saludables", hl: true },
        { text: " que se adapten a tu estilo de vida y cuiden tu " },
        { text: "bienestar a largo plazo", hl: true },
        { text: " con nutrición basada en evidencia y un acompañamiento cercano." },
      ],
      [
        {
          text: "En PLENHA, cada plan se diseña según tus objetivos, preferencias y rutina diaria—porque los ",
        },
        { text: "resultados duraderos", hl: true },
        { text: " vienen de hábitos que de verdad puedes mantener." },
      ],
    ],
    features: [
      { key: "leaf", label: "Enfoque basado en evidencia" },
      { key: "plan", label: "Planes de nutrición personalizados" },
      { key: "heart", label: "Hábitos sostenibles para resultados duraderos" },
    ],
    photoAlt: "Dulce Menzel, nutricionista",
  },
  footer: {
    tagline: "Crea hábitos. Vive plenamente.",
    location: "Guatemala",
    worldwide: "Consultas online en todo el mundo.",
    rights: "Plenha Nutrition. Todos los derechos reservados.",
  },
  agendar: {
    page: {
      eyebrow: "Agendar consulta",
      title: "Comencemos juntas",
      subtitle:
        "Cuatro pasos sencillos: elige tu servicio, cuéntanos sobre ti, sube tu comprobante y, si quieres, escoge horario.",
      back: "Volver",
      troublePrefix: "¿Tienes problemas?",
      troubleLink: "Escríbenos",
      errorTitle: "No pudimos cargar los servicios",
      errorBody:
        "Verifica tu conexión o intenta de nuevo en unos minutos. Si el problema persiste, escríbenos a hola@plenhanutrition.com.",
      backHome: "Volver al inicio",
    },
    steps: { service: "Servicio", data: "Tus datos", payment: "Pago", schedule: "Horario" },
    buttons: {
      back: "Atrás",
      continue: "Continuar",
      submitting: "Enviando…",
      submit: "Enviar solicitud",
      skip: "Omitir y enviar",
    },
    service: {
      title: "Elige tu servicio",
      subtitle: "Selecciona el tipo de consulta que mejor se adapte a ti.",
      monthly: "Mensual",
      min: "min",
    },
    region: {
      title: "¿Desde dónde agendas?",
      gt: "Guatemala",
      intl: "Otro país",
      hint: "En Guatemala cobramos en quetzales (Q) y para otros países en dólares (US$).",
    },
    data: {
      title: "Cuéntanos sobre ti",
      subtitle:
        "Necesitamos tus datos para coordinar la consulta y enviarte el plan.",
      fullName: "Nombre completo *",
      fullNamePh: "Ej. María González",
      email: "Correo electrónico *",
      emailPh: "tu@correo.com",
      docType: "Tipo de documento *",
      docFallback: "Documento",
      docHelpSuffix: "Nos permite reconocerte en futuras consultas.",
      phone: "Teléfono / WhatsApp",
      phonePh: "+502 0000 0000",
      timezone: "Zona horaria",
      goal: "¿Cuál es tu objetivo? *",
      goalPh:
        "Ej. Bajar 5 kilos en 3 meses, mejorar mi energía, controlar mi diabetes…",
      conditions: "¿Tienes alguna condición médica o alergia?",
      conditionsPh: "Diabetes, hipertensión, alergias, restricciones alimentarias…",
    },
    documents: {
      DPI: { label: "DPI (Guatemala)", placeholder: "1234 56789 0123", hint: "13 dígitos." },
      CURP: {
        label: "CURP (México)",
        placeholder: "GOMR980613HDFLRD09",
        hint: "18 caracteres alfanuméricos.",
      },
      PASSPORT: {
        label: "Pasaporte",
        placeholder: "P12345678",
        hint: "5 a 15 caracteres alfanuméricos.",
      },
      OTHER: { label: "Otro documento", placeholder: "Número o código", hint: "Cualquier identificación oficial." },
    },
    payment: {
      title: "Sube tu comprobante de pago",
      subtitle:
        "Realiza el pago por transferencia o depósito y sube el comprobante. Verificamos manualmente en máximo 24 horas.",
      summary: "Resumen",
      monthly: "Mensual",
      min: "min",
      depositTitle: "Datos para el depósito (Guatemala):",
      bankLabel: "Banco:",
      bankValue: "(configurar) — completar en producción",
      accountLabel: "Cuenta:",
      nameLabel: "Nombre:",
      depositTitleIntl: "Pago internacional (USD):",
      methodLabel: "Método:",
      methodValue: "PayPal / Wise (configurar)",
    },
    schedule: {
      title: "Elige tu horario (opcional)",
      note: "Cuando aprobemos tu pago confirmaremos este horario. Si lo dejas en blanco, te enviaremos un link para elegirlo después.",
      min: "min",
      availableOn: "Horario disponible ·",
      searching: "Buscando horarios…",
      none: "No hay horarios disponibles ese día.",
      tentative: "Horario tentativo:",
      yourTime: "tu hora",
    },
    success: {
      title: "¡Recibimos tu solicitud!",
      tentative: "Horario tentativo",
      guatemala: "Guatemala",
      yourTime: "tu hora",
      nextStepsTitle: "Próximos pasos",
      step1: "Revisamos tu comprobante (máximo 24 horas).",
      step2WithSchedule:
        "Confirmamos tu pago y tu horario; luego te enviamos la confirmación final.",
      step2NoSchedule: "Te enviamos un correo con un enlace para elegir tu horario.",
      step3: "Recibes el link de la videollamada antes de la cita.",
      backHome: "Volver al inicio",
    },
    errors: { missingReceipt: "Falta el comprobante.", unknown: "Error desconocido" },
    fileDrop: {
      changeHint: "Click para cambiar",
      uploadTitle: "Click para subir tu comprobante",
      uploadHint: "JPG, PNG, WebP, HEIC o PDF — máximo 10 MB",
    },
  },
  calendar: {
    weekdays: ["L", "M", "M", "J", "V", "S", "D"],
    months: [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ],
    prevMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    available: "Disponible",
    full: "Lleno",
    blocked: "Bloqueado",
    fullBadge: "lleno",
    blockedBadge: "bloq.",
  },
  dateLocale: "es-GT",
};

export type Locale = "en" | "es";

export const DICT: Record<Locale, Dict> = { en, es };
