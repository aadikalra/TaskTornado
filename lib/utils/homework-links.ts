export type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

/**
 * Robustly parses a links array/string from the database or API.
 * Ensure all links have IDs and valid structures.
 */
export function parseHomeworkLinks(rawLinks: any): HomeworkLink[] {
  let links: HomeworkLink[] = [];
  
  if (!rawLinks) return [];

  try {
    links = typeof rawLinks === 'string' ? JSON.parse(rawLinks) : rawLinks;
    if (!Array.isArray(links)) {
      links = [];
    }
    
    return links.map((l: any) => ({
      ...l,
      id: l.id || Math.random().toString(36).substring(2, 9)
    }));
  } catch (e) {
    console.error('Error parsing links:', e);
    return [];
  }
}
