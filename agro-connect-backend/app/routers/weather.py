import datetime

from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..models import User

router = APIRouter(prefix="/weather", tags=["weather"])

# No external weather provider is wired up here (that needs an API key and
# real coordinates from the farmer's profile). These endpoints return
# reasonable, clearly-static placeholder data so the Weather screen renders
# correctly instead of erroring — swap in a real provider (e.g.
# OpenWeatherMap) here when you're ready.


@router.get("")
def current(user: User = Depends(get_current_user)):
    return {
        "temperature_c": 29,
        "condition": "Partly cloudy",
        "humidity_pct": 64,
        "wind_kmh": 11,
        "updated_at": datetime.datetime.utcnow().isoformat(),
        "note": "Placeholder data — connect a real weather provider to replace this.",
    }


@router.get("/forecast")
def forecast(user: User = Depends(get_current_user)):
    base = datetime.date.today()
    conditions = ["Sunny", "Partly cloudy", "Light rain", "Sunny", "Cloudy", "Sunny", "Partly cloudy"]
    return [
        {
            "date": (base + datetime.timedelta(days=i)).isoformat(),
            "condition": conditions[i % len(conditions)],
            "high_c": 30 + (i % 3),
            "low_c": 21 + (i % 2),
        }
        for i in range(7)
    ]


@router.get("/alerts")
def alerts(user: User = Depends(get_current_user)):
    return []
