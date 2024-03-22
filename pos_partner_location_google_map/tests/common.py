# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

RESPONSE_MAP = {
    "result": {
        "address_components": [
            {"long_name": "277", "short_name": "277", "types": ["street_number"]},
            {
                "long_name": "Bedford Avenue",
                "short_name": "Bedford Ave",
                "types": ["route"],
            },
            {
                "long_name": "Williamsburg",
                "short_name": "Williamsburg",
                "types": ["neighborhood", "political"],
            },
            {
                "long_name": "Brooklyn",
                "short_name": "Brooklyn",
                "types": ["sublocality", "political"],
            },
            {
                "long_name": "Kings",
                "short_name": "Kings",
                "types": ["administrative_area_level_2", "political"],
            },
            {
                "long_name": "New York",
                "short_name": "NY",
                "types": ["administrative_area_level_1", "political"],
            },
            {
                "long_name": "United States",
                "short_name": "US",
                "types": ["country", "political"],
            },
            {"long_name": "11211", "short_name": "11211", "types": ["postal_code"]},
        ],
        "formatted_address": "277 Bedford Avenue, Brooklyn, NY 11211, USA",
        "geometry": {
            "location": {"lat": 40.714232, "lng": -73.9612889},
            "location_type": "ROOFTOP",
            "viewport": {
                "northeast": {"lat": 40.7155809802915, "lng": -73.9599399197085},
                "southwest": {"lat": 40.7128830197085, "lng": -73.96263788029151},
            },
        },
        "place_id": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
        "types": ["street_address"],
    },
    "status": "OK",
}

FORMATTED_RESULT = {
    "street_number": "277",
    "route": "Bedford Ave",
    "neighborhood": "Williamsburg",
    "political": "United States",
    "sublocality": "Brooklyn",
    "administrative_area_level_2": {"code": "Kings", "name": "Kings"},
    "administrative_area_level_1": {"code": "NY", "name": "New York"},
    "country": {"code": "US", "name": "United States"},
    "postal_code": "11211",
}
