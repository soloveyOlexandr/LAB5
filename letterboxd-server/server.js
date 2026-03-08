const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

const parser = new Parser({
  customFields: {
    item: ['letterboxd:memberRating', 'description'],
  },
  timeout: 10000,
});

// In-memory кеш (TTL: 5 хвилин)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Парсинг елементів RSS у масив рецензій
function parseReviews(items) {
  return items.map((item, index) => {
    const $ = cheerio.load(item.description || '');
    const poster = $('img').attr('src') || 'https://via.placeholder.com/200x300?text=No+Poster';
    $('img').remove();
    const reviewText = $.text().trim();

    return {
      id: index,
      title: item.title ? item.title.split(' - ')[0].trim() : 'Без назви',
      rating: item['letterboxd:memberRating'] ? parseFloat(item['letterboxd:memberRating']) : 0,
      review: reviewText,
      poster,
      link: item.link,
    };
  });
}

// Валідація username
function isValidUsername(username) {
  return /^[a-zA-Z0-9_-]{1,40}$/.test(username);
}

// Випадкове перемішування масиву (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Популярні акаунти для випадкових рецензій на стартовій
const POPULAR_USERS = [
  'dave', 'sally', 'sean', 'lucy', 'matt',
  'adam', 'jake', 'alex', 'jack', 'mark',
  'karsten', 'davidehrlich', 'letterboxd',
];
const RANDOM_REVIEWS_COUNT = 12;

app.get('/api/letterboxd/random', async (req, res) => {
  const startTime = Date.now();

  // Перевіряємо кеш
  const cached = getCached('__random__');
  if (cached) {
    // Повертаємо перемішану версію кешованих даних
    console.log(`[${new Date().toISOString()}] RANDOM CACHE HIT (${Date.now() - startTime}ms)`);
    return res.json({ reviews: shuffle(cached.reviews).slice(0, RANDOM_REVIEWS_COUNT) });
  }

  try {
    // Беремо 4 випадкових юзерів і тягнемо їх стрічки паралельно
    const selectedUsers = shuffle(POPULAR_USERS).slice(0, 4);
    const feeds = await Promise.allSettled(
      selectedUsers.map((u) => parser.parseURL(`https://letterboxd.com/${u}/rss/`))
    );

    let allReviews = [];
    feeds.forEach((result) => {
      if (result.status === 'fulfilled') {
        const parsed = parseReviews(result.value.items);
        // Беремо тільки ті, що мають постер і рейтинг
        const good = parsed.filter((r) => r.rating > 0 && !r.poster.includes('placeholder'));
        allReviews.push(...good);
      }
    });

    if (allReviews.length === 0) {
      return res.status(503).json({ error: 'Не вдалося завантажити рецензії. Спробуйте пізніше.' });
    }

    // Перенумеровуємо id
    allReviews = allReviews.map((r, i) => ({ ...r, id: i }));

    // Кешуємо весь пул, а віддаємо випадкову підмножину
    setCache('__random__', { reviews: allReviews });
    const selected = shuffle(allReviews).slice(0, RANDOM_REVIEWS_COUNT);

    console.log(`[${new Date().toISOString()}] RANDOM OK: ${allReviews.length} total, sent ${selected.length} (${Date.now() - startTime}ms)`);
    res.json({ reviews: selected });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] RANDOM ERROR: ${error.message}`);
    res.status(500).json({ error: 'Не вдалося завантажити випадкові рецензії.' });
  }
});

app.get('/api/letterboxd/:username', async (req, res) => {
  const { username } = req.params;
  const startTime = Date.now();

  if (!isValidUsername(username)) {
    console.log(`[${new Date().toISOString()}] REJECTED invalid username: "${username}"`);
    return res.status(400).json({ error: 'Некоректне ім\'я користувача. Дозволені: літери, цифри, _ та -' });
  }

  // Перевіряємо кеш
  const cached = getCached(username);
  if (cached) {
    console.log(`[${new Date().toISOString()}] CACHE HIT: ${username} (${Date.now() - startTime}ms)`);
    return res.json(cached);
  }

  try {
    const feed = await parser.parseURL(`https://letterboxd.com/${username}/rss/`);
    const reviews = parseReviews(feed.items);

    const result = { reviews };
    setCache(username, result);

    console.log(`[${new Date().toISOString()}] OK: ${username} — ${reviews.length} reviews (${Date.now() - startTime}ms)`);
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR: ${username} — ${error.message}`);

    if (error.message.includes('Status code 404') || error.message.includes('Non-whitespace before first tag')) {
      return res.status(404).json({ error: 'Профіль не знайдено або користувач не має записів.' });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ error: 'Не вдалося з\'єднатися з Letterboxd. Спробуйте пізніше.' });
    }

    res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[${new Date().toISOString()}] Сервер працює на http://localhost:${PORT}`));
