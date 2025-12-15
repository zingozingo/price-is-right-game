export const metadata = {
  title: 'Price is Right - Spring Edition',
  description: 'Spring party game',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
