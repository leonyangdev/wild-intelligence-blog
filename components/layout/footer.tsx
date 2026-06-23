import Link from "next/link"
import { Globe, Mail, Rss, ArrowUpRight } from "lucide-react"
import { githubProfile } from "@/lib/data"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navSections = [
    {
      title: "内容",
      links: [
        { href: "/blog", label: "博客文章" },
        { href: "/projects", label: "项目展示" },
        { href: "/search", label: "搜索" },
      ],
    },
    {
      title: "关于",
      links: [
        { href: "/about", label: "关于我" },
        { href: "/contact", label: "联系方式" },
        { href: "/rss.xml", label: "RSS 订阅" },
      ],
    },
  ]

  const socialLinks = [
    {
      href: githubProfile.githubUrl,
      label: "GitHub",
    },
    {
      href: githubProfile.twitterUrl,
      label: "Twitter",
    },
  ]

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <span className="text-heading-16 text-foreground">
                TechPulse
              </span>
            </Link>
            <p className="text-copy-14 text-muted-foreground max-w-xs leading-relaxed mb-4">
              {githubProfile.bio}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-label-13 text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {social.label}
                  <ArrowUpRight className="size-3" />
                </Link>
              ))}
              <Link
                href="/rss.xml"
                className="flex items-center gap-1.5 text-label-13 text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <Rss className="size-3.5" />
                RSS
              </Link>
            </div>
          </div>

          {/* Nav columns */}
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-label-14 text-foreground mb-3">
                {section.title}
              </h3>
              <nav className="space-y-2">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-copy-14 text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-label-12 text-muted-foreground">
            &copy; {currentYear} {githubProfile.name}. All rights reserved.
          </p>
          <p className="text-label-12 text-muted-foreground">
            Built with{" "}
            <Link
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Next.js
            </Link>{" "}
            &{" "}
            <Link
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              shadcn/ui
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
