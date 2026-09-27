import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ variant = 'light', className = '' }) {
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs
          ${isDark
            ? 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-white'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="font-bold">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
      </button>

      {isOpen && (
        <div
          className={`
            absolute right-0 mt-1.5 w-44 rounded-xl shadow-xl z-50 py-1.5 animate-scale-in border overflow-hidden
            ${isDark
              ? 'bg-slate-900 border-slate-800 text-slate-200 divide-y divide-slate-800/60'
              : 'bg-white border-slate-200 text-slate-800 divide-y divide-slate-100'
            }
          `}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Language
          </div>

          <div className="py-1">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3.5 py-2 text-xs flex items-center justify-between transition-colors text-left
                    ${isDark
                      ? isSelected
                        ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                        : 'hover:bg-slate-800/80 text-slate-300'
                      : isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <span className="block font-medium leading-snug">{lang.nativeName}</span>
                      <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{lang.label}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 stroke-[3] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
