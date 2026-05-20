"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminLogin } from "../../lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif-display text-2xl text-gray-900">
            NutriVerde
          </Link>
          <p className="mt-2 text-xs uppercase tracking-wider text-brand-700">
            Panel de administración
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Correo
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 text-center text-xs text-gray-500 hover:text-gray-700 block"
        >
          ← Volver al sitio público
        </Link>
      </div>
    </main>
  );
}
