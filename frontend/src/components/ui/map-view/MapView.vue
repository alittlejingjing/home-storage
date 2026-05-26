<template>
  <div
    ref="containerRef"
    class="map-view"
    :class="{ 'map-view--dark': theme === 'dark' }"
    :style="{ height }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type LMap = ReturnType<typeof L.map>
type LLayerGroup = ReturnType<typeof L.layerGroup>

/** 标记点 */
export interface MapMarker {
  lat: number
  lng: number
  title?: string
}

interface Props {
  /** 深色模式 */
  theme?: 'light' | 'dark'
  /** 中心点纬度 */
  centerLat?: number
  /** 中心点经度 */
  centerLng?: number
  /** 缩放级别 */
  zoom?: number
  /** 标记点列表 */
  markers?: MapMarker[]
  /** 容器高度 */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  centerLat: 39.9,
  centerLng: 116.4,
  zoom: 10,
  markers: () => [],
  height: '400px',
})

const emit = defineEmits<{
  (e: 'click', payload: { lat: number; lng: number }): void
}>()

const containerRef = ref<HTMLElement | null>(null)
let map: LMap | null = null
const markerLayer = ref<LLayerGroup | null>(null)

const amapTileUrl =
  'https://webrd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'
const subdomains = ['1', '2', '3', '4']

function initMap() {
  if (!containerRef.value) return
  map = L.map(containerRef.value, {
    center: [props.centerLat, props.centerLng],
    zoom: props.zoom,
    zoomControl: true,
  })
  L.control.zoom({ position: 'topright' }).addTo(map)
  L.tileLayer(amapTileUrl, { subdomains }).addTo(map)
  markerLayer.value = L.layerGroup().addTo(map)
  map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
    emit('click', { lat: e.latlng.lat, lng: e.latlng.lng })
  })
  updateMarkers()
}

function updateMarkers() {
  if (!markerLayer.value || !props.markers?.length) return
  markerLayer.value.clearLayers()
  const icon = L.divIcon({
    className: 'map-marker-icon',
    html: '<span class="map-marker-pin"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
  props.markers.forEach((m) => {
    const marker = L.marker([m.lat, m.lng], { icon })
      .addTo(markerLayer.value!)
    if (m.title) marker.bindTooltip(m.title, { permanent: false })
  })
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  markerLayer.value?.clearLayers()
  map?.remove()
  map = null
})

watch(
  () => [props.centerLat, props.centerLng, props.zoom] as const,
  ([lat, lng, zoom]) => {
    if (map) {
      map.setView([lat, lng], zoom)
    }
  }
)

watch(
  () => props.markers,
  () => updateMarkers(),
  { deep: true }
)
</script>

<style scoped>
.map-view {
  width: 100%;
  border-radius: 0.375rem;
  overflow: hidden;
  background: var(--muted);
}
.map-view--dark {
  filter: brightness(0.85) contrast(1.1);
}
:deep(.leaflet-control-attribution) {
  font-size: 10px;
}
</style>

<style>
.map-marker-icon {
  background: none;
  border: none;
}
.map-marker-pin {
  width: 20px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  background: var(--primary);
  transform: rotate(-45deg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
