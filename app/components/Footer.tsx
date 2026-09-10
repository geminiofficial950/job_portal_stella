"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail, Share2 } from "lucide-react";
import { STELLA_CONTACT } from "@/lib/stellaContent";
import styles from "./Footer.module.css";

const columns = [
  { title: "For Job Seekers", links: [ ["Jobs", "/jobs"], ["Resume & Profile", "/profile/setup"], ["Career Support", "/#benefits"], ["Talent Network", "/#talent-network"] ] },
  { title: "For Employers", links: [ ["Hire Talent", "/employers"], ["Post a Job", "/register?role=recruiter&next=/dashboard/recruiter/jobs/new"], ["Talent Solutions", "/recruiters"], ["Employer Account", "/register?role=recruiter"] ] },
  { title: "Company", links: [ ["Our Community", "/#talent-network"], ["Learning", "/courses"], ["Events", "/events"], ["Careers", "/jobs"] ] },
  { title: "Support", links: [ ["Help Center", `mailto:${STELLA_CONTACT.email}`], ["Contact Us", `mailto:${STELLA_CONTACT.email}`], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"] ] },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Please try again in a moment.");
      setStatus("Thanks! You’re on the list.");
      setEmail("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to sign up. Please try again.");
    } finally { setBusy(false); }
  }

  function share(platform: "linkedin" | "x" | "email") {
    const url = encodeURIComponent(window.location.origin);
    if (platform === "email") {
      window.location.href = `mailto:?subject=A%20brighter%20future%20with%20Gemini%20Jobs&body=${url}`;
      return;
    }
    window.open(platform === "linkedin" ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}` : `https://twitter.com/intent/tweet?text=A%20brighter%20future%20with%20Gemini%20Jobs&url=${url}`, "_blank", "noopener,noreferrer");
  }

  return (
    <footer className={`site-footer ${styles.footer}`} data-nav-theme="dark">
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <h2>A brighter future<br /><span>starts here.</span></h2>
          <div className={styles.invitation}>
            <p>Join a community of professionals and forward-thinking employers<br className={styles.desktopBreak} /> on Gemini Jobs.</p>
            <div className={styles.actions}>
              <Link href="/profile/setup" className={styles.primary}>Get Started Free <ArrowRight size={18} /></Link>
              <Link href="/register?role=recruiter" className={styles.secondary}>I&apos;m Hiring <ArrowRight size={18} /></Link>
            </div>
          </div>
          <div className={styles.handwriting} aria-hidden="true">
            <svg viewBox="0 0 100 85" fill="none"><path d="M7 77 Q34 17 86 21 M68 10 L88 21 L75 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>People<br />Power<br />Progress</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="Gemini Jobs home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Geminijobscomblack.png" alt="Gemini Jobs" width={1200} height={413} />
            </Link>
            <p>AI for opportunity. People for progress.</p>
          </div>
          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={title} className={styles.column}>
              <h3>{title}</h3>
              <ul>{links.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul>
            </nav>
          ))}
          <div className={styles.newsletter}>
            <h3>Stay in the loop</h3>
            <p>Get career tips, product updates, and<br className={styles.desktopBreak} /> the latest opportunities.</p>
            <form onSubmit={subscribe} className={styles.form}>
              <label htmlFor="footer-email" className={styles.srOnly}>Your email address</label>
              <input id="footer-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} aria-describedby="footer-signup-status" />
              <button type="submit" disabled={busy} aria-label="Subscribe to career updates"><ArrowRight size={21} /></button>
            </form>
            <p id="footer-signup-status" className={styles.status} role="status">{busy ? "Signing you up…" : status}</p>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Gemini Jobs. All rights reserved.</p>
          <div className={styles.socials} aria-label="Share Gemini Jobs">
            <Share2 size={15} aria-hidden="true" />
            <button type="button" onClick={() => share("linkedin")} aria-label="Share Gemini Jobs on LinkedIn"><svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.89a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.86H15.8V14.1c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44v4.73H9.53V9.2h2.83v1.3h.04c.4-.75 1.36-1.54 2.79-1.54 2.98 0 3.56 1.96 3.56 4.5v5.29Z" /></svg></button>
            <button type="button" onClick={() => share("x")} aria-label="Share Gemini Jobs on X"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l5.5 6.7L18.9 2Zm-1.1 18h1.8L6.3 3.9H4.4L17.8 20Z" /></svg></button>
            <button type="button" onClick={() => share("email")} aria-label="Share Gemini Jobs by email"><Mail size={21} /></button>
          </div>
          <p>A more human future of work.</p>
        </div>
      </div>
    </footer>
  );
}
