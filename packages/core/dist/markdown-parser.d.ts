/**
 * Markdown Section Parser
 *
 * Parses markdown documents into discrete sections for spot treatment editing.
 * Each section can be edited or regenerated independently while freezing others.
 */
export interface Section {
    id: string;
    header: string;
    level: number;
    content: string;
    startLine: number;
    endLine: number;
    editedAt?: string;
    originalContent?: string;
}
/**
 * Parse markdown content into sections based on ## and ### headers
 *
 * @param markdown - The markdown content to parse
 * @returns Array of sections with headers, content, and line numbers
 */
export declare function parseMarkdownSections(markdown: string): Section[];
/**
 * Reassemble sections back into markdown
 *
 * @param sections - Array of sections to reassemble
 * @returns Complete markdown string
 */
export declare function reassembleSections(sections: Section[]): string;
/**
 * Update a specific section's content
 *
 * @param sections - Current sections array
 * @param sectionId - ID of section to update
 * @param newContent - New content for the section
 * @returns Updated sections array
 */
export declare function updateSection(sections: Section[], sectionId: string, newContent: string): Section[];
/**
 * Get frozen context for spot treatment (summarized before/after sections)
 *
 * @param sections - All sections
 * @param targetSectionId - The section being regenerated
 * @returns Object with before and after context
 */
export declare function getFrozenContext(sections: Section[], targetSectionId: string): {
    before: string;
    after: string;
};
/**
 * Check if any sections have been edited
 */
export declare function hasEdits(sections: Section[]): boolean;
/**
 * Get list of edited section IDs
 */
export declare function getEditedSectionIds(sections: Section[]): string[];
