export const metadata = {
  title: 'Price is Right - Holiday Edition',
  description: 'Holiday party game',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
