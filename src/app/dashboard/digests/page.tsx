import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function DigestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: digests } = await supabase
    .from("digests")
    .select("id, title, date, category, summary, source_name, is_sent")
    .order("date", { ascending: false })
    .limit(50);

  const categoryColors: Record<string, string> = {
    psychedelic_law: "bg-emerald-500/20 text-emerald-400",
    church: "bg-violet-500/20 text-violet-400",
    dea: "bg-red-500/20 text-red-400",
    state_reform: "bg-amber-500/20 text-amber-400",
    other: "bg-gray-500/20 text-gray-400",
  };

  const categoryLabels: Record<string, string> = {
    psychedelic_law: "Psychedelic Law",
    church: "Church",
    dea: "DEA",
    state_reform: "State Reform",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">Digests</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-950 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
            <Plus className="w-4 h-4" />
            New Digest
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {digests && digests.length > 0 ? (
          <div className="space-y-3">
            {digests.map((digest) => (
              <div
                key={digest.id}
                className="p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        categoryColors[digest.category] || categoryColors.other
                      }`}
                    >
                      {categoryLabels[digest.category] || digest.category}
                    </span>
                    <h3 className="text-white font-medium">{digest.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(digest.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-2">
                  {digest.summary}
                </p>
                {digest.source_name && (
                  <p className="text-xs text-gray-500">
                    Source: {digest.source_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No digests yet</p>
            <p className="text-gray-500 text-sm">
              Psychedelic law & church updates will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}