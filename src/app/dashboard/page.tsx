import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Video,
  Newspaper,
  LogOut,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get counts
  const { count: contentCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true });
  const { count: videoCount } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true });
  const { count: digestCount } = await supabase
    .from("digests")
    .select("*", { count: "exact", head: true });

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <h1 className="text-xl font-bold text-white">Mission Control</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {profile?.full_name || user.email}
          </span>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/dashboard/content"
            className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors group"
          >
            <FileText className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
              Content Library
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              {contentCount ?? 0}
            </p>
            <p className="text-sm text-gray-400">
              Newsletters, scripts, social posts
            </p>
          </Link>

          <Link
            href="/dashboard/videos"
            className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors group"
          >
            <Video className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
              Video Catalog
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              {videoCount ?? 0}
            </p>
            <p className="text-sm text-gray-400">Raw footage & clips</p>
          </Link>

          <Link
            href="/dashboard/digests"
            className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors group"
          >
            <Newspaper className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              Digests
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              {digestCount ?? 0}
            </p>
            <p className="text-sm text-gray-400">
              Psychedelic law & church updates
            </p>
          </Link>
        </div>

        {/* Recent activity placeholder */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <p className="text-gray-400 text-sm">
            Content and digests will appear here as you add them.
          </p>
        </div>
      </main>
    </div>
  );
}