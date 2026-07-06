import { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
    title: 'Blog | The TaskTornado Journal',
    description: 'Insights into the future of education, AI integration in classrooms, and building the ultimate student organization platform.',
    keywords: ['TaskTornado blog', 'AI in education', 'student productivity insights', 'educational engineering', 'edtech startups'],
    openGraph: {
        title: 'The TaskTornado Journal | Education Reimagined',
        description: 'Insights into the future of education and AI integration.',
        type: 'website',
        url: 'https://tasktornado.com/blog',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TaskTornado Blog',
        description: 'Insights into the future of education and AI integration.',
    }
};

export default function BlogPage() {
    return <BlogClient />;
}
