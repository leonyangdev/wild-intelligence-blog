import { NextResponse } from "next/server"

function getResend() {
  const { Resend } = require("resend")
  return new Resend(process.env.RESEND_API_KEY)
}

interface NewsletterPayload {
  email?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "无效的请求格式" },
        { status: 415 }
      )
    }

    const body: NewsletterPayload = await request.json()
    const { email } = body

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: "请输入邮箱地址" },
        { status: 400 }
      )
    }

    if (email.length > 254) {
      return NextResponse.json(
        { success: false, error: "邮箱地址过长" },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "请输入有效的邮箱地址" },
        { status: 400 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL
    if (!fromEmail) {
      return NextResponse.json(
        { success: false, error: "邮件服务未配置" },
        { status: 500 }
      )
    }

    // Send welcome email to subscriber
    await getResend().emails.send({
      from: "Wild Intelligence <noreply@leonyangdev.com>",
      to: email.trim(),
      subject: "欢迎订阅 Wild Intelligence！",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">欢迎订阅 Wild Intelligence！</h2>
          <p style="color: #555; line-height: 1.6;">
            感谢你订阅我的技术博客。我会定期分享关于前端开发、AI 全栈、LLM 和 RAG 的最新见解和实战经验。
          </p>
          <div style="margin: 24px 0; padding: 16px; background: #f9f9f9; border-radius: 8px;">
            <p style="color: #333; margin: 0; font-weight: 500;">你可以在这里阅读最新文章：</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"}/blog" style="color: #0070f3; text-decoration: none;">
              ${process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"}/blog
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            如果你不希望收到邮件，可以忽略此邮件。
          </p>
        </div>
      `,
    })

    // Notify owner about new subscriber
    const ownerEmail = process.env.CONTACT_EMAIL || fromEmail
    await getResend().emails.send({
      from: "Wild Intelligence <noreply@leonyangdev.com>",
      to: ownerEmail,
      subject: "[Wild Intelligence 订阅] 新的邮件订阅者",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">新的邮件订阅</h2>
          <p style="color: #555;">
            有一个新的用户订阅了你的博客邮件通知：
          </p>
          <div style="padding: 12px 16px; background: #f0f7ff; border-radius: 8px; margin: 16px 0;">
            <p style="color: #333; margin: 0;">📧 ${email.trim()}</p>
          </div>
        </div>
      `,
    })

    // Save subscriber to database
    try {
      const { prisma } = await import("@/lib/prisma")
      await prisma.subscriber.upsert({
        where: { email: email.trim() },
        update: { active: true },
        create: { email: email.trim() },
      })
    } catch {
      // Database not available, emails already sent
    }

    return NextResponse.json({
      success: true,
      message: "订阅成功！感谢你的关注。",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "请求处理失败，请稍后重试" },
      { status: 500 }
    )
  }
}
