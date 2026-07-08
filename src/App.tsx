import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Toaster, toast } from "sonner";

const CATS = [
  {
    id: "castiel",
    name: "Castiel",
    age: "1 year old",
    breed: "Siamese Mix",
    trait: "The Resident Boss",
    bio: "Loves to sleep right on your laptop while you work. Certified filter coffee sniffer.",
    img: "/images/catcas.jpeg",
    adoptable: false,
  },
  {
    id: "lencse",
    name: "Lencse",
    age: "11 months old",
    breed: "Tabby Prankster",
    trait: "Always on the Move",
    bio: "Will fetch any toy wand you throw. When he yawns, the entire café melts instantly.",
    img: "/images/cattob.jpg",
    adoptable: true,
  },
  {
    id: "lucas",
    name: "Lucas",
    age: "2 years old",
    breed: "Grey Tom",
    trait: "Master Biscuits Maker",
    bio: "The fierce hunter of the lounge. A quiet gentleman who loves chin scratches.",
    img: "/images/catluc.jpeg",
    adoptable: false,
  },
  {
    id: "sumi",
    name: "Sumi",
    age: "4 years old",
    breed: "Tuxedo Lady",
    trait: "Queen of the Quiet Purr Zone",
    bio: "A silent observer. She only gives kisses to our most patient and gentle guests.",
    img: "/images/cattux.jpeg",
    adoptable: true,
  },
];

const REVIEWS = [
  {
    name: "Gábor Nagy",
    source: "Google Reviewer",
    stars: 5,
    text: "The coffee is exceptional, and the cats are incredibly friendly. I will definitely be a returning guest!",
  },
  {
    name: "Vivien Zolyomi",
    source: "Budapest",
    stars: 5,
    text: "The Quiet Purr Zone is absolute heaven. Mochi curled up right next to my filter coffee. I almost cried.",
  },
  {
    name: "Bence Tóth",
    source: "Local Guide",
    stars: 5,
    text: "Never thought specialty coffee and cats would mix this well. The flat white is an absolute 10/10.",
  },
  {
    name: "Lilla Varga",
    source: "Adopter",
    stars: 5,
    text: "We adopted Lencse through Purrfect Cups. The team helped with everything. Thank you so much!",
  },
  {
    name: "Réka Simon",
    source: "3rd Visit",
    stars: 5,
    text: "Warm lighting, soft jazz, and purring in every corner. Way better than any coworking space.",
  },
  {
    name: "Márk H.",
    source: "Specialty Fanatic",
    stars: 5,
    text: "Colombian Gesha, 91 points. A fresh croissant on my plate, a cat on my lap. What else could I ask for?",
  },
  {
    name: "Eszter Farkas",
    source: "Regular",
    stars: 5,
    text: "I come here every Thursday to work. The quiet zone is a lifesaver, and Sumi always sits on my notes.",
  },
  {
    name: "Dániel Kovács",
    source: "First Visit",
    stars: 5,
    text: "My girlfriend dragged me here. Now I understand. The pour-over is incredible and Castiel stole my seat.",
  },
  {
    name: "Anna Papp",
    source: "Cat Lover",
    stars: 5,
    text: "Clean, cozy, and the cats are so well cared for. You can tell this is a passion project, not just a business.",
  },
];

type Booking = {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  zone: "main" | "quiet";
  note?: string;
  createdAt: string;
};

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3001");

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

function CatPawIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="20.5" r="6.2" fill="currentColor" />
      <ellipse cx="9.15" cy="13.35" rx="2.75" ry="3.2" fill="currentColor" />
      <ellipse cx="16" cy="10.15" rx="2.75" ry="3.25" fill="currentColor" />
      <ellipse cx="22.85" cy="13.35" rx="2.75" ry="3.2" fill="currentColor" />
    </svg>
  );
}

function useLocalBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("purrfect_bookings_v2");
      if (raw) setBookings(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (b: Booking[]) => {
    setBookings(b);
    localStorage.setItem("purrfect_bookings_v2", JSON.stringify(b));
  };
  return { bookings, save };
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#1c1c1c] antialiased">
      <Toaster richColors position="top-center" expand={false} theme="light" toastOptions={{
        style: { background: "#ffffff", border: "1px solid #d4d4d4", color: "#2a2a2a" }
      }} />
      <SiteNav />
      <main className="relative">
        <Hero />
        <div className="absolute left-1/2 z-30 pointer-events-none cat-overlay"
             style={{
               transform: "translateX(-50%)"
             }}>
          <img src="/images/hero.png" alt="" className="block w-auto cat-overlay-img" />
        </div>
        <Concept />
        <Residents />
        <MenuTeaser />
        <BookingSection />
        <Reviews />
        <VisitBlock />
      </main>
      <Footer />
    </div>
  );
}

function SiteNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#cicak", label: "Our Cats" },
    { href: "#menu", label: "Menu" },
    { href: "#foglalas", label: "Book a Table" },
    { href: "#velemenyek", label: "Reviews" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a]/70 backdrop-blur-xl px-5 sm:px-8 lg:px-10 py-3.5 shadow">
          <a href="#" className="flex items-center gap-3 text-[#e0e0e0]">
            <span className="w-9 h-9 rounded-full bg-[#e8e8e8] text-[#2a2a2a] grid place-items-center">
              <CatPawIcon className="w-[17px] h-[17px]" />
            </span>
            <span className="font-display text-[19px] sm:text-[20.5px] tracking-[-0.01em]">Purrfect Cups</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-[13.8px] text-[#d0d0d0]/90">
            {links.map(l => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#foglalas" className="hidden sm:inline-flex rounded-full bg-[#e5e5e5] px-4 py-[10px] text-[13.5px] font-medium text-[#2a2a2a] hover:bg-[#d4d4d4] transition-colors">
              Book a Table
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden rounded-full w-10 h-10 grid place-items-center text-[#d0d0d0] hover:bg-white/10 transition"
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M5 7h14M5 12h14M5 17h14" />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-3 rounded-xl border border-white/20 bg-[#2a2a2a]/90 backdrop-blur-2xl text-[#d0d0d0] px-5 py-4 shadow-xl"
            >
              <div className="flex flex-col">
                {links.map(l => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={()=>setOpen(false)}
                    className="py-3 border-b border-white/10 last:border-0 text-[15px]"
                  >{l.label}</a>
                ))}
                <a href="#foglalas" onClick={()=>setOpen(false)} className="mt-3 rounded-full bg-[#e5e5e5] text-[#2a2a2a] text-center py-3 text-[14px] font-medium">
                  Book a Table
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"]});
  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] bg-[#1a1a1a]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#222222] via-[#1a1a1a] to-[#1a1a1a]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 min-h-[100svh] flex flex-col justify-start pt-16 sm:pt-20 pb-16">
        <motion.div style={{ y: yText, opacity: opacityText }} className="w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.18, 0.75, 0.24, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8]/18 bg-white/[0.045] px-4 py-1.5 text-[11.8px] tracking-widest text-[#d0d0d0] uppercase"
          >
            <span className="w-[5px] h-[5px] rounded-full bg-[#b0b0b0]" />
            8200 Veszprém, Csikász Imre utca 2/B.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.18, .75, .24, 1] }}
            className="font-display text-[#ececec] mt-8 text-[54px] sm:text-[86px] lg:text-[118px] leading-[0.92] tracking-[-0.025em]"
          >
            Purrfect<br />Cups
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22 }}
            className="mx-auto mt-7 max-w-xl text-[17px] sm:text-[19.5px] text-[#c0c0c0]/92 leading-relaxed"
          >
            Specialty coffee, artisanal pastries, and 12 adoptable resident cats.
            Sip slowly. Stay a while. Purr back.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.36 }}
            className="mt-9 flex items-center justify-center gap-4 flex-wrap"
          >
            <a href="#foglalas" className="rounded-full bg-[#e5e5e5] px-6 py-3.5 text-[15px] font-medium text-[#1c1c1c] shadow-sm hover:bg-[#d4d4d4] transition">
              Book a Turn
            </a>
            <a href="#cicak" className="rounded-full border border-[#e0e0e0]/32 px-6 py-3.5 text-[15px] text-[#e0e0e0] hover:bg-white/10 transition">
              Meet the Cats
            </a>
          </motion.div>

          <div className="mt-14 text-[11.5px] tracking-widest uppercase text-[#c0c0c0]/70 flex items-center justify-center gap-10 flex-wrap">
            <span>Single-origin espresso</span>
            <span className="opacity-55">•</span>
            <span>No-kid quiet zone</span>
            <span className="opacity-55">•</span>
            <span>Cat Adoption</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Concept() {
  return (
    <section className="relative">
      <div className="bg-[#f8f8f8] mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 pt-[42vh] sm:pt-[45vh] pb-24 sm:pb-28 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-start">
          <div className="lg:col-span-7">
            <p className="text-[11.8px] tracking-[0.18em] uppercase text-[#7d7d7d] font-medium">The Concept</p>
            <h2 className="font-display text-[40px] sm:text-[56px] lg:text-[62px] leading-[0.98] tracking-[-0.022em] text-[#1c1c1c] mt-5">
              Coffee to<br/>wake up.<br/>Cats to<br/>make you stay.
            </h2>
          </div>
          <div className="lg:col-span-5 pt-2 text-[17.5px] leading-relaxed text-[#333333]">
            <p>
              Purrfect Cups is a cozy, sunlit specialty cat café located in the heart of Veszprém. 
              Mornings are for pour-overs and warm croissants. Afternoons transform into a peaceful reading sanctuary with lap-kneading companions.
            </p>
            <p className="mt-5 text-[#444444]">
              All of our residents were rescued from local shelters. You can play with them, pet them, 
              and if you fall in love – you can even adopt them. We handle the paperwork, vaccinations, and provide a starter kit for a smooth transition.
            </p>
            <div className="mt-9 grid grid-cols-3 gap-6 pt-8 border-t border-[#c0c0c0]">
              <Stat n="37" label="cats found a home" />
              <Stat n="12" label="current residents" />
              <Stat n="4.9" label="Google rating" />
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-22 grid md:grid-cols-3 gap-6 text-[14.6px] text-[#333333]">
          <ConceptCard title="Specialty, Seriously" body="Colombia, Ethiopia, Kenya – weekly rotation. In-house grinding, V60, AeroPress, and a premium La Marzocco machine." />
          <ConceptCard title="Cat-First Space" body="Scratching posts, climbing shelves, and private sleeping pods. The cats always have the right of way. No exceptions." />
          <ConceptCard title="Quiet Purr Zone" body="A dedicated zone for laptop work, studying, or reading. Soft ambient music, no loud noises. Just endless purring." />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[34px] text-[#1c1c1c] tracking-[-0.014em]">{n}</div>
      <div className="text-[12.6px] leading-snug text-[#555555] max-w-[120px]">{label}</div>
    </div>
  );
}
function ConceptCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e0e0e0] px-6 py-6 shadow-sm">
      <div className="text-[13.8px] font-medium text-[#222222]">{title}</div>
      <p className="mt-2 text-[14.6px] leading-relaxed text-[#444444]">{body}</p>
    </div>
  );
}

function Residents() {
  return (
    <section id="cicak" className="bg-[#1a1a1a] text-[#e8e8e8] relative">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 py-24 sm:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="text-[11.8px] tracking-[0.18em] text-[#999999] uppercase">Meet the Residents</p>
            <h3 className="font-display text-[42px] sm:text-[54px] tracking-[-0.018em] mt-3 text-[#f0f0f0]">Our Feline Crew</h3>
            <p className="mt-3 max-w-lg text-[15.8px] leading-relaxed text-[#b0b0b0]">All rescued. All fully socialized. Meet four of them below, though we had 12 furry friends running around the café this morning.</p>
          </div>
          <div className="text-[13.8px] text-[#a0a0a0]">
            <div>Open: M–S 9:00–20:00</div>
            <div>Entry: 1 Drink / 90 Mins</div>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {CATS.map((cat, i) => (
            <CatCard key={cat.id} cat={cat} i={i} />
          ))}
        </div>

        <div className="mt-10 text-[13.5px] text-[#909090]">
          Interested in adoption? Drop us a line at <span className="text-[#c0c0c0]">adopt@purrfectcups.hu</span>. We also provide settling-in assistance.
        </div>
      </div>
    </section>
  );
}

function CatCard({ cat, i }: { cat: typeof CATS[number]; i: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: i * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl overflow-hidden border border-white/[0.075] bg-[#1c1c1c] shadow-sm"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.img
          src={cat.img}
          alt={cat.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.055 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/85 via-[#151515]/22 to-transparent" />
        {cat.adoptable && (
          <span className="absolute top-4 left-4 text-[11px] rounded-full bg-[#e0e0e0] text-[#222222] px-3 py-1.5 font-medium shadow">
            Available for Adoption
          </span>
        )}
      </div>

      <div className="px-5 pt-4 pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="font-display text-[26px] text-[#e0e0e0]">{cat.name}</h4>
          <div className="text-[12.3px] text-[#a0a0a0]">{cat.age}</div>
        </div>
        <div className="text-[12.8px] text-[#b0b0b0] mt-0.5">{cat.breed} • {cat.trait}</div>
        <p className="mt-3 text-[14.3px] leading-relaxed text-[#909090]">{cat.bio}</p>
      </div>
    </motion.article>
  );
}

function MenuTeaser() {
  const items = [
    { name: "Mochi Flat White", price: "1 490 Ft", note: "Double ristretto, oat milk" },
    { name: "Croissant Pour Over", price: "1 650 Ft", note: "Weekly single origin, V60" },
    { name: "Sumi's Cold Brew", price: "1 590 Ft", note: "12h nitro brew, tonic option" },
    { name: "Lencse Latte", price: "1 390 Ft", note: "Dirty chai available on request" },
    { name: "Homemade Pistachio Croissant", price: "1 190 Ft", note: "Baked fresh every morning" },
    { name: "Matcha Yuzu Spritz", price: "1 650 Ft", note: "Alcohol-free refreshing pick-me-up" },
  ];
  return (
    <section id="menu" className="bg-[#f0f0f0] border-y border-[#d4d4d4]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11.8px] tracking-[0.18em] uppercase text-[#7d7d7d]">Menu</p>
            <h3 className="font-display text-[40px] sm:text-[50px] tracking-[-0.018em] text-[#2a2a2a] mt-2">Fresh at the Bar</h3>
          </div>
          <div className="text-[13.8px] text-[#444444]">Cat-free kitchen area • Plant-based milk +150 Ft</div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-x-14 gap-y-6">
          {items.map(it => (
            <div key={it.name} className="flex items-baseline gap-4 border-b border-dotted border-[#d4d4d4] pb-5">
              <div className="flex-1">
                <div className="text-[17.5px] text-[#222222]">{it.name}</div>
                <div className="text-[13.7px] text-[#555555]">{it.note}</div>
              </div>
              <div className="text-[15.5px] text-[#2a2a2a] font-medium">{it.price}</div>
            </div>
          ))}
        </div>
        <p className="mt-7 text-[13.5px] text-[#555555]">Cat-friendly treats can be purchased at the counter. Feeding the cats with your own food is strictly prohibited – thank you!</p>
      </div>
    </section>
  );
}

function BookingSection() {
  const { bookings, save } = useLocalBookings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    time: "15:00",
    guests: 2,
    zone: "main" as "main" | "quiet",
    note: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || !form.date) {
      toast.error("Please fill in your name, email, and booking date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      const booking = data.booking;
      save([booking, ...bookings].slice(0, 14));

      if (data.emailSent) {
        toast.success("Purrfect! Reservation confirmed. Check your email.", {
          description: `${form.date} • ${form.time} • ${form.zone === "main" ? "Main Lounge" : "Quiet Purr Zone"} • ${form.guests} guests`
        });
      } else {
        toast.success("Reservation saved locally.", {
          description: "Email confirmation could not be sent."
        });
      }
      setForm({ name: "", email: "", date: "", time: "15:00", guests: 2, zone: "main", note: "" });
    } catch (err: any) {
      toast.error("Booking failed", { description: err.message });
    }
    setSubmitting(false);
  };

  return (
    <section id="foglalas" className="bg-[#f5f5f5]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 py-24 sm:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-[11.8px] tracking-[0.18em] uppercase text-[#7d7d7d]">Online Booking</p>
            <h3 className="font-display text-[44px] sm:text-[56px] leading-[0.98] tracking-[-0.018em] text-[#1c1c1c] mt-4">
              Reserve Your Spot with the Cats
            </h3>
            <p className="mt-5 text-[16.7px] leading-relaxed text-[#333333]">
              Reservations are highly recommended on weekends and after 16:00. Turn slots are 90 minutes with a 1-drink minimum consumption rule. The cats might come over to hang out – or not. They decide.
            </p>

            <div className="mt-7 rounded-[20px] bg-[#ffffff] border border-[#d4d4d4] px-5 py-5 text-[14.3px] text-[#333333] shadow-sm">
              <div className="font-medium text-[#222222]">Our Zones</div>
              <ul className="mt-2 space-y-2">
                <li><b>Main Lounge</b> – Couches, natural light, cat playground. Perfect for chatting.</li>
                <li><b>Quiet Purr Zone</b> – Ages 14+, whisper-quiet. Laptops, books, and naps are fully encouraged.</li>
              </ul>
            </div>

            <div className="mt-5 text-[13.7px] text-[#555555]">
              Need to cancel? Please let us know 3 hours in advance so someone else can grab the slot!
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-[#f8f8f8] border border-[#e0e0e0] shadow-sm px-6 sm:px-9 py-8 sm:py-10"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full Name">
                  <input
                    value={form.name}
                    onChange={e => update("name",""+e.target.value)}
                    placeholder="John Doe"
                    className="field-input"
                    required
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    placeholder="john@email.com"
                    className="field-input"
                    required
                  />
                </Field>

                <Field label="Date">
                  <input
                    type="date"
                    min={todayStr}
                    value={form.date}
                    onChange={e => update("date", e.target.value)}
                    className="field-input"
                    required
                  />
                </Field>
                <Field label="Time Slot">
                  <select
                    value={form.time}
                    onChange={e => update("time", e.target.value)}
                    className="field-input"
                  >
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Guests">
                  <select
                    value={form.guests}
                    onChange={e => update("guests", parseInt(e.target.value))}
                    className="field-input"
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                  </select>
                </Field>

                <Field label="Select Zone">
                  <div className="grid grid-cols-2 gap-2 text-[13.8px]">
                    {(["main","quiet"] as const).map(z => (
                      <button
                        type="button"
                        key={z}
                        onClick={()=>update("zone", z)}
                        className={`rounded-xl border px-3 py-3 transition ${form.zone===z ? "bg-[#1a1a1a] text-[#e0e0e0] border-[#1a1a1a]" : "bg-white border-[#e0e0e0] text-[#333333] hover:bg-[#f5f5f5]"}`}
                      >
                        {z==="main" ? "Main Lounge" : "Quiet Purr"}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Special Requests (optional)">
                    <textarea
                      value={form.note}
                      onChange={e => update("note", e.target.value)}
                      placeholder="Celebrating a birthday, favorite cat preference, etc."
                      rows={3}
                      className="field-input resize-none"
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#1c1c1c] text-[#e8e8e8] px-[22px] py-3.5 text-[15px] font-medium hover:bg-[#2a2a2a] transition disabled:opacity-70"
                >
                  {submitting ? "Booking..." : "Confirm Reservation"}
                </button>
                <span className="text-[12.8px] text-[#555555]">Bookings are securely saved in your browser (localStorage).</span>
              </div>
            </form>

            {bookings.length > 0 && (
              <div className="mt-8 rounded-xl border border-[#d4d4d4] bg-[#f8f8f8] px-5 py-5">
                <div className="text-[13.7px] font-medium text-[#333333]">Your Active Bookings on This Device</div>
                <ul className="mt-3 space-y-2 text-[13.8px] text-[#333333]">
                  {bookings.slice(0, 6).map(b => (
                    <li key={b.id} className="flex flex-wrap gap-x-3 gap-y-1 border-b border-dotted border-[#d4d4d4] pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{b.date} • {b.time}</span>
                      <span>{b.guests} {b.guests === 1 ? 'guest' : 'guests'} • {b.zone==="main" ? "Main" : "Quiet"}</span>
                      <span className="text-[#666666]">— {b.name}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    save([]);
                    toast("Bookings cleared.", { description: "Local storage successfully wiped clean." });
                  }}
                  className="mt-3 text-[12.6px] underline text-[#666666] hover:text-[#555555]"
                >
                  Clear All Bookings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .field-input{
          width:100%;
          border-radius: 14px;
          background:#fff;
          border:1px solid #d4d4d4;
          padding: 12px 14px;
          font-size: 15px;
          color:#2d2d2d;
          outline:none;
          transition: box-shadow .18s, border-color .18s;
        }
        .field-input::placeholder{ color:#777777; }
        .field-input:focus{
          border-color:#999999;
          box-shadow: 0 0 0 4px rgba(200,124,71,0.16);
        }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.7px] uppercase tracking-widest text-[#777777] mb-2">{label}</div>
      {children}
    </label>
  );
}

type UserReview = {
  id: string;
  name: string;
  source: string;
  stars: number;
  text: string;
  image?: string;
  createdAt: string;
};

function Reviews() {
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/reviews`)
      .then(r => r.json())
      .then(setUserReviews)
      .catch(() => {});
  }, []);

  const allReviews: (UserReview | typeof REVIEWS[number])[] = [...userReviews, ...REVIEWS];
  const PER_PAGE = 4;
  const totalPages = Math.ceil(allReviews.length / PER_PAGE);
  const offset = page * PER_PAGE;
  const paged = allReviews.slice(offset, offset + PER_PAGE);

  return (
    <section id="velemenyek" className="bg-[#f0f0f0]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 py-24 sm:py-28">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[11.8px] tracking-[0.18em] uppercase text-[#7d7d7d]">Guest Reviews</p>
            <h3 className="font-display text-[42px] sm:text-[52px] tracking-[-0.018em] text-[#1c1c1c] mt-3">What Our Guests Say</h3>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-[#1c1c1c] text-[#e0e0e0] px-5 py-2.5 text-[13.5px] font-medium hover:bg-[#2a2a2a] transition"
          >{showForm ? "Close Form" : "Write a Review"}</button>
        </div>

        {showForm && <ReviewForm onReviewAdded={(r) => { setUserReviews(prev => [r, ...prev]); setShowForm(false); }} />}

        <div className={showForm ? "mt-6" : "mt-9"}>
          {paged.length === 0 ? (
            <p className="text-center text-[#555555] py-12">No reviews yet. Be the first to write one!</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {paged.map((r, i) => {
                const key = "id" in r ? r.id : `static-${i}`;
                const stars = r.stars;
                const text = r.text;
                const name = r.name;
                const source = r.source;
                const image = "image" in r ? r.image : undefined;
                const imgSrc = image ? (image.startsWith("http") ? image : `${API}${image}`) : undefined;
                return (
                  <div key={key} className="rounded-xl bg-[#ffffff] border border-[#e0e0e0] shadow-sm flex overflow-hidden min-h-[140px]">
                    {imgSrc ? (
                      <div className="w-[35%] shrink-0 bg-[#f0f0f0] overflow-hidden">
                        <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-[35%] shrink-0 bg-[#f0f0f0] flex items-center justify-center text-[#888888] text-[28px] select-none">[paw]</div>
                    )}
                    <div className="flex flex-col justify-between p-5 min-w-0 flex-1">
                      <div>
                        <div className="text-amber-500 text-[14px]">{"★".repeat(stars)}</div>
                        <p className="mt-1.5 text-[14.8px] leading-relaxed text-[#2a2a2a] break-words">"{text}"</p>
                      </div>
                      <div className="mt-3 text-[13px] text-[#555555] truncate">{name} · {source}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-full bg-white border border-[#d4d4d4] text-[#333333] grid place-items-center hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-full text-[14px] font-medium transition ${i === page ? "bg-[#1c1c1c] text-[#e0e0e0]" : "bg-white border border-[#d4d4d4] text-[#333333] hover:bg-[#f5f5f5]"}`}
              >{i + 1}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 rounded-full bg-white border border-[#d4d4d4] text-[#333333] grid place-items-center hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >›</button>
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewForm({ onReviewAdded }: { onReviewAdded: (r: UserReview) => void }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); setPreview(null); return; }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(f.type)) {
      toast.error("Only JPEG, PNG, WebP, GIF, or AVIF images.");
      e.target.value = "";
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      e.target.value = "";
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { toast.error("Please write a review."); return; }
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim() || "Anonymous");
      fd.append("source", source.trim() || "Guest");
      fd.append("stars", String(stars));
      fd.append("text", text.trim());
      if (file) fd.append("image", file);

      const res = await fetch(`${API}/api/reviews`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      toast.success("Review submitted!");
      onReviewAdded(data.review);
    } catch (err: any) {
      toast.error("Failed to submit review", { description: err.message });
    }
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-[#ffffff] border border-[#e0e0e0] p-6 shadow-sm">
      <div className="grid sm:grid-cols-2 gap-4">
        <ReviewField label="Your Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Anonymous" className="rev-input" />
        </ReviewField>
        <ReviewField label="From / Source">
          <input value={source} onChange={e => setSource(e.target.value)} placeholder="Budapest, Regular, etc." className="rev-input" />
        </ReviewField>
        <ReviewField label="Rating">
          <div className="flex gap-1 text-[22px]">
            {[1,2,3,4,5].map(n => (
              <button type="button" key={n}
                onMouseEnter={() => setHoverStar(n)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => setStars(n)}
                className={`transition-colors ${(hoverStar || stars) >= n ? "text-amber-500" : "text-[#d4d4d4]"}`}
              >★</button>
            ))}
          </div>
        </ReviewField>
        <ReviewField label="Photo (optional, max 2 MB)">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="rounded-xl bg-[#f0f0f0] border border-[#d4d4d4] px-4 py-2.5 text-[13.5px] text-[#333333] hover:bg-[#dbdbdb] transition">Choose File</span>
            <span className="text-[12.5px] text-[#666666]">{file ? file.name : "JPEG, PNG, WebP"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleFile} className="hidden" />
          </label>
          {preview && (
            <div className="mt-2 relative inline-block">
              <img src={preview} alt="" className="w-16 h-16 rounded-xl object-cover border border-[#e0e0e0]" />
              <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#333333] text-white text-[11px]">×</button>
            </div>
          )}
        </ReviewField>
        <div className="sm:col-span-2">
          <ReviewField label="Your Review">
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Tell us about your visit..." rows={3} className="rev-input resize-none" required />
          </ReviewField>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={sending} className="rounded-full bg-[#1c1c1c] text-[#e0e0e0] px-5 py-2.5 text-[13.5px] font-medium hover:bg-[#2a2a2a] transition disabled:opacity-60">{sending ? "Submitting..." : "Submit Review"}</button>
        <span className="text-[12px] text-[#666666]">Reviews are public. Max 5 per minute.</span>
      </div>
      <style>{`
        .rev-input{ width:100%; border-radius:14px; background:#fff; border:1px solid #d4d4d4; padding:10px 14px; font-size:14px; color:#2d2d2d; outline:none; transition:box-shadow .18s,border-color .18s; }
        .rev-input::placeholder{ color:#777777; }
        .rev-input:focus{ border-color:#999999; box-shadow:0 0 0 4px rgba(200,124,71,0.16); }
      `}</style>
    </form>
  );
}

function ReviewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] uppercase tracking-widest text-[#777777] mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function VisitBlock() {
  return (
    <section className="bg-[#f5f5f5]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 py-20">
        <div className="rounded-2xl border border-[#d4d4d4] bg-[linear-gradient(180deg,#ffffff, #f0f0f0)] px-7 sm:px-12 py-12 sm:py-16 shadow-sm grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-display text-[38px] sm:text-[46px] tracking-[-0.017em] text-[#1c1c1c] leading-[1.02]">Come for the coffee.<br/>Stay for the purrs.</div>
            <p className="mt-4 text-[16.5px] text-[#333333] max-w-md">Csikász Imre utca 2/B, Veszprém. Pannon University square is just a 4-minute walk away. No dogs allowed, unfortunately – cat tranquility comes first!</p>
          </div>
          <div className="text-[15.2px] text-[#333333] grid sm:grid-cols-2 gap-8">
            <div>
              <div className="text-[11.6px] uppercase tracking-widest text-[#777777]">Opening Hours</div>
              <div className="mt-2 space-y-1">
                <div>Mon–Fri 9:00 AM – 8:00 PM</div>
                <div>Sat–Sun 9:00 AM – 8:00 PM</div>
              </div>
            </div>
            <div>
              <div className="text-[11.6px] uppercase tracking-widest text-[#777777]">Get in Touch</div>
              <div className="mt-2 space-y-1">
                <div>hello@purrfectcups.hu</div>
                <div>@purrfectcups.bp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-[#999999] border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-10 py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#e0e0e0] text-[#1c1c1c] grid place-items-center">
              <CatPawIcon />
            </span>
            <div>
              <div className="font-display text-[20px] text-[#e0e0e0]">Purrfect Cups</div>
              <div className="text-[13px] text-[#888888]">Cat Café & Lounge — Veszprém</div>
            </div>
          </div>
          <div className="text-[13.35px] text-[#888888] leading-relaxed">
            8200 Veszprém, Csikász imre utca 2/B.<br/>
            All our residents are neutered, vaccinated, and microchipped.
          </div>
          <div className="text-[12.7px] text-[#777777]">
            © {new Date().getFullYear()} Purrfect Cups Ltd.<br/>
            Coffee + Cats = ❤
          </div>
        </div>
      </div>
    </footer>
  );
}