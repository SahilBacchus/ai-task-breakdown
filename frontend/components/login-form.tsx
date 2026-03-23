'use client'

import { supabase } from "@/lib/supabase/client"
import { syncProfileForUser } from "@/lib/supabase/profiles"
import { ArrowRight, KeyRound, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import styles from "./login-form.module.css"

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      if (!data.user) {
        await supabase.auth.signOut()
        setErrorMsg("Sign-in succeeded, but no user was returned.")
        return
      }

      const { error: profileError } = await syncProfileForUser(data.user)

      if (profileError) {
        await supabase.auth.signOut()
        setErrorMsg(`Sign-in succeeded, but profile sync failed: ${profileError.message}`)
        return
      }

      router.push("/projects")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobLeft} />
      <div className={styles.blobBottom} />

      <section className={styles.section}>
        {/* Left — hero */}
        <div className={styles.hero}>
          <div>
            <p className={styles.heroBadge}>AI Task Breakdown</p>
            <h1 className={styles.heroTitle}>
              Welcome back.
              <br />
              Continue where you left off.
            </h1>
            <p className={styles.heroText}>
              Sign in to view your board, update priorities, and keep tasks moving.
              New here? Create an account in a minute.
            </p>
          </div>
        </div>

        {}
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Login</h2>
            <p className={styles.cardSubtitle}>Use your account credentials to sign in.</p>

            <form className={styles.form} onSubmit={handleLogin}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Email</span>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} aria-hidden="true" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={styles.input}
                    required
                  />
                </div>
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Password</span>
                <div className={styles.inputWrapper}>
                  <KeyRound className={styles.inputIcon} aria-hidden="true" />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={styles.input}
                    required
                  />
                </div>
              </label>

              <div className={styles.formRow}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="remember" className={styles.checkbox} />
                  Remember me
                </label>
                <Link href="#" className={styles.forgotLink}>Forgot password?</Link>
              </div>

              {errorMsg && <p className={styles.error}>{errorMsg}</p>}

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className={styles.btnIcon} aria-hidden="true" />
              </button>
            </form>

            <p className={styles.footerText}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={styles.footerLink}>Create account</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}