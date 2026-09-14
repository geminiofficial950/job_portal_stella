import SeekerThemeToggle from "@/app/components/SeekerTheme";
import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { Application } from "@/models/Application";
import { SavedJob } from "@/models/SavedJob";
import styles from "./seeker.module.css";
import {
  Search, FileText, Bookmark, CalendarCheck, UserRound, ArrowRight,
  ArrowUpRight, Briefcase, CheckCircle2, Circle, Heart, Target,
} from "lucide-react";

function profileCompletion(profile: {
  headline?: string | null;
  location?: string | null;
  about?: string | null;
  skills?: string[] | null;
  experienceLevel?: string | null;
  education?: string | null;
  resumeUrl?: string | null;
} | null) {
  const checks = [
    { label: "Headline", done: Boolean(profile?.headline?.trim()) },
    { label: "Location", done: Boolean(profile?.location?.trim()) },
    { label: "About you", done: Boolean(profile?.about?.trim()) },
    { label: "Skills", done: Boolean(profile?.skills?.length) },
    { label: "Experience level", done: Boolean(profile?.experienceLevel) },
    { label: "Education", done: Boolean(profile?.education?.trim()) },
    { label: "Resume link", done: Boolean(profile?.resumeUrl?.trim()) },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);
  return { checks, doneCount, percent };
}

export default async function SeekerOverviewPage() {
  const auth = await requireAuth(["user"]);

  await connectDB();
  const [user, openJobs, applicationCount, savedCount] = await Promise.all([
    User.findById(auth.sub).select("seekerProfile phone").lean(),
    Job.countDocuments({ status: "open" }),
    Application.countDocuments({ seekerId: auth.sub }),
    SavedJob.countDocuments({ seekerId: auth.sub }),
  ]);

  const { checks, doneCount, percent } = profileCompletion(
    user?.seekerProfile || null,
  );

  const stats = [
    {
      label: "Open Roles",
      value: openJobs,
      icon: Briefcase,
      href: "/jobs",
      actionIcon: Search,
      action: "Browse",
    },
    {
      label: "Applications",
      value: applicationCount,
      icon: FileText,
      href: "/dashboard/seeker/applications",
      actionIcon: FileText,
      action: "Track",
    },
    {
      label: "Saved Jobs",
      value: savedCount,
      icon: Bookmark,
      href: "/dashboard/seeker/saved",
      actionIcon: Heart,
      action: "Saved",
    },
    {
      label: "Interviews",
      value: 0,
      icon: CalendarCheck,
      href: "/dashboard/seeker/interviews",
      actionIcon: CalendarCheck,
      action: "Upcoming",
    },
  ];

  const shortcuts = [
    {
      title: "Suggested Jobs",
      copy: "See roles matched to your profile skills.",
      href: "/dashboard/seeker/suggested",
      icon: Search,
    },
    {
      title: "Complete Your Profile",
      copy: "Add skills, experience, and a resume link.",
      href: "/dashboard/seeker/profile",
      icon: UserRound,
    },
    {
      title: "Track Applications",
      copy: "Follow every role you apply to.",
      href: "/dashboard/seeker/applications",
      icon: FileText,
    },
  ];

  return (
    <main className={styles.overview}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>Workspace <span>/</span> <strong>Overview</strong></div>
        <div className={styles.headerActions}><SeekerThemeToggle /><Link href="/dashboard/seeker/profile" className={styles.account} aria-label="View your profile">
          <span className={styles.avatar}>{auth.name.trim().charAt(0).toUpperCase()}</span>
          <span>{auth.name}<small>Personal workspace</small></span>
          <ArrowUpRight size={16} />
        </Link></div>
      </header>

      <section className={styles.welcome}>
        <div><p className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>Hey, {auth.name.split(" ")[0]}</h1>
          <p>Big ambitions. Better opportunities. Let’s make your next move.</p>
        </div>
        <Link href="/dashboard/seeker/suggested" className={styles.primaryButton}><Search size={17} /> Find your next role <ArrowUpRight size={17} /></Link>
      </section>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>A LITTLE MOMENTUM GOES A LONG WAY</span>
          <h2>Your next big opportunity.<br /><span>Make it happen.</span></h2>
          <p>Discover roles that fit your skills, build a standout profile,<br className="hidden sm:block" /> and take the next step in your career.</p>
          <Link href="/dashboard/seeker/suggested" className={styles.heroButton}>Explore suggested jobs <ArrowRight size={17} /></Link>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.orbit} /><div className={styles.orbitInner} />
          <div className={styles.floatingLabel}><span /> Your future looks bright</div>
          <div className={styles.artCard}><span className={styles.artIcon}><Briefcase size={32} /></span><span className={styles.artLine} /><span className={styles.artLineShort} /><div className={styles.artTags}><i /><i /></div></div>
          <div className={styles.artCheck}><CheckCircle2 size={25} /></div>
        </div>
      </section>

      <div className={styles.sectionHeading}><h2>Your career at a glance</h2><span>Every step counts</span></div>
      <section className={styles.stats} aria-label="Career statistics">
        {stats.map((stat, index) => { const Icon = stat.icon; return (
          <Link key={stat.label} href={stat.href} className={styles.stat} data-tone={index}>
            <div className={styles.statTop}><span className={styles.statIcon}><Icon size={20} /></span><ArrowUpRight size={18} /></div>
            <strong className={styles.statValue}>{stat.value.toLocaleString()}</strong>
            <div className={styles.statBottom}><span>{stat.label}</span><small>{stat.action} <ArrowRight size={12} /></small></div>
          </Link>
        ); })}
      </section>

      <div className={styles.middleGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><p className={styles.eyebrow}>PUT YOUR BEST SELF FORWARD</p><h2>Profile readiness</h2></div><Link href="/dashboard/seeker/profile" className={styles.textLink}>Edit profile <ArrowUpRight size={15} /></Link></div>
          <div className={styles.progressSummary}>
            <div className={styles.progressRing} style={{ background: `conic-gradient(var(--seeker-progress, #55c9e0) ${percent}%, var(--seeker-progress-track, #253854) 0)` }}><span>{percent}<small>%</small></span></div>
            <div><h3>{percent === 100 ? "Looking good. You’re all set!" : "A stronger profile opens doors."}</h3><p>{doneCount} of {checks.length} sections completed</p><span className={styles.progressHint}><Target size={13} /> Help recruiters get to know you</span></div>
          </div>
          <ul className={styles.checklist}>{checks.map(item => <li key={item.label} data-done={item.done}>{item.done ? <CheckCircle2 size={16} /> : <Circle size={16} />} {item.label}<span>{item.done ? "Done" : "To do"}</span></li>)}</ul>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><p className={styles.eyebrow}>KEEP MOVING FORWARD</p><h2>Your next moves</h2></div></div>
          <ul className={styles.shortcuts}>{shortcuts.map((item, index) => { const Icon = item.icon; return <li key={item.href}><Link href={item.href}><span className={styles.shortcutIcon} data-tone={index}><Icon size={20} /></span><span><strong>{item.title}</strong><small>{item.copy}</small></span><ArrowUpRight size={18} /></Link></li>; })}</ul>
          <div className={styles.note}><p>Small steps today.<br /><strong>Big possibilities tomorrow.</strong></p></div>
        </section>
      </div>

      <section className={styles.gettingStarted}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>A SIMPLE PATH FORWARD</p><h2>From getting started to getting hired</h2></div><span className={styles.guideTag}>YOUR CAREER GUIDE</span></div>
        <div className={styles.steps}>{[
          { step: "01", title: "Build your profile", copy: "Add your skills, education, and links so recruiters can get to know you." },
          { step: "02", title: "Find your fit", copy: "Explore jobs by title, skill, or location. Save the ones that feel right." },
          { step: "03", title: "Make your move", copy: "Apply with confidence and keep track of applications and interviews here." },
        ].map(item => <div className={styles.step} key={item.step}><span>{item.step}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></div>)}</div>
      </section>
      <footer className={styles.pageFooter}><span>Your ambition. Your journey.</span><span>Made for your next move</span></footer>
    </main>
  );
}
