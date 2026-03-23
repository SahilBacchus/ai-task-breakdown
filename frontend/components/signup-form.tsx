'use client'

import { supabase } from "@/lib/supabase/client"
import { syncProfileForUser } from "@/lib/supabase/profiles"
import { ArrowRight, KeyRound, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import styles from "./signup-form.module.css"

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [infoMsg, setInfoMsg] = useState("")

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg("")
    setInfoMsg("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
        return
      }

      if (data.user && data.session) {
        const { error: profileError } = await syncProfileForUser(data.user, name)

        if (profileError) {
          await supabase.auth.signOut()
          setErrorMsg(`Account created, but profile sync failed: ${profileError.message}`)
          return
        }

        router.push("/projects")
        router.refresh()
        return
      }

      setInfoMsg(
        "Account created. Check your email to confirm your account. Your profile will be set up when you sign in.",
      )
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
        <div className={styles.hero}>
          <div>
            <p className={styles.heroBadge}>AI Task Breakdown</p>
            <h1 className={styles.heroTitle}>
              Create your account.
              <br />
              Start organizing your work.
            </h1>
            <p className={styles.heroText}>
              Sign up to create boards, track priorities, and collaborate across tasks
              in one place.
            </p>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Create Account</h2>
            <p className={styles.cardSubtitle}>Enter your details to set up a new account.</p>

            <form className={styles.form} onSubmit={handleSignup}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Full name</span>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} aria-hidden="true" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={styles.input}
                    required
                  />
                </div>
              </label>

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
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className={styles.input}
                    required
                  />
                </div>
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Confirm password</span>
                <div className={styles.inputWrapper}>
                  <KeyRound className={styles.inputIcon} aria-hidden="true" />
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className={styles.input}
                    required
                  />
                </div>
              </label>

              <label className={styles.termsLabel}>
                <input type="checkbox" name="terms" className={styles.checkbox} required />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>

              {errorMsg && <p className={styles.error}>{errorMsg}</p>}
              {infoMsg && <p className={styles.info}>{infoMsg}</p>}

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Creating account..." : "Create account"}
                <ArrowRight className={styles.btnIcon} aria-hidden="true" />
              </button>
            </form>

            <p className={styles.footerText}>
              Already have an account?{" "}
              <Link href="/login" className={styles.footerLink}>Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}