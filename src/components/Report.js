import React, { useState, useEffect } from 'react';
import { TileLayer, MapContainer as Map, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

import './Report.css';

const ReportForm = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [complaint, setComplaint] = useState('');
  const [incident, setIncident] = useState('');


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError(`Error getting location: ${error.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', {
      currentTime: currentTime.toLocaleTimeString(),
      location,
      complaint,
    });
  };

  return (
    <div className="report-container">
      <h2>File a Report</h2>
      <form onSubmit={handleSubmit} className="report-form">
        

        <p className="time-info">
          Current Time: <strong>{currentTime.toLocaleTimeString()}</strong>
        </p>
        <label htmlFor="incident">Type of incident you saw:</label>
        <textarea
          id="incident"
          name="incident"
          value={incident}
          onChange={(e) => setIncident(e.target.value)}
          required
        ></textarea>
        <label htmlFor="complaint">Your Report:</label>
        <textarea
          id="complaint"
          name="complaint"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          required
        ></textarea>

        <button type="submit">Submit Report</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {location && (
        <div className="map-container">
          <Map center={[location.latitude, location.longitude]} zoom={13} style={{ height: '200px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
              position={[location.latitude, location.longitude]}
              icon={new Icon({ iconUrl: 'path-to-your-custom-marker-icon', iconSize: [25, 41], iconAnchor: [12, 41] })}
            ></Marker>
          </Map>
          {location && (
          <div className="container-fluid justify-content-center text-muted">
            <span>
              Lat: <strong>{location.latitude.toFixed(3)}</strong> |
            </span>
            <span>
            &nbsp;Lng: <strong>{location.longitude.toFixed(3)}</strong>
            </span>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ReportForm />
    </div>
  );
}

export default App;
