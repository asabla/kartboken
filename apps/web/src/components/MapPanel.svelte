<script lang="ts">
  import type { GeoJSONSource, Map as MapInstance } from "maplibre-gl";
  import mapStylesheetUrl from "maplibre-gl/dist/maplibre-gl.css?url";
  import { onMount } from "svelte";

  import type { Place } from "@kartboken/catalog/types";

  interface Props {
    places: Place[];
    selectedId: string;
    styleUrl: string;
    onselect: (id: string) => void;
  }

  let { places, selectedId, styleUrl, onselect }: Props = $props();
  let container: HTMLDivElement;
  let map: MapInstance | undefined;
  let status = $state<"waiting" | "loading" | "ready" | "error">("waiting");

  function loadMapStylesheet(): Promise<void> {
    const existing = document.querySelector<HTMLLinkElement>("link[data-maplibre-styles]");
    if (existing?.sheet) return Promise.resolve();

    const link = existing ?? document.createElement("link");
    link.rel = "stylesheet";
    link.href = mapStylesheetUrl;
    link.dataset.maplibreStyles = "";
    if (!existing) document.head.append(link);

    return new Promise((resolve, reject) => {
      link.addEventListener("load", () => resolve(), { once: true });
      link.addEventListener(
        "error",
        () => {
          link.remove();
          reject(new Error("Map stylesheet failed to load"));
        },
        { once: true },
      );
    });
  }

  const collection = $derived({
    type: "FeatureCollection" as const,
    features: places.map((place) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [place.location.coordinates.longitude, place.location.coordinates.latitude],
      },
      properties: {
        id: place.id,
        name: place.name,
        selected: place.id === selectedId,
      },
    })),
  });

  function updateSource(): void {
    const source = map?.getSource("places") as GeoJSONSource | undefined;
    source?.setData(collection);
    if (!selectedId) fitPlaces();
  }

  function fitPlaces(): void {
    if (!map || places.length === 0) return;
    const longitudes = places.map((place) => place.location.coordinates.longitude);
    const latitudes = places.map((place) => place.location.coordinates.latitude);
    map.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
      ],
      {
        padding: 70,
        maxZoom: 11,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500,
      },
    );
  }

  async function initializeMap(): Promise<void> {
    if (status === "loading" || status === "ready") return;
    map?.remove();
    map = undefined;
    status = "loading";

    try {
      const [mapModule] = await Promise.all([import("maplibre-gl"), loadMapStylesheet()]);
      map = new mapModule.Map({
        container,
        style: styleUrl,
        center: [15.2, 62],
        zoom: 3.4,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      map.addControl(new mapModule.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        map?.addSource("places", {
          type: "geojson",
          data: collection,
          cluster: true,
          clusterMaxZoom: 11,
          clusterRadius: 44,
        });
        map?.addLayer({
          id: "place-clusters",
          type: "circle",
          source: "places",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#1e2820",
            "circle-radius": ["step", ["get", "point_count"], 18, 10, 23, 30, 28],
            "circle-stroke-color": "#f3eddf",
            "circle-stroke-width": 3,
          },
        });
        map?.addLayer({
          id: "place-cluster-count",
          type: "symbol",
          source: "places",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
          },
          paint: { "text-color": "#f3eddf" },
        });
        map?.addLayer({
          id: "place-points",
          type: "circle",
          source: "places",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["case", ["==", ["get", "selected"], true], "#1e2820", "#d9553f"],
            "circle-radius": ["case", ["==", ["get", "selected"], true], 11, 8],
            "circle-stroke-color": "#f3eddf",
            "circle-stroke-width": 3,
          },
        });

        map?.on("click", "place-points", (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === "string") onselect(id);
        });
        map?.on("click", "place-clusters", async (event) => {
          const feature = event.features?.[0];
          const clusterId = feature?.properties?.cluster_id;
          if (!feature || typeof clusterId !== "number") return;
          const source = map?.getSource("places") as GeoJSONSource | undefined;
          const zoom = await source?.getClusterExpansionZoom(clusterId);
          if (zoom !== undefined && feature.geometry.type === "Point") {
            const camera = { center: feature.geometry.coordinates as [number, number], zoom };
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) map?.jumpTo(camera);
            else map?.easeTo(camera);
          }
        });
        for (const layer of ["place-points", "place-clusters"]) {
          map?.on("mouseenter", layer, () => {
            if (map) map.getCanvas().style.cursor = "pointer";
          });
          map?.on("mouseleave", layer, () => {
            if (map) map.getCanvas().style.cursor = "";
          });
        }

        status = "ready";
        fitPlaces();
      });
      map.once("error", () => {
        if (status === "loading") {
          map?.remove();
          map = undefined;
          status = "error";
        }
      });
    } catch {
      status = "error";
    }
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void initializeMap();
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(container);
    return () => {
      observer.disconnect();
      map?.remove();
    };
  });

  $effect(() => {
    collection;
    if (status === "ready") updateSource();
  });

  $effect(() => {
    const selected = places.find((place) => place.id === selectedId);
    if (status === "ready" && map && selected) {
      const camera = {
        center: [selected.location.coordinates.longitude, selected.location.coordinates.latitude],
        zoom: Math.max(map.getZoom(), 9),
      } as const;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) map.jumpTo(camera);
      else map.easeTo(camera);
    }
  });
</script>

<div class="map-shell" role="region" aria-label="Karta över rekommenderade platser">
  <div class="map" bind:this={container}></div>
  {#if status === "waiting" || status === "loading"}
    <p class="map-status" role="status">Kartan vecklas ut…</p>
  {:else if status === "error"}
    <div class="map-status map-error" role="status">
      <strong>Kartan kunde inte laddas.</strong>
      <span>Alla platser finns fortfarande i listan.</span>
      <button type="button" onclick={() => void initializeMap()}>Försök igen</button>
    </div>
  {/if}
</div>
