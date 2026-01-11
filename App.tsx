
import React, { useState, useMemo, useEffect } from 'react';
import { AppMode, Progress, LeixiangItem } from './types';
import { LEIXIANG_DATA, CATEGORIES } from './data';
import Navigation from './components/Navigation';
import FlashcardMode from './components/FlashcardMode';
import TableView from './components/TableView';
import QuizMode from './components/QuizMode';

const STORAGE_KEY = 'wanwu_leixiang_progress';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('BROWSE');
  const [progress, setProgress] = useState<Progress[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync progress to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (itemId: string, known: boolean) => {
    setProgress(prev => {
      const idx = prev.findIndex(p => p.itemId === itemId);
      const now = Date.now();
      if (idx > -1) {
        const current = prev[idx];
        const newBox = known ? Math.min(current.box + 1, 4) : Math.max(current.box - 1, 0);
        const nextReview = now + (known ? Math.pow(2, newBox) * 24 * 60 * 60 * 1000 : 0);
        const newProgress = [...prev];
        newProgress[idx] = { ...current, box: newBox, nextReview, lastReview: now };
        return newProgress;
      } else {
        const newBox = known ? 1 : 0;
        return [...prev, { itemId, box: newBox, nextReview: now, lastReview: now }];
      }
    });
  };

  const filteredItems = useMemo(() => {
    return LEIXIANG_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch = item.name.includes(searchQuery) || 
                          item.meanings.some(m => m.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center serif text-xl font-bold">
              象
            </div>
            <div>
              <h1 className="text-xl font-bold stone-800 serif">萬物類象記憶</h1>
              <p className="text-xs text-stone-500">系統化玄學類象訓練</p>
            </div>
          </div>
          
          <nav className="flex bg-stone-100 p-1 rounded-lg">
            <button 
              onClick={() => setMode('BROWSE')}
              className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'BROWSE' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
            >
              檢視
            </button>
            <button 
              onClick={() => setMode('LEARN')}
              className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'LEARN' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
            >
              學習
            </button>
            <button 
              onClick={() => setMode('QUIZ')}
              className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'QUIZ' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
            >
              測驗
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6">
        {mode === 'BROWSE' && (
          <TableView 
            items={filteredItems} 
            categories={CATEGORIES} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {mode === 'LEARN' && (
          <FlashcardMode 
            items={LEIXIANG_DATA} 
            progress={progress} 
            onUpdate={updateProgress} 
          />
        )}
        {mode === 'QUIZ' && (
          <QuizMode items={LEIXIANG_DATA} />
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-white border-t border-stone-200 p-4 text-center text-xs text-stone-400">
        <p>© 2024 萬物類象記憶助手 | 已掌握項目: {progress.filter(p => p.box >= 3).length} / {LEIXIANG_DATA.length}</p>
      </footer>
    </div>
  );
};

export default App;
