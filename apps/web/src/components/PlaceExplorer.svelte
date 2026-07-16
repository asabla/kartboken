<script lang="ts">
  import { searchPlaces } from "@kartboken/catalog/search";
  import type { Place } from "@kartboken/catalog/types";

  let { places }: { places: Place[] } = $props();
  let query = $state("");
  const results = $derived(searchPlaces(places, query));

  const categoryLabels: Record<Place["categories"][number], string> = {
    restaurant: "restaurang",
    cafe: "kafé",
    bakery: "bageri",
    bar: "bar",
    "farm-shop": "gårdsbutik",
    "food-stop": "matstopp",
    other: "annat",
  };

  const journeyLabels: Record<Place["journeyValue"], string> = {
    nearby: "i närheten",
    stop: "värt ett stopp",
    detour: "värt en omväg",
    journey: "värt en resa",
  };
</script>

<section class="explorer" aria-labelledby="explorer-title">
  <div class="explorer-heading">
    <div>
      <p class="eyebrow">Katalogen</p>
      <h2 id="explorer-title">{places.length ? `${places.length} handplockade platser` : "Första platserna är på väg"}</h2>
    </div>

    <label class="search">
      <span>Sök efter plats, ort eller typ</span>
      <input bind:value={query} type="search" placeholder="Till exempel kafé eller Dalarna" />
    </label>
  </div>

  {#if places.length === 0}
    <div class="empty-state">
      <span aria-hidden="true">↗</span>
      <p>Kartan är tom just nu, men anteckningsboken är öppen.</p>
      <small>Vi börjar med att granska rekommendationerna innan de får en nål.</small>
    </div>
  {:else if results.length === 0}
    <p class="no-results" aria-live="polite">Ingen plats matchar “{query}” ännu.</p>
  {:else}
    <p class="result-count" aria-live="polite">{results.length} {results.length === 1 ? "plats" : "platser"}</p>
    <ul class="place-grid">
      {#each results as { place } (place.id)}
        <li>
          <article class="place-card">
            <p class="place-meta">
              {place.location.locality} · {place.categories.map((category) => categoryLabels[category]).join(" / ")}
            </p>
            <h3>{place.name}</h3>
            <p>{place.summary}</p>
            <div class="place-footer">
              <span class="journey">{journeyLabels[place.journeyValue]}</span>
              <ul class="sources" aria-label={`Källor för ${place.name}`}>
                {#each place.sources as source}
                  <li>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                  </li>
                {/each}
              </ul>
            </div>
          </article>
        </li>
      {/each}
    </ul>
  {/if}
</section>
