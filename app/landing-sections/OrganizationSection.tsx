import Image from 'next/image';

type FeatureCard = {
    title: string;
    desc: string;
    image?: string;
};

type OrganizationSectionProps = {
    id?: string;
    content?: {
        heading: string;
        cards: FeatureCard[];
    };
};

const homepageCards: FeatureCard[] = [
    {
        title: 'Smart Calendar',
        desc: 'Syncs assignments across all your classes automatically, so you never miss a deadline.',
        image: '/calendarCard.png',
    },
    {
        title: 'AI Study Assistant',
        desc: 'Get instant study help, practice quizzes, and detailed breakdowns of complex topics.',
        image: '/aiCard.png',
    },
    {
        title: 'Progress Tracking',
        desc: 'Visualize your academic growth with deep insights into your grades and completion rates.',
        image: '/progressCard.png',
    },
];

export default function OrganizationSection({ id = 'organization', content }: OrganizationSectionProps) {
    const cards = content?.cards ?? homepageCards;

    return (
        <section id={id} className="py-12 md:py-20 bg-[#FCFDF5] dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="bg-[#F1F6D1] dark:bg-zinc-900 rounded-[40px] md:rounded-[64px] p-8 md:p-16">
                    <div className={`text-center mb-12 md:mb-16 md:px-16 ${content ? '' : 'px-8'}`}>
                        {!content && (
                            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                                Organization
                            </span>
                        )}
                        <h2 className={`text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] max-w-3xl mx-auto ${content ? 'text-balance' : ''}`}>
                            {content?.heading ?? 'Your entire school life, centralized.'}
                        </h2>
                    </div>

                    <div className={`grid grid-cols-1 gap-8 max-w-6xl mx-auto ${content ? 'lg:grid-cols-3' : 'md:grid-cols-3'}`}>
                        {cards.map((card) => (
                            <div
                                key={card.title}
                                className={`bg-[#fff8fa] dark:bg-zinc-800 rounded-[32px] p-8 md:p-10 flex flex-col shadow-sm border border-[#275085]/5 dark:border-zinc-700 h-full hover:shadow-md transition-shadow ${content ? 'text-left' : 'items-center text-center'}`}
                            >
                                {card.image && (
                                    <div className="h-44 flex items-center justify-center mb-8 w-full">
                                        <Image
                                            src={card.image}
                                            alt=""
                                            width={220}
                                            height={176}
                                            sizes="220px"
                                            className="w-auto h-auto max-w-full max-h-full object-contain dark:opacity-90"
                                        />
                                    </div>
                                )}
                                <h3 className="text-xl md:text-2xl font-bold text-[#275085] dark:text-[#7ec0f2] mb-4 leading-tight">
                                    {card.title}
                                </h3>
                                <p className="text-base text-[#275085]/85 dark:text-[#b4dbf9] leading-relaxed">
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
