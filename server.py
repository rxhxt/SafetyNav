from flask import Flask, render_template, request, jsonify
import requests
import pandas as pd
import json
from flask_cors import CORS
from geopy.distance import geodesic
import geopy
import osmapi
app = Flask(__name__)
CORS(app, resources={r"/get-avoided-roads": {"origins": "*"},r"/get-intersections": {"origins": "*"},r"/get-csv-coords": {"origins": "*"}})

def get_route_coordinates_osm(origin, destination):
    overpass_url = "http://overpass-api.de/api/interpreter"

    # Query to get the route between origin and destination
    query = f"""
    [out:json];
    (
        node["highway"](around: 100, {origin});
        node["highway"](around: 100, {destination});
    );
    out body;
    """

    # Make the request to Overpass API
    response = requests.post(overpass_url, data=query)

    # Parse the JSON response
    data = response.json()

    # Extract and print the coordinates of points along the route
    coordinates = [(node["lat"], node["lon"]) for node in data["elements"]]

    return coordinates

def find_close_coordinates(route_coordinates, dataframe, threshold=50):
    close_coordinates = []

    for route_coord in route_coordinates:
        for _, row in dataframe.iterrows():
            point_coord = (row['latitude'], row['longitude'])
            
            # Calculate the distance between route_coord and point_coord
            distance = geodesic(route_coord, point_coord).meters

            # You can adjust the distance threshold as needed
            if distance < threshold:
                print("CLose ",route_coord, point_coord )
                close_coordinates.append({"route":route_coord,"riskPoint":point_coord})

    return close_coordinates


def find_alternate_route(start_point, end_point, avoid_coordinates):
    overpass = osmapi.OsmApi()

    # Query to get the route between start_point and end_point, avoiding specific nodes
    query = f"""
    [out:json];
    (
        node["highway"](around: 100, {start_point});
        node["highway"](around: 100, {end_point});
    );
    out body;
    """

    # Make the request to Overpass API using the requests library
    response = requests.get('http://overpass-api.de/api/interpreter', params={'data': query})

    # Parse the JSON response
    data = response.json()

    # Extract and print the coordinates of points along the route
    route_coordinates = [(node['lat'], node['lon']) for node in data['elements']]

    # Find an alternate route that avoids specified coordinates
    for avoid_coord in avoid_coordinates.itertuples(index=False):
        for i, coord in enumerate(route_coordinates):
            # Calculate the distance between route_coord and avoid_coord
            distance = geopy.distance.geodesic(coord, (avoid_coord.latitude, avoid_coord.longitude)).meters

            # If the distance is below a certain threshold, remove the point from the route
            if distance < 50:  # Set your desired distance threshold in meters
                route_coordinates.pop(i)

    return route_coordinates

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/get-data', methods=['GET'])
def get_data_for_dates():
    try:
        # Get parameters from the query string
        start_date = request.args.get('startdate')
        end_date = request.args.get('enddate')

        # Set up the API request
        url = "https://data.sfgov.org/resource/wg3w-h783.json"
        params = {
            "$where": f"incident_datetime between '{start_date}T00:00:00' and '{end_date}T23:59:59'",
        }

        # Make the API request
        response = requests.get(url, params=params)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({"error": f"Error: {response.status_code} - {response.text}"}), 500

    except requests.RequestException as e:
        return jsonify({"error": f"Request error: {e}"}), 500

@app.route('/get-csv-coords')
def get_all_coords():
    df = pd.read_csv("combined_risk_score.csv")
    return json.dumps([{"lat":i,"long":j,"score":k,"count":l } for i,j,k,l in zip(df["latitude"],df["longitude"],df["avg_score"],df["count"])])

@app.route("/get-intersections", methods=["GET"])
def get_intersections():
    try:
        # Get parameters from the query string
        start_point = request.args.get('startPoint')
        end_point = request.args.get('endPoint')
        print(start_point,end_point)
        route_coordinates_osm = get_route_coordinates_osm(start_point, end_point)
        df = pd.read_csv("combined_risk_score.csv")
        return json.dumps(find_close_coordinates(route_coordinates_osm,df))
    except requests.RequestException as e:
        return jsonify({"error": f"Request error: {e}"}), 500

@app.route("/get-avoided-roads", methods=["GET"])
def get_avoided_roads():
    try:
        # Get parameters from the query string
        start_point = request.args.get('startPoint')
        end_point = request.args.get('endPoint')
        print(start_point,end_point)
        # route_coordinates_osm = get_route_coordinates_osm(start_point, end_point)
        df = pd.read_csv("combined_risk_score.csv")
        return json.dumps(find_alternate_route(start_point,end_point,df))
    except requests.RequestException as e:
        return jsonify({"error": f"Request error: {e}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5021)

        

         
