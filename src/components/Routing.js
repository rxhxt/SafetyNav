import React, { Component, useEffect, useState } from 'react'
import { Box, TextField, Button } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "leaflet-routing-machine";
import RoutingMachine from './TwoPointRoute';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, Tooltip, } from 'react-leaflet';


const SanFrancisco = [37.74638779388551, -122.42209196090698]


const Routing = () => {
    const [riskData, setRiskData] = useState([]);
    const [startLocation, setStartLocation] = useState(null)
    const [endLocation, setEndLocation] = useState(null)
    const [startCoordinates, setStartCoordinates] = useState(null)
    const [endCoordinates, setEndCoordinates] = useState(null)
    const [coordFlag, setCoordFlag] = useState(0)
    const [coordsList, setCoordsList ] = useState(null)
    // const [coordsToDsiplay, set]
    const [key, setKey] = useState(0); // State to manage the key

    useEffect(() => {
      setKey((prevKey) => prevKey + 1); // Increment the key when startCoords or endCoords change
    }, [startCoordinates, endCoordinates]);

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

    const handleLocationSearch = async (location) => {
        try {
            const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=dd75d582b6164089a6a68b31f88129fc`
            );

            // Assuming the first result is the most relevant
            const result = response.data.results[0];

            if (result) {
                return {
                    lat: result.geometry.lat,
                    lng: result.geometry.lng,
                }
            } else {
                console.error('Location not found');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    const setBothCoords = async () => {
        let tempStart = await handleLocationSearch(startLocation);
        setStartCoordinates(() => { return tempStart; });
        let tempEnd = await handleLocationSearch(endLocation);
        setEndCoordinates(() => { return tempEnd; });
        getIntersectionData(tempStart,tempEnd)
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDataAndSetData();
    }, []);

    const getIntersectionData = async(startPoint, endPoint) =>{
        console.log(startPoint,endPoint)
        const apiUrl = `http://localhost:5021/get-avoided-roads?startPoint=${startPoint.lat},${startPoint.lng}&endPoint=${endPoint.lat},${endPoint.lng}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
           console.log(data, "together api")
           setCoordsList(()=>{return data})
          } catch (error) {
            console.error('Error fetching data:', error);
          }

    }
   
    return (<div className="container mt-5">
    <h1 className="text-center mb-4">Routing Page</h1>
    <div className="row mb-3">
      <div className="col-md-4">
        <h4>Enter Start Location</h4>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Start"
            value={startLocation}
            onChange={(event) => setStartLocation(event.target.value)}
            fullWidth
          />
        </Box>
      </div>
      <div className="col-md-4">
        <h4>Enter End Location</h4>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="End"
            value={endLocation}
            onChange={(event) => setEndLocation(event.target.value)}
            fullWidth
          />
        </Box>
      </div>
      <div className="col-md-2 d-flex align-items-end">
        <Button variant="outlined" onClick={setBothCoords}>
          Go <ArrowForwardIosIcon fontSize="small" />
        </Button>
      </div>
    </div>
    <div className="row" style={{ height: '70vh', width: '80%' }}>
      <MapContainer doubleClickZoom={false} id="mapId" zoom={14} center={SanFrancisco}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RoutingMachine startCoords={startCoordinates} endCoords={endCoordinates} avoidedCoords={coordsList} key={key} />
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
                // fillOpacity: circleOpacity,
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
      </MapContainer>
    </div>
  </div>)
}

export default Routing;