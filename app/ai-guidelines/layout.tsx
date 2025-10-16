import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Assistant Guidelines',
  description: 'Learn how to use the AI Assistant effectively for your studies',
};

export default function AIGuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
