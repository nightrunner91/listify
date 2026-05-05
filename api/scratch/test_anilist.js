async function searchAniList(query) {
  const url = 'https://graphql.anilist.co';
  const queryStr = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: MANGA) {
          title {
            english
            romaji
          }
          startDate {
            year
          }
        }
      }
    }
  `;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: queryStr, variables: { search: query } })
  });
  const data = await res.json();
  return (data.data.Page.media || []).map(m => ({
    title: m.title.english || m.title.romaji,
    year: m.startDate.year
  }));
}

async function run() {
  const queries = ['Chainsaw Man', 'One Piece', 'Berserk', 'Solo Leveling'];
  for (const q of queries) {
    console.log(`\nQuery: "${q}"`);
    const results = await searchAniList(q);
    results.forEach(r => console.log(`- ${r.title} (${r.year})`));
  }
}

run();
