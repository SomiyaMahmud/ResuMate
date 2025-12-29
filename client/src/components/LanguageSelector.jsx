import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { languages } from '../locales/translations'
import { Globe } from 'lucide-react'

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300/80 hover:bg-gray-50 transition-colors"
      >
        <Globe size={18} color="#6B7280" />
        <span className="text-sm text-gray-700">{currentLanguage?.flag} {currentLanguage?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300/80 rounded-lg shadow-lg overflow-hidden z-10 min-w-[180px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
