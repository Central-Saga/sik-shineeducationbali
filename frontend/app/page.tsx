"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: User[];
  count: number;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>("");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://shine.local.test/api";

  useEffect(() => {
    // Test API connection first
    fetch(`${apiBase}/test`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApiStatus(`✅ ${data.message} (${data.backend})`);
        }
      })
      .catch((err) => {
        setApiStatus(`❌ API connection failed: ${err.message}`);
      });

    // Fetch users
    fetch(`${apiBase}/users`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: ApiResponse) => {
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message || "Failed to fetch users");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(`Error: ${err.message}`);
        setLoading(false);
      });
  }, [apiBase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center py-8 px-4 sm:px-8 bg-white dark:bg-black">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-zinc-50">
            Shine Education Bali
          </h1>
          <p className="text-lg mb-6 text-zinc-600 dark:text-zinc-400">
            Test Connection: Backend ↔ Frontend
          </p>

          {/* API Status */}
          {apiStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              apiStatus.includes("✅") 
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
            }`}>
              <p className="font-medium">{apiStatus}</p>
              <p className="text-sm mt-1">API Base: {apiBase}</p>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Users from Backend ({loading ? "Loading..." : users.length})
            </h2>

            {loading && (
              <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                Loading users...
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-300">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && users.length === 0 && (
              <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                No users found. Run seeder: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">docker compose exec backend php artisan db:seed</code>
              </div>
            )}

            {!loading && !error && users.length > 0 && (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-black dark:text-zinc-50">
                          {user.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          {user.email}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                          ID: {user.id} • Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            <p>✅ If you see users above, backend and frontend are connected successfully!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
