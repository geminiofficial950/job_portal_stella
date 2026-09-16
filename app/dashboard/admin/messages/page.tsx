import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";

function formatWhen(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminMessagesPage() {
  await connectDB();
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-bold text-[#0f172a]">Contact messages</h1>
      <p className="mt-1 text-sm text-slate-500">
        Messages sent from the Contact Us form. Newest first.
      </p>

      {messages.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-12 text-center text-[#6b7a9e]">
          No messages yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {messages.map((item) => (
            <article
              key={String(item._id)}
              className="rounded-2xl border border-[#e6eaf2] bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#0f172a]">{item.name}</p>
                  <a
                    href={`mailto:${item.email}`}
                    className="text-sm text-[#2563eb] hover:underline"
                  >
                    {item.email}
                  </a>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8]">
                    {item.topic}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatWhen(item.createdAt as Date | undefined)}
                  </p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#334155]">
                {item.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
