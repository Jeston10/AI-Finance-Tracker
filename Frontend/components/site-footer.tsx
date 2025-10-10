import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2024 Finance Tracker. All rights reserved.
        </p>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="flex space-x-4">
            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Image src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="Facebook" width={20} height={20} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Image src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="Twitter" width={20} height={20} />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Image src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" alt="Instagram" width={20} height={20} />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Image src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" width={20} height={20} />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Image src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" alt="Email" width={20} height={20} className="text-muted-foreground" />
            <Link
              href="mailto:contact@finance-tracker.com"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              contact@finance-tracker.com
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
