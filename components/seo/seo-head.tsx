/**
 * SEO 头部组件
 * 用于管理页面的 meta 标签
 */

interface SeoHeadProps {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description: string
  /** 页面关键词 */
  keywords?: string[]
  /** 页面 URL */
  url?: string
  /** 页面图片 */
  image?: string
  /** 页面类型 */
  type?: "website" | "article" | "profile"
  /** 发布时间 */
  publishedTime?: string
  /** 修改时间 */
  modifiedTime?: string
  /** 作者 */
  author?: string
  /** 网站名称 */
  siteName?: string
  /** 语言 */
  locale?: string
}

/**
 * SEO 头部组件
 * 生成页面的 meta 标签
 */
export function SeoHead({
  title,
  description,
  keywords = [],
  url,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  siteName = "TechPulse",
  locale = "zh_CN",
}: SeoHeadProps) {
  const fullTitle = `${title} | ${siteName}`

  return (
    <>
      {/* 基础 meta 标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {author && <meta name="author" content={author} />}

      {/* Open Graph 标签 */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter 标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* 文章特定标签 */}
      {type === "article" && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* 规范链接 */}
      {url && <link rel="canonical" href={url} />}
    </>
  )
}

/**
 * 文章 SEO 组件
 * 用于文章页面的 SEO 优化
 */
export function ArticleSeo({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
  keywords = [],
}: {
  title: string
  description: string
  url: string
  image?: string
  publishedTime: string
  modifiedTime?: string
  author: string
  keywords?: string[]
}) {
  return (
    <SeoHead
      title={title}
      description={description}
      url={url}
      image={image}
      type="article"
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      author={author}
      keywords={keywords}
    />
  )
}

/**
 * 首页 SEO 组件
 * 用于首页的 SEO 优化
 */
export function HomeSeo() {
  return (
    <SeoHead
      title="首页"
      description="一个优雅精致的技术博客，分享 Web 开发、前端工程化和用户体验设计的最新见解和实践经验。"
      keywords={["技术博客", "Web 开发", "前端开发", "Next.js", "React", "TypeScript"]}
      url="https://www.leonyangdev.com"
    />
  )
}

/**
 * 博客列表 SEO 组件
 * 用于博客列表页面的 SEO 优化
 */
export function BlogListSeo() {
  return (
    <SeoHead
      title="博客文章"
      description="探索最新的技术见解、实战经验和学习心得"
      keywords={["技术文章", "编程教程", "Web 开发", "前端开发"]}
      url="https://www.leonyangdev.com/blog"
    />
  )
}

/**
 * 关于我 SEO 组件
 * 用于关于我页面的 SEO 优化
 */
export function AboutSeo() {
  return (
    <SeoHead
      title="关于我"
      description="了解我的技术背景、工作经历和兴趣爱好"
      keywords={["关于我", "技术背景", "工作经历", "前端工程师"]}
      url="https://www.leonyangdev.com/about"
    />
  )
}

/**
 * 联系我 SEO 组件
 * 用于联系我页面的 SEO 优化
 */
export function ContactSeo() {
  return (
    <SeoHead
      title="联系我"
      description="如果你有任何问题或合作意向，欢迎随时联系我"
      keywords={["联系我", "合作", "咨询", "前端开发"]}
      url="https://www.leonyangdev.com/contact"
    />
  )
}