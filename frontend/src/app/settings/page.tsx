"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
}

interface ApiToken {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/api/auth/github?returnTo=/settings");
          return;
        }
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/");
      });

    // Fetch API tokens
    fetch("/api/settings/tokens")
      .then((res) => res.json())
      .then((data) => {
        if (data.tokens) {
          setTokens(data.tokens);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this token?")) return;

    try {
      const response = await fetch(`/api/settings/tokens/${tokenId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTokens(tokens.filter((t) => t.id !== tokenId));
      }
    } catch {
      alert("Failed to revoke token");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navigation />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-16 h-16 rounded-xl"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.displayName || user.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
              {user.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Profile information is synced from GitHub and cannot be edited here.
          </p>
        </section>

        {/* API Tokens Section */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            API Tokens
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tokens are created when you run{" "}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              token-tracker login
            </code>{" "}
            from the CLI.
          </p>

          {tokens.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <p>No API tokens yet.</p>
              <p className="text-sm mt-2">
                Run{" "}
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  token-tracker login
                </code>{" "}
                to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {token.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created {new Date(token.createdAt).toLocaleDateString()}
                      {token.lastUsedAt && (
                        <> - Last used {new Date(token.lastUsedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeToken(token.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Deleting your account will remove all your submissions and cannot be undone.
          </p>
          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                )
              ) {
                // TODO: Implement account deletion
                alert("Account deletion is not yet implemented.");
              }
            }}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
