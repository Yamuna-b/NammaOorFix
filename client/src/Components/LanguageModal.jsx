import { t } from '../i18n';

export default function LanguageModal({ chooseLang }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50/80 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 w-80 text-center animate-fade-in">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {t('chooseLanguage')}
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => chooseLang('en')}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            {t('english')}
          </button>
          <button
            onClick={() => chooseLang('ta')}
            className="w-full py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            {t('tamil')}
          </button>
        </div>
      </div>
    </div>
  );
}
