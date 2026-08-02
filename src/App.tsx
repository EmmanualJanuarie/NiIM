import {
  Activity,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  Database,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  Lock,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  Utensils,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Tab = "today" | "program" | "food" | "calendar" | "motivate";
type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  load: string;
  focus: string;
  instructions: string[];
};
type Session = {
  key: string;
  day: string;
  title: string;
  intent: string;
  warmup: string[];
  cardio: string;
  exercises: Exercise[];
  finisher: string;
  stretch: string;
};
type CalendarCell =
  | { blank: true; key: string }
  | { blank: false; key: string; day: number; training: boolean; done: boolean; today: boolean };
type Meal = {
  name: string;
  goal: string;
  items: string[];
  prep: string;
  macros: string;
};

const startDate = new Date("2026-08-03T00:00:00");
const targetDate = new Date("2028-10-31T00:00:00");

const sessions: Session[] = [
  {
    key: "monday",
    day: "Monday",
    title: "Front-Line Strength",
    intent: "Chest, legs, trunk strength, and upper-body density for a lean athletic build.",
    warmup: ["10 min easy street jog", "Athletic stance: 3 x 20 sec low brace and shoulder-set", "Lateral shuffle x 3 each side", "World's greatest stretch x 5 each side", "Empty bar press x 15"],
    cardio: "Garage repeat-power burner: do this after all strength work. Complete 10 rounds of 20 sec fast feet, 10 sec lateral shuffle left, 10 sec lateral shuffle right, 30 sec rest.",
    finisher: "Heavy rope: 10 rounds of 20 seconds hard, 40 seconds walk. Finish with 3 x 20 m bear crawls.",
    stretch: "After the finisher: 2 rounds of 30 sec each side for hip flexor, hamstring, chest, and lat stretches.",
    exercises: [
      {
        id: "bench",
        name: "Barbell Bench Press",
        sets: 5,
        reps: "10 reps",
        load: "Start with a weight you can control. Add 2.5 kg when all sets feel solid.",
        focus: "Upper-body power and chest development for a lean athletic frame.",
        instructions: [
          "Plant your feet and squeeze your shoulder blades into the bench.",
          "Lower the bar to the lower chest with elbows about 45 degrees from your body.",
          "Press up hard without bouncing the bar or lifting your hips.",
        ],
      },
      {
        id: "squat",
        name: "Barbell Back Squat",
        sets: 5,
        reps: "8 reps",
        load: "Bar plus plates you can own with clean depth.",
        focus: "Leg drive for a stronger, more defined lower body.",
        instructions: [
          "Brace your stomach, keep your ribs stacked, and stay controlled.",
          "Sit between your hips, keep your chest proud, and drive knees out.",
          "Stand by pushing the floor away and keep the bar path steady.",
        ],
      },
      {
        id: "row",
        name: "Barbell Bent Row",
        sets: 4,
        reps: "10 reps",
        load: "Moderate barbell load. No swinging.",
        focus: "Back strength for wrestling, pulling, and posture.",
        instructions: [
          "Hinge at the hips until your torso is angled forward.",
          "Pull the bar toward the lower ribs and pause for one beat.",
          "Keep your spine long and lower the bar under control.",
        ],
      },
      {
        id: "lunge",
        name: "Front-Rack Reverse Lunge",
        sets: 4,
        reps: "10 each leg",
        load: "Barbell or two dumbbells you can control without wobbling.",
        focus: "Single-leg drive, glutes, and athletic balance.",
        instructions: [
          "Brace tall, step back softly, and keep the front foot planted.",
          "Drop the back knee under control until the front thigh is working hard.",
          "Drive through the whole front foot and squeeze the glute at the top.",
        ],
      },
      {
        id: "curl",
        name: "Barbell Curl",
        sets: 4,
        reps: "10-12 reps",
        load: "Light enough to keep elbows still and lower for 3 seconds.",
        focus: "Biceps size and arm definition.",
        instructions: [
          "Stand tall with ribs down and elbows close to your sides.",
          "Curl without swinging your shoulders or leaning back.",
          "Lower slowly and fully straighten the elbows without snapping them.",
        ],
      },
    ],
  },
  {
    key: "tuesday",
    day: "Tuesday",
    title: "Engine And Feet",
    intent: "Conditioning, speed repeatability, and core control.",
    warmup: ["10 min easy street jog", "A-skips in place x 30 sec", "Fast feet into athletic stance x 4 rounds", "Hip openers x 8 each", "Bear crawl forward/back x 3 each"],
    cardio: "Small-space fat-burner: do this after all strength work. Mark 3-5 m in the garage and complete 8 rounds of 20 sec lateral shuttles, 10 sec sprawls, 30 sec rest. Finish with 6 x 10 sec reaction starts.",
    finisher: "Ab roller: 5 sets of 5 controlled reps from knees, then 4 x 30 seconds lateral line hops.",
    stretch: "After the finisher: 2 rounds of 30 sec child’s pose, hip flexor, calf, and shoulder stretches.",
    exercises: [
      {
        id: "rope",
        name: "Jump Rope Intervals",
        sets: 10,
        reps: "45 sec",
        load: "Light rope for speed. Heavy rope on rounds 9 and 10 if fresh.",
        focus: "Foot rhythm and repeat conditioning.",
        instructions: [
          "Stay tall and bounce low from the balls of your feet.",
          "Keep elbows close and turn the rope from your wrists.",
          "Rest 30 seconds between rounds and breathe through the nose when you can.",
        ],
      },
      {
        id: "push",
        name: "Tempo Push-Ups",
        sets: 5,
        reps: "8-12 reps",
        load: "Bodyweight. Hands on bench if full reps break down.",
        focus: "Shoulder and trunk control under fatigue.",
        instructions: [
          "Lower for three seconds, pause, then press up strong.",
          "Keep ribs down and glutes tight like a moving plank.",
          "Stop each set before your lower back sags.",
        ],
      },
      {
        id: "hang",
        name: "Pull-Up Bar Dead Hang",
        sets: 5,
        reps: "15-30 sec",
        load: "Bodyweight. Feet lightly on a chair if needed.",
        focus: "Grip strength now, pull-up foundation later.",
        instructions: [
          "Wrap your thumbs around the bar and set your shoulders down.",
          "Hang with a long body and steady breathing.",
          "End the set before your grip fully fails.",
        ],
      },
      {
        id: "chin",
        name: "Chin-Up or Assisted Chin-Up",
        sets: 5,
        reps: "5-8 reps",
        load: "Use a band or chair assist. Stop before your shoulders lose position.",
        focus: "Lats, upper back, and biceps for a wide, defined upper body.",
        instructions: [
          "Start from a controlled hang with your ribs tucked and shoulders active.",
          "Pull your chest toward the bar and drive elbows down.",
          "Lower for 3 seconds and reset instead of kicking or swinging.",
        ],
      },
    ],
  },
  {
    key: "thursday",
    day: "Thursday",
    title: "Hinge And Carry Power",
    intent: "Posterior chain, grip, and collision-ready hips.",
    warmup: ["10 min easy street jog", "Glute bridges x 15", "Hip-hinge reach x 10", "Bear crawl shoulder taps x 10 each", "Empty bar Romanian deadlift x 12"],
    cardio: "Garage power burner: do this after all strength work. Complete 8 rounds of 15 sec plate march or farmer carry, 15 sec fast feet, 15 sec shadow squat-to-reach, 45 sec rest.",
    finisher: "Mat core: side plank 3 x 30 seconds each side, then 3 x 12 frog pumps for glutes.",
    stretch: "After the finisher: 2 rounds of 30 sec glute, hamstring, hip flexor, and upper-back stretches.",
    exercises: [
      {
        id: "deadlift",
        name: "Barbell Deadlift",
        sets: 5,
        reps: "5 reps",
        load: "Strong but clean. Never grind ugly reps.",
        focus: "Hip power for glute development and a stronger posterior chain.",
        instructions: [
          "Stand with the bar over mid-foot and brace hard.",
          "Push the floor away, keep the bar close, and lock out tall.",
          "Return the bar with control by hinging first, then bending knees.",
        ],
      },
      {
        id: "press",
        name: "Standing Barbell Press",
        sets: 5,
        reps: "6 reps",
        load: "Light enough to keep ribs down and no back bend.",
        focus: "Shoulders and trunk for overhead strength.",
        instructions: [
          "Squeeze glutes, brace, and start with forearms vertical.",
          "Press the bar past your face, then bring your head through.",
          "Lower to the shoulders under control.",
        ],
      },
      {
        id: "carry",
        name: "Plate Bear-Hug Carry",
        sets: 6,
        reps: "30 meters",
        load: "Use a 20 kg plate or two plates if safe.",
        focus: "Carry strength and hard breathing while braced.",
        instructions: [
          "Hug the plate high on your chest and lock ribs down.",
          "Walk with short powerful steps and stay tall.",
          "Turn carefully, then keep moving until distance is complete.",
        ],
      },
      {
        id: "hip-thrust",
        name: "Barbell Hip Thrust",
        sets: 4,
        reps: "10-12 reps",
        load: "Moderate barbell load. Pause and squeeze at lockout.",
        focus: "Glute size and hip extension for a stronger, more defined lower body.",
        instructions: [
          "Set your upper back against a bench and keep your chin slightly tucked.",
          "Drive through your heels until hips are fully extended without arching your back.",
          "Hold the top for one beat, then lower under control.",
        ],
      },
      {
        id: "rdl",
        name: "Romanian Deadlift",
        sets: 4,
        reps: "8-10 reps",
        load: "Moderate load. Keep the bar close and stop when hamstrings are loaded.",
        focus: "Hamstrings, glutes, and posterior-chain size for sprinting.",
        instructions: [
          "Unlock the knees and push the hips back while keeping the spine long.",
          "Lower until the hamstrings are loaded, not until your back rounds.",
          "Push the hips forward and squeeze the glutes to stand tall.",
        ],
      },
    ],
  },
  {
    key: "friday",
    day: "Friday",
    title: "Speed Strength",
    intent: "Explosive reps, athletic movement, and durable shoulders.",
    warmup: ["10 min easy street jog", "Pogo hops x 20", "Lateral line hops x 20 each side", "Scap push-ups x 12", "Athletic three-point start practice x 6 each side"],
    cardio: "Garage fat-loss burner: do this after all strength work. Complete 6 rounds of 20 sec lateral line hops, 20 sec broad-jump reset, 20 sec fast-feet sprint-in-place, 60 sec rest. Finish with 6 x 5 sec starts.",
    finisher: "Heavy rope: 6 minutes continuous, changing 30 seconds steady and 30 seconds hard.",
    stretch: "After the finisher: 2 rounds of 30 sec quad, calf, chest, and shoulder stretches with slow breathing.",
    exercises: [
      {
        id: "jump",
        name: "Broad Jump",
        sets: 6,
        reps: "3 jumps",
        load: "Bodyweight.",
        focus: "Horizontal power for line breaks and acceleration.",
        instructions: [
          "Load hips back and swing arms behind you.",
          "Jump forward, land softly, and reset each rep.",
          "Stop the set if landing becomes loud or sloppy.",
        ],
      },
      {
        id: "floor",
        name: "Barbell Floor Press",
        sets: 5,
        reps: "8 reps",
        load: "Moderate. Pause elbows on floor each rep.",
        focus: "Pressing power without over-stressing shoulders.",
        instructions: [
          "Lie on the mat with knees bent and feet flat.",
          "Lower until triceps touch the floor, pause, then press.",
          "Keep wrists stacked over elbows throughout.",
        ],
      },
      {
        id: "split",
        name: "Rear-Foot Elevated Split Squat",
        sets: 4,
        reps: "8 each leg",
        load: "Bodyweight or hold light dumbbells.",
        focus: "Single-leg strength for stepping, cutting, and balance.",
        instructions: [
          "Put the back foot on the bench and find a stable stance.",
          "Drop the back knee down while the front foot stays planted.",
          "Drive through the front foot and keep your torso controlled.",
        ],
      },
      {
        id: "nordic",
        name: "Nordic Hamstring Lower",
        sets: 4,
        reps: "5 slow reps",
        load: "Anchor your ankles under a heavy bar or have a partner hold them.",
        focus: "Hamstring resilience for sprinting, cutting, and injury prevention.",
        instructions: [
          "Start tall with hips extended and ribs down.",
          "Lower forward for 4-5 seconds, using your hands to catch the floor.",
          "Push lightly to return to the start; never force a painful range.",
        ],
      },
    ],
  },
  {
    key: "saturday",
    day: "Saturday",
    title: "Full-Body Shred Builder",
    intent: "Full-body conditioning, trunk resilience, and a leaner athletic build.",
    warmup: ["10 min easy street jog", "Dynamic lunges x 10 each", "Ankle pogo hops x 20", "Shoulder circles x 20", "Low athletic stance to stand x 10"],
    cardio: "Garage conditioning test: do this after all strength work. Complete 10 rounds of 30 sec rope or fast feet, 20 sec bear crawl, 10 sec sprawls, 60 sec easy walk. Finish with 6 x 15 sec carry-and-sprint-in-place efforts.",
    finisher: "Write one sentence: where am I going, and what did I prove today?",
    stretch: "After the finisher: 5 minutes of relaxed full-body stretching, giving extra time to hips, hamstrings, and lats.",
    exercises: [
      {
        id: "complex",
        name: "Barbell Complex",
        sets: 5,
        reps: "6 row, 6 clean pull, 6 front squat, 6 press",
        load: "Empty bar or very light plates. Do not drop the bar.",
        focus: "Whole-body conditioning for a lean, athletic physique.",
        instructions: [
          "Move from one exercise to the next without rushing form.",
          "Keep the bar close and breathe between movements.",
          "Rest 90 seconds after each full complex.",
        ],
      },
      {
        id: "roller",
        name: "Ab Roller",
        sets: 5,
        reps: "5-8 reps",
        load: "From knees. Short range is fine.",
        focus: "Anti-extension core strength for a tight, defined midsection.",
        instructions: [
          "Start with ribs tucked and glutes squeezed.",
          "Roll only as far as you can return without arching your back.",
          "Pull the wheel back using your abs, not your lower back.",
        ],
      },
      {
        id: "crawl",
        name: "Bear Crawl",
        sets: 6,
        reps: "20 meters",
        load: "Bodyweight.",
        focus: "Shoulder, trunk, and hip coordination.",
        instructions: [
          "Hands under shoulders, knees under hips, knees just off the mat.",
          "Move opposite hand and foot together.",
          "Keep hips low and steps quiet.",
        ],
      },
    ],
  },
];

const quotes = [
  "Nothing is impossible. Today is one step closer to the body you are building.",
  "You are not training for a mirror. You are building a body that can answer the call.",
  "Small honest sessions become a different man over two years.",
  "When motivation drops, keep the promise smaller: one set, then another.",
  "You are going somewhere great. Train like the journey has already started.",
  "A strong day counts. A hard day counts more.",
];

const challenges = [
  "Complete every warm-up this week without skipping.",
  "Add 5 total minutes to Saturday cardio.",
  "Hold the dead hang for 5 seconds longer than last week.",
  "Finish one session even when motivation is low.",
  "Keep every barbell rep clean. Quality is the win.",
  "On the final safe bodyweight set today, go to technical failure.",
  "Beat procrastination: start within 10 minutes of opening NiIM.",
  "Pick one lift and make every rep slower on the way down.",
  "After cardio, walk 3 extra minutes instead of sitting down straight away.",
];

const trainerCalls = [
  "No scrolling. Shoes on, warm-up started, then decide how you feel.",
  "Final set rule: if form is clean, push to technical failure. Stop before ugly reps.",
  "Tempo challenge: lower every strength rep for 3 seconds today.",
  "Core mindset: brace your stomach before every rep and keep your ribs stacked.",
  "Beat yesterday by one clean rep, one cleaner set, or one honest minute.",
  "When you want to quit, finish the current set first. Then reassess.",
  "Make the easy reps beautiful. That is how heavy reps get safer.",
];

const sessionTwists = [
  "Power start: first working set should feel fast, not heavy.",
  "Last-set push: final set is AMRAP with clean form only.",
  "Quiet feet: every jump, jog, and rope landing should stay soft.",
  "Captain's standard: no skipped warm-up, no rushed cooldown.",
  "Shred engine: breathe steady even when the work gets uncomfortable.",
];

type Achievement = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  progress: string;
  unlocked: boolean;
};

function getAchievements(stats: { sessions: number; totalSets: number; completedTasks: number; cardioTasks: number; foodTasks: number; streak: number; level: number }): Achievement[] {
  return [
    { id: "first-whistle", emoji: "🏉", title: "First Whistle", description: "Complete your first training session.", progress: `${Math.min(stats.sessions, 1)}/1 session`, unlocked: stats.sessions >= 1 },
    { id: "week-warrior", emoji: "💪", title: "Week Warrior", description: "Complete five training sessions.", progress: `${Math.min(stats.sessions, 5)}/5 sessions`, unlocked: stats.sessions >= 5 },
    { id: "one-month", emoji: "🔥", title: "30-Day Shred Block", description: "Complete your first 30-day block with 20 training sessions.", progress: `${Math.min(stats.sessions, 20)}/20 sessions`, unlocked: stats.sessions >= 20 },
    { id: "leg-drive", emoji: "🦵", title: "Leg Drive", description: "Log 50 working sets toward stronger legs.", progress: `${Math.min(stats.totalSets, 50)}/50 sets`, unlocked: stats.totalSets >= 50 },
    { id: "cardio-engine", emoji: "⚡", title: "Cardio Engine", description: "Complete 10 fat-burning conditioning sessions.", progress: `${Math.min(stats.cardioTasks, 10)}/10 cardio tasks`, unlocked: stats.cardioTasks >= 10 },
    { id: "fuel-the-player", emoji: "🥗", title: "Fuel The Player", description: "Complete 20 food and hydration tasks.", progress: `${Math.min(stats.foodTasks, 20)}/20 food tasks`, unlocked: stats.foodTasks >= 20 },
    { id: "captains-run", emoji: "🏆", title: "Captain's Run", description: "Reach a seven-training-day streak.", progress: `${Math.min(stats.streak, 7)}/7 training days`, unlocked: stats.streak >= 7 },
    { id: "level-up", emoji: "🌟", title: "Level Up", description: "Reach level five.", progress: `Level ${Math.min(stats.level, 5)}/5`, unlocked: stats.level >= 5 },
  ];
}

const meals: Meal[] = [
  {
    name: "Breakfast",
    goal: "Strong start: protein, carbs, and healthy fat without feeling heavy.",
    items: [
      "3 whole eggs",
      "1 tsp olive oil, about 5 ml",
      "1 medium tomato, about 120 g, chopped",
      "1/2 green pepper, about 75 g, chopped",
      "80 g dry oats cooked with 300 ml water",
    ],
    prep: "Cook the tomato and green pepper in olive oil for 2 minutes, add beaten eggs, then serve with oats. Add cinnamon to oats if you want it easier to eat.",
    macros: "About 610 kcal, 34 g protein, 62 g carbs, 25 g fat.",
  },
  {
    name: "Lunch",
    goal: "Midday tea reset: keep it simple, unsweetened, and hydrating.",
    items: [
      "1-2 cups rooibos tea",
      "No sugar",
      "No milk",
      "Drink water alongside it",
    ],
    prep: "Steep rooibos for 5-7 minutes. This is a light tea break, not a performance meal; add a simple protein snack if training, hunger, or energy levels call for it.",
    macros: "Unsweetened rooibos is about 0-5 kcal and caffeine-free.",
  },
  {
    name: "Dinner",
    goal: "Main recovery plate: two pieces of meat, vegetables, and measured rice.",
    items: [
      "2 pieces of lean meat, such as chicken, fish, lean beef, or pork",
      "80-100 g dry rice, cooked into a measured portion",
      "2 cups vegetables, about 160-200 g",
      "1 tsp olive oil, about 5 ml, if needed",
    ],
    prep: "Grill, bake, or pan-cook the meat. Fill half the plate with vegetables, then use rice to fuel recovery. Keep the portions consistent while your body composition changes.",
    macros: "Roughly 650-850 kcal depending on the meat and rice portion; prioritize protein and vegetables.",
  },
];

const dailyFoodNotes = [
  "Body-recomposition target: use consistent portions and adjust based on energy, recovery, and weekly progress rather than crash dieting.",
  "Protein target: aim for 190-220 g per day. If these meals leave you short, add 2 boiled eggs or another chicken breast.",
  "For a shredded build, keep the rice portion around training and let vegetables take up most of the dinner plate.",
  "Hydration: 2.5-3.5 L water daily, especially after the jog and garage cardio.",
];

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const trainingDays = new Set(sessions.map((session) => session.key));
const dbName = "niim-training-db";
const dbVersion = 1;
const apiBase =
  import.meta.env.VITE_API_URL ??
  (location.hostname === "127.0.0.1" || location.hostname === "localhost" ? "http://127.0.0.1:8787" : "/api");
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const supabaseBrowser = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

async function apiPost<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "NiIM backend request failed.");
  return payload;
}

function openNiimDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet<T>(key: string, fallback: T) {
  const db = await openNiimDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction("kv", "readonly");
    const request = tx.objectStore("kv").get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? fallback);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function dbSet<T>(key: string, value: T) {
  const db = await openNiimDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(value, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function getTrainingStats(completedSessions: Record<string, string>, setCounts: Record<string, number>, taskProgress: Record<string, boolean>, today: Date) {
  const completedDates = Object.keys(completedSessions).sort();
  const totalSets = Object.values(setCounts).reduce((total, count) => total + count, 0);
  const completedTasks = Object.values(taskProgress).filter(Boolean).length;
  const cardioTasks = Object.entries(taskProgress).filter(([key, done]) => done && key.endsWith(":cardio")).length;
  const foodTasks = Object.entries(taskProgress).filter(([key, done]) => done && key.includes(":food:")).length;
  const xp = completedDates.length * 500 + totalSets * 25 + completedTasks * 50;
  const level = Math.floor(xp / 1000) + 1;
  const levelProgress = xp % 1000;
  let streak = 0;
  const cursor = new Date(today);
  for (let offset = 0; offset < 14; offset += 1) {
    const isTrainingDay = trainingDays.has(dayKeys[cursor.getDay()]);
    if (isTrainingDay && completedSessions[isoDate(cursor)]) streak += 1;
    if (isTrainingDay && !completedSessions[isoDate(cursor)]) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { xp, level, levelProgress, streak, totalSets, sessions: completedDates.length, completedTasks, cardioTasks, foodTasks };
}

function getSessionForDate(date: Date) {
  const key = dayKeys[date.getDay()];
  return sessions.find((session) => session.key === key);
}

function getNextTrainingDay(from: Date) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const date = new Date(from);
    date.setDate(from.getDate() + offset);
    const session = getSessionForDate(date);
    if (session) {
      return { date, session };
    }
  }
  return null;
}

function useDatabaseState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    dbGet<T>(key, initial)
      .then((stored) => {
        if (mounted) setValue(stored);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, [key]);

  const update = (next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next;
      void dbSet(key, resolved);
      return resolved;
    });
  };

  return [value, update, ready] as const;
}

export default function App() {
  const today = useMemo(() => new Date(), []);
  const todayKey = isoDate(today);
  const todaySession = getSessionForDate(today);
  const nextTraining = getNextTrainingDay(today);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [authenticated, setAuthenticated] = useState(false);
  const [setCounts, setSetCounts, setsReady] = useDatabaseState<Record<string, number>>("set-counts", {});
  const [completedSessions, setCompletedSessions, sessionsReady] = useDatabaseState<Record<string, string>>("completed-sessions", {});
  const [taskProgress, setTaskProgress, tasksReady] = useDatabaseState<Record<string, boolean>>("task-progress", {});
  const [motivationMode, setMotivationMode] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const journeyOffset = daysBetween(startDate, today);
  const activeJourneyOffset = Math.max(0, journeyOffset);
  const quote = quotes[positiveModulo(activeJourneyOffset, quotes.length)];
  const challenge = challenges[positiveModulo(Math.floor(activeJourneyOffset / 3), challenges.length)];
  const trainerCall = trainerCalls[positiveModulo(activeJourneyOffset + today.getDay(), trainerCalls.length)];
  const sessionTwist = sessionTwists[positiveModulo(activeJourneyOffset + 2, sessionTwists.length)];
  const completeToday = Boolean(completedSessions[todayKey]);
  const journeyLabel = journeyOffset < 0 ? `Starts in ${Math.abs(journeyOffset)}d` : `Day ${journeyOffset + 1}`;
  const daysLeft = Math.max(0, daysBetween(today, targetDate));
  const stats = getTrainingStats(completedSessions, setCounts, taskProgress, today);

  const sessionForCard = todaySession ?? nextTraining?.session;
  const sessionDate = todaySession ? today : nextTraining?.date ?? today;

  const incrementSet = (exercise: Exercise) => {
    const storageKey = `${isoDate(sessionDate)}:${exercise.id}`;
    setSetCounts((current) => ({
      ...current,
      [storageKey]: Math.min((current[storageKey] ?? 0) + 1, exercise.sets),
    }));
    setLastReward(25);
  };

  const resetExercise = (exercise: Exercise) => {
    const storageKey = `${isoDate(sessionDate)}:${exercise.id}`;
    setSetCounts((current) => ({ ...current, [storageKey]: 0 }));
  };

  const markSessionDone = () => {
    setCompletedSessions((current) => ({
      ...current,
      [isoDate(sessionDate)]: sessionForCard?.title ?? "Training",
    }));
    setLastReward(500);
  };

  const toggleTask = (taskKey: string) => {
    setTaskProgress((current) => ({ ...current, [taskKey]: !current[taskKey] }));
    if (!taskProgress[taskKey]) setLastReward(50);
  };

  const allDone =
    sessionForCard?.exercises.every((exercise) => {
      const key = `${isoDate(sessionDate)}:${exercise.id}`;
      return (setCounts[key] ?? 0) >= exercise.sets;
    }) ?? false;

  const lockApp = async () => {
    await supabaseBrowser?.auth.signOut();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (!setsReady || !sessionsReady || !tasksReady) {
    return (
      <main className="phone authScreen">
        <div className="authCard">
          <Database size={24} />
          <h1>Loading NiIM</h1>
          <p>Opening your private training database.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="phone">
        <section className="topbar">
          <div className="logoMark">NiIM</div>
          <div className="topbarActions">
            <button className="iconButton" aria-label="Motivation" onClick={() => setMotivationMode(!motivationMode)}>
              <Sparkles size={20} />
            </button>
            <button className="iconButton" aria-label="Lock app" onClick={lockApp}>
              <LogOut size={20} />
            </button>
          </div>
        </section>

        <section className="hero">
          <div className="heroTitleRow">
            <div>
              <p className="eyebrow">Nothing is impossible</p>
              <h1>Build a shredded, athletic body.</h1>
            </div>
            <div className="levelBadge"><Award size={18} /><span>LVL {stats.level}</span></div>
          </div>
          <div className="xpTrack">
            <div className="xpTrackTop"><span>{stats.xp.toLocaleString()} XP</span><span>{1000 - stats.levelProgress} XP to next level</span></div>
            <div className="xpBar"><span style={{ width: `${stats.levelProgress / 10}%` }} /></div>
          </div>
          <div className="statsGrid">
            <Metric label="Current streak" value={`${stats.streak} days`} />
            <Metric label="Rank" value={stats.level >= 5 ? "Starter" : "Rookie"} />
            <Metric label="Journey" value={journeyLabel} />
            <Metric label="Days to goal" value={String(daysLeft)} />
          </div>
          <p className="goalNote">Body-recomposition target · 178-180 cm · 110 kg starting point</p>
        </section>

        <section className="missionBar">
          <div className="missionIcon"><Zap size={18} /></div>
          <div><strong>Daily mission</strong><span>{challenge}</span></div>
          <b>+150</b>
        </section>

        {lastReward > 0 && <div className="rewardToast" onAnimationEnd={() => setLastReward(0)}>+{lastReward} XP earned</div>}

        {motivationMode && (
          <section className="quotePanel">
            <Flame size={18} />
            <div>
              <strong>Coach voice</strong>
              <p>{quote}</p>
            </div>
          </section>
        )}

        {activeTab === "today" && (
          <TodayView
            completeToday={completeToday}
            session={sessionForCard}
            sessionDate={sessionDate}
            isTodayTraining={Boolean(todaySession)}
            nextTraining={nextTraining}
            setCounts={setCounts}
            allDone={allDone}
            onIncrement={incrementSet}
            onReset={resetExercise}
            onDone={markSessionDone}
            challenge={challenge}
            trainerCall={trainerCall}
            sessionTwist={sessionTwist}
            stats={stats}
            taskProgress={taskProgress}
            onTaskToggle={toggleTask}
          />
        )}

        {activeTab === "program" && <ProgramView />}
        {activeTab === "food" && <FoodView todayKey={todayKey} taskProgress={taskProgress} onTaskToggle={toggleTask} />}
        {activeTab === "calendar" && <CalendarView completedSessions={completedSessions} today={today} />}
        {activeTab === "motivate" && <MotivationView quote={quote} achievements={getAchievements(stats)} />}
      </main>

      <nav className="bottomNav" aria-label="Primary">
        <NavButton icon={<Home size={20} />} label="Today" active={activeTab === "today"} onClick={() => setActiveTab("today")} />
        <NavButton icon={<Dumbbell size={20} />} label="Split" active={activeTab === "program"} onClick={() => setActiveTab("program")} />
        <NavButton icon={<Utensils size={20} />} label="Food" active={activeTab === "food"} onClick={() => setActiveTab("food")} />
        <NavButton icon={<CalendarDays size={20} />} label="Calendar" active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} />
        <NavButton icon={<Trophy size={20} />} label="Drive" active={activeTab === "motivate"} onClick={() => setActiveTab("motivate")} />
      </nav>

      <aside className="desktopBlock">
        <div>
          <h2>NiIM is mobile only</h2>
          <p>Open this app on a phone-sized screen to use the training experience.</p>
        </div>
      </aside>
    </>
  );
}

function AuthGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadAuth() {
      try {
        setLoading(true);
        if (!supabaseBrowser) {
          throw new Error("Missing Supabase browser keys. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        }
        const { data } = await supabaseBrowser.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          return;
        }
        await apiPost<{ ok: boolean }>("/auth/authorize", { accessToken: token });
        if (mounted) onAuthenticated();
      } catch (authError) {
        await supabaseBrowser?.auth.signOut();
        if (mounted) setError(authError instanceof Error ? authError.message : "Could not authorize this user.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadAuth();
    return () => {
      mounted = false;
    };
  }, [onAuthenticated]);

  const submitLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (!supabaseBrowser) {
        throw new Error("Missing Supabase browser keys. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }
      const { data, error: signInError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      const token = data.session?.access_token;
      if (!token) throw new Error("Supabase did not return a session.");
      await apiPost<{ ok: boolean }>("/auth/authorize", { accessToken: token });
      onAuthenticated();
    } catch (authError) {
      await supabaseBrowser?.auth.signOut();
      setError(authError instanceof Error ? authError.message : "Email or password could not be authorized.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="phone authScreen">
        <section className="authCard">
          <div className="authIcon"><Lock size={24} /></div>
          <p className="eyebrow">Private training log</p>
          <h1>Unlock NiIM</h1>
          <p>Sign in with your Supabase email and password. Only emails marked as authorized can enter.</p>

          <label className="codeInput textInput">
            <span>Email</span>
            <input
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={loading}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="codeInput textInput">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              disabled={loading}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p className="authError">{error}</p>}

          <button className="primaryButton" onClick={submitLogin} disabled={loading || !email || password.length < 6}>
            <Lock size={18} />
            {loading ? "Checking access" : "Sign in"}
          </button>
        </section>
      </main>
      <aside className="desktopBlock">
        <div>
          <h2>NiIM is mobile only</h2>
          <p>Open this app on a phone-sized screen to use the training experience.</p>
        </div>
      </aside>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TodayView({
  completeToday,
  session,
  sessionDate,
  isTodayTraining,
  nextTraining,
  setCounts,
  allDone,
  onIncrement,
  onReset,
  onDone,
  challenge,
  trainerCall,
  sessionTwist,
  stats,
  taskProgress,
  onTaskToggle,
}: {
  completeToday: boolean;
  session?: Session;
  sessionDate: Date;
  isTodayTraining: boolean;
  nextTraining: { date: Date; session: Session } | null;
  setCounts: Record<string, number>;
  allDone: boolean;
  onIncrement: (exercise: Exercise) => void;
  onReset: (exercise: Exercise) => void;
  onDone: () => void;
  challenge: string;
  trainerCall: string;
  sessionTwist: string;
  stats: { xp: number; level: number; levelProgress: number; streak: number; totalSets: number; sessions: number; completedTasks: number };
  taskProgress: Record<string, boolean>;
  onTaskToggle: (taskKey: string) => void;
}) {
  if (!session) return null;

  const sessionKey = isoDate(sessionDate);
  const warmupDone = Boolean(taskProgress[`${sessionKey}:warmup`]);
  const cardioDone = Boolean(taskProgress[`${sessionKey}:cardio`]);
  const finisherDone = Boolean(taskProgress[`${sessionKey}:finisher`]);

  return (
    <div className="contentStack">
      <section className="sessionHeader">
        <div>
          <p>{isTodayTraining ? "Today's session" : `Rest day. Next: ${nextTraining?.date.toLocaleDateString(undefined, { weekday: "long" })}`}</p>
          <h2>{session.title}</h2>
          <span>{session.intent}</span>
        </div>
        <div className="sessionReward"><Flame size={17} /><strong>+500 XP</strong>{completeToday && <Check className="doneBadge" size={22} />}</div>
      </section>

      <section className="runCard">
        <div><span>Current run</span><strong>{stats.streak} day streak</strong></div>
        <div><span>Session clear</span><strong>+500 XP</strong></div>
        <div><span>Sets logged</span><strong>{stats.totalSets}</strong></div>
      </section>

      <section className="miniCard">
        <div className="miniIcon"><ShieldCheck size={18} /></div>
        <div>
          <strong>This week's challenge</strong>
          <p>{challenge}</p>
        </div>
      </section>

      <section className="trainerCard">
        <Activity size={20} />
        <div>
          <strong>Personal trainer call</strong>
          <p>{trainerCall}</p>
          <span>{sessionTwist}</span>
        </div>
      </section>

      <section className="taskPanel">
        <div className="taskPanelHeader"><div><p>Session flow</p><h3>Complete in order</h3><small>Warm up first. Lift. Do cardio after all working sets. Finish with the finisher and stretch.</small></div><strong>+50 XP each</strong></div>
        <div className="taskCarousel">
          <TaskRow taskKey={`${sessionKey}:warmup`} label="1 · Warm up before lifting" detail={session.warmup.join(" · ")} done={warmupDone} onToggle={onTaskToggle} />
          <TaskRow taskKey={`${sessionKey}:cardio`} label="2 · Cardio after all sets" detail={session.cardio} done={cardioDone} disabled={!allDone} onToggle={onTaskToggle} />
          <TaskRow taskKey={`${sessionKey}:finisher`} label="3 · Finisher after cardio" detail={session.finisher} done={finisherDone} disabled={!cardioDone} onToggle={onTaskToggle} />
          <TaskRow taskKey={`${sessionKey}:stretch`} label="4 · Stretch after finisher" detail={session.stretch} done={Boolean(taskProgress[`${sessionKey}:stretch`])} disabled={!finisherDone} onToggle={onTaskToggle} />
        </div>
      </section>

      <div className="exerciseList">
        {session.exercises.map((exercise) => {
          const key = `${isoDate(sessionDate)}:${exercise.id}`;
          const count = setCounts[key] ?? 0;
          const closed = count >= exercise.sets;
          return (
            <article className={`exerciseCard ${closed ? "closed" : ""}`} key={exercise.id}>
              <div className="exerciseTop">
                <div>
                  <p>{exercise.focus}</p>
                  <h3>{exercise.name}</h3>
                  <span>{exercise.sets} sets x {exercise.reps}</span>
                </div>
                <div className="counterRing">{count}/{exercise.sets}</div>
              </div>

              {!closed && (
                <>
                  <div className="loadLine">{exercise.load}</div>
                  {count === exercise.sets - 1 && (
                    <div className="coachNote">
                      Final set: push hard today. Go to technical failure only if your form stays safe and sharp.
                    </div>
                  )}
                  <ol>
                    {exercise.instructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                  </ol>
                  <button className="primaryButton" onClick={() => onIncrement(exercise)}>
                    <Check size={18} />
                    Log set {Math.min(count + 1, exercise.sets)} <span className="buttonXp">+25 XP</span>
                  </button>
                </>
              )}

              {closed && (
                <button className="ghostButton" onClick={() => onReset(exercise)}>
                  <RotateCcw size={16} />
                  Reopen
                </button>
              )}
            </article>
          );
        })}
      </div>

      <button className="finishButton" disabled={!allDone} onClick={onDone}>
        {allDone ? "Claim session reward · +500 XP" : "Complete all sets to unlock reward"}
      </button>
    </div>
  );
}

function TaskRow({ taskKey, label, detail, done, disabled = false, onToggle }: { taskKey: string; label: string; detail: string; done: boolean; disabled?: boolean; onToggle: (taskKey: string) => void }) {
  return (
    <button className={`taskRow ${done ? "done" : ""} ${disabled ? "disabled" : ""}`} disabled={disabled} onClick={() => onToggle(taskKey)}>
      <span className="taskCheck">{done && <Check size={15} />}</span>
      <span className="taskCopy"><strong>{label}</strong><small>{detail}</small></span>
      <b>+50</b>
    </button>
  );
}

function ProgramView() {
  return (
    <div className="contentStack">
      <section className="sectionTitle">
        <p>Weekly split</p>
        <h2>Five training days. Two real rest days.</h2>
      </section>
      {sessions.map((session) => (
        <article className="programCard" key={session.key}>
          <div>
            <span>{session.day}</span>
            <h3>{session.title}</h3>
            <p>{session.intent}</p>
          </div>
          <ChevronRight size={18} />
        </article>
      ))}
      <section className="detailsBand">
        <h3>Progression</h3>
        <p>Run this base split for 4 weeks, but let the trainer calls change the feel each day. If all reps are clean, add 2.5 kg to barbell lifts, add one cardio round, or make the last set AMRAP with safe form. Every fourth week, keep the weights lighter and move perfectly.</p>
      </section>
    </div>
  );
}

function CalendarView({ completedSessions, today }: { completedSessions: Record<string, string>; today: Date }) {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const blanks = monthStart.getDay();
  const cells: CalendarCell[] = [
    ...Array.from({ length: blanks }, (_, index): CalendarCell => ({ blank: true, key: `blank-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
      const key = isoDate(date);
      return {
        blank: false,
        key,
        day: index + 1,
        training: trainingDays.has(dayKeys[date.getDay()]),
        done: Boolean(completedSessions[key]),
        today: key === isoDate(today),
      } satisfies CalendarCell;
    }),
  ];

  return (
    <div className="contentStack">
      <section className="sectionTitle">
        <p>Calendar</p>
        <h2>{today.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
      </section>
      <div className="calendarGrid labels">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendarGrid">
        {cells.map((cell) => (
          <div
            className={`calendarCell ${cell.blank ? "blank" : ""} ${"training" in cell && cell.training ? "training" : ""} ${"done" in cell && cell.done ? "done" : ""} ${"today" in cell && cell.today ? "today" : ""}`}
            key={cell.key}
          >
            {"day" in cell ? cell.day : ""}
          </div>
        ))}
      </div>
      <section className="miniCard">
        <div className="miniIcon"><Timer size={18} /></div>
        <div>
          <strong>Training days</strong>
          <p>Monday, Tuesday, Thursday, Friday, Saturday. Wednesday and Sunday are rest days.</p>
        </div>
      </section>
    </div>
  );
}

function FoodView({ todayKey, taskProgress, onTaskToggle }: { todayKey: string; taskProgress: Record<string, boolean>; onTaskToggle: (taskKey: string) => void }) {
  return (
    <div className="contentStack">
      <section className="sectionTitle">
        <p>Food plan</p>
        <h2>Eat like the training matters.</h2>
      </section>

      <section className="trainerCard">
        <Utensils size={20} />
        <div>
          <strong>Build target</strong>
          <p>Simple food, exact portions, and high protein to support a leaner, more defined athletic frame.</p>
          <span>Adjust rice up on hard training days and slightly down on rest days.</span>
        </div>
      </section>

      <section className="taskPanel foodTasks">
        <div className="taskPanelHeader"><div><p>Nutrition checklist</p><h3>Fuel the physique</h3></div><strong>+50 XP each</strong></div>
        <div className="taskCarousel">
          {meals.map((meal) => {
            const taskKey = `${todayKey}:food:${meal.name.toLowerCase()}`;
            return <TaskRow key={taskKey} taskKey={taskKey} label={`Eat ${meal.name.toLowerCase()}`} detail={meal.macros} done={Boolean(taskProgress[taskKey])} onToggle={onTaskToggle} />;
          })}
          <TaskRow taskKey={`${todayKey}:food:water`} label="Hit your water target" detail="Aim for 2.5–3.5 L today, more in heat or hard cardio." done={Boolean(taskProgress[`${todayKey}:food:water`])} onToggle={onTaskToggle} />
        </div>
      </section>

      {meals.map((meal) => (
        <article className="foodCard" key={meal.name}>
          <div className="foodTop">
            <div>
              <p>{meal.goal}</p>
              <h3>{meal.name}</h3>
            </div>
            <Utensils size={20} />
          </div>
          <ul>
            {meal.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="loadLine">{meal.prep}</div>
          <div className="macroLine">{meal.macros}</div>
        </article>
      ))}

      <section className="detailsBand">
        <h3>Coach notes</h3>
        {dailyFoodNotes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </section>
    </div>
  );
}

function MotivationView({ quote, achievements }: { quote: string; achievements: Achievement[] }) {
  return (
    <div className="contentStack">
      <section className="sectionTitle">
        <p>Drive</p>
        <h2>When you feel low, shrink the task and keep the promise.</h2>
      </section>
      <section className="bigQuote">
        <HeartPulse size={24} />
        <p>{quote}</p>
      </section>
      <section className="achievementSection">
        <div className="achievementHeader"><div><p>Achievement locker</p><h3>Collect your proof</h3></div><strong>{achievements.filter((achievement) => achievement.unlocked).length}/{achievements.length} unlocked</strong></div>
        <div className="achievementGrid">
          {achievements.map((achievement) => (
            <article className={`achievementCard ${achievement.unlocked ? "unlocked" : "locked"}`} key={achievement.id}>
              <div className="achievementEmoji">{achievement.unlocked ? achievement.emoji : "🔒"}</div>
              <div className="achievementCopy"><strong>{achievement.title}</strong><p>{achievement.description}</p><span>{achievement.progress}</span></div>
            </article>
          ))}
        </div>
      </section>
      <section className="detailsBand">
        <h3>Low motivation rule</h3>
        <p>Do the warm-up and the first set. After that, you can choose. Most days, starting is enough to wake the rest of you up.</p>
        <h3>Direction</h3>
        <p>You are building a shredded, athletic body at 178-180 cm and 110 kg. The journey starts Monday, August 03, 2026 and points to October 31, 2028.</p>
      </section>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
