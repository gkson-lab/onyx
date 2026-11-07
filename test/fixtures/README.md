# Recorded responses

Real responses from the services `host/net.js` talks to, recorded on 2026-11-07 and trimmed (long article text and
feed sections cut), so `test/test.js` can check the internet port without going online:

| File | Request |
|---|---|
| `wiki-search-ada-lovelace.json` | the results of `en.wikipedia.org/w/api.php?action=query&list=search&srsearch=ada lovelace`, laid out as `rest.php/v1/search/page` returns them (that endpoint was rate limited from the recording machine; its layout is the one in the French file) |
| `wiki-search-tour-eiffel-fr.json` | `fr.wikipedia.org/w/rest.php/v1/search/page?q=tour eiffel` |
| `wiki-summary-tour-eiffel-fr.json` | `fr.wikipedia.org/api/rest_v1/page/summary/Tour_Eiffel` |
| `wiki-summary-ada-lovelace.json` | `en.wikipedia.org/api/rest_v1/page/summary/Ada_Lovelace` |
| `wiki-article-ada-lovelace.json` | `en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=Ada Lovelace` (first 9,000 characters) |
| `wiki-feed-2026-11-07.json` | `en.wikipedia.org/api/rest_v1/feed/featured/2026/11/07` ("In the news" only) |
| `meteo-geocode-paris.json` | `geocoding-api.open-meteo.com/v1/search?name=Paris` |
| `meteo-forecast-paris.json` | `api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&...` |
| `dictionary-petrichor.json` | `api.dictionaryapi.dev/api/v2/entries/en/petrichor` |
| `dictionary-not-found.json` | `api.dictionaryapi.dev/api/v2/entries/en/zzqxv` (HTTP 404) |

Wikipedia text is from Wikipedia's contributors under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/);
Wiktionary text (via the Free Dictionary API) is under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/);
weather data is by [Open-Meteo.com](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
These files are test data only; none of it ships in `src/`.
