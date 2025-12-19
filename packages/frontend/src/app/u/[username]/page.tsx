import type { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} - Token Usage | Tokscale`,
    description: `View ${username}'s AI token usage statistics and cost breakdown on Tokscale`,
    openGraph: {
      title: `@${username}'s Token Usage | Tokscale`,
      description: `AI token usage statistics for ${username} on Tokscale`,
      type: 'profile',
      url: `https://tokscale.ai/u/${username}`,
      siteName: 'Tokscale',
      images: [
        {
          url: 'https://tokscale.ai/og-image.png',
          width: 1200,
          height: 630,
          alt: `${username}'s Token Usage on Tokscale`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `@${username}'s Token Usage | Tokscale`,
      images: ['https://tokscale.ai/og-image.png'],
    },
  };
}

export default function ProfilePage() {
  return <ProfilePageClient />;
}
