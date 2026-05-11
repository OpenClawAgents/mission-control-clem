import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function VideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, file_path, duration_seconds, tags, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

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
            <h1 className="text-xl font-bold text-white">Video Catalog</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-950 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors"
              >
                <div className="w-full h-32 bg-gray-800 rounded-lg mb-3 flex items-center justify-center text-gray-600 text-sm">
                  {video.duration_seconds
                    ? `${Math.floor(video.duration_seconds / 60)}:${String(
                        video.duration_seconds % 60
                      ).padStart(2, "0")}`
                    : "—"}
                </div>
                <h3 className="text-white font-medium mb-2">{video.title}</h3>
                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No videos yet</p>
            <p className="text-gray-500 text-sm">
              Tagged clips from raw footage will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}