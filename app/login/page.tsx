import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        {user ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              로그인됨
            </p>
            <p className="font-medium text-black dark:text-zinc-50">
              {user.email ?? user.id}
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
