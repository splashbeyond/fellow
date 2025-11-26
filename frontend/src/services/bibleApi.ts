export interface BibleVerse {
  reference: string;
  text: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
}

/**
 * Search for a Bible verse using bible-api.com
 * Supports formats like: "John 3:16", "1 Corinthians 13:4-7", "Psalm 23"
 */
export async function searchBibleVerse(query: string): Promise<BibleVerse | null> {
  try {
    // Clean and encode the query
    const cleanQuery = query.trim().replace(/\s+/g, ' ');
    const encodedQuery = encodeURIComponent(cleanQuery);
    
    const response = await fetch(`https://bible-api.com/${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      reference: data.reference || cleanQuery,
      text: data.text || '',
      verses: data.verses || []
    };
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    return null;
  }
}

/**
 * Load an entire chapter or a range of verses
 * Supports formats like: "John 3" (entire chapter) or "John 3:1-20" (range)
 */
export async function loadBibleChapter(book: string, chapter: number, startVerse?: number, endVerse?: number): Promise<BibleVerse | null> {
  try {
    let query: string;
    if (startVerse && endVerse) {
      query = `${book} ${chapter}:${startVerse}-${endVerse}`;
    } else {
      // Try different formats - some APIs support just the chapter number
      // First try: "John 3" format
      query = `${book} ${chapter}`;
    }
    
    let encodedQuery = encodeURIComponent(query);
    let response = await fetch(`https://bible-api.com/${encodedQuery}`);
    
    // If that fails, try with verse range
    if (!response.ok && !startVerse && !endVerse) {
      query = `${book} ${chapter}:1-50`;
      encodedQuery = encodeURIComponent(query);
      response = await fetch(`https://bible-api.com/${encodedQuery}`);
    }
    
    // If that also fails, try fetching individual verses and combining
    if (!response.ok && !startVerse && !endVerse) {
      // Fetch verses one by one and combine them
      const verses: Array<{
        book_id: string;
        book_name: string;
        chapter: number;
        verse: number;
        text: string;
      }> = [];
      
      let allText = '';
      let verseNum = 1;
      let foundVerses = true;
      
      // Try up to 50 verses
      while (verseNum <= 50 && foundVerses) {
        const verseQuery = `${book} ${chapter}:${verseNum}`;
        const verseResponse = await fetch(`https://bible-api.com/${encodeURIComponent(verseQuery)}`);
        
        if (verseResponse.ok) {
          const verseData = await verseResponse.json();
          if (verseData.verses && verseData.verses.length > 0) {
            verses.push(...verseData.verses);
            allText += (allText ? ' ' : '') + verseData.text;
            verseNum++;
          } else {
            foundVerses = false;
          }
        } else {
          foundVerses = false;
        }
      }
      
      if (verses.length > 0) {
        return {
          reference: `${book} ${chapter}`,
          text: allText,
          verses: verses
        };
      }
      
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      reference: data.reference || query,
      text: data.text || '',
      verses: data.verses || []
    };
  } catch (error) {
    console.error('Error fetching Bible chapter:', error);
    return null;
  }
}

