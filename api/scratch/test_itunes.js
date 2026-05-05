async function searchITunesBooks(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=10`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).map(item => ({
    title: item.trackName,
    author: item.artistName,
    date: item.releaseDate
  }));
}

async function run() {
  const queries = ['The Lord of the Rings', 'Atomic Habits', 'The Great Gatsby', 'Mistborn'];
  for (const q of queries) {
    console.log(`\nQuery: "${q}"`);
    const results = await searchITunesBooks(q);
    results.forEach(r => console.log(`- ${r.title} by ${r.author} (${r.date?.split('-')[0]})`));
  }
}

run();
