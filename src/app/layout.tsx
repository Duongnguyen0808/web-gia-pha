import './globals.css';

export const metadata = {
  title: 'Gia Phả Dòng Họ | Phong Cách Huế',
  description: 'Trang web gia phả dòng họ, lưu giữ truyền thống gia đình.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
