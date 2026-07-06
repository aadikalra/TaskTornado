'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import { HugeIcon } from '@/lib/huge-icon-map';

export default function CSVImportTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="CSV Import for Flashcards"
            category="Features"
            description="Import flashcard decks from spreadsheets instantly. Learn how to format your CSV, TSV, or TXT files for a perfect import."
        >
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <p className="text-xl leading-[1.6] text-sky-700/80 dark:text-sky-300/80 mb-8 font-serif italic text-center px-8 border-l-4 border-sky-500">
                    &quot;Already have your flashcards in a spreadsheet? Import them in seconds.&quot;
                </p>

                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    The CSV Import feature lets you upload flashcard data from <b>Google Sheets</b>, <b>Excel</b>, <b>Quizlet exports</b>, or any plain text file. TaskTornado automatically detects headers, delimiters, and quoted fields — so you can focus on studying, not formatting.
                </p>

                {/* ── Supported Formats ────────────────── */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">Supported File Formats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <h4 className="font-bold text-sky-800 dark:text-sky-200 mb-2">.csv</h4>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">Comma-separated values. The most common format — works with Excel, Google Sheets, Numbers.</p>
                    </div>
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <h4 className="font-bold text-sky-800 dark:text-sky-200 mb-2">.tsv</h4>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">Tab-separated values. Great for Quizlet exports and data copied from spreadsheets.</p>
                    </div>
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <h4 className="font-bold text-sky-800 dark:text-sky-200 mb-2">.txt</h4>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">Plain text with comma, tab, or semicolon separators. TaskTornado auto-detects the delimiter.</p>
                    </div>
                </div>

                {/* ── How to Format ────────────────── */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">How to Format Your File</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    Your file needs <b>two columns</b>: the first for the <b>question</b> (front of the card), and the second for the <b>answer</b> (back of the card). A header row is optional — TaskTornado will automatically detect and skip it.
                </p>

                {/* Basic Example */}
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mt-8 mb-3">Basic CSV Example</h3>
                <div className="rounded-2xl overflow-hidden border border-sky-200/40 dark:border-sky-800/30 mb-8">
                    <div className="bg-sky-50/60 dark:bg-zinc-800 px-4 py-2 text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-sky-200/40 dark:border-sky-800/30">
                        biology_chapter5.csv
                    </div>
                    <pre className="bg-[#f5f9fc] dark:bg-zinc-900 p-5 text-sm text-sky-900 dark:text-sky-100 overflow-x-auto font-mono leading-relaxed">
                        {`Question,Answer
What is the powerhouse of the cell?,Mitochondria
What is DNA?,Deoxyribonucleic acid
What process converts sunlight to energy?,Photosynthesis
What is the basic unit of life?,The cell`}
                    </pre>
                </div>

                {/* Without Headers */}
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mt-8 mb-3">Without Headers</h3>
                <p className="text-base leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-4">
                    You don&apos;t need a header row. TaskTornado will treat the first row as data if it doesn&apos;t match known header names.
                </p>
                <div className="rounded-2xl overflow-hidden border border-sky-200/40 dark:border-sky-800/30 mb-8">
                    <div className="bg-sky-50/60 dark:bg-zinc-800 px-4 py-2 text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-sky-200/40 dark:border-sky-800/30">
                        vocab.csv
                    </div>
                    <pre className="bg-[#f5f9fc] dark:bg-zinc-900 p-5 text-sm text-sky-900 dark:text-sky-100 overflow-x-auto font-mono leading-relaxed">
                        {`Ephemeral,Lasting for a very short time
Ubiquitous,Present everywhere
Pragmatic,Dealing with things practically`}
                    </pre>
                </div>

                {/* Tab-separated */}
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mt-8 mb-3">Tab-Separated (TSV / Quizlet Export)</h3>
                <p className="text-base leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-4">
                    When you export from <b>Quizlet</b> or copy from a spreadsheet, the data is often tab-separated. That works too!
                </p>
                <div className="rounded-2xl overflow-hidden border border-sky-200/40 dark:border-sky-800/30 mb-8">
                    <div className="bg-sky-50/60 dark:bg-zinc-800 px-4 py-2 text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-sky-200/40 dark:border-sky-800/30">
                        quizlet_export.tsv
                    </div>
                    <pre className="bg-[#f5f9fc] dark:bg-zinc-900 p-5 text-sm text-sky-900 dark:text-sky-100 overflow-x-auto font-mono leading-relaxed">
                        {`Term\tDefinition
Photosynthesis\tProcess by which plants convert light energy
Mitosis\tCell division producing two identical cells
Osmosis\tMovement of water across a membrane`}
                    </pre>
                </div>

                {/* Commas in Answers */}
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mt-8 mb-3">Handling Commas in Answers</h3>
                <p className="text-base leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-4">
                    If your question or answer contains commas, wrap that field in <b>double quotes</b>. This is standard CSV formatting and works automatically in Excel and Google Sheets.
                </p>
                <div className="rounded-2xl overflow-hidden border border-sky-200/40 dark:border-sky-800/30 mb-8">
                    <div className="bg-sky-50/60 dark:bg-zinc-800 px-4 py-2 text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider border-b border-sky-200/40 dark:border-sky-800/30">
                        history.csv
                    </div>
                    <pre className="bg-[#f5f9fc] dark:bg-zinc-900 p-5 text-sm text-sky-900 dark:text-sky-100 overflow-x-auto font-mono leading-relaxed">
                        {`Question,Answer
"Who was the first US president?",George Washington
"What year did WW2 end?","1945, in September"
"Name three Renaissance artists","Leonardo, Michelangelo, Raphael"`}
                    </pre>
                </div>

                {/* ── Recognized Headers ────────────────── */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">Recognized Header Names</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    If your first row matches any of these header pairs, it will be automatically skipped:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                    {[
                        ['Question', 'Answer'],
                        ['Front', 'Back'],
                        ['Term', 'Definition'],
                        ['Q', 'A'],
                        ['Prompt', 'Response'],
                    ].map(([col1, col2]) => (
                        <div key={col1} className="flex items-center gap-2 p-3 rounded-xl bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                            <HugeIcon name="CheckmarkCircle02" className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium text-sky-800 dark:text-sky-200">
                                {col1} / {col2}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Step by Step ────────────────── */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">Step-by-Step Import Guide</h2>
                <div className="space-y-6 mb-12">
                    {[
                        {
                            step: 1,
                            title: 'Prepare your spreadsheet',
                            desc: 'Open Google Sheets or Excel. Put questions in column A and answers in column B. Optionally add a header row.',
                        },
                        {
                            step: 2,
                            title: 'Export as CSV',
                            desc: 'In Google Sheets: File → Download → Comma-separated values (.csv). In Excel: File → Save As → CSV UTF-8.',
                        },
                        {
                            step: 3,
                            title: 'Click Create → Import CSV',
                            desc: 'On the Flashcards page, click the green Create button and select "Import CSV" from the dropdown.',
                        },
                        {
                            step: 4,
                            title: 'Select your file',
                            desc: 'Pick your .csv, .tsv, or .txt file. TaskTornado will parse it and show you a preview of all cards.',
                        },
                        {
                            step: 5,
                            title: 'Review and save',
                            desc: 'Edit the deck title, review each card, add or remove cards if needed, then click "Save Deck" to save.',
                        },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4">
                            <div className="mt-0.5 w-8 h-8 bg-sky-100 dark:bg-sky-500/10 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{item.step}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sky-800 dark:text-sky-200">{item.title}</h4>
                                <p className="text-sky-800/60 dark:text-sky-300/60 text-sm mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Common Issues ────────────────── */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">Troubleshooting</h2>
                <div className="space-y-4 mb-8">
                    {[
                        {
                            issue: '"No valid cards found"',
                            fix: 'Your file needs at least 2 columns per row. Make sure questions and answers are separated by commas, tabs, or semicolons.',
                        },
                        {
                            issue: 'Answers are getting cut off at commas',
                            fix: 'Wrap fields containing commas in double quotes: "answer with, a comma"',
                        },
                        {
                            issue: 'Header row is being imported as a card',
                            fix: 'Use recognized header names like "Question" and "Answer". See the full list above.',
                        },
                        {
                            issue: 'Special characters look wrong',
                            fix: 'Save your file as UTF-8 encoded CSV. In Excel: File → Save As → CSV UTF-8.',
                        },
                    ].map((item, i) => (
                        <div key={i} className="p-5 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                            <div className="flex items-start gap-3">
                                <HugeIcon name="AlertCircle" className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm mb-1">{item.issue}</h4>
                                    <p className="text-sm text-sky-700/70 dark:text-sky-300/70">{item.fix}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Pro Tips ────────────────── */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-4">Pro Tips</h2>
                <ul className="space-y-3 mb-8">
                    {[
                        'The deck title is automatically generated from the filename — rename your file before importing for a cleaner title.',
                        'You can edit any imported card before saving. The import opens a review screen, not a blind import.',
                        'Extra columns beyond the first two are ignored — feel free to have notes in column C.',
                        'Empty rows are automatically skipped, so don\'t worry about blank lines in your file.',
                        'Quizlet\'s "Export" feature creates a tab-separated format that works perfectly with this importer.',
                    ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sky-800/70 dark:text-sky-300/70">
                            <HugeIcon name="CheckmarkCircle02" className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{tip}</span>
                        </li>
                    ))}
                </ul>

                {/* ── Test Your File ────────────────── */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-sky-800 dark:text-sky-200 mb-6">Test Your File</h2>
                    <p className="text-lg text-sky-800/70 dark:text-sky-300/70 mb-8 font-medium">
                        Drop your CSV, TSV, or TXT file below to check if it&apos;s valid for flashcard import — no data is uploaded anywhere.
                    </p>
                    <FileValidator />
                </div>

            </motion.section>
        </TutorialArticleTemplate>
    );
}

// ─── File Validator ───────────────────────────────────────
interface ValidationResult {
    valid: boolean;
    fileName: string;
    fileSize: string;
    delimiter: string;
    headerDetected: boolean;
    headerRow: string[] | null;
    totalRows: number;
    validCards: number;
    skippedRows: number;
    cards: { question: string; answer: string }[];
    warnings: string[];
}

function FileValidator() {
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const detectDelimiter = (text: string): string => {
        const firstLine = text.split(/\r?\n/)[0] || '';
        if (firstLine.includes('\t')) return 'Tab (TSV)';
        if (firstLine.includes(';')) return 'Semicolon';
        return 'Comma (CSV)';
    };

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const validateFile = useCallback((file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !['csv', 'tsv', 'txt'].includes(ext)) {
            setResult({
                valid: false,
                fileName: file.name,
                fileSize: formatSize(file.size),
                delimiter: 'N/A',
                headerDetected: false,
                headerRow: null,
                totalRows: 0,
                validCards: 0,
                skippedRows: 0,
                cards: [],
                warnings: [`Unsupported file type ".${ext}". Please use .csv, .tsv, or .txt files.`],
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const warnings: string[] = [];

            if (!text?.trim()) {
                setResult({
                    valid: false, fileName: file.name, fileSize: formatSize(file.size),
                    delimiter: 'N/A', headerDetected: false, headerRow: null,
                    totalRows: 0, validCards: 0, skippedRows: 0, cards: [], warnings: ['File is empty.'],
                });
                return;
            }

            const delimiter = detectDelimiter(text);
            const lines = text.split(/\r?\n/).filter(l => l.trim());

            if (lines.length === 0) {
                setResult({
                    valid: false, fileName: file.name, fileSize: formatSize(file.size),
                    delimiter, headerDetected: false, headerRow: null,
                    totalRows: 0, validCards: 0, skippedRows: 0, cards: [], warnings: ['No data found in file.'],
                });
                return;
            }

            const firstLine = parseCSVLine(lines[0]);
            const isHeader = firstLine.length >= 2 &&
                firstLine.slice(0, 2).every(cell =>
                    /^(question|answer|front|back|term|definition|q|a|prompt|response)$/i.test(cell)
                );

            if (firstLine.length < 2) {
                warnings.push('First row has fewer than 2 columns — the delimiter might not be detected correctly.');
            }

            const dataLines = isHeader ? lines.slice(1) : lines;
            const cards: { question: string; answer: string }[] = [];
            let skippedRows = 0;

            for (const line of dataLines) {
                const cols = parseCSVLine(line);
                if (cols.length >= 2 && cols[0] && cols[1]) {
                    cards.push({ question: cols[0], answer: cols[1] });
                } else {
                    skippedRows++;
                }
            }

            if (skippedRows > 0) {
                warnings.push(`${skippedRows} row${skippedRows > 1 ? 's' : ''} skipped (missing question or answer).`);
            }

            if (cards.length === 0) {
                warnings.push('No valid flashcard pairs found. Each row needs at least 2 non-empty columns.');
            }

            if (firstLine.length > 2) {
                warnings.push(`Extra columns detected (${firstLine.length} total). Only the first 2 columns are used.`);
            }

            setResult({
                valid: cards.length > 0,
                fileName: file.name,
                fileSize: formatSize(file.size),
                delimiter,
                headerDetected: isHeader,
                headerRow: isHeader ? firstLine.slice(0, 2) : null,
                totalRows: lines.length,
                validCards: cards.length,
                skippedRows,
                cards: cards.slice(0, 5),
                warnings,
            });
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) validateFile(file);
    }, [validateFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateFile(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-6 text-sm [&_p]:text-sm [&_h3]:text-base [&_h2]:text-base [&_span]:text-inherit [&_td]:text-sm [&_th]:text-[10px]">
            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                    relative cursor-pointer rounded-[24px] border-2 border-dashed transition-all duration-300
                    flex flex-col items-center justify-center py-14 px-6 text-center
                    ${dragging
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-500/10 scale-[1.01]'
                        : 'border-sky-200/60 dark:border-sky-800/40 bg-[#f5f9fc] dark:bg-zinc-800/50 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10'
                    }
                `}
            >
                <div className={`p-4 rounded-2xl mb-4 transition-colors ${dragging ? 'bg-sky-100 dark:bg-sky-500/20' : 'bg-sky-100/60 dark:bg-sky-500/10'}`}>
                    <HugeIcon name="FileUp" className={`w-7 h-7 ${dragging ? 'text-sky-600 dark:text-sky-400' : 'text-sky-500/60'}`} />
                </div>
                <span className="block font-semibold text-sky-800 dark:text-sky-200 mb-1" style={{ fontSize: '14px' }}>
                    {dragging ? 'Drop it here!' : 'Drag & drop your file here'}
                </span>
                <span className="block text-sky-600/50 dark:text-sky-400/50" style={{ fontSize: '12px' }}>
                    or click to browse — accepts .csv, .tsv, .txt
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`rounded-[24px] border overflow-hidden ${result.valid
                            ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-900/10'
                            : 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-900/10'
                            }`}
                    >
                        {/* Status Banner */}
                        <div className={`px-6 py-4 flex items-center gap-3 ${result.valid
                            ? 'bg-emerald-100/60 dark:bg-emerald-500/10'
                            : 'bg-red-100/60 dark:bg-red-500/10'
                            }`}>
                            {result.valid ? (
                                <HugeIcon name="CheckmarkCircle02" className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                                <HugeIcon name="CancelCircle" className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
                            )}
                            <div>
                                <span className={`block font-bold ${result.valid ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`} style={{ fontSize: '16px' }}>
                                    {result.valid ? 'This file is ready for import!' : 'This file won\'t work as-is'}
                                </span>
                                <span className={`block ${result.valid ? 'text-emerald-700/70 dark:text-emerald-300/70' : 'text-red-700/70 dark:text-red-300/70'}`} style={{ fontSize: '14px' }}>
                                    {result.valid
                                        ? `${result.validCards} flashcard${result.validCards !== 1 ? 's' : ''} detected and ready to import.`
                                        : 'Check the details below for what needs to be fixed.'}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-5">
                            {/* File Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'File', value: result.fileName },
                                    { label: 'Size', value: result.fileSize },
                                    { label: 'Delimiter', value: result.delimiter },
                                    { label: 'Total Rows', value: String(result.totalRows) },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-sky-100/60 dark:border-gray-700/40">
                                        <span className="block font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider mb-0.5" style={{ fontSize: '10px' }}>{item.label}</span>
                                        <span className="block font-semibold text-sky-900 dark:text-white truncate" style={{ fontSize: '14px' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Detection Info */}
                            <div className="flex flex-wrap gap-2.5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${result.headerDetected
                                    ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                    }`}>
                                    {result.headerDetected ? <HugeIcon name="CheckmarkCircle02" className="w-3 h-3" /> : <HugeIcon name="FileEmpty02" className="w-3 h-3" />}
                                    {result.headerDetected ? `Header detected: ${result.headerRow?.join(' / ')}` : 'No header row detected'}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${result.validCards > 0
                                    ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300'
                                    }`}>
                                    <HugeIcon name="Star" className="w-3 h-3" />
                                    {result.validCards} valid card{result.validCards !== 1 ? 's' : ''}
                                </span>
                                {result.skippedRows > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                        <HugeIcon name="AlertCircle" className="w-3 h-3" />
                                        {result.skippedRows} skipped
                                    </span>
                                )}
                            </div>

                            {/* Card Preview Table */}
                            {result.cards.length > 0 && (
                                <div>
                                    <span className="block font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-widest mb-2 px-1" style={{ fontSize: '10px' }}>
                                        Preview (first {result.cards.length} card{result.cards.length !== 1 ? 's' : ''})
                                    </span>
                                    <div className="rounded-2xl overflow-hidden border border-sky-100/60 dark:border-gray-700/40">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-sky-50/60 dark:bg-gray-800/60">
                                                    <th className="text-left px-4 py-2.5 font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider w-[10%]" style={{ fontSize: '10px' }}>#</th>
                                                    <th className="text-left px-4 py-2.5 font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider w-[45%]" style={{ fontSize: '10px' }}>Question</th>
                                                    <th className="text-left px-4 py-2.5 font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider w-[45%]" style={{ fontSize: '10px' }}>Answer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.cards.map((card, i) => (
                                                    <tr key={i} className="border-t border-sky-100/40 dark:border-gray-700/30">
                                                        <td className="px-4 py-2.5 text-sky-500/50 font-mono" style={{ fontSize: '12px' }}>{i + 1}</td>
                                                        <td className="px-4 py-2.5 text-sky-900 dark:text-sky-100 truncate max-w-[200px]" style={{ fontSize: '14px' }}>{card.question}</td>
                                                        <td className="px-4 py-2.5 text-sky-900 dark:text-sky-100 truncate max-w-[200px]" style={{ fontSize: '14px' }}>{card.answer}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {result.validCards > 5 && (
                                            <div className="px-4 py-2 bg-sky-50/40 dark:bg-gray-800/30 text-sky-600/50 dark:text-sky-400/50 text-center" style={{ fontSize: '12px' }}>
                                                and {result.validCards - 5} more card{result.validCards - 5 !== 1 ? 's' : ''}…
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Warnings */}
                            {result.warnings.length > 0 && (
                                <div className="space-y-2">
                                    {result.warnings.map((warning, i) => (
                                        <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/40 dark:border-amber-700/20">
                                            <HugeIcon name="AlertCircle" className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                            <span className="block text-amber-800 dark:text-amber-200" style={{ fontSize: '14px' }}>{warning}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Try Again */}
                            <button
                                onClick={() => { setResult(null); inputRef.current?.click(); }}
                                className="w-full h-11 rounded-full flex items-center justify-center gap-2 font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/50 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/40 dark:border-[#d4e88e]/15 transition-colors"
                                style={{ fontSize: '13px' }}
                            >
                                <HugeIcon name="FileUp" className="w-4 h-4" />
                                Test Another File
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
