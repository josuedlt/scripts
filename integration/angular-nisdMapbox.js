/**
 * Required sources:
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.css' rel='stylesheet' />
 */

var app = angular.module('nisdMapbox', [])
    .directive('mapbox', () => {
        return {
            link: (scope, elem, attrs) => {
                mapboxgl.accessToken =
                    'pk.eyJ1Ijoiam9zdWVkbHQiLCJhIjoiY2l5a3hwcGFzMDAxdjJ4czd0dW1nNnpvbiJ9.118F1NOgT72aFsmG99qPYQ';

                var mapbox = scope.mapbox = new mapboxgl.Map({
                    container: elem[0],
                    style: 'mapbox://styles/mapbox/streets-v10/',
                    center: [-98.5, 29.43],
                    zoom: 10
                });

                // Script to map sources
                mapbox.mapSources = (sources) => {
                    sources.forEach((s) => {
                        if (!mapbox.getSource(s.id))
                            mapbox.addSource(s.id, { 'type': 'geojson', 'data': s.data });
                        else
                            mapbox.getSource(s.id).setData(s.data);
                    })
                }

                mapbox.mapLayers = (layers) => {
                    layers.forEach((l) => {
                        if (!mapbox.getLayer(l.id))
                            mapbox.addLayer(l);
                    })
                }
            }
        }
    })