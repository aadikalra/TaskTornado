import { Metadata } from 'next';
import ChangelogClient from './ChangelogClient';

export const metadata: Metadata = {
    title: 'Changelog | TaskTornado',
    description: 'Product updates, improvements, and version history for TaskTornado.',
};

// Revalidate every 5 minutes — cached on the server, not fetched on every request
export const revalidate = 300;

async function getChangelogData() {
    try {
        const response = await fetch('https://api.npoint.io/9eb23a1980287e881d97', {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) return [];

        const data = await response.json();
        if (!data.versions || !Array.isArray(data.versions)) return [];

        return data.versions;
    } catch (error) {
        console.error('Error prefetching changelog data:', error);
        return [];
    }
}

export default async function ChangelogPage() {
    const versions = await getChangelogData();

    return <ChangelogClient initialVersions={versions} />;
}
