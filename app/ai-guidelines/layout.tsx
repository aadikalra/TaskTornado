import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aurora Guidelines',
  description: 'Learn how to use the Aurora effectively for your studies',
};

export default function AIGuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
