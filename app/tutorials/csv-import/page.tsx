import { Metadata } from 'next';
import CSVImportClient from './CSVImportClient';

export const metadata: Metadata = {
    title: 'CSV Import for Flashcards | TaskTornado',
    description: 'Learn how to format and import CSV files to create flashcard decks in TaskTornado. Supports CSV, TSV, and TXT files with automatic header detection.',
    keywords: ['csv import', 'flashcards', 'import flashcards', 'TaskTornado', 'study tools', 'spreadsheet import'],
    openGraph: {
        title: 'CSV Import for Flashcards | TaskTornado',
        description: 'Format your CSV correctly and import flashcard decks instantly.',
        type: 'article',
        url: 'https://tasktornado.com/tutorials/csv-import',
    }
};

export default function Page() {
    return <CSVImportClient />;
}
