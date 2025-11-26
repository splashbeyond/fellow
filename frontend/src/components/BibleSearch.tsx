import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { searchBibleVerse, loadBibleChapter, type BibleVerse } from '../services/bibleApi';
import { signalingService } from '../services/signaling';

interface BibleSearchProps {
  roomId: string | null;
  isConnected: boolean;
}

export function BibleSearch({ roomId, isConnected }: BibleSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<{
    reference: string;
    text: string;
  } | null>(null);
  const [verseData, setVerseData] = useState<BibleVerse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedVerses, setExpandedVerses] = useState<BibleVerse[]>([]);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);

  // Listen for Bible verses shared by the other user
  useEffect(() => {
    if (!roomId) return;

    const handleBibleVerse = (data: { 
      roomId: string; 
      reference: string; 
      text: string;
      verses: Array<{
        book_id: string;
        book_name: string;
        chapter: number;
        verse: number;
        text: string;
      }>;
    }) => {
      if (data.roomId === roomId) {
        setCurrentVerse({
          reference: data.reference,
          text: data.text
        });
        setVerseData({
          reference: data.reference,
          text: data.text,
          verses: data.verses
        });
      }
    };

    signalingService.onBibleVerse(handleBibleVerse);

    return () => {
      signalingService.offBibleVerse(handleBibleVerse);
    };
  }, [roomId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const verse = await searchBibleVerse(searchQuery.trim());

    if (verse) {
      setCurrentVerse({
        reference: verse.reference,
        text: verse.text
      });
      setVerseData(verse);

      // Share the verse with the other user only if connected
      if (roomId && isConnected) {
        signalingService.shareBibleVerse(roomId, {
          reference: verse.reference,
          text: verse.text,
          verses: verse.verses
        });
      }
    } else {
      // Show error or handle not found
      alert('Verse not found. Please try a different format (e.g., "John 3:16", "1 Corinthians 13:4-7")');
    }

    setIsSearching(false);
  };

  // Parse reference to extract book, chapter, and verse
  const parseReference = (reference: string) => {
    // Match patterns like "John 3:16", "1 Corinthians 13:4", "Psalm 23:1"
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)/);
    if (match) {
      return {
        book: match[1].trim(),
        chapter: parseInt(match[2], 10),
        verse: parseInt(match[3], 10)
      };
    }
    return null;
  };

  // Navigate to next verse
  const handleNextVerse = async () => {
    if (!verseData || !currentVerse) return;
    
    const parsed = parseReference(currentVerse.reference);
    if (!parsed) return;

    setIsSearching(true);
    
    // Try next verse in same chapter
    const nextVerseNum = parsed.verse + 1;
    let nextQuery = `${parsed.book} ${parsed.chapter}:${nextVerseNum}`;
    let verse = await searchBibleVerse(nextQuery);
    
    // If verse not found, try first verse of next chapter
    if (!verse) {
      const nextChapter = parsed.chapter + 1;
      nextQuery = `${parsed.book} ${nextChapter}:1`;
      verse = await searchBibleVerse(nextQuery);
    }
    
    if (verse) {
      setCurrentVerse({
        reference: verse.reference,
        text: verse.text
      });
      setVerseData(verse);

      // Share the verse with the other user only if connected
      if (roomId && isConnected) {
        signalingService.shareBibleVerse(roomId, {
          reference: verse.reference,
          text: verse.text,
          verses: verse.verses
        });
      }
    }
    setIsSearching(false);
  };

  // Navigate to previous verse
  const handlePreviousVerse = async () => {
    if (!verseData || !currentVerse) return;
    
    const parsed = parseReference(currentVerse.reference);
    if (!parsed) return;

    setIsSearching(true);
    
    // Try previous verse in same chapter
    let verse = null;
    if (parsed.verse > 1) {
      const prevVerseNum = parsed.verse - 1;
      const prevQuery = `${parsed.book} ${parsed.chapter}:${prevVerseNum}`;
      verse = await searchBibleVerse(prevQuery);
    }
    
    // If at verse 1 or previous verse not found, try last verse of previous chapter
    if (!verse && parsed.chapter > 1) {
      const prevChapter = parsed.chapter - 1;
      // Try verse numbers from 50 down to 1 to find the last verse
      for (let verseNum = 50; verseNum >= 1; verseNum--) {
        const prevQuery = `${parsed.book} ${prevChapter}:${verseNum}`;
        verse = await searchBibleVerse(prevQuery);
        if (verse) break;
      }
    }
    
    if (verse) {
      setCurrentVerse({
        reference: verse.reference,
        text: verse.text
      });
      setVerseData(verse);

      // Share the verse with the other user only if connected
      if (roomId && isConnected) {
        signalingService.shareBibleVerse(roomId, {
          reference: verse.reference,
          text: verse.text,
          verses: verse.verses
        });
      }
    }
    setIsSearching(false);
  };

  // Load expanded view (entire chapter)
  const handleExpand = async () => {
    console.log('Expand button clicked, currentVerse:', currentVerse);
    if (!currentVerse) {
      console.log('No current verse to expand');
      return;
    }
    
    const parsed = parseReference(currentVerse.reference);
    console.log('Parsed reference:', parsed);
    if (!parsed) {
      console.log('Could not parse reference:', currentVerse.reference);
      return;
    }
    
    setIsLoadingExpanded(true);
    console.log('Loading chapter:', parsed.book, parsed.chapter);
    try {
      const chapter = await loadBibleChapter(parsed.book, parsed.chapter);
      console.log('Chapter loaded:', chapter);
      
      if (chapter && chapter.verses && chapter.verses.length > 0) {
        setExpandedVerses([chapter]);
        setIsExpanded(true);
        console.log('Expanded view should now be visible, verses:', chapter.verses.length);
      } else {
        console.log('Failed to load chapter or no verses found');
        alert('Could not load the chapter. Please try again.');
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
      alert('Error loading chapter. Please try again.');
    } finally {
      setIsLoadingExpanded(false);
    }
  };

  // Navigate in expanded view
  const handleExpandedNext = async () => {
    if (expandedVerses.length === 0) return;
    
    const lastVerse = expandedVerses[expandedVerses.length - 1];
    const parsed = parseReference(lastVerse.reference);
    if (!parsed) return;
    
    setIsLoadingExpanded(true);
    
    // Try next chapter
    const nextChapter = parsed.chapter + 1;
    const chapter = await loadBibleChapter(parsed.book, nextChapter);
    
    if (chapter) {
      setExpandedVerses(prev => [...prev, chapter]);
    }
    setIsLoadingExpanded(false);
  };

  const handleExpandedPrevious = async () => {
    if (expandedVerses.length === 0) return;
    
    const firstVerse = expandedVerses[0];
    const parsed = parseReference(firstVerse.reference);
    if (!parsed || parsed.chapter <= 1) return;
    
    setIsLoadingExpanded(true);
    
    // Load previous chapter
    const prevChapter = parsed.chapter - 1;
    const chapter = await loadBibleChapter(parsed.book, prevChapter);
    
    if (chapter) {
      setExpandedVerses(prev => [chapter, ...prev]);
    }
    setIsLoadingExpanded(false);
  };

  // Check if we can navigate
  const parsed = currentVerse ? parseReference(currentVerse.reference) : null;
  // Can go previous if not at verse 1 of chapter 1 (we'll try to find previous chapter)
  const canGoPrevious = parsed ? (parsed.verse > 1 || parsed.chapter > 1) : false;

  return (
    <>
      <div className="p-4 border-b border-charcoal/50 bg-charcoal/90 flex-shrink-0">
        <div className="mb-2">
        <label className="text-xs text-ivory/70 mb-1 block">Search Bible</label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., John 3:16, Psalm 23"
            disabled={isSearching}
            className="flex-1 bg-charcoal/60 border-charcoal/50 text-ivory placeholder:text-ivory/40"
          />
          <Button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="bg-moss hover:bg-moss/90 disabled:bg-charcoal/50 disabled:cursor-not-allowed text-ivory"
          >
            {isSearching ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </Button>
        </form>
      </div>
      
      {currentVerse && (
        <div className="mt-2 p-3 bg-moss/20 border border-moss/30 rounded-lg max-h-64 flex flex-col">
          <p className="text-xs font-semibold text-moss mb-1 flex-shrink-0">{currentVerse.reference}</p>
          <div className="flex-1 overflow-y-auto mb-3 min-h-0">
            <p className="text-sm text-ivory leading-relaxed break-words">{currentVerse.text}</p>
          </div>
          
          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-moss/20 flex-shrink-0">
            {/* Expand button */}
            <button
              onClick={handleExpand}
              disabled={isLoadingExpanded || !currentVerse}
              className="p-2 rounded-md bg-moss/30 hover:bg-moss/50 disabled:bg-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              aria-label="Expand view"
            >
              <svg 
                className="w-4 h-4 text-ivory" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            
            <button
              onClick={handlePreviousVerse}
              disabled={!canGoPrevious || isSearching}
              className="p-2 rounded-md bg-moss/30 hover:bg-moss/50 disabled:bg-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              aria-label="Previous verse"
            >
              <svg 
                className="w-4 h-4 text-ivory" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-xs text-ivory/60">
              {parsed ? `${parsed.book} ${parsed.chapter}:${parsed.verse}` : currentVerse.reference}
            </span>
            
            <button
              onClick={handleNextVerse}
              disabled={isSearching}
              className="p-2 rounded-md bg-moss/30 hover:bg-moss/50 disabled:bg-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              aria-label="Next verse"
            >
              <svg 
                className="w-4 h-4 text-ivory" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Expanded View Modal */}
      {isExpanded && (
        <div className="fixed left-0 top-0 bottom-0 z-[100] w-80 bg-charcoal/95 border-r-2 border-ivory/30 shadow-2xl flex flex-col" style={{ zIndex: 1000 }}>
            {/* Header with close button */}
            <div className="p-4 border-b border-charcoal/50 bg-charcoal/90 flex items-center justify-between">
              <h3 className="font-semibold text-ivory">Bible Reading</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md hover:bg-charcoal/50 transition-colors"
                aria-label="Close expanded view"
              >
                <svg 
                  className="w-5 h-5 text-ivory" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation controls */}
            <div className="p-4 border-b border-charcoal/50 bg-charcoal/90 flex items-center justify-center gap-4">
              <button
                onClick={handleExpandedPrevious}
                disabled={isLoadingExpanded || (expandedVerses.length > 0 && parseReference(expandedVerses[0].reference)?.chapter === 1)}
                className="p-2 rounded-md bg-moss/30 hover:bg-moss/50 disabled:bg-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                aria-label="Previous chapter"
              >
                <svg 
                  className="w-4 h-4 text-ivory" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-sm text-ivory/60">
                {expandedVerses.length > 0 && parsed ? `${parsed.book} ${parsed.chapter}` : ''}
              </span>
              
              <button
                onClick={handleExpandedNext}
                disabled={isLoadingExpanded}
                className="p-2 rounded-md bg-moss/30 hover:bg-moss/50 disabled:bg-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                aria-label="Next chapter"
              >
                <svg 
                  className="w-4 h-4 text-ivory" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Verses content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingExpanded ? (
                <div className="text-center text-ivory/50 text-sm">Loading...</div>
              ) : (
                expandedVerses.map((chapter, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-sm font-semibold text-moss mb-2">
                      {chapter.reference}
                    </h4>
                    {chapter.verses.map((verse, vIdx) => (
                      <div key={vIdx} className="text-sm text-ivory leading-relaxed">
                        <span className="text-moss font-semibold mr-2">{verse.verse}.</span>
                        <span>{verse.text}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
        </div>
      )}
    </>
  );
}

