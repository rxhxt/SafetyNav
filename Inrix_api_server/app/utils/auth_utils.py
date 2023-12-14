import requests

HASH_TOKEN = 'c2JoMWZtZTVubHxyUkZyWEtCemUyMnlVSDZnQzZuTHk0TXMzVnNUaHpSQzlqS1VlTGht'
APP_ID = 'sbh1fme5nl'
TOKEN_URL = 'https://api.iq.inrix.com/auth/v1/appToken'
OFF_PARK_URL = 'https://api.iq.inrix.com/lots/v3'
ON_PARK_URL = 'https://api.iq.inrix.com/blocks/v3'

def get_token():
    #Pass in the app_id and hash_token as query parameters
    params = {
        'appId': APP_ID,
        'hashToken': HASH_TOKEN
    }
    # Make the request to the INRIX token endpoint
    try:
        response = requests.get(TOKEN_URL, params=params)
        response.raise_for_status()  # Raise HTTPError for bad responses

        data = response.json()
        # Extract the token from the response
        # For more info on how to parse the response, see the json_parser_example.py file
        token = data['result']['token']
        return token, response.status_code

    except requests.exceptions.RequestException as e:
        return f'Request failed with error: {e}', None
    except (KeyError, ValueError) as e:
        return f'Error parsing JSON: {e}', None
    

def get_offParking():
    #Pass in the app_id and hash_token as query parameters
    token, resp = get_token()
    params = {
        'accesstoken':token,
        'point':'37.774929|-122.419418',
        'radius':5000
    }
    # Make the request to the INRIX token endpoint
    try:
        response = requests.get(OFF_PARK_URL, params=params)
        response.raise_for_status()  # Raise HTTPError for bad responses
        data = response.json()
        # print(data)
        # Extract the token from the response
        # For more info on how to parse the response, see the json_parser_example.py file
        extracted_data = []
        for item in data.get("result", []):
            extracted_data.append({
                "id": item.get("id"),
                "hrs": item.get("hrs"),
                "rateCard": item.get("rateCard"),
                "name": item.get("name"),
                "point": item.get("point"),
                "occupancy": item.get("occupancy"),
            })

        return extracted_data, response.status_code

    except requests.exceptions.RequestException as e:
        return f'Request failed with error: {e}', None
    except (KeyError, ValueError) as e:
        return f'Error parsing JSON: {e}', None

def get_onParking():
    #Pass in the app_id and hash_token as query parameters
    token, resp = get_token()
    params = {
        'accesstoken':token,
        'point':'37.774929|-122.419418',
        'radius':1000
    }
    # Make the request to the INRIX token endpoint
    try:
        response = requests.get(ON_PARK_URL, params=params)
        response.raise_for_status()  # Raise HTTPError for bad responses
        data = response.json()
        # print(data)
        # Extract the token from the response
        # For more info on how to parse the response, see the json_parser_example.py file
        extracted_data = []
        for item in data.get("result", []):
            extracted_data.append({
                "id": item.get("id"),
                "probability": item.get("probability"),
                "rateCard": item.get("rateCard"),
                "name": item.get("name"),
                # "point": item.get("point"),
                # "occupancy": item.get("occupancy"),
            })


        return extracted_data, response.status_code

    except requests.exceptions.RequestException as e:
        return f'Request failed with error: {e}', None
    except (KeyError, ValueError) as e:
        return f'Error parsing JSON: {e}', None
    