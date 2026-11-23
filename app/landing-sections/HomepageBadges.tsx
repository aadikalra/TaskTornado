import { ArrowUpRight } from 'lucide-react';

const badges = [
    {
        name: 'BuiltByIndies',
        content: (
            <div
                className="[&_img]:h-[60px]"
                dangerouslySetInnerHTML={{
                    __html: '<a href="https://builtbyindies.com/products/tasktornado?utm_source=badge&utm_medium=embed&utm_campaign=live" target="_blank"><img src="https://builtbyindies.com/badge/f60292b4-3615-4fe0-9484-0a81f7d0bf9e.svg" alt="BuiltByIndies" height="60" /></a>',
                }}
            />
        ),
    },
    {
        name: 'Trustpilot',
        content: (
            <a
                href="https://www.trustpilot.com/review/tasktornado.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[60px] items-center gap-2 rounded-xl border border-[#275085]/20 bg-white px-5 text-sm text-[#275085] hover:border-[#275085] focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-[#4a9cdb]/30 dark:bg-gray-900 dark:text-sky-200 dark:hover:border-sky-200"
            >
                <span>Find us on <strong>Trustpilot</strong></span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
        ),
    },
];

export default function HomepageBadges() {
    return (
        <div className="bg-[#fffaf4] px-6 py-6 dark:bg-gray-950">
            <fieldset>
                <legend className="sr-only">Choose a TaskTornado badge</legend>
                <div className="relative flex flex-wrap justify-center gap-2 pb-[72px]">
                    {badges.map(({ name, content }, index) => (
                        <div key={name} className="group">
                            <label className="inline-flex cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-[#275085] hover:bg-[#275085]/10 has-checked:bg-[#275085] has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 dark:text-sky-200 dark:hover:bg-[#4a9cdb]/15 dark:has-checked:bg-sky-200 dark:has-checked:text-gray-950">
                                <input
                                    type="radio"
                                    name="homepage-badge"
                                    defaultChecked={index === 0}
                                    className="sr-only"
                                />
                                {name}
                            </label>
                            <div className="absolute inset-x-0 bottom-0 hidden h-[60px] items-center justify-center group-has-checked:flex">
                                {content}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
}
