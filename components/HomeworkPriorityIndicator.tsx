import { HugeIcon } from '@/lib/huge-icon-map';

export const getPriorityIndicator = (priority: 'high' | 'medium' | 'low', withBackground = true) => {
  switch (priority) {
    case 'high':
      return (
        <span className={withBackground ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/15" : "flex shrink-0 items-center justify-center size-4"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`${withBackground ? "size-3" : "block size-4"} text-red-500 dark:text-red-400`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <path d="M12 22C16.4183 22 20 18.4183 20 14C20 8 12 2 12 2C11.6117 4.48692 11.2315 5.82158 10 8C8.79908 7.4449 8.5 7 8 5.75C6 8 4 11 4 14C4 18.4183 7.58172 22 12 22Z" />
            <path d="M12 18C13.6569 18 15 16.6569 15 15C15 13.5 13.5 12 12 11C10.5 12 9 13.5 9 15C9 16.6569 10.3431 18 12 18Z" />
          </svg>
        </span>
      );
    case 'medium':
      return (
        <span className={withBackground ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/12" : "flex shrink-0 items-center justify-center size-4"}>
          <HugeIcon name="AlertCircle" size={withBackground ? 12 : 16} className={`${withBackground ? "size-3" : "block size-4"} text-orange-500 dark:text-orange-400`} />
        </span>
      );
    case 'low':
    default:
      return (
        <span className={withBackground ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/10" : "flex shrink-0 items-center justify-center size-4"}>
          <HugeIcon name="MinusSignCircle" size={withBackground ? 12 : 16} className={`${withBackground ? "size-3" : "block size-4"} text-green-500/60 dark:text-green-400/50`} />
        </span>
      );
  }
};

