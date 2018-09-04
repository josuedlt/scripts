/**
 * Required sources:
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.css' rel='stylesheet' />
 */

var app = angular.module('nisdMapbox', [])
    .directive('mapbox', () => {
        return {
            link: (scope, elem, attrs) => {
                
            }
        }
    })