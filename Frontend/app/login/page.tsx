import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm type="login" />
      </div>
    </div>
  )
}
