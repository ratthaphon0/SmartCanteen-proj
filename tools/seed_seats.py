import json
import os

roi_path = os.path.join(os.path.dirname(__file__), "..", "services", "cv-engine", "roi_config.json")
with open(roi_path, "r") as f:
    config = json.load(f)

sql_lines = [
    "TRUNCATE TABLE seat_history CASCADE;",
    "TRUNCATE TABLE seats CASCADE;"
]

for table in config.get("tables", []):
    table_id = table["table_id"]
    for seat in table.get("seats", []):
        seat_id = seat["seat_id"]
        zone = "A" if "LW" in seat_id else "B"
        sql_lines.append(f"INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('{seat_id}', '{table_id}', '{zone}', 'vacant');")

output_path = os.path.join(os.path.dirname(__file__), "seed_seats.sql")
with open(output_path, "w") as f:
    f.write("\n".join(sql_lines))

print(f"Created SQL seed file with {len(sql_lines)-2} seats.")
