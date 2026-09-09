'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { HugeIcon } from '@/lib/huge-icon-map';
import {
  parseGoogleClassroomAssignment,
  type ParsedGoogleClassroomAssignment,
} from '@/lib/google-classroom-import';

export interface ClassroomImportApplicationResult {
  populatedFields: string[];
  matchedClassName?: string;
}

interface GoogleClassroomImportProps {
  onImport: (assignment: ParsedGoogleClassroomAssignment) => ClassroomImportApplicationResult;
}

export const GoogleClassroomImport = ({ onImport }: GoogleClassroomImportProps) => {
  const [rawText, setRawText] = useState('');
  const [clipboardHtml, setClipboardHtml] = useState('');
  const [parsedAssignment, setParsedAssignment] = useState<ParsedGoogleClassroomAssignment>();
  const [applicationResult, setApplicationResult] = useState<ClassroomImportApplicationResult>();
  const [parseError, setParseError] = useState('');

  const importAssignment = useCallback((plainText: string, html: string) => {
    const parsed = parseGoogleClassroomAssignment(plainText, html, new Date());
    if (!parsed.recognized) {
      setParsedAssignment(undefined);
      setApplicationResult(undefined);
      setParseError('No assignment details were confidently detected. Make sure you copied the individual assignment page, then try again.');
      return;
    }

    setParseError('');
    setParsedAssignment(parsed);
    setApplicationResult(onImport(parsed));
  }, [onImport]);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const plainText = event.clipboardData.getData('text/plain') || event.clipboardData.getData('text');
    if (!plainText.trim()) return;

    // Clipboard HTML is retained only long enough to extract safe http(s) links.
    // It is never inserted into the DOM or rendered back to the user.
    const html = event.clipboardData.getData('text/html');
    event.preventDefault();
    setRawText(plainText);
    setClipboardHtml(html);
    importAssignment(plainText, html);
  };

  const detectedDetails = useMemo(() => {
    if (!parsedAssignment) return [];
    const details: string[] = [];
    if (parsedAssignment.teacher) details.push(`Teacher: ${parsedAssignment.teacher}`);
    if (parsedAssignment.course) {
      details.push(`Class: ${parsedAssignment.course}${parsedAssignment.section ? ` · ${parsedAssignment.section}` : ''}`);
    } else if (parsedAssignment.section) {
      details.push(`Section: ${parsedAssignment.section}`);
    }
    if (parsedAssignment.points !== undefined) details.push(`${parsedAssignment.points} points`);
    if (parsedAssignment.status) details.push(parsedAssignment.status);
    if (parsedAssignment.attachments.length > 0) {
      details.push(`${parsedAssignment.attachments.length} attachment${parsedAssignment.attachments.length === 1 ? '' : 's'}`);
    }
    return details;
  }, [parsedAssignment]);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="h-9 w-9 rounded-xl bg-[#ebf6b5]/70 dark:bg-[#ebf6b5]/10 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
          <HugeIcon name="School01" size={18} className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-sky-900 dark:text-white">Import from Google Classroom</h3>
          <p className="mt-0.5 text-xs leading-5 text-sky-600/70 dark:text-sky-400/70">
            Copy an assignment page and we’ll fill in the homework details. No Google sign-in needed.
          </p>
        </div>
      </div>

      <div className="p-3 bg-sky-50/40 dark:bg-gray-800/35 border border-sky-100 dark:border-gray-700 rounded-2xl space-y-3">
        <ol className="text-[11px] leading-5 text-sky-700/75 dark:text-sky-300/75 list-decimal pl-4">
          <li>Open the individual assignment in Google Classroom.</li>
          <li>Press <kbd className="font-semibold">Cmd+A</kbd>, then <kbd className="font-semibold">Cmd+C</kbd>.</li>
          <li>Paste the copied page below.</li>
        </ol>

        <textarea
          value={rawText}
          onPaste={handlePaste}
          onChange={(event) => {
            setRawText(event.target.value);
            setClipboardHtml('');
            setParsedAssignment(undefined);
            setApplicationResult(undefined);
            setParseError('');
          }}
          aria-label="Google Classroom assignment page content"
          placeholder="Paste the copied Classroom page here..."
          rows={4}
          className="w-full px-3 py-2.5 bg-white/70 dark:bg-gray-800/60 border border-sky-100 dark:border-gray-700 rounded-xl text-xs leading-relaxed text-sky-800 dark:text-sky-100 placeholder:text-sky-300 dark:placeholder:text-sky-600 focus:outline-none focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] resize-none"
        />

        <button
          type="button"
          onClick={() => importAssignment(rawText, clipboardHtml)}
          disabled={!rawText.trim()}
          className="w-full h-9 inline-flex items-center justify-center gap-2 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/70 dark:bg-[#ebf6b5]/15 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <HugeIcon name="ClipboardPaste" size={14} className="h-3.5 w-3.5" />
          Detect assignment
        </button>

        <div aria-live="polite">
          {parseError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 rounded-xl">
              <HugeIcon name="AlertCircle" size={13} className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-4 text-red-700 dark:text-red-300">{parseError}</p>
            </div>
          )}

          {parsedAssignment && applicationResult && (
            <div className="px-3 py-2.5 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl space-y-1.5">
              <div className="flex items-start gap-2">
                <HugeIcon name="CheckmarkCircle02" size={13} className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-4 font-semibold text-emerald-800 dark:text-emerald-200">
                  {applicationResult.populatedFields.length > 0
                    ? `Filled ${applicationResult.populatedFields.join(', ')}. Review the fields below before saving.`
                    : 'Assignment details detected. Review and complete the fields below.'}
                </p>
              </div>
              {detectedDetails.length > 0 && (
                <p className="pl-5 text-[10px] leading-4 text-emerald-700/75 dark:text-emerald-300/75">
                  {detectedDetails.join(' · ')}
                </p>
              )}
              {parsedAssignment.course && !applicationResult.matchedClassName && (
                <p className="pl-5 text-[10px] leading-4 text-amber-700 dark:text-amber-300">
                  “{parsedAssignment.course}” did not match an existing TaskTornado class. Choose the class manually below.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
