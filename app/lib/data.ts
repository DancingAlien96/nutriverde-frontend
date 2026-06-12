// Contenido de la landing. Extraído tal cual de los prototipos.
// Reemplazar `image` con URLs definitivas cuando estén listas.

export interface Service {
  slug: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
  highlighted?: boolean;
}

export const SERVICES: Service[] = [
  {
    slug: "consulta-inicial",
    name: "Consulta Inicial",
    price: "Q350",
    duration: "60 min",
    description:
      "Una evaluación integral de tu salud, hábitos, estilo de vida y objetivos. Revisaremos tu historial médico, alimentación actual, rutina y necesidades específicas para desarrollar una estrategia nutricional personalizada y sostenible.",
    features: [
      "Evaluación integral de salud",
      "Revisión de historial y hábitos",
      "Estrategia personalizada",
    ],
    image: "/consultainicial.png",
    highlighted: true,
  },
  {
    slug: "consulta-seguimiento",
    name: "Consulta de Seguimiento",
    price: "Q250",
    duration: "45 min",
    description:
      "Diseñadas para evaluar avances, resolver dificultades y realizar los ajustes necesarios para continuar progresando hacia tus objetivos de manera realista y sostenible.",
    features: [
      "Evaluación de avances",
      "Ajuste del plan",
      "Resolución de dificultades",
    ],
    image: "/consultaseguimiento.png",
  },
  {
    slug: "coaching-nutricional",
    name: "Coaching Nutricional y Cambio de Hábitos",
    price: "Q0",
    duration: "60 min",
    description:
      "Un espacio enfocado en ayudarte a implementar cambios duraderos en tu alimentación y estilo de vida. Ideal para mejorar tu relación con la comida, fortalecer hábitos saludables y mantener resultados a largo plazo.",
    features: [
      "Cambio de hábitos sostenible",
      "Mejor relación con la comida",
      "Estrategias prácticas",
    ],
    image: "/coachingnutricional.png",
  },
  {
    slug: "nutricion-deportiva",
    name: "Nutrición Deportiva",
    price: "Q0",
    duration: "60 min",
    description:
      "Para corredores, atletas y personas que se preparan para competencias o eventos de resistencia. Estrategias de alimentación, hidratación y suplementación basadas en evidencia para optimizar el rendimiento y la recuperación.",
    features: [
      "Alimentación e hidratación",
      "Suplementación basada en evidencia",
      "Rendimiento y recuperación",
    ],
    image: "/nutriciondeportiva.png",
  },
];

export interface Specialty {
  label: string;
  icon: string; // emoji simple por ahora
}

export const SPECIALTIES: Specialty[] = [
  { label: "Nutrición clínica", icon: "🩺" },
  { label: "Recomposición corporal", icon: "💪" },
  { label: "Resistencia a la insulina", icon: "🩸" },
  { label: "Rendimiento deportivo", icon: "🏃" },
  { label: "Salud metabólica", icon: "🥗" },
  { label: "Hábitos sostenibles", icon: "🌱" },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
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
];

export const PROCESS_FEATURES: { label: string; icon: string }[] = [
  { label: "Ajuste de zona horaria automático", icon: "🕒" },
  { label: "Recordatorios automáticos", icon: "📧" },
  { label: "Pago verificado manualmente", icon: "✅" },
  { label: "Notificación por WhatsApp", icon: "💬" },
  { label: "Desde cualquier lugar del mundo", icon: "🌎" },
];

export interface Testimonial {
  name: string;
  location: string;
  quote: string;
  plan: string;
  rating: number;
  result?: string;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "María José Rodríguez",
    location: "Guatemala City",
    quote:
      "Comencé sin mucha esperanza, pero el seguimiento personalizado de Plenha Nutrition cambió por completo mi relación con la comida. El plan fue real y adaptado a mi ritmo de vida. ¡Bajé 8 kilos en 3 meses sintiéndome con energía!",
    plan: "Coaching Nutricional",
    rating: 5,
    result: "-8 kg en 3 meses",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Ana Lucía Pérez",
    location: "Antigua Guatemala",
    quote:
      "La consulta online es muy cómoda. Me encantó que el proceso fue súper organizado: llené el formulario, subí mi pago y en menos de 24 horas ya tenía mi cita confirmada.",
    plan: "Consulta Inicial",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Sofía Alvarado",
    location: "México",
    quote:
      "Estaba buscando a alguien que me entendiera y no solo me diera una dieta genérica. Aquí encontré un plan adaptado a mi cultura, mi presupuesto y mi estilo de vida.",
    plan: "Consulta de Seguimiento",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
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
];

export const NAV_LINKS = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/servicios", label: "Servicios" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/faq", label: "FAQ" },
];

export const SITE = {
  name: "Plenha",
  fullName: "Plenha Nutrition",
  tagline: "Nutrición que transforma hábitos y vidas",
  email: "hola@plenhanutrition.com",
  location: "Guatemala, C.A. (UTC-6)",
  whatsappNumber: "+502 3070 6592",
  whatsappUrl: "https://wa.me/50230706592",
  socials: {
    instagram: "https://instagram.com/plenhanutrition",
    facebook: "https://facebook.com/plenhanutrition",
  },
};
