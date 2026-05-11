import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const handleEmailSignIn = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/dashboard");
  };

  const handleGitHubSignIn = async () => {
    "use server";
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://mission-control-clem.vercel.app"}/auth/callback`,
      },
    });
    if (error) {
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    redirect(data.url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="mb-6 text-5xl">🎬</div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400 mb-8">Sign in to Mission Control</p>

        {params.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {decodeURIComponent(params.error)}
          </div>
        )}
        {params.message && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {decodeURIComponent(params.message)}
          </div>
        )}

        <form action={handleEmailSignIn} className="space-y-4 mb-6">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign In with Email
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-950 text-gray-500">or</span>
          </div>
        </div>

        <form action={handleGitHubSignIn}>
          <button
            type="submit"
            className="w-full px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}