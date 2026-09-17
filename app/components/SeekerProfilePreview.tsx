"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { Pencil, MapPin, Mail, Phone, BriefcaseBusiness, GraduationCap, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { ProfileState } from "./SeekerProfileForm";
import styles from "./SeekerProfilePreview.module.css";

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      if (expanded) return;
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  if (!text) return null;

  const showToggle = overflows || expanded;

  return (
    <div>
      <p ref={ref} className={`${styles.description} ${!expanded ? styles.clamped : ""}`}>
        {text}
      </p>
      {showToggle && (
        <button
          className={styles.textButton}
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function SeekerProfilePreview({ profile, name, email, phone, initials, onEdit }: { profile: ProfileState; name: string; email: string; phone: string; initials: string; onEdit: (step: number) => void }) {
  const [allSkills, setAllSkills] = useState(false);
  function editButton(step: number, label: string) {
    return <button type="button" className={styles.iconButton} title={`Edit ${label}`} aria-label={`Edit ${label}`} onClick={() => onEdit(step)}><Pencil size={14} /></button>;
  }
  return <div className={styles.preview}>
    <header className={styles.identity}>
      <div className={styles.avatar}>{profile.photoUrl ? <Image unoptimized src={profile.photoUrl} width={72} height={72} alt={`${name} profile`} /> : initials}</div>
      <div className={styles.identityText}>
        <div className={styles.nameRow}><h1>{name || "Your profile"}</h1>{profile.openToWork && <span className={styles.available}><CheckCircle2 size={12} />Open to work</span>}</div>
        <p className={styles.headline}>{profile.headline || "Headline not added"}</p>
        <div className={styles.contacts}>
          {profile.location && <span><MapPin size={13} />{profile.location}</span>}
          {email && <a href={`mailto:${email}`}><Mail size={13} />{email}</a>}
          {phone && <a href={`tel:${phone}`}><Phone size={13} />{phone}</a>}
        </div>
      </div>
      <button type="button" className={styles.editButton} onClick={() => onEdit(0)}><Pencil size={14} />Edit profile</button>
    </header>
    <div className={styles.columns}>
      <div className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}><h2>About</h2>{editButton(3, "about")}</div>
          {profile.about ? <Description text={profile.about} /> : <p className={styles.empty}>No summary added.</p>}
        </section>
        {(["experiences", "educations"] as const).map((kind) => {
          const work = kind === "experiences";
          const entries = profile[kind];
          const Icon = work ? BriefcaseBusiness : GraduationCap;
          return <section className={styles.section} key={kind}>
            <div className={styles.sectionHeading}><h2>{work ? "Experience" : "Education"}<span className={styles.count}>{entries.length}</span></h2>{editButton(work ? 1 : 2, kind)}</div>
            {!entries.length && <p className={styles.empty}>No {work ? "experience" : "education"} added.</p>}
            {entries.map((entry, index) => <article className={styles.entry} key={index}>
              <span className={styles.entryIcon}><Icon size={17} /></span>
              <div className={styles.entryBody}><h3>{("title" in entry ? entry.title : entry.degree) || ("company" in entry ? entry.company : entry.institution)}</h3>
                {("title" in entry ? entry.title : entry.degree) && <p className={styles.organization}>{"company" in entry ? entry.company : entry.institution}</p>}
                {"level" in entry && (entry.level || entry.yearCompleted) ? (
                  <p className={styles.organization}>{[entry.level, entry.yearCompleted].filter(Boolean).join(" · ")}</p>
                ) : null}
                <Description text={entry.description} />
                {entry.skills.length > 0 && <div className={styles.skills}>{entry.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
              </div>
            </article>)}
          </section>;
        })}
      </div>
      <aside className={styles.aside}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}><h2>Skills<span className={styles.count}>{profile.skills.length}</span></h2>{editButton(3, "skills")}</div>
          <div className={styles.skills}>{(allSkills ? profile.skills : profile.skills.slice(0, 8)).map((skill) => <span key={skill}>{skill}</span>)}</div>
          {!profile.skills.length && <p className={styles.empty}>No skills added.</p>}
          {profile.skills.length > 8 && <button type="button" className={styles.textButton} aria-expanded={allSkills} onClick={() => setAllSkills(!allSkills)}>{allSkills ? "Show less" : `+${profile.skills.length - 8} more skills`}</button>}
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}><h2>Job preferences</h2>{editButton(4, "preferences")}</div>
          <dl className={styles.facts}>
            <div><dt>Level</dt><dd>{profile.experienceLevel || "Not specified"}</dd></div>
            <div><dt>Employment</dt><dd>{profile.preferredEmploymentTypes.join(", ") || "Not specified"}</dd></div>
            <div><dt>Work mode</dt><dd>{profile.preferredWorkModes.join(", ") || "Not specified"}</dd></div>
          </dl>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}><h2>Resume & links</h2>{editButton(4, "links")}</div>
          <div className={styles.links}>{[["Resume", profile.resumeUrl], ["LinkedIn", profile.linkedin], ["Portfolio", profile.portfolio]].filter(([, url]) => url).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={15} /></a>)}</div>
          {!profile.resumeUrl && !profile.linkedin && !profile.portfolio && <p className={styles.empty}>No links added.</p>}
        </section>
      </aside>
    </div>
  </div>;
}
