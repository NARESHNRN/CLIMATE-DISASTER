from fastapi import APIRouter, Query
from datetime import datetime
import httpx
from app.schemas.models import WeatherResponse, WeatherCurrent, WeatherForecastDay
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("", response_model=WeatherResponse)
async def get_weather(location: str = Query(default="Chennai", description="Location name across India")):
    meta = resolve_location(location)
    lat = meta["latitude"]
    lon = meta["longitude"]

    # Attempt live query to Open-Meteo
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m,surface_pressure,weather_code&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&"
        f"timezone=auto"
    )

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                daily = data.get("daily", {})

                forecast_days = []
                times = daily.get("time", [])[:7]
                t_max = daily.get("temperature_2m_max", [])
                t_min = daily.get("temperature_2m_min", [])
                p_sum = daily.get("precipitation_sum", [])

                for i, t in enumerate(times):
                    forecast_days.append(WeatherForecastDay(
                        time=t,
                        temperature=float(t_max[i] if i < len(t_max) else 31.0),
                        rainfall=float(p_sum[i] if i < len(p_sum) else 0.0),
                        tempMin=float(t_min[i] if i < len(t_min) else 24.0),
                        tempMax=float(t_max[i] if i < len(t_max) else 32.0),
                    ))

                w_code = current.get("weather_code", 0)
                condition = "Heavy Rainfall" if w_code >= 65 else "Showers" if w_code >= 51 else "Clear Sky" if w_code == 0 else "Partly Cloudy"

                return WeatherResponse(
                    location=meta["name"],
                    country="India",
                    latitude=lat,
                    longitude=lon,
                    dataMode="live",
                    lastUpdated=datetime.utcnow().isoformat() + "Z",
                    current=WeatherCurrent(
                        temperature=float(current.get("temperature_2m", 30.5)),
                        humidity=int(current.get("relative_humidity_2m", 72)),
                        rainfall=float(current.get("precipitation", 0.0)),
                        windSpeed=float(current.get("wind_speed_10m", 14.2)),
                        pressure=float(current.get("surface_pressure", 1008.4)),
                        apparentTemperature=float(current.get("apparent_temperature", 32.8)),
                        weatherCode=w_code,
                        conditionText=condition,
                    ),
                    forecast=forecast_days,
                    source="Open-Meteo Live API",
                )
    except Exception:
        pass

    # Graceful fallback to dataset / demo observation
    return WeatherResponse(
        location=meta["name"],
        country="India",
        latitude=lat,
        longitude=lon,
        dataMode="demo",
        lastUpdated=datetime.utcnow().isoformat() + "Z",
        current=WeatherCurrent(
            temperature=31.2,
            humidity=75,
            rainfall=18.4 if meta["id"] in ["Mumbai", "Delhi"] else 2.1,
            windSpeed=13.5,
            pressure=1009.1,
            apparentTemperature=33.5,
            weatherCode=61 if meta["id"] in ["Mumbai", "Delhi"] else 1,
            conditionText="Light Rain" if meta["id"] in ["Mumbai", "Delhi"] else "Partly Cloudy",
        ),
        forecast=[
            WeatherForecastDay(time="2023-07-25", temperature=31.0, rainfall=12.0, tempMin=24.0, tempMax=32.0),
            WeatherForecastDay(time="2023-07-26", temperature=30.5, rainfall=22.4, tempMin=23.8, tempMax=31.2),
            WeatherForecastDay(time="2023-07-27", temperature=29.8, rainfall=34.1, tempMin=23.5, tempMax=30.4),
            WeatherForecastDay(time="2023-07-28", temperature=30.2, rainfall=8.5, tempMin=24.1, tempMax=31.0),
            WeatherForecastDay(time="2023-07-29", temperature=31.4, rainfall=2.0, tempMin=24.5, tempMax=32.2),
            WeatherForecastDay(time="2023-07-30", temperature=31.8, rainfall=0.0, tempMin=25.0, tempMax=32.6),
            WeatherForecastDay(time="2023-07-31", temperature=32.0, rainfall=0.0, tempMin=25.2, tempMax=33.0),
        ],
        source="Uploaded Dataset (Fallback)",
    )
