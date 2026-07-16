import json

log_path = "/Users/aadikalra/.gemini/antigravity-ide/brain/55776a82-ca09-4b61-9c0c-c74ad82cade1/.system_generated/logs/transcript_full.jsonl"
navbar_path = "/Users/aadikalra/Desktop/Coding/Personal Projects/SchoolOrganizer/school-organizer/school-organizer/components/AppNavbar.tsx"

# 1. Read clean git HEAD lines
with open(navbar_path, 'r') as f:
    clean_lines = f.readlines()

# 2. Collect all lines from view_file logs BEFORE step 415
file_lines = {}
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        step = data.get("step_index")
        if step is not None and step < 415:
            content = data.get("content") or ""
            if "File Path: " in content and "AppNavbar.tsx" in content:
                for l in content.split("\n"):
                    if ":" in l:
                        parts = l.split(":", 1)
                        try:
                            line_num = int(parts[0].strip())
                            line_val = parts[1]
                            if line_val.startswith(" "):
                                line_val = line_val[1:]
                            file_lines[line_num] = line_val
                        except ValueError:
                            pass

# 3. Reconstruct original 928-line file
orig_lines = []
for i in range(1, 929):
    if i in file_lines:
        orig_lines.append(file_lines[i] + "\n")
    else:
        orig_lines.append(clean_lines[i - 1])

orig_content = "".join(orig_lines)

# 4. Load Step 294 replacement chunks from transcript
step_294_chunks = []
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get("step_index") == 294 and data.get("type") == "PLANNER_RESPONSE":
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                if tc.get("name") == "multi_replace_file_content":
                    args = tc.get("args")
                    chunks = args.get("ReplacementChunks")
                    if isinstance(chunks, str):
                        step_294_chunks = json.loads(chunks)
                    else:
                        step_294_chunks = chunks

print(f"Applying Step 294 containing {len(step_294_chunks)} chunks...")
for idx, chunk in enumerate(step_294_chunks):
    target = chunk["TargetContent"]
    replacement = chunk["ReplacementContent"]
    count = orig_content.count(target)
    if count == 0:
        print(f"  Warning: Step 294 Chunk {idx} target not found!")
    else:
        orig_content = orig_content.replace(target, replacement)
        print(f"  Successfully applied Step 294 Chunk {idx}")

# 5. Load Step 433 replacement chunk
step_433_chunks = []
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get("step_index") == 433 and data.get("type") == "PLANNER_RESPONSE":
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                if tc.get("name") == "replace_file_content":
                    args = tc.get("args")
                    step_433_chunks.append({
                        "TargetContent": args.get("TargetContent"),
                        "ReplacementContent": args.get("ReplacementContent")
                    })

print(f"Applying Step 433 containing {len(step_433_chunks)} chunks...")
for idx, chunk in enumerate(step_433_chunks):
    target = chunk["TargetContent"]
    replacement = chunk["ReplacementContent"]
    count = orig_content.count(target)
    if count == 0:
        print(f"  Warning: Step 433 Chunk {idx} target not found!")
    else:
        orig_content = orig_content.replace(target, replacement)
        print(f"  Successfully applied Step 433 Chunk {idx}")

# 6. Apply the Flashcards size revert replacements (back to normal size)
desktop_tablet_large = """                                                            {tool.label === 'Flashcards' ? (
                                                                <Image 
                                                                    src="/AIFlashcards.png" 
                                                                    alt="AI Flashcards" 
                                                                    width={24} 
                                                                    height={24} 
                                                                    className="w-6 h-6 object-contain"
                                                                    unoptimized
                                                                />
                                                            ) : ("""

desktop_tablet_normal = """                                                            {tool.label === 'Flashcards' ? (
                                                                <Image 
                                                                    src="/AIFlashcards.png" 
                                                                    alt="AI Flashcards" 
                                                                    width={16} 
                                                                    height={16} 
                                                                    className="w-4 h-4 object-contain"
                                                                    unoptimized
                                                                />
                                                            ) : ("""

mobile_large = """                                                {tool.label === 'Flashcards' ? (
                                                    <Image 
                                                        src="/AIFlashcards.png" 
                                                        alt="AI Flashcards" 
                                                        width={26} 
                                                        height={26} 
                                                        className="w-6.5 h-6.5 object-contain"
                                                        unoptimized
                                                    />
                                                ) : ("""

mobile_normal = """                                                {tool.label === 'Flashcards' ? (
                                                    <Image 
                                                        src="/AIFlashcards.png" 
                                                        alt="AI Flashcards" 
                                                        width={18} 
                                                        height={18} 
                                                        className="w-4.5 h-4.5 object-contain"
                                                        unoptimized
                                                    />
                                                ) : ("""

print("Applying Flashcard normal sizing replacements...")
dt_count = orig_content.count(desktop_tablet_large)
print(f"  Found {dt_count} occurrences of large desktop/tablet Flashcard image.")
if dt_count > 0:
    orig_content = orig_content.replace(desktop_tablet_large, desktop_tablet_normal)
    print("  Successfully replaced desktop/tablet Flashcard image occurrences.")

m_count = orig_content.count(mobile_large)
print(f"  Found {m_count} occurrences of large mobile Flashcard image.")
if m_count > 0:
    orig_content = orig_content.replace(mobile_large, mobile_normal)
    print("  Successfully replaced mobile Flashcard image occurrences.")

# 7. Save the fully reconstructed components/AppNavbar.tsx
with open(navbar_path, 'w') as f:
    f.write(orig_content)

print("Full reconstruction and sizing adjustment complete!")
