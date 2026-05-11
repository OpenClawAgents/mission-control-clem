import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function ContentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: items } = await supabase
    .from("content")
    .select("id, title, type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const typeColors: Record<string, string> = {
    newsletter: "bg-blue-500/20 text-blue-400",
    script: "bg-purple-500/20 text-purple-400",
    social_post: "bg-pink-500/20 text-pink-400",
    research: "bg-amber-500/20 text-amber-400",
    digest: "bg-emerald-500/20 text-emerald-400",
    video_clip: "bg-indigo-500/20 text-indigo-400",
    draft: "bg-gray-500/20 text-gray-400",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400",
    review: "bg-yellow-500/20 text-yellow-400",
    published: "bg-green-500/20 text-green-400",
    archived: "bg-red-500/20 text-red-400",
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
            <h1 className="text-xl font-bold text-white">Content Library</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-950 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
            <Plus className="w-4 h-4" />
            New Content
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      typeColors[item.type] || typeColors.draft
                    }`}
                  >
                    {item.type.replace("_", " ")}
                  </span>
                  <h3 className="text-white font-medium">{item.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusColors[item.status] || statusColors.draft
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No content yet</p>
            <p className="text-gray-500 text-sm">
              Newsletters, scripts, and social posts will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}