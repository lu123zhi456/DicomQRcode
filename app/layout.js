import "./globals.css"

export const metadata = {
  title: "社区医院DICOM查看",
  description: "上传zip生成二维码，患者扫码查看影像"
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
