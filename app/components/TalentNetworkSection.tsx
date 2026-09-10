"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Building2, Network, Pause, Play, Shapes } from "lucide-react";
import styles from "./TalentNetworkSection.module.css";

const members = [
  { label: "Designers", x: 22, y: 24, size: 10, tone: "#eea6e9", clip: "collaboration", portrait: "09-trust-avatar-01.png" },
  { label: "Engineers", x: 59, y: 15, size: 10, tone: "#9be6fa", clip: "engineering", portrait: "09-trust-avatar-04.png" },
  { label: "Product", x: 89, y: 21, size: 9, tone: "#f4c7ca", clip: "team", portrait: "09-trust-avatar-05.png" },
  { label: "Engineers", x: 12, y: 62, size: 12, tone: "#81deef", clip: "engineering", portrait: "09-trust-avatar-02.png" },
  { label: "Data Scientists", x: 77, y: 41, size: 11, tone: "#d99adf", clip: "engineering", portrait: "09-trust-avatar-05.png" },
  { label: "Creators", x: 61, y: 62, size: 11, tone: "#e4b1e8", clip: "collaboration", portrait: "09-trust-avatar-03.png" },
  { label: "Marketers", x: 41, y: 84, size: 9, tone: "#f0bb99", clip: "team", portrait: "09-trust-avatar-01.png" },
];
const stats = [
  { value: "50K+", label: "Skilled professionals", Icon: Network },
  { value: "2K+", label: "Companies hiring", Icon: Building2 },
  { value: "100+", label: "Skills and specialties", Icon: Shapes },
];

export default function TalentNetworkSection() {
  const section = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => element.querySelectorAll("video").forEach((video) => {
      if (paused || motion.matches || !visible || document.hidden) video.pause();
      else void video.play().catch(() => { /* Poster remains if autoplay is unavailable. */ });
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  const video = (clip: string, poster: string) => (
    <video autoPlay muted loop playsInline preload="none" poster={poster} aria-hidden="true" tabIndex={-1}>
      <source src={`/videos/talent-network/${clip}.mp4`} type="video/mp4" />
    </video>
  );

  return (
    <section id="talent-network" ref={section} data-nav-theme="dark" className={`talent-network-section ${styles.section}`} aria-labelledby="talent-network-heading">
      <div className={styles.shell}>
        <div className={styles.copy}>
          <h2 id="talent-network-heading">A talent network<br />that goes further.</h2>
          <p>Join a curated community of skilled professionals solving real problems. Get discovered by innovative companies, collaborate on projects, and be part of what&apos;s next.</p>
          <Link href="/profile/setup" className={styles.cta}>Join the Talent Network <ArrowRight size={19} /></Link>
        </div>

        <div className={styles.network} role="group" aria-label="A connected community of designers, engineers, creators and marketers">
          <svg className={styles.lines} viewBox="0 0 1000 460" fill="none" aria-hidden="true">
            <defs>
              <radialGradient id="talent-line-glow"><stop stopColor="#48aaff" stopOpacity=".9" /><stop offset="1" stopColor="#225bda" stopOpacity=".12" /></radialGradient>
              <filter id="talent-star-glow"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            <g stroke="url(#talent-line-glow)" strokeWidth="1.5">
              <ellipse cx="485" cy="235" rx="470" ry="167" transform="rotate(-15 485 235)" />
              <ellipse cx="485" cy="235" rx="437" ry="131" transform="rotate(13 485 235)" />
              <ellipse cx="490" cy="228" rx="355" ry="202" transform="rotate(-21 490 228)" />
              <path d="M80 285 Q330 340 890 95 M220 110 Q510 50 770 189 M120 285 Q440 100 610 285 M410 386 Q470 205 590 69 M220 110 Q490 360 770 189 M40 350 Q360 420 945 260" />
              {members.map((member) => <path key={member.label + member.x} d={`M410 216 Q${member.x * 8} 210 ${member.x * 10} ${member.y * 4.6}`} />)}
            </g>
            {[[76, 160], [173, 392], [494, 65], [690, 90], [825, 335], [350, 331], [929, 218]].map(([cx, cy]) => (
              <g key={cx}><circle cx={cx} cy={cy} r="7" fill="#318fff" filter="url(#talent-star-glow)" /><circle cx={cx} cy={cy} r="2" fill="#bcdeff" /></g>
            ))}
          </svg>
          <div className={styles.hub}>{video("collaboration", "/talent-hub-portrait.png")}</div>
          {members.map((member) => (
            <div key={member.label + member.x} className={styles.member} style={{ left: `${member.x}%`, top: `${member.y}%`, width: `${member.size}%`, "--rim": member.tone } as CSSProperties}>
              <div className={styles.frame}>{video(member.clip, `/assets/${member.portrait}`)}</div>
              <span className={styles.label}>{member.label}</span>
            </div>
          ))}
          <span className={styles.productLabel}>Product</span>
          <span className={styles.marketerLabel}>Marketers</span>
          <div className={styles.orb}>A stronger<br />tomorrow<br />— together.</div>
          <button type="button" className={styles.playback} onClick={() => setPaused(!paused)} aria-label={paused ? "Play network videos" : "Pause network videos"} aria-pressed={paused}>
            {paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? "Play videos" : "Pause videos"}</span>
          </button>
        </div>

        <aside className={styles.card} aria-label="Our talent network in numbers">
          <ul>{stats.map(({ value, label, Icon }) => <li key={label}><span className={styles.icon}><Icon size={24} strokeWidth={1.8} /></span><div><strong>{value}</strong><span className={styles.statLabel}>{label}</span></div></li>)}</ul>
          <div className={styles.community}>
            <div className={styles.avatars}>{[1, 3, 5].map((number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={number} src={`/assets/09-trust-avatar-0${number}.png`} alt="" width={36} height={36} />
            ))}</div>
            <p>A global community<br />of problem solvers</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
