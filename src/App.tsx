import { useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Section = 'home' | 'assistant' | 'lessons' | 'games' | 'reading' | 'library' | 'progress' | 'profile' | 'settings' | 'about';

type Lesson = {
  id: string;
  title: string;
  category: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  description: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
};

type Game = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
};

type Reading = {
  id: string;
  title: string;
  category: string;
  level: string;
  time: string;
  text: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
};

type DictionaryWord = {
  word: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
};

type NotificationItem = {
  id: string;
  title: string;
  text: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type Achievement = { key: string; label: string; unlocked: boolean };

type ProfileState = {
  name: string;
  avatar: string;
  createdAt: string;
  preferences: {
    theme: Theme;
    textScale: number;
    highContrast: boolean;
    reducedAnimations: boolean;
    dailyGoal: number;
    reminderTime: string;
    notificationsEnabled: boolean;
  };
};

type ProgressState = {
  completedLessons: string[];
  completedGames: string[];
  completedReadings: string[];
  favoriteReadings: string[];
  favoriteWords: string[];
  points: number;
  averageScore: number;
  streak: number;
  lastActivity: string | null;
  achievements: Achievement[];
  recentActivity: Array<{ title: string; date: string; type: string }>;
};

type AppState = {
  profile: ProfileState;
  progress: ProgressState;
  notifications: NotificationItem[];
};

const storageKey = 'lenguaNicState';

const lessons: Lesson[] = [
  {
    id: 'ortografia-basica',
    title: 'Ortografía básica',
    category: 'Ortografía',
    difficulty: 'Principiante',
    description: 'Repasa mayúsculas, letras y reglas esenciales para escribir con claridad.',
    questions: [
      {
        id: 'ort1',
        prompt: '¿Cuál es la forma correcta?',
        options: ['escuela', 'escula', 'eschuela'],
        answer: 'escuela',
        explanation: 'La palabra correcta es “escuela” con “sc”.'
      },
      {
        id: 'ort2',
        prompt: '¿Qué oración está bien escrita?',
        options: ['El niño corrio rapido.', 'El niño corrió rápido.', 'El niño corrio rapidó.'],
        answer: 'El niño corrió rápido.',
        explanation: 'Se escriben con tilde “corrió” y “rápido”.'
      } 
    ]
  },
  {
    id: 'gramatica-contexto',
    title: 'Gramática en contexto',
    category: 'Gramática',
    difficulty: 'Intermedio',
    description: 'Reconoce sujetos, verbos y concordancia al leer oraciones completas.',
    questions: [
      {
        id: 'gra1',
        prompt: '¿Cuál es el verbo de la oración “Los estudiantes estudian cada día”?',
        options: ['estudiantes', 'cada', 'día', 'estudian'],
        answer: 'estudian',
        explanation: 'El verbo principal es “estudian”.'
      },
      {
        id: 'gra2',
        prompt: '¿Qué palabra es un sustantivo?',
        options: ['bonito', 'leer', 'naranja', 'rápidamente'],
        answer: 'naranja',
        explanation: '“Naranja” puede funcionar como sustantivo.'
      }
    ]
  },
  {
    id: 'acentuacion',
    title: 'Acentuación',
    category: 'Acentuación',
    difficulty: 'Intermedio',
    description: 'Identifica palabras agudas, graves, esdrújulas y la tilde necesaria.',
    questions: [
      {
        id: 'ace1',
        prompt: '¿Qué palabra es aguda?',
        options: ['árbol', 'casa', 'espejo', 'pájaro'],
        answer: 'árbol',
        explanation: '“Árbol” es aguda porque la sílaba tónica está al final.'
      },
      {
        id: 'ace2',
        prompt: '¿Qué palabra lleva tilde por regla general?',
        options: ['mesa', 'camion', 'lapiz', 'comida'],
        answer: 'camion',
        explanation: '“Camión” lleva tilde por ser palabra llana terminada en “n” y con tilde obligatoria.'
      }
    ]
  }
];

const miniGames: Game[] = [
  {
    id: 'reto-ortografico',
    title: 'Reto ortográfico',
    description: 'Elige la palabra escrita correctamente.',
    instructions: 'Escribe con atención: cada respuesta correcta suma puntos.',
    questions: [
      {
        id: 'g1',
        prompt: '¿Cuál es la opción correcta?',
        options: ['biblioteca', 'bibiloteca', 'biblioteka'],
        answer: 'biblioteca',
        explanation: 'La forma correcta es “biblioteca”.'
      },
      {
        id: 'g2',
        prompt: '¿Cuál forma está bien escrita?',
        options: ['conociendo', 'conosciendo', 'conociendo?'],
        answer: 'conociendo',
        explanation: 'La palabra correcta es “conociendo”.'
      }
    ]
  },
  {
    id: 'construye-oracion',
    title: 'Construye la oración',
    description: 'Organiza palabras para formar frases correctas.',
    instructions: 'Haz clic en la opción que forma la oración adecuada.',
    questions: [
      {
        id: 'g3',
        prompt: '¿Qué secuencia es correcta?',
        options: ['Mañana estudiamos en la biblioteca.', 'Biblioteca en estudiamos la mañana.', 'Estudiamos mañana la en biblioteca.'],
        answer: 'Mañana estudiamos en la biblioteca.',
        explanation: 'La oración sigue el orden lógico y gramatical correcto.'
      },
      {
        id: 'g4',
        prompt: '¿Cuál opción forma una frase válida?',
        options: ['Los niños juegan en el parque.', 'Juegan parque el los niños.', 'En el niños parque juegan.'],
        answer: 'Los niños juegan en el parque.',
        explanation: 'El sujeto, verbo y lugar están bien ordenados.'
      }
    ]
  },
  {
    id: 'desafio-vocabulario',
    title: 'Desafío de vocabulario',
    description: 'Practica sinónimos, antónimos y definiciones.',
    instructions: 'Selecciona la respuesta más apropiada según el significado.',
    questions: [
      {
        id: 'g5',
        prompt: '¿Qué palabra es sinónimo de “feliz”?',
        options: ['triste', 'contento', 'perezoso', 'frío'],
        answer: 'contento',
        explanation: '“Contento” es un sinónimo de “feliz”.'
      },
      {
        id: 'g6',
        prompt: '¿Qué palabra significa lo contrario de “rápido”?',
        options: ['veloz', 'lento', 'alto', 'seco'],
        answer: 'lento',
        explanation: '“Lento” es el antónimo adecuado.'
      }
    ]
  }
];

const readings: Reading[] = [
  {
    id: 'rio-azul',
    title: 'El río azul',
    category: 'Cuentos',
    level: 'Principiante',
    time: '6 min',
    text: 'Al amanecer, Elena caminó junto al río azul. El agua brillaba como un espejo. En la orilla, una tortuga dormía bajo la sombra de un árbol. Elena escuchó el canto de los pájaros y sintió calma. Ese día entendió que la naturaleza también enseña paciencia.',
    questions: [
      {
        id: 'r1',
        prompt: '¿Qué hizo Elena al amanecer?',
        options: ['Fue a la escuela', 'Caminó junto al río', 'Jugó en la ciudad', 'Leyó un libro'],
        answer: 'Caminó junto al río',
        explanation: 'El texto dice que Elena caminó junto al río azul.'
      },
      {
        id: 'r2',
        prompt: '¿Qué aprendió Elena?',
        options: ['Que la naturaleza enseña paciencia', 'Que el río es peligroso', 'Que los pájaros no cantan', 'Que la tortuga vive en la ciudad'],
        answer: 'Que la naturaleza enseña paciencia',
        explanation: 'La última frase del texto explica la enseñanza que recibió.'
      }
    ]
  },
  {
    id: 'bosque-nicaragua',
    title: 'El bosque de Nicaragua',
    category: 'Naturaleza',
    level: 'Intermedio',
    time: '8 min',
    text: 'En Nicaragua, el bosque tropical guarda especies únicas. Allí viven monos, aves coloridas y flores de varios tonos. El aire es húmedo y el sonido de las hojas crea un ritmo constante. Los estudiantes visitan estos lugares para aprender sobre la biodiversidad y la importancia de cuidar la tierra.',
    questions: [
      {
        id: 'r3',
        prompt: '¿Qué aprenden los estudiantes al visitar el bosque?',
        options: ['Cómo cocinar', 'Sobre la biodiversidad', 'A nadar', 'Sobre la música clásica'],
        answer: 'Sobre la biodiversidad',
        explanation: 'El texto menciona explícitamente la biodiversidad.'
      },
      {
        id: 'r4',
        prompt: '¿Cómo describe el texto el ambiente del bosque?',
        options: ['Seco y frío', 'Húmedo y lleno de vida', 'Vacío y silencioso', 'Industrial y lejano'],
        answer: 'Húmedo y lleno de vida',
        explanation: 'Se describen un aire húmedo y muchas especies.'
      }
    ]
  }
];

const dictionaryWords: DictionaryWord[] = [
  {
    word: 'aprendizaje',
    definition: 'Proceso de adquirir conocimiento, habilidades y valores.',
    examples: ['El aprendizaje del español requiere práctica diaria.', 'El aprendizaje mejora con la lectura.'],
    synonyms: ['estudio', 'formación'],
    antonyms: ['olvido', 'ignorancia']
  },
  {
    word: 'biblioteca',
    definition: 'Lugar donde se conservan libros y recursos para leer y estudiar.',
    examples: ['La biblioteca del colegio está abierta.', 'Leí un cuento en la biblioteca.'],
    synonyms: ['sala de lectura'],
    antonyms: ['desorden']
  },
  {
    word: 'esfuerzo',
    definition: 'Trabajo o dedicación que se realiza para lograr una meta.',
    examples: ['El esfuerzo constante ayuda a progresar.', 'Necesitamos esfuerzo para mejorar.'],
    synonyms: ['dedicación', 'trabajo'],
    antonyms: ['pereza', 'desinterés']
  }
];

const getDefaultState = (): AppState => ({
  profile: {
    name: 'Estudiante',
    avatar: '🌟',
    createdAt: new Date().toISOString(),
    preferences: {
      theme: 'system',
      textScale: 1,
      highContrast: false,
      reducedAnimations: false,
      dailyGoal: 15,
      reminderTime: '20:00',
      notificationsEnabled: false
    }
  },
  progress: {
    completedLessons: [],
    completedGames: [],
    completedReadings: [],
    favoriteReadings: [],
    favoriteWords: [],
    points: 0,
    averageScore: 0,
    streak: 0,
    lastActivity: null,
    achievements: [
      { key: 'first-lesson', label: 'Primera lección completada', unlocked: false },
      { key: 'five-lessons', label: 'Cinco lecciones completadas', unlocked: false },
      { key: 'first-reading', label: 'Primera lectura completada', unlocked: false },
      { key: 'ten-games', label: 'Diez minijuegos terminados', unlocked: false },
      { key: 'perfect-score', label: 'Primera puntuación perfecta', unlocked: false }
    ],
    recentActivity: []
  },
  notifications: [
    {
      id: 'welcome',
      title: 'Bienvenido a Lengua Nic',
      text: 'Comienza con una lección breve para activar tu progreso.',
      type: 'welcome',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
});

const navItems = [
  { key: 'home', label: 'Inicio', icon: '🏠' },
  { key: 'assistant', label: 'Asistente IA', icon: '🤖' },
  { key: 'lessons', label: 'Lecciones', icon: '📘' },
  { key: 'games', label: 'Minijuegos', icon: '🎮' },
  { key: 'reading', label: 'Comprensión', icon: '📖' },
  { key: 'library', label: 'Biblioteca', icon: '🗂️' },
  { key: 'progress', label: 'Mi progreso', icon: '📊' },
  { key: 'profile', label: 'Perfil', icon: '👤' },
  { key: 'settings', label: 'Ajustes', icon: '⚙️' },
  { key: 'about', label: 'Acerca de', icon: 'ℹ️' }
] as const;

const getThemeFromPreference = (theme: Theme) => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

function App() {
  const [section, setSection] = useState<Section>('home');
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === 'undefined') return getDefaultState();
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return getDefaultState();
    try {
      return JSON.parse(raw) as AppState;
    } catch {
      return getDefaultState();
    }
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0].id);
  const [selectedReadingId, setSelectedReadingId] = useState<string>(readings[0].id);
  const [searchText, setSearchText] = useState('');
  const [readingFilter, setReadingFilter] = useState('Todos');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [dictionarySearch, setDictionarySearch] = useState('');
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const applyTheme = () => {
      const theme = getThemeFromPreference(state.profile.preferences.theme);
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.setProperty('--text-scale', String(state.profile.preferences.textScale));
      document.body.classList.toggle('high-contrast', state.profile.preferences.highContrast);
      document.body.classList.toggle('reduce-motion', state.profile.preferences.reducedAnimations);
    };

    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (state.profile.preferences.theme === 'system') {
        applyTheme();
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [state.profile.preferences]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setShowInstallPrompt(true);
    };
    const onlineListener = () => setIsOnline(navigator.onLine);
    const offlineListener = () => setIsOnline(navigator.onLine);

    window.addEventListener('beforeinstallprompt', beforeInstall as EventListener);
    window.addEventListener('online', onlineListener);
    window.addEventListener('offline', offlineListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall as EventListener);
      window.removeEventListener('online', onlineListener);
      window.removeEventListener('offline', offlineListener);
    };
  }, []);

  const lesson = lessons.find((item) => item.id === selectedLessonId) ?? lessons[0];
  const reading = readings.find((item) => item.id === selectedReadingId) ?? readings[0];

  const filteredReadings = useMemo(() => {
    return readings.filter((item) => {
      const matchesText = item.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = readingFilter === 'Todos' || item.category === readingFilter;
      const matchesLevel = levelFilter === 'Todos' || item.level === levelFilter;
      return matchesText && matchesCategory && matchesLevel;
    });
  }, [searchText, readingFilter, levelFilter]);

  const dictionaryResults = useMemo(() => {
    const query = dictionarySearch.trim().toLowerCase();
    if (!query) return dictionaryWords;
    return dictionaryWords.filter((word) => word.word.toLowerCase().includes(query));
  }, [dictionarySearch]);

  const unreadNotifications = state.notifications.filter((item) => !item.read).length;

  const addNotification = (title: string, text: string, type: string) => {
    const entry: NotificationItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      title,
      text,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      notifications: [entry, ...prev.notifications].slice(0, 12)
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => item.id === id ? { ...item, read: true } : item)
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, read: true }))
    }));
  };

  const deleteNotification = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((item) => item.id !== id)
    }));
  };

  const clearNotifications = () => {
    const confirmed = window.confirm('¿Deseas limpiar todo el historial de notificaciones?');
    if (!confirmed) return;
    setState((prev) => ({ ...prev, notifications: [] }));
  };

  const updateAchievement = (key: string, unlocked: boolean) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        achievements: prev.progress.achievements.map((achievement) =>
          achievement.key === key ? { ...achievement, unlocked } : achievement
        )
      }
    }));
  };

  const handleLessonComplete = (lessonId: string, score: number, total: number) => {
    const percent = total === 0 ? 0 : Math.round((score / total) * 100);
    setState((prev) => {
      const nextCompleted = prev.progress.completedLessons.includes(lessonId)
        ? prev.progress.completedLessons
        : [...prev.progress.completedLessons, lessonId];
      const achievements = prev.progress.achievements.map((achievement) => {
        if (achievement.key === 'first-lesson' && nextCompleted.length >= 1) return { ...achievement, unlocked: true };
        if (achievement.key === 'five-lessons' && nextCompleted.length >= 5) return { ...achievement, unlocked: true };
        return achievement;
      });

      return {
        ...prev,
        progress: {
          ...prev.progress,
          completedLessons: nextCompleted,
          points: prev.progress.points + Math.max(5, Math.round(percent / 10)),
          averageScore: prev.progress.averageScore === 0 ? percent : (prev.progress.averageScore + percent) / 2,
          lastActivity: new Date().toISOString(),
          recentActivity: [{ title: `${lessons.find((item) => item.id === lessonId)?.title ?? 'Lección'} completada`, date: new Date().toISOString(), type: 'lesson' }, ...prev.progress.recentActivity].slice(0, 6),
          achievements
        },
        notifications: [
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            title: 'Lección completada',
            text: `Resultado: ${score}/${total}.`,
            type: 'lesson',
            read: false,
            createdAt: new Date().toISOString()
          },
          ...prev.notifications
        ].slice(0, 12)
      };
    });
  };

  const handleGameComplete = (gameId: string, score: number, total: number) => {
    const percent = total === 0 ? 0 : Math.round((score / total) * 100);
    setState((prev) => {
      const nextCompleted = prev.progress.completedGames.includes(gameId)
        ? prev.progress.completedGames
        : [...prev.progress.completedGames, gameId];
      const achievements = prev.progress.achievements.map((achievement) => {
        if (achievement.key === 'ten-games' && nextCompleted.length >= 10) return { ...achievement, unlocked: true };
        if (achievement.key === 'perfect-score' && score === total) return { ...achievement, unlocked: true };
        return achievement;
      });

      return {
        ...prev,
        progress: {
          ...prev.progress,
          completedGames: nextCompleted,
          points: prev.progress.points + Math.max(5, Math.round(percent / 10)),
          averageScore: prev.progress.averageScore === 0 ? percent : (prev.progress.averageScore + percent) / 2,
          lastActivity: new Date().toISOString(),
          recentActivity: [{ title: `${miniGames.find((item) => item.id === gameId)?.title ?? 'Minijuego'} terminado`, date: new Date().toISOString(), type: 'game' }, ...prev.progress.recentActivity].slice(0, 6),
          achievements
        },
        notifications: [
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            title: 'Minijuego terminado',
            text: `Puntuación: ${score}/${total}.`,
            type: 'game',
            read: false,
            createdAt: new Date().toISOString()
          },
          ...prev.notifications
        ].slice(0, 12)
      };
    });
  };

  const handleReadingComplete = (readingId: string, score: number, total: number) => {
    const percent = total === 0 ? 0 : Math.round((score / total) * 100);
    setState((prev) => {
      const nextCompleted = prev.progress.completedReadings.includes(readingId)
        ? prev.progress.completedReadings
        : [...prev.progress.completedReadings, readingId];
      const achievements = prev.progress.achievements.map((achievement) => {
        if (achievement.key === 'first-reading' && nextCompleted.length >= 1) return { ...achievement, unlocked: true };
        return achievement;
      });

      return {
        ...prev,
        progress: {
          ...prev.progress,
          completedReadings: nextCompleted,
          points: prev.progress.points + Math.max(5, Math.round(percent / 10)),
          averageScore: prev.progress.averageScore === 0 ? percent : (prev.progress.averageScore + percent) / 2,
          lastActivity: new Date().toISOString(),
          recentActivity: [{ title: `${readings.find((item) => item.id === readingId)?.title ?? 'Lectura'} completada`, date: new Date().toISOString(), type: 'reading' }, ...prev.progress.recentActivity].slice(0, 6),
          achievements
        },
        notifications: [
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            title: 'Comprensión lectora completada',
            text: `Resultado: ${score}/${total}.`,
            type: 'reading',
            read: false,
            createdAt: new Date().toISOString()
          },
          ...prev.notifications
        ].slice(0, 12)
      };
    });
  };

  const toggleFavoriteReading = (id: string) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        favoriteReadings: prev.progress.favoriteReadings.includes(id)
          ? prev.progress.favoriteReadings.filter((item) => item !== id)
          : [...prev.progress.favoriteReadings, id]
      }
    }));
  };

  const toggleFavoriteWord = (word: string) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        favoriteWords: prev.progress.favoriteWords.includes(word)
          ? prev.progress.favoriteWords.filter((item) => item !== word)
          : [...prev.progress.favoriteWords, word]
      }
    }));
  };

  const resetAppearanceSettings = () => {
    const confirmed = window.confirm('¿Restablecer la apariencia y accesibilidad?');
    if (!confirmed) return;
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferences: {
          ...prev.profile.preferences,
          theme: 'system',
          textScale: 1,
          highContrast: false,
          reducedAnimations: false
        }
      }
    }));
  };

  const resetAllData = () => {
    const confirmed = window.confirm('¿Deseas borrar todos los datos locales? Esta acción es irreversible.');
    if (!confirmed) return;
    setState(getDefaultState());
  };

  const installPwa = async () => {
    if (!deferredInstallPrompt) {
      setShowInstallPrompt(false);
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    setShowInstallPrompt(false);
  };

  const requestReminderPermission = async () => {
    if (!('Notification' in window)) {
      addNotification('Recordatorio no disponible', 'Tu navegador no admite notificaciones.', 'reminder');
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification('Recordatorio de estudio', {
        body: `Tu objetivo hoy es ${state.profile.preferences.dailyGoal} minutos.`,
        icon: '/icon.svg'
      });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      addNotification('Recordatorio activado', 'Las notificaciones del navegador han sido habilitadas.', 'reminder');
      new Notification('Lengua Nic', {
        body: 'Recordatorio listo. Puedes estudiar con tu objetivo diario.',
        icon: '/icon.svg'
      });
    }
  };

  const renderHome = () => (
    <section className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">Lengua Nic 🇳🇮📚</p>
          <h1>Aprende, escribe y domina el español.</h1>
          <p>Una experiencia educativa moderna para estudiar con lecciones, lectura, juegos y seguimiento del progreso.</p>
          <div className="cta-row">
            <button className="primary" onClick={() => setSection('lessons')}>Comenzar</button>
            <button className="ghost" onClick={() => setSection('reading')}>Leer ahora</button>
          </div>
        </div>
        <div className="metric-card accent">
          <span>Progreso</span>
          <strong>{state.progress.completedLessons.length + state.progress.completedGames.length + state.progress.completedReadings.length}</strong>
          <small>{state.progress.points} puntos acumulados</small>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <span>Lecciones</span>
          <strong>{state.progress.completedLessons.length}</strong>
        </div>
        <div className="stat-box">
          <span>Minijuegos</span>
          <strong>{state.progress.completedGames.length}</strong>
        </div>
        <div className="stat-box">
          <span>Lecturas</span>
          <strong>{state.progress.completedReadings.length}</strong>
        </div>
        <div className="stat-box">
          <span>Racha</span>
          <strong>{state.progress.streak} días</strong>
        </div>
      </div>

      <div className="card-grid two-col">
        <div className="card">
          <h3>Accesos rápidos</h3>
          <ul className="quick-list">
            <li>✅ Lecciones interactivas</li>
            <li>✅ Minijuegos de español</li>
            <li>✅ Lecturas con preguntas</li>
            <li>✅ Biblioteca y diccionario</li>
          </ul>
        </div>
        <div className="card">
          <h3>Recomendaciones</h3>
          <ul className="quick-list">
            <li>🎯 Practica ortografía hoy</li>
            <li>📚 Lee una lectura breve</li>
            <li>🧠 Repite una lección de gramática</li>
            <li>🧩 Completa un minijuego</li>
          </ul>
        </div>
      </div>
    </section>
  );

  const renderAssistant = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Asistente IA</p>
          <h2>Tu compañero para aprender y mejorar tu español</h2>
        </div>
      </div>
      <div className="card assistant-panel">
        <p>ChatGPT puede ayudarte a resolver dudas de gramática, revisar textos, practicar vocabulario y redactar con mayor claridad.</p>
        <a className="primary external" href="https://chatgpt.com/" target="_blank" rel="noreferrer">Abrir ChatGPT</a>
        <p className="note">Es un servicio externo, requiere conexión a Internet y puede pedir una cuenta para determinadas funciones.</p>
      </div>
      <div className="card-grid three-col">
        {[
          ['Gramática', 'Resuelve dudas sobre concordancia, tiempos verbales y estructuras.'],
          ['Ortografía', 'Comprueba tildes, letras y reglas ortográficas específicas.'],
          ['Redacción', 'Revisa textos y mejora claridad y cohesión.'],
          ['Vocabulario', 'Amplía palabras, sinónimos, antónimos y expresiones útiles.'],
          ['Literatura', 'Analiza textos literarios y comprende sus temas.'],
          ['Temas escolares', 'Apoya tareas de lectura, redacción y comprensión.']
        ].map(([title, text]) => (
          <div className="card" key={title as string}>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderLessons = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Lecciones</p>
          <h2>Aprende español paso a paso</h2>
        </div>
      </div>
      <div className="lesson-layout">
        <div className="lesson-list">
          {lessons.map((item) => (
            <button key={item.id} className={`lesson-item ${selectedLessonId === item.id ? 'active' : ''}`} onClick={() => setSelectedLessonId(item.id)}>
              <span>{item.category}</span>
              <strong>{item.title}</strong>
              <small>{item.difficulty}</small>
            </button>
          ))}
        </div>

        <div className="card lesson-card">
          <h3>{lesson.title}</h3>
          <p>{lesson.description}</p>
          <div className="badge-row">
            <span>{lesson.category}</span>
            <span>{lesson.difficulty}</span>
          </div>
          <LessonPlayer lesson={lesson} onComplete={handleLessonComplete} />
        </div>
      </div>
    </section>
  );

  const renderGames = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Minijuegos</p>
          <h2>Aprende jugando</h2>
        </div>
      </div>
      <div className="card-grid three-col">
        {miniGames.map((game) => (
          <div key={game.id} className="card game-card">
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <p className="muted">{game.instructions}</p>
            <GamePlayer game={game} onComplete={handleGameComplete} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderReading = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Comprensión lectora</p>
          <h2>Lee, analiza y responde</h2>
        </div>
      </div>
      <div className="reading-layout">
        <div className="reading-list card">
          {readings.map((item) => (
            <button key={item.id} className={`reading-item ${selectedReadingId === item.id ? 'active' : ''}`} onClick={() => setSelectedReadingId(item.id)}>
              <strong>{item.title}</strong>
              <small>{item.category} · {item.level} · {item.time}</small>
            </button>
          ))}
        </div>
        <div className="card reading-card">
          <h3>{reading.title}</h3>
          <div className="badge-row">
            <span>{reading.category}</span>
            <span>{reading.level}</span>
            <span>{reading.time}</span>
          </div>
          <p className="reading-text">{reading.text}</p>
          <ReadingPlayer reading={reading} onComplete={handleReadingComplete} />
        </div>
      </div>
    </section>
  );

  const renderLibrary = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Recursos educativos</h2>
        </div>
      </div>

      <div className="library-tools">
        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Buscar lecturas" aria-label="Buscar lecturas" />
        <select value={readingFilter} onChange={(e) => setReadingFilter(e.target.value)} aria-label="Filtrar por categoría">
          <option>Todos</option>
          <option>Cuentos</option>
          <option>Naturaleza</option>
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} aria-label="Filtrar por nivel">
          <option>Todos</option>
          <option>Principiante</option>
          <option>Intermedio</option>
        </select>
      </div>

      <div className="card-grid two-col">
        {filteredReadings.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.category} · {item.level}</p>
            <p>{item.text.slice(0, 120)}...</p>
            <div className="inline-actions">
              <button className="ghost" onClick={() => setSelectedReadingId(item.id)}>Abrir</button>
              <button className="ghost" onClick={() => toggleFavoriteReading(item.id)}>{state.progress.favoriteReadings.includes(item.id) ? '★ Guardada' : '☆ Guardar'}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card section-spacer">
        <h3>Libros de texto del MINED de Nicaragua 🇳🇮</h3>
        <div className="card-grid two-col">
          <div className="card min-card">
            <h4>Libros de Primaria</h4>
            <p>Consulta los libros de texto para la educación primaria.</p>
            <a className="primary external" href="https://nicaraguaeduca.mined.gob.ni/index.php/libros-primaria-2/" target="_blank" rel="noreferrer">Ver libros de primaria</a>
          </div>
          <div className="card min-card">
            <h4>Libros de Secundaria</h4>
            <p>Consulta los libros de texto para la educación secundaria.</p>
            <a className="primary external" href="https://nicaraguaeduca.mined.gob.ni/index.php/libros-de-texto-secundaria/" target="_blank" rel="noreferrer">Ver libros de secundaria</a>
          </div>
        </div>
        <p className="note">Necesitas conexión a Internet para acceder al portal del MINED.</p>
      </div>

      <div className="card section-spacer">
        <h3>Diccionario de español</h3>
        <input value={dictionarySearch} onChange={(e) => setDictionarySearch(e.target.value)} placeholder="Buscar palabra" aria-label="Buscar palabra" />
        <div className="dictionary-grid">
          {dictionaryResults.map((word) => (
            <div className="word-card" key={word.word}>
              <div className="inline-actions">
                <strong>{word.word}</strong>
                <button className="ghost small" onClick={() => toggleFavoriteWord(word.word)}>{state.progress.favoriteWords.includes(word.word) ? '★' : '☆'}</button>
              </div>
              <p>{word.definition}</p>
              <small>Ejemplos: {word.examples.join(' • ')}</small>
              <small>Sinónimos: {word.synonyms.join(', ') || '—'}</small>
              <small>Antónimos: {word.antonyms.join(', ') || '—'}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderProgress = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Mi progreso</p>
          <h2>Seguimiento del aprendizaje</h2>
        </div>
      </div>

      {state.progress.completedLessons.length === 0 && state.progress.completedGames.length === 0 && state.progress.completedReadings.length === 0 ? (
        <div className="card empty-state">
          <h3>¡Aún no tienes actividad registrada!</h3>
          <p>Completa tu primera lección, lectura o minijuego para comenzar a construir tu racha y tus logros.</p>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-box"><span>Lecciones</span><strong>{state.progress.completedLessons.length}</strong></div>
          <div className="stat-box"><span>Minijuegos</span><strong>{state.progress.completedGames.length}</strong></div>
          <div className="stat-box"><span>Lecturas</span><strong>{state.progress.completedReadings.length}</strong></div>
          <div className="stat-box"><span>Puntos</span><strong>{state.progress.points}</strong></div>
        </div>
      )}

      <div className="card-grid two-col">
        <div className="card">
          <h3>Logros</h3>
          <ul className="quick-list">
            {state.progress.achievements.map((achievement) => (
              <li key={achievement.key}>{achievement.unlocked ? '✅' : '⬜'} {achievement.label}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Actividad reciente</h3>
          <ul className="quick-list">
            {state.progress.recentActivity.length === 0 ? <li>No hay actividades aún.</li> : state.progress.recentActivity.map((item) => (
              <li key={`${item.title}-${item.date}`}>{item.title} · {new Date(item.date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Perfil</p>
          <h2>Perfil del estudiante</h2>
        </div>
      </div>
      <div className="card profile-card">
        <div className="avatar-row">
          <div className="avatar-display" aria-label="Avatar del estudiante">{state.profile.avatar}</div>
          <div>
            <label htmlFor="student-name">Nombre o apodo</label>
            <input id="student-name" value={state.profile.name} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))} />
          </div>
        </div>

        <div className="avatar-picker">
          {['🌟', '📚', '🎓', '✍️', '🌿', '🌞'].map((avatar) => (
            <button key={avatar} className={`avatar-option ${state.profile.avatar === avatar ? 'selected' : ''}`} onClick={() => setState((prev) => ({ ...prev, profile: { ...prev.profile, avatar } }))}>
              {avatar}
            </button>
          ))}
        </div>

        <p>Fecha de creación: {new Date(state.profile.createdAt).toLocaleDateString()}</p>
        <button className="primary" onClick={() => addNotification('Perfil guardado', 'Los cambios se guardaron localmente.', 'profile')}>Guardar cambios</button>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Ajustes</p>
          <h2>Personaliza tu experiencia</h2>
        </div>
      </div>

      <div className="card-grid two-col">
        <div className="card">
          <h3>Apariencia</h3>
          <label>
            Tema
            <select value={state.profile.preferences.theme} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, theme: e.target.value as Theme } } }))}>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="system">Sistema</option>
            </select>
          </label>
          <label>
            Tamaño del texto
            <input type="range" min="0.9" max="1.3" step="0.05" value={state.profile.preferences.textScale} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, textScale: Number(e.target.value) } } }))} />
          </label>
          <label><input type="checkbox" checked={state.profile.preferences.highContrast} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, highContrast: e.target.checked } } }))} /> Alto contraste</label>
          <label><input type="checkbox" checked={state.profile.preferences.reducedAnimations} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, reducedAnimations: e.target.checked } } }))} /> Reducir animaciones</label>
          <button className="ghost" onClick={resetAppearanceSettings}>Restablecer apariencia</button>
        </div>

        <div className="card">
          <h3>Estudio</h3>
          <label>
            Objetivo diario
            <select value={state.profile.preferences.dailyGoal} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, dailyGoal: Number(e.target.value) } } }))}>
              {[5, 10, 15, 20, 30].map((option) => (
                <option key={option} value={option}>{option} minutos</option>
              ))}
            </select>
          </label>
          <label>
            Hora de recordatorio
            <input type="time" value={state.profile.preferences.reminderTime} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, reminderTime: e.target.value } } ))} />
          </label>
          <label><input type="checkbox" checked={state.profile.preferences.notificationsEnabled} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, preferences: { ...prev.profile.preferences, notificationsEnabled: e.target.checked } } ))} /> Activar recordatorios</label>
          <button className="ghost" onClick={requestReminderPermission}>Probar recordatorio</button>
        </div>
      </div>

      <div className="card section-spacer">
        <h3>Datos y privacidad</h3>
        <p>Los datos se guardan localmente en el navegador para mantener el perfil, los logros y los favoritos disponibles al volver a abrir la aplicación.</p>
        <button className="danger" onClick={resetAllData}>Borrar todos los datos</button>
      </div>
    </section>
  );

  const renderAbout = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Acerca de</p>
          <h2>Lengua Nic 🇳🇮📚</h2>
        </div>
      </div>
      <div className="card">
        <p>«Aprende, escribe y domina el español».</p>
        <p>Lengua Nic es una aplicación educativa pensada para practicar español con lecciones, minijuegos, lecturas, diccionario y seguimiento de progreso. Algunas funciones externas, como ChatGPT y los libros del MINED, requieren conexión a Internet.</p>
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Notificaciones</p>
          <h2>Historial reciente</h2>
        </div>
      </div>
      <div className="card">
        <div className="inline-actions">
          <button className="ghost" onClick={markAllNotificationsRead}>Marcar todas como leídas</button>
          <button className="ghost" onClick={clearNotifications}>Limpiar historial</button>
        </div>
        {state.notifications.length === 0 ? <p>No hay notificaciones.</p> : state.notifications.map((notification) => (
          <div key={notification.id} className={`notification ${notification.read ? 'read' : ''}`}>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.text}</p>
            </div>
            <div className="inline-actions">
              <button className="ghost small" onClick={() => markNotificationRead(notification.id)}>{notification.read ? 'Leída' : 'Leer'}</button>
              <button className="ghost small" onClick={() => deleteNotification(notification.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>🇳🇮</span>
          <div>
            <strong>Lengua Nic</strong>
            <small>Aprender español</small>
          </div>
        </div>

        <nav className="nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <button key={item.key} className={`nav-item ${section === item.key ? 'active' : ''}`} onClick={() => setSection(item.key)}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="install-box">
          {showInstallPrompt ? (
            <button className="primary small" onClick={installPwa}>Instalar app</button>
          ) : (
            <button className="ghost small" onClick={() => setShowInstallPrompt(true)}>Instalar</button>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{navItems.find((item) => item.key === section)?.label}</h2>
          </div>
          <div className="topbar-actions">
            {!isOnline && <span className="offline-badge">Sin conexión</span>}
            <button className="ghost small" onClick={() => setSection('home')}>🏠</button>
            <button className="ghost small" onClick={() => setSection('notifications')}>🔔 {unreadNotifications}</button>
            <button className="ghost small" onClick={() => setSection('profile')}>{state.profile.avatar} {state.profile.name}</button>
          </div>
        </header>

        {section === 'home' && renderHome()}
        {section === 'assistant' && renderAssistant()}
        {section === 'lessons' && renderLessons()}
        {section === 'games' && renderGames()}
        {section === 'reading' && renderReading()}
        {section === 'library' && renderLibrary()}
        {section === 'progress' && renderProgress()}
        {section === 'profile' && renderProfile()}
        {section === 'settings' && renderSettings()}
        {section === 'about' && renderAbout()}
        {section === 'notifications' && renderNotifications()}
      </main>
    </div>
  );
}

type LessonPlayerProps = {
  lesson: Lesson;
  onComplete: (lessonId: string, score: number, total: number) => void;
};

function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const score = lesson.questions.reduce((acc, question) => acc + (answers[question.id] === question.answer ? 1 : 0), 0);

  const toggleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const finish = () => {
    const total = lesson.questions.length;
    const currentScore = lesson.questions.reduce((acc, question) => acc + (answers[question.id] === question.answer ? 1 : 0), 0);
    setFinished(true);
    onComplete(lesson.id, currentScore, total);
  };

  if (finished) {
    return (
      <div className="result-box">
        <h4>Resultado final</h4>
        <p>{score}/{lesson.questions.length} respuestas correctas.</p>
        <button className="primary" onClick={() => { setCurrent(0); setAnswers({}); setFinished(false); }}>Repetir actividad</button>
      </div>
    );
  }

  const question = lesson.questions[current];

  return (
    <div className="question-block">
      <p className="question-number">Pregunta {current + 1} de {lesson.questions.length}</p>
      <h4>{question.prompt}</h4>
      <div className="options-grid">
        {question.options.map((option) => (
          <button key={option} className={`option ${answers[question.id] === option ? 'selected' : ''}`} onClick={() => toggleAnswer(question.id, option)}>
            {option}
          </button>
        ))}
      </div>
      <div className="inline-actions">
        <button className="ghost" disabled={current === 0} onClick={() => setCurrent((prev) => prev - 1)}>Anterior</button>
        {current < lesson.questions.length - 1 ? (
          <button className="primary" onClick={() => setCurrent((prev) => prev + 1)}>Siguiente</button>
        ) : (
          <button className="primary" onClick={finish}>Finalizar</button>
        )}
      </div>
      <p className="explanation">{question.explanation}</p>
    </div>
  );
}

type GamePlayerProps = {
  game: Game;
  onComplete: (gameId: string, score: number, total: number) => void;
};

function GamePlayer({ game, onComplete }: GamePlayerProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const score = game.questions.reduce((acc, question) => acc + (answers[question.id] === question.answer ? 1 : 0), 0);

  const finish = () => {
    const total = game.questions.length;
    const currentScore = game.questions.reduce((acc, question) => acc + (answers[question.id] === question.answer ? 1 : 0), 0);
    setFinished(true);
    onComplete(game.id, currentScore, total);
  };

  if (finished) {
    return (
      <div className="result-box">
        <h4>Resultado del juego</h4>
        <p>{score}/{game.questions.length} aciertos.</p>
        <button className="primary" onClick={() => { setCurrent(0); setAnswers({}); setFinished(false); }}>Jugar otra vez</button>
      </div>
    );
  }

  const question = game.questions[current];

  return (
    <div className="question-block">
      <p className="question-number">Ronda {current + 1} de {game.questions.length}</p>
      <h4>{question.prompt}</h4>
      <div className="options-grid">
        {question.options.map((option) => (
          <button key={option} className={`option ${answers[question.id] === option ? 'selected' : ''}`} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}>
            {option}
          </button>
        ))}
      </div>
      <div className="inline-actions">
        <button className="ghost" disabled={current === 0} onClick={() => setCurrent((prev) => prev - 1)}>Anterior</button>
        {current < game.questions.length - 1 ? (
          <button className="primary" onClick={() => setCurrent((prev) => prev + 1)}>Siguiente</button>
        ) : (
          <button className="primary" onClick={finish}>Terminar</button>
        )}
      </div>
      <p className="explanation">{question.explanation}</p>
    </div>
  );
}

type ReadingPlayerProps = {
  reading: Reading;
  onComplete: (readingId: string, score: number, total: number) => void;
};

function ReadingPlayer({ reading, onComplete }: ReadingPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const finish = () => {
    const total = reading.questions.length;
    const currentScore = reading.questions.reduce((acc, question) => acc + (answers[question.id] === question.answer ? 1 : 0), 0);
    setFinished(true);
    onComplete(reading.id, currentScore, total);
  };

  if (finished) {
    return (
      <div className="result-box">
        <h4>Resultado de la lectura</h4>
        <p>{reading.questions.reduce((acc, question) => acc + (answers[question.id] === question.answer ? 1 : 0), 0)}/{reading.questions.length} respuestas correctas.</p>
        <button className="primary" onClick={() => { setCurrent(0); setAnswers({}); setFinished(false); }}>Repetir lectura</button>
      </div>
    );
  }

  const question = reading.questions[current];

  return (
    <div className="question-block">
      <p className="question-number">Pregunta {current + 1} de {reading.questions.length}</p>
      <h4>{question.prompt}</h4>
      <div className="options-grid">
        {question.options.map((option) => (
          <button key={option} className={`option ${answers[question.id] === option ? 'selected' : ''}`} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}>
            {option}
          </button>
        ))}
      </div>
      <div className="inline-actions">
        <button className="ghost" disabled={current === 0} onClick={() => setCurrent((prev) => prev - 1)}>Anterior</button>
        {current < reading.questions.length - 1 ? (
          <button className="primary" onClick={() => setCurrent((prev) => prev + 1)}>Siguiente</button>
        ) : (
          <button className="primary" onClick={finish}>Finalizar</button>
        )}
      </div>
      <p className="explanation">{question.explanation}</p>
    </div>
  );
}

export default App;
