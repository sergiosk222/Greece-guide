import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShieldCheck, AlertTriangle, FileText, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { articles, categories } from './data/articles.js';
import './styles.css';

const statusLabels = {
  draft: 'Черновик',
  verified: 'Проверено',
  outdated: 'Нужно обновить'
};

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabels[status] || status}</span>;
}

function ArticleCard({ article, onOpen }) {
  return (
    <motion.button
      className="article-card"
      onClick={() => onOpen(article)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="card-topline">
        <span className="category-pill">{article.category}</span>
        <StatusBadge status={article.status} />
      </div>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <div className="card-meta">
        <span>Проверено: {article.lastChecked}</span>
        <span>Открыть →</span>
      </div>
    </motion.button>
  );
}

function ArticleView({ article, onBack }) {
  return (
    <main className="page article-page">
      <button className="back-button" onClick={onBack}>← Назад к статьям</button>
      <article className="article-shell">
        <div className="card-topline">
          <span className="category-pill">{article.category}</span>
          <StatusBadge status={article.status} />
        </div>
        <h1>{article.title}</h1>
        <p className="lead">{article.summary}</p>

        <section className="quick-answer">
          <h2><CheckCircle2 size={22} /> Быстрый ответ</h2>
          <p>{article.sections.short}</p>
        </section>

        <InfoSection title="Кому нужно" content={article.sections.whoNeeds} />
        <InfoSection title="Что понадобится" content={article.sections.documents} />
        <InfoSection title="Куда обращаться" content={article.sections.where} />

        <section>
          <h2>Пошагово</h2>
          <ol className="steps-list">
            {article.sections.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>

        <section>
          <h2>Частые ошибки</h2>
          <ul className="mistakes-list">
            {article.sections.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
          </ul>
        </section>

        <section className="source-box">
          <h2><ExternalLink size={20} /> Официальный источник</h2>
          <a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.sourceName}</a>
          <p>Дата проверки: {article.lastChecked}</p>
        </section>

        <section className="warning-box">
          <AlertTriangle size={20} />
          <p>{article.sections.warning}</p>
        </section>
      </article>
    </main>
  );
}

function InfoSection({ title, content }) {
  return (
    <section>
      <h2>{title}</h2>
      <p>{content}</p>
    </section>
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = category === 'Все' || article.category === category;
      const matchesQuery = !normalized || [article.title, article.summary, article.category].join(' ').toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div>
      <header className="hero">
        <nav className="nav">
          <div className="logo"><ShieldCheck size={24} /> Greece Guide</div>
          <a href="mailto:hello@greece-guide.local" className="nav-link">Предложить исправление</a>
        </nav>

        <motion.div className="hero-content" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="eyebrow">Бюрократия Греции простым языком</span>
          <h1>Понятные инструкции для жизни в Греции</h1>
          <p>Документы, работа, медицина, жильё, армия и помощь иностранцам. Без сложного официального языка.</p>

          <div className="search-box">
            <Search size={22} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Что вы хотите сделать? Например: получить ΑΜΚΑ"
              aria-label="Поиск по инструкциям"
            />
          </div>
        </motion.div>
      </header>

      <main className="page">
        <section className="trust-strip">
          <div><FileText size={22} /><span>Только официальные источники</span></div>
          <div><ShieldCheck size={22} /><span>Публикация после ручной проверки</span></div>
          <div><AlertTriangle size={22} /><span>Всегда проверяйте оригинал</span></div>
        </section>

        <section>
          <h2>Разделы</h2>
          <div className="category-grid">
            {categories.map((item) => (
              <button key={item} className={item === category ? 'category active' : 'category'} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>Инструкции</h2>
            <span>{filteredArticles.length} найдено</span>
          </div>
          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onOpen={setSelectedArticle} />
            ))}
          </div>
        </section>

        <section className="suggest-box">
          <div>
            <h2>Нашли ошибку или хотите предложить тему?</h2>
            <p>Напишите, какую инструкцию добавить или что исправить. Черновики публикуются только после проверки.</p>
          </div>
          <a className="primary-button" href="mailto:hello@greece-guide.local"><Send size={18} /> Предложить исправление</a>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
