<script lang="ts">
  import { onMount } from "svelte";

  import { searchPlaces } from "@kartboken/catalog/search";
  import type { JourneyValue, Place, PlaceCategory } from "@kartboken/catalog/types";
  import MapPanel from "./MapPanel.svelte";

  let { places, mapStyleUrl }: { places: Place[]; mapStyleUrl: string } = $props();
  let query = $state("");
  let category = $state<PlaceCategory | "">("");
  let journey = $state<JourneyValue | "">("");
  let selectedId = $state("");
  let hydrated = $state(false);

  const categoryLabels: Record<PlaceCategory, string> = {
    restaurant: "restaurang",
    cafe: "kafé",
    bakery: "bageri",
    bar: "bar",
    "farm-shop": "gårdsbutik",
    "food-stop": "matstopp",
    other: "annat",
  };
  const journeyLabels: Record<JourneyValue, string> = {
    nearby: "i närheten",
    stop: "värt ett stopp",
    detour: "värt en omväg",
    journey: "värt en resa",
  };

  const availableCategories = $derived(
    [...new Set(places.flatMap((place) => place.categories))].sort((left, right) =>
      categoryLabels[left].localeCompare(categoryLabels[right], "sv"),
    ),
  );
  const results = $derived(
    searchPlaces(places, query)
      .map(({ place }) => place)
      .filter((place) => !category || place.categories.includes(category))
      .filter((place) => !journey || place.journeyValue === journey),
  );

  function selectPlace(id: string): void {
    selectedId = id;
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document
        .getElementById(`place-${id}`)
        ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
    });
  }

  function resetFilters(): void {
    query = "";
    category = "";
    journey = "";
    selectedId = "";
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    query = params.get("q") ?? "";
    const requestedCategory = params.get("category");
    const requestedJourney = params.get("journey");
    const requestedPlace = params.get("place");
    category = availableCategories.includes(requestedCategory as PlaceCategory)
      ? (requestedCategory as PlaceCategory)
      : "";
    journey = ["nearby", "stop", "detour", "journey"].includes(requestedJourney ?? "")
      ? (requestedJourney as JourneyValue)
      : "";
    selectedId = places.some((place) => place.id === requestedPlace) ? (requestedPlace ?? "") : "";
    hydrated = true;
  });

  $effect(() => {
    if (selectedId && !results.some((place) => place.id === selectedId)) selectedId = "";
  });

  $effect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (journey) params.set("journey", journey);
    if (selectedId) params.set("place", selectedId);
    const search = params.toString();
    history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  });
</script>

<section class="explorer" aria-labelledby="explorer-title">
  <div class="explorer-heading">
    <div>
      <p class="eyebrow">Katalogen</p>
      <h2 id="explorer-title">{places.length ? `${places.length} handplockade platser` : "Första platserna är på väg"}</h2>
    </div>

    <div class="filters">
      <label class="search">
        <span>Sök efter plats, ort eller typ</span>
        <input bind:value={query} type="search" placeholder="Till exempel kafé eller Dalarna" />
      </label>
      <div class="filter-row">
        <label>
          <span>Typ av plats</span>
          <select bind:value={category}>
            <option value="">Alla typer</option>
            {#each availableCategories as value}
              <option value={value}>{categoryLabels[value]}</option>
            {/each}
          </select>
        </label>
        <label>
          <span>Värd resan</span>
          <select bind:value={journey}>
            <option value="">Alla avstånd</option>
            <option value="nearby">I närheten</option>
            <option value="stop">Ett stopp</option>
            <option value="detour">En omväg</option>
            <option value="journey">En resa</option>
          </select>
        </label>
        <button class="reset" type="button" onclick={resetFilters} disabled={!query && !category && !journey}>
          Rensa
        </button>
      </div>
    </div>
  </div>

  {#if places.length === 0}
    <div class="empty-state">
      <span aria-hidden="true">↗</span>
      <p>Kartan är tom just nu, men anteckningsboken är öppen.</p>
      <small>Vi börjar med att granska rekommendationerna innan de får en nål.</small>
    </div>
  {:else}
    <div class="browse-layout">
      <MapPanel places={results} {selectedId} styleUrl={mapStyleUrl} onselect={selectPlace} />
      <div class="results-panel">
        <p class="result-count" aria-live="polite">
          {results.length} {results.length === 1 ? "plats" : "platser"}
        </p>
        {#if results.length === 0}
          <p class="no-results">Ingen plats matchar dina val ännu.</p>
        {:else}
          <ul class="place-grid">
            {#each results as place (place.id)}
              <li id={`place-${place.id}`}>
                <article class:place-selected={place.id === selectedId} class="place-card">
                  <p class="place-meta">
                    {place.location.locality} · {place.categories.map((value) => categoryLabels[value]).join(" / ")}
                  </p>
                  <h3>
                    <button type="button" onclick={() => selectPlace(place.id)}>{place.name}</button>
                  </h3>
                  <p>{place.summary}</p>
                  <div class="place-footer">
                    <span class="journey">{journeyLabels[place.journeyValue]}</span>
                    <ul class="sources" aria-label={`Källor för ${place.name}`}>
                      {#each place.sources as source}
                        <li><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>
                      {/each}
                    </ul>
                  </div>
                </article>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
</section>
