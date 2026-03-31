import { useTheme } from '../../context/ThemeContext';
import { useFontSize } from '../../context/FontSizeContext';
import { useState } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const [showFontMenu, setShowFontMenu] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
        title={theme === 'light' ? 'Beralih ke dark mode' : 'Beralih ke light mode'}
        aria-label={theme === 'light' ? 'Beralih ke dark mode' : 'Beralih ke light mode'}
      >
        {theme === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
      </button>

      {/* Font Size Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowFontMenu(!showFontMenu)}
          className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl font-bold"
          title="Ukuran font"
          aria-label="Atur ukuran font"
        >
          A
        </button>

        {showFontMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowFontMenu(false)}
            />
            <div
              className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-40"
              role="menu"
              aria-label="Menu ukuran font"
            >
              <button
                onClick={() => {
                  setFontSize('small');
                  setShowFontMenu(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  fontSize === 'small'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                role="menuitem"
                aria-label="Ukuran font kecil"
              >
                <span className="text-xs font-bold">A</span> Kecil
              </button>
              <button
                onClick={() => {
                  setFontSize('medium');
                  setShowFontMenu(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-base transition-colors ${
                  fontSize === 'medium'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                role="menuitem"
                aria-label="Ukuran font normal"
              >
                <span className="text-base font-bold">A</span> Normal
              </button>
              <button
                onClick={() => {
                  setFontSize('large');
                  setShowFontMenu(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-lg transition-colors ${
                  fontSize === 'large'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                role="menuitem"
                aria-label="Ukuran font besar"
              >
                <span className="text-lg font-bold">A</span> Besar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
