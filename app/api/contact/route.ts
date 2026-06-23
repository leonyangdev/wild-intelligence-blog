import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

function getResend() {
  const { Resend } = require("resend")
  return new Resend(process.env.RESEND_API_KEY)
}

interface ContactPayload {
  name?: string
  email?: string
  subject?: string
  message?: string
  website?: string // honeypot
  "cf-turnstile-response"?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) return true // Skip verification if not configured

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
      }
    )
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
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

    const body: ContactPayload = await request.json()
    const { name, email, subject, message, website, "cf-turnstile-response": turnstileToken } = body

    // Honeypot: silently reject bots
    if (website) {
      return NextResponse.json({
        success: true,
        message: "消息已发送，我会尽快回复你！",
      })
    }

    const ip = getClientIP(request)

    // Turnstile verification (before rate limiting so failed attempts don't count)
    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: "请完成人机验证" },
        { status: 400 }
      )
    }

    const turnstileValid = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileValid) {
      return NextResponse.json(
        { success: false, error: "人机验证失败，请重试" },
        { status: 400 }
      )
    }

    // Rate limiting (only counts after Turnstile passes)
    const rateLimit = await checkRateLimit(ip, "/api/contact")
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `请求过于频繁，请在 ${rateLimit.retryAfter} 秒后重试`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      )
    }

    // Validation
    const errors: Record<string, string> = {}
    if (!name?.trim()) errors.name = "请输入姓名"
    else if (name.trim().length > 100) errors.name = "姓名不能超过 100 个字符"
    if (!email?.trim()) errors.email = "请输入邮箱"
    else if (!validateEmail(email)) errors.email = "请输入有效的邮箱地址"
    if (!subject?.trim()) errors.subject = "请输入主题"
    else if (subject.trim().length > 200) errors.subject = "主题不能超过 200 个字符"
    if (!message?.trim()) errors.message = "请输入消息内容"
    else if (message.trim().length > 5000) errors.message = "消息内容不能超过 5000 个字符"

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "表单验证失败", errors },
        { status: 400 }
      )
    }

    const ownerEmail = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL
    if (!ownerEmail) {
      return NextResponse.json(
        { success: false, error: "邮件服务未配置" },
        { status: 500 }
      )
    }

    await getResend().emails.send({
      from: "Wild Intelligence <noreply@leonyangdev.com>",
      to: ownerEmail,
      replyTo: email!.trim(),
      subject: `[Wild Intelligence 联系] ${subject!.trim()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            新的联系消息
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 80px;">姓名</td>
              <td style="padding: 8px 0; color: #333;">${name!.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">邮箱</td>
              <td style="padding: 8px 0; color: #333;">${email!.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">主题</td>
              <td style="padding: 8px 0; color: #333;">${subject!.trim()}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
            <p style="color: #666; margin: 0 0 8px 0; font-size: 12px;">消息内容</p>
            <p style="color: #333; margin: 0; white-space: pre-wrap;">${message!.trim()}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            此邮件由 Wild Intelligence 博客联系表单自动发送
          </p>
        </div>
      `,
    })

    // Save to database
    try {
      const { prisma } = await import("@/lib/prisma")
      await prisma.contactMessage.create({
        data: {
          name: name!.trim(),
          email: email!.trim(),
          subject: subject!.trim(),
          message: message!.trim(),
        },
      })
    } catch {
      // Database not available, email already sent
    }

    return NextResponse.json({
      success: true,
      message: "消息已发送，我会尽快回复你！",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "请求处理失败，请稍后重试" },
      { status: 500 }
    )
  }
}
