from google.cloud import firestore

db = firestore.Client()

db.collection("competitors").document("Tomato").set({
    "zepto": 38,
    "blinkit": 42,
    "amazon": 40
})

print("Firestore seeded!")
    