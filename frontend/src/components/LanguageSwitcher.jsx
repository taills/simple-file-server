import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-3 py-1 border rounded-md bg-white text-gray-700"
      >
        <option value="zh-CN">简体中文</option>
        <option value="zh-TW">繁體中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
