"""
Optional: creates one ready-to-use account per role, plus a few sample crop
listings, so there's something to look at and log into immediately instead
of starting from a totally empty database.

Run once, from the project root, after installing dependencies:

    python seed.py

Safe to re-run — it skips creating anything that already exists.
"""
import json

from app.database import Base, SessionLocal, engine
from app.models import Crop, User
from app.security import hash_password

Base.metadata.create_all(bind=engine)

ACCOUNTS = [
    dict(name="Demo Farmer", email="farmer@example.com", phone="9000000001", role="farmer",
         extra={"village": "Rampur", "district": "Meerut", "state": "Uttar Pradesh", "pincode": "250001"}),
    dict(name="Demo Buyer", email="buyer@example.com", phone="9000000002", role="buyer",
         extra={"business_name": "Fresh Mart", "city": "Delhi", "state": "Delhi"}),
    dict(name="Demo Expert", email="expert@example.com", phone="9000000003", role="expert",
         extra={"qualification": "M.Sc Agriculture", "specialisation": "Plant pathology"}),
    dict(name="Demo Admin", email="admin@example.com", phone="9000000004", role="admin", extra={}),
]

PASSWORD = "Password123"

SAMPLE_CROPS = [
    dict(name="Tomato", variety="Hybrid", category="Vegetable", price=22, unit="kg", quantity=500, grade="Grade A", organic=False),
    dict(name="Wheat", variety="Sharbati", category="Grain", price=28, unit="kg", quantity=2000, grade="Grade A", organic=False),
    dict(name="Potato", variety="Kufri Jyoti", category="Vegetable", price=15, unit="kg", quantity=1200, grade="Grade B", organic=True),
]


def run():
    db = SessionLocal()
    try:
        created_farmer = None
        for acc in ACCOUNTS:
            existing = db.query(User).filter(User.email == acc["email"]).first()
            if existing:
                if acc["role"] == "farmer":
                    created_farmer = existing
                print(f"- {acc['role']:8} {acc['email']} already exists, skipping.")
                continue
            user = User(
                name=acc["name"], email=acc["email"], phone=acc["phone"], role=acc["role"],
                password_hash=hash_password(PASSWORD), verified=(acc["role"] == "farmer"),
                profile_extra=json.dumps(acc["extra"]),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            if acc["role"] == "farmer":
                created_farmer = user
            print(f"+ created {acc['role']:8} {acc['email']} / password: {PASSWORD}")

        if created_farmer and db.query(Crop).filter(Crop.farmer_id == created_farmer.id).count() == 0:
            for c in SAMPLE_CROPS:
                db.add(Crop(farmer_id=created_farmer.id, **c))
            db.commit()
            print(f"+ added {len(SAMPLE_CROPS)} sample crop listings for {created_farmer.email}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
    print("\nDone. Log in with any of the emails above and password:", PASSWORD)
