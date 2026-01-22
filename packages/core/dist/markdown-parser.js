/**
 * Markdown Section Parser
 *
 * Parses markdown documents into discrete sections for spot treatment editing.
 * Each section can be edited or regenerated independently while freezing others.
 */
/**
 * Generate a URL-safe ID from a header string
 */
function generateSectionId(header) {
    return header
        .toLowerCase()
        .replace(/^#+\s*/, "") // Remove leading #s
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .substring(0, 50); // Limit length
}
/**
 * Parse markdown content into sections based on ## and ### headers
 *
 * @param markdown - The markdown content to parse
 * @returns Array of sections with headers, content, and line numbers
 */
export function parseMarkdownSections(markdown) {
    const lines = markdown.split("\n");
    const sections = [];
    const headerRegex = /^(#{2,3})\s+(.+)$/;
    let currentSection = null;
    let contentLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(headerRegex);
        if (match) {
            // Save previous section if exists
            if (currentSection) {
                currentSection.content = contentLines.join("\n").trim();
                currentSection.endLine = i - 1;
                sections.push(currentSection);
            }
            // Start new section
            const level = match[1].length; // 2 for ##, 3 for ###
            const headerText = match[2];
            const header = line;
            currentSection = {
                id: generateSectionId(headerText),
                header,
                level,
                content: "",
                startLine: i,
                endLine: i, // Will be updated
            };
            contentLines = [];
        }
        else if (currentSection) {
            contentLines.push(line);
        }
        else {
            // Content before first header - create intro section
            if (line.trim() && !currentSection) {
                currentSection = {
                    id: "intro",
                    header: "",
                    level: 0,
                    content: "",
                    startLine: 0,
                    endLine: 0,
                };
                contentLines = [line];
            }
            else if (currentSection) {
                contentLines.push(line);
            }
        }
    }
    // Don't forget the last section
    if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        currentSection.endLine = lines.length - 1;
        sections.push(currentSection);
    }
    return sections;
}
/**
 * Reassemble sections back into markdown
 *
 * @param sections - Array of sections to reassemble
 * @returns Complete markdown string
 */
export function reassembleSections(sections) {
    return sections
        .map((section) => {
        if (section.header) {
            return `${section.header}\n\n${section.content}`;
        }
        return section.content;
    })
        .join("\n\n");
}
/**
 * Update a specific section's content
 *
 * @param sections - Current sections array
 * @param sectionId - ID of section to update
 * @param newContent - New content for the section
 * @returns Updated sections array
 */
export function updateSection(sections, sectionId, newContent) {
    return sections.map((section) => {
        if (section.id === sectionId) {
            return {
                ...section,
                content: newContent,
                editedAt: new Date().toISOString(),
                originalContent: section.originalContent || section.content,
            };
        }
        return section;
    });
}
/**
 * Get frozen context for spot treatment (summarized before/after sections)
 *
 * @param sections - All sections
 * @param targetSectionId - The section being regenerated
 * @returns Object with before and after context
 */
export function getFrozenContext(sections, targetSectionId) {
    const targetIndex = sections.findIndex((s) => s.id === targetSectionId);
    if (targetIndex === -1) {
        return { before: "", after: "" };
    }
    // Get sections before target (summarized)
    const beforeSections = sections.slice(0, targetIndex);
    const before = beforeSections
        .map((s) => {
        const preview = s.content.length > 200 ? s.content.substring(0, 200) + "..." : s.content;
        return s.header ? `${s.header}\n${preview}` : preview;
    })
        .join("\n\n");
    // Get sections after target (summarized)
    const afterSections = sections.slice(targetIndex + 1);
    const after = afterSections
        .map((s) => {
        const preview = s.content.length > 200 ? s.content.substring(0, 200) + "..." : s.content;
        return s.header ? `${s.header}\n${preview}` : preview;
    })
        .join("\n\n");
    return { before, after };
}
/**
 * Check if any sections have been edited
 */
export function hasEdits(sections) {
    return sections.some((s) => s.editedAt !== undefined);
}
/**
 * Get list of edited section IDs
 */
export function getEditedSectionIds(sections) {
    return sections.filter((s) => s.editedAt).map((s) => s.id);
}
