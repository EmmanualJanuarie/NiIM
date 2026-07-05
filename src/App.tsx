import {
  Activity,
  CalendarDays,
  Check,
  ChevronRight,
  Database,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  KeyRound,
  Lock,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  Utensils,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

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

const startDate = new Date("2026-07-06T00:00:00");
const targetDate = new Date("2028-10-31T00:00:00");

const sessions: Session[] = [
  {
    key: "monday",
    day: "Monday",
    title: "Front-Line Strength",
    intent: "Bench, legs, trunk pressure, and contact strength for rugby.",
    warmup: ["5 min light jump rope", "World's greatest stretch x 5 each side", "Empty bar press x 15"],
    cardio: "Easy 12 minute jog after lifting. Nose breathing pace.",
    finisher: "Heavy rope: 8 rounds of 20 seconds on, 40 seconds walk.",
    exercises: [
      {
        id: "bench",
        name: "Barbell Bench Press",
        sets: 5,
        reps: "10 reps",
        load: "Start with a weight you can control. Add 2.5 kg when all sets feel solid.",
        focus: "Upper-body power for tackles, carries, and ruck clears.",
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
        focus: "Leg drive for scrums, carries, and repeated accelerations.",
        instructions: [
          "Brace your stomach like you are about to take contact.",
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
    ],
  },
  {
    key: "tuesday",
    day: "Tuesday",
    title: "Engine And Feet",
    intent: "Conditioning, speed repeatability, and core control.",
    warmup: ["3 min light rope", "High knees x 30 sec", "A-skips x 20 meters", "Hip openers x 8 each"],
    cardio: "Jog 20 minutes. Every 4 minutes, surge for 20 seconds then settle.",
    finisher: "Ab roller: 5 sets of 5 controlled reps from knees.",
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
    ],
  },
  {
    key: "thursday",
    day: "Thursday",
    title: "Hinge And Carry Power",
    intent: "Posterior chain, grip, and collision-ready hips.",
    warmup: ["5 min easy jog", "Glute bridges x 15", "Empty bar Romanian deadlift x 12"],
    cardio: "6 hill or driveway accelerations of 15 seconds. Walk back fully.",
    finisher: "Mat core: side plank 3 x 30 seconds each side.",
    exercises: [
      {
        id: "deadlift",
        name: "Barbell Deadlift",
        sets: 5,
        reps: "5 reps",
        load: "Strong but clean. Never grind ugly reps.",
        focus: "Hip power for tackles, carries, and mauls.",
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
    ],
  },
  {
    key: "friday",
    day: "Friday",
    title: "Speed Strength",
    intent: "Explosive reps, athletic movement, and durable shoulders.",
    warmup: ["Light rope x 4 min", "Bodyweight squats x 20", "Scap push-ups x 12"],
    cardio: "10 x 60 meter strides at 70-80 percent. Walk back recovery.",
    finisher: "Heavy rope: 5 minutes continuous, relaxed pace.",
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
    ],
  },
  {
    key: "saturday",
    day: "Saturday",
    title: "Samoa Rugby Builder",
    intent: "Longer work capacity, trunk resilience, and confidence.",
    warmup: ["Easy jog x 8 min", "Dynamic lunges x 10 each", "Shoulder circles x 20"],
    cardio: "Rugby engine: 30 min jog-walk. Jog 3 minutes, walk 1 minute.",
    finisher: "Write one sentence: where am I going, and what did I prove today?",
    exercises: [
      {
        id: "complex",
        name: "Barbell Complex",
        sets: 5,
        reps: "6 row, 6 clean pull, 6 front squat, 6 press",
        load: "Empty bar or very light plates. Do not drop the bar.",
        focus: "Whole-body conditioning with rugby-style fatigue.",
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
        focus: "Anti-extension core strength for contact.",
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
  "Nothing is impossible. Today is one step closer to Samoa.",
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
  "Contact mindset: brace your stomach before every rep like you are taking a hit.",
  "Beat yesterday by one clean rep, one cleaner set, or one honest minute.",
  "When you want to quit, finish the current set first. Then reassess.",
  "Make the easy reps beautiful. That is how heavy reps get safer.",
];

const sessionTwists = [
  "Power start: first working set should feel fast, not heavy.",
  "Last-set push: final set is AMRAP with clean form only.",
  "Quiet feet: every jump, jog, and rope contact should land soft.",
  "Captain's standard: no skipped warm-up, no rushed cooldown.",
  "Samoa engine: breathe steady even when the work gets uncomfortable.",
];

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
    goal: "Main build meal for a Samoan rugby frame: high protein, enough rice, and vegetables.",
    items: [
      "2 chicken breasts, about 300-360 g raw total",
      "100 g dry white rice, cooked into about 300 g rice",
      "2 cups vegetables, about 160-200 g",
      "1 tsp olive oil, about 5 ml, for cooking or over vegetables",
    ],
    prep: "Grill, pan-cook, or bake the chicken. Keep rice plain most days. Add vegetables when you have them; green pepper, tomato, mixed veg, cabbage, or spinach all work.",
    macros: "About 850-950 kcal, 80-95 g protein, 90 g carbs, 15-20 g fat.",
  },
  {
    name: "Dinner",
    goal: "Recover without overeating: protein, rice, and vegetables to refill for tomorrow.",
    items: [
      "1 chicken breast, about 150-180 g raw",
      "80 g dry white rice, cooked into about 240 g rice",
      "2 cups vegetables, about 160-200 g",
      "1 tsp olive oil, about 5 ml, if the meal feels too dry",
    ],
    prep: "Use the same chicken and rice base as lunch. If training was brutal, keep the full rice portion. On rest days, use 60 g dry rice instead.",
    macros: "About 570-680 kcal, 45-55 g protein, 72 g carbs, 8-14 g fat.",
  },
];

const dailyFoodNotes = [
  "Daily target: roughly 2,000-2,300 kcal from these meals before snacks. Adjust up if weight drops too fast or training feels flat.",
  "Protein target: aim for 190-220 g per day. If these meals leave you short, add 2 boiled eggs or another chicken breast.",
  "For the rugby build, keep rice around training. It fuels lifting, jogging, rope work, and recovery.",
  "Hydration: 2.5-3.5 L water daily, more when Samoa-style heat or hard cardio hits.",
];

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const trainingDays = new Set(sessions.map((session) => session.key));
const dbName = "niim-training-db";
const dbVersion = 1;
const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const apiBase =
  import.meta.env.VITE_API_URL ??
  (location.hostname === "127.0.0.1" || location.hostname === "localhost" ? "http://127.0.0.1:8787" : "/api");

function getDeviceId() {
  const key = "niim:device-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

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

function randomBase32Secret() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let bits = "";
  bytes.forEach((byte) => {
    bits += byte.toString(2).padStart(8, "0");
  });
  return bits.match(/.{1,5}/g)?.map((chunk) => base32Alphabet[parseInt(chunk.padEnd(5, "0"), 2)]).join("") ?? "";
}

function decodeBase32(secret: string) {
  const cleaned = secret.replace(/=+$/g, "").replace(/\s/g, "").toUpperCase();
  let bits = "";
  for (const char of cleaned) {
    const value = base32Alphabet.indexOf(char);
    if (value >= 0) bits += value.toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{1,8}/g)?.filter((chunk) => chunk.length === 8).map((chunk) => parseInt(chunk, 2)) ?? [];
  return new Uint8Array(bytes);
}

async function generateTotp(secret: string, timestep = Math.floor(Date.now() / 30000)) {
  const key = await crypto.subtle.importKey("raw", decodeBase32(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const counter = new ArrayBuffer(8);
  const view = new DataView(counter);
  view.setUint32(4, timestep);
  const hash = new Uint8Array(await crypto.subtle.sign("HMAC", key, counter));
  const offset = hash[hash.length - 1] & 0xf;
  const binary = ((hash[offset] & 0x7f) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
  return String(binary % 1000000).padStart(6, "0");
}

async function verifyTotp(secret: string, code: string) {
  const cleanCode = code.replace(/\D/g, "");
  const timestep = Math.floor(Date.now() / 30000);
  const validCodes = await Promise.all([-1, 0, 1].map((offset) => generateTotp(secret, timestep + offset)));
  return validCodes.includes(cleanCode);
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
  const [motivationMode, setMotivationMode] = useState(false);
  const journeyOffset = daysBetween(startDate, today);
  const activeJourneyOffset = Math.max(0, journeyOffset);
  const quote = quotes[positiveModulo(activeJourneyOffset, quotes.length)];
  const challenge = challenges[positiveModulo(Math.floor(activeJourneyOffset / 3), challenges.length)];
  const trainerCall = trainerCalls[positiveModulo(activeJourneyOffset + today.getDay(), trainerCalls.length)];
  const sessionTwist = sessionTwists[positiveModulo(activeJourneyOffset + 2, sessionTwists.length)];
  const completeToday = Boolean(completedSessions[todayKey]);
  const journeyLabel = journeyOffset < 0 ? `Starts in ${Math.abs(journeyOffset)}d` : `Day ${journeyOffset + 1}`;
  const daysLeft = Math.max(0, daysBetween(today, targetDate));

  const sessionForCard = todaySession ?? nextTraining?.session;
  const sessionDate = todaySession ? today : nextTraining?.date ?? today;

  const incrementSet = (exercise: Exercise) => {
    const storageKey = `${isoDate(sessionDate)}:${exercise.id}`;
    setSetCounts((current) => ({
      ...current,
      [storageKey]: Math.min((current[storageKey] ?? 0) + 1, exercise.sets),
    }));
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
  };

  const allDone =
    sessionForCard?.exercises.every((exercise) => {
      const key = `${isoDate(sessionDate)}:${exercise.id}`;
      return (setCounts[key] ?? 0) >= exercise.sets;
    }) ?? false;

  if (!authenticated) {
    return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (!setsReady || !sessionsReady) {
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
            <button className="iconButton" aria-label="Lock app" onClick={() => setAuthenticated(false)}>
              <LogOut size={20} />
            </button>
          </div>
        </section>

        <section className="hero">
          <p className="eyebrow">Nothing is impossible</p>
          <h1>Samoa rugby body, built one session at a time.</h1>
          <div className="statsGrid">
            <Metric label="Height" value="178 cm" />
            <Metric label="Weight" value="110 kg" />
            <Metric label="Journey" value={journeyLabel} />
            <Metric label="Days left" value={String(daysLeft)} />
          </div>
        </section>

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
          />
        )}

        {activeTab === "program" && <ProgramView />}
        {activeTab === "food" && <FoodView />}
        {activeTab === "calendar" && <CalendarView completedSessions={completedSessions} today={today} />}
        {activeTab === "motivate" && <MotivationView quote={quote} />}
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
  const [secret, setSecret] = useState("");
  const [setupUri, setSetupUri] = useState("");
  const [hasExistingSecret, setHasExistingSecret] = useState(true);
  const [lockedToOtherDevice, setLockedToOtherDevice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [deviceId] = useState(() => getDeviceId());

  useEffect(() => {
    let mounted = true;
    async function loadAuth() {
      try {
        setLoading(true);
        const status = await apiPost<{ registered: boolean; thisDevice: boolean }>("/auth/status", { deviceId });
        if (!mounted) return;
        if (status.registered && !status.thisDevice) {
          setLockedToOtherDevice(true);
          return;
        }
        if (!status.registered) {
          const registration = await apiPost<{ ok: boolean; secret: string; setupUri: string }>("/auth/register", { deviceId });
          if (!mounted) return;
          setSecret(registration.secret);
          setSetupUri(registration.setupUri);
          setHasExistingSecret(false);
          return;
        }
        setHasExistingSecret(true);
      } catch (authError) {
        if (mounted) setError(authError instanceof Error ? authError.message : "Could not reach NiIM backend.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadAuth();
    return () => {
      mounted = false;
    };
  }, [deviceId]);

  const submitCode = async () => {
    setError("");
    try {
      await apiPost<{ ok: boolean }>("/auth/verify", { deviceId, code });
      onAuthenticated();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "That code did not match.");
    }
  };

  return (
    <>
      <main className="phone authScreen">
        <section className="authCard">
          <div className="authIcon"><Lock size={24} /></div>
          <p className="eyebrow">Private training log</p>
          <h1>Unlock NiIM</h1>
          {loading && <p>Connecting to the NiIM backend and checking this device.</p>}
          {!loading && lockedToOtherDevice && (
            <p>This NiIM backend is already locked to another device. Login from this phone is blocked.</p>
          )}
          {!loading && !lockedToOtherDevice && (
            <p>
              {hasExistingSecret
                ? "Enter the 6-digit code from your authenticator app."
                : "First time setup: add this key to your authenticator app, then enter the 6-digit code it shows."}
            </p>
          )}

          {!loading && !lockedToOtherDevice && !hasExistingSecret && (
            <div className="setupBox">
              <strong>Manual setup key</strong>
              <code>{secret || "Generating..."}</code>
              <span>{setupUri}</span>
            </div>
          )}

          {!lockedToOtherDevice && (
            <label className="codeInput">
              <span>Authenticator code</span>
              <input
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                disabled={loading}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </label>
          )}

          {error && <p className="authError">{error}</p>}

          <button className="primaryButton" onClick={submitCode} disabled={loading || lockedToOtherDevice || code.length !== 6}>
            <KeyRound size={18} />
            Unlock app
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
}) {
  if (!session) return null;

  return (
    <div className="contentStack">
      <section className="sessionHeader">
        <div>
          <p>{isTodayTraining ? "Today's session" : `Rest day. Next: ${nextTraining?.date.toLocaleDateString(undefined, { weekday: "long" })}`}</p>
          <h2>{session.title}</h2>
          <span>{session.intent}</span>
        </div>
        {completeToday && <Check className="doneBadge" size={24} />}
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

      <section className="detailsBand">
        <h3>Warm-up</h3>
        {session.warmup.map((item) => (
          <p key={item}>{item}</p>
        ))}
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
                    Complete set {Math.min(count + 1, exercise.sets)}
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

      <section className="detailsBand">
        <h3>Cardio</h3>
        <p>{session.cardio}</p>
        <h3>Finisher</h3>
        <p>{session.finisher}</p>
      </section>

      <button className="finishButton" disabled={!allDone} onClick={onDone}>
        {allDone ? "Lock session complete" : "Finish every set to close session"}
      </button>
    </div>
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

function FoodView() {
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
          <p>Simple food, exact portions, high protein. This supports a bigger rugby frame while still keeping conditioning possible.</p>
          <span>Adjust rice up on hard training days and slightly down on rest days.</span>
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

function MotivationView({ quote }: { quote: string }) {
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
      <section className="detailsBand">
        <h3>Low motivation rule</h3>
        <p>Do the warm-up and the first set. After that, you can choose. Most days, starting is enough to wake the rest of you up.</p>
        <h3>Direction</h3>
        <p>You are training for Samoa in 2028. The app starts from Monday, July 06, 2026 and points to October 31, 2028.</p>
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
