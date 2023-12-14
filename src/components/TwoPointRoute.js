import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import "../static/route.css"


const createTwoPointRoute = (props) => {
    const markerIcon = L.icon({
        iconUrl: markerIconPng,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
      
      const { startCoords, endCoords } = props;

    console.log("in two",startCoords, endCoords)
  const instance = L.Routing.control({
    waypoints: [
      L.latLng(startCoords?.lat, startCoords?.lng),
      L.latLng(endCoords?.lat, endCoords?.lng),
    ],
    lineOptions: {
      styles: [{ color: "#6FA1EC", weight: 4 }]
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: true,
    draggableWaypoints: true,
    fitSelectedRoutes: true,
    showAlternatives: false,
    createMarker: (i, waypoint, n) => {
        const markerOptions = {
          icon: markerIcon,
        };
        return L.marker(waypoint.latLng, markerOptions);
      },
  });

  return instance;
};

const RoutingMachine = createControlComponent(createTwoPointRoute);

export default RoutingMachine;
