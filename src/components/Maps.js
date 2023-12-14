import { MapContainer, TileLayer, Circle, CircleMarker, Marker, Popup, Polygon, Rectangle, Tooltip, ScaleControl } from 'react-leaflet';
import React, { useState, useMemo, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'
import NavbarComponent from './NavbarComponent';

const SanFrancisco = [37.74638779388551,-122.42209196090698]

function TooltipCircle() {
  const [clickedCount, setClickedCount] = useState(0)
  const eventHandlers = useMemo(
    () => ({
      click() {
        setClickedCount((count) => count + 1)
      },
    }),
    [],
  )

  const clickedText =
    clickedCount === 0
      ? 'Click this Circle to change the Tooltip text'
      : `Circle click: ${clickedCount}`

  return (
    <Circle
      center={SanFrancisco}
      eventHandlers={eventHandlers}
      pathOptions={{ fillColor: 'blue' }}
      radius={200}>
      <Tooltip>{clickedText}</Tooltip>
    </Circle>
  )
}

const fetchRiskAreaData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5021/get-csv-coords');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      return result.sort((a, b) => b.score - a.score).slice(0, 500);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

const fetchOffParkingData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/getOffParking');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log(result,"OP")

      return result['message'];
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

const fetchOnParkingData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/getOnParking');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      return result['message'];
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
const Maps = () => {
    const [riskData, setRiskData] = useState([]);
    const [offParkingData, setOffParkingData] = useState([]);
    const [onParkingData, setOnParkingData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
  const [riskScore, setRiskScore] = useState(null);

    const handleLocationSubmit = async (e) => {
      e.preventDefault();
  
      // Use the selectedLocation state to fetch the risk score for the entered location
      // You can modify this part based on your API or data structure
      try {
        const response = await fetch(`YOUR_API_ENDPOINT?location=${selectedLocation}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const result = await response.json();
        setRiskScore(result.riskScore); // Modify based on your API response
      } catch (error) {
        console.error('Error fetching risk score:', error);
        setRiskScore(null);
      }
    };
    const calculateCircleOpacity = (count) => {
        // Your logic to determine the opacity based on the count
        // Here, I'm using a simple linear scale: higher count -> lower opacity
        const maxCount = 1; // You can adjust this based on your data
        const minOpacity = 0.3; // Minimum opacity
        const maxOpacity = 1; // Maximum opacity
        const opacity = 1 - (count / maxCount) * (1 - minOpacity);
        return opacity;
      };
    useEffect(() => {
        const fetchDataAndSetData = async () => {
            try {
                const result = await fetchRiskAreaData();
                setRiskData(result);
                let temp =  await fetchOffParkingData()
                console.log(temp)
                setOffParkingData(()=>{return temp})
                temp =  await fetchOnParkingData()
                setOnParkingData(()=>{return temp})
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchDataAndSetData();
    }, []);
  return (
    <div className="container-fluid ">
    <div className="row mt-4">
      <div className="col-lg-12">
        <div style={{ height: "600px", width: "100%" }}>
          <MapContainer center={SanFrancisco} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {offParkingData.map((row, index) => (
              <Marker
                key={index}
                position={[row["point"]["coordinates"][1], row["point"]['coordinates'][0]]}
                icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}
              >
                <Popup>
                  Off-Parking Information
                </Popup>
              </Marker>
            ))}
            {riskData.map((point, index) => {
              const count = point.score;
              const circleOpacity = calculateCircleOpacity(count);
              return (
                <Circle
                  key={index}
                  center={[point.lat, point.long]}
                  radius={50}
                  pathOptions={{
                    fillColor: 'red',
                    color: 'red',
                    weight: 2,
                  }}
                >
                  <Tooltip>
                    <div>
                      <strong>Risk Score:</strong> {circleOpacity.toFixed(3)} <br />
                      <strong>Cases Count:</strong> {point.count}
                    </div>
                  </Tooltip>
                </Circle>
              );
            })}
            <ScaleControl position="bottomleft" imperial={false} />
          </MapContainer>
        </div>
      </div>
    </div>
    <div className="row mt-4 justify-content-center">
        <div className="col-lg-6">
          <form onSubmit={handleLocationSubmit}>
            <div className="mb-3">
              <label htmlFor="locationInput" className="form-label">
                Enter Location:
              </label>
              <input
                type="text"
                className="form-control"
                id="locationInput"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Get Risk Score
            </button>
          </form>

          {riskScore !== null && (
            <div className="mt-3">
              <h4>Risk Score for {selectedLocation}:</h4>
              <p>{riskScore}</p>
            </div>
          )}
        </div>
      </div>
  </div>
    );
};

export default Maps;
