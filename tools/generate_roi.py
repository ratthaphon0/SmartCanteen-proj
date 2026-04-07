import json
import os

def create_table(table_id, start_x, start_y, width, height, seats_count):
    table = {
        "table_id": table_id,
        "table_roi": [
            [start_x, start_y],
            [start_x + width, start_y],
            [start_x + width, start_y + height],
            [start_x, start_y + height],
        ],
        "seats": []
    }
    
    seat_width = width // seats_count
    for i in range(seats_count):
        # We add some perspective by shrinking the Y size or just generic bounding boxes
        sx = start_x + (i * seat_width)
        table["seats"].append({
            "seat_id": f"{table_id}-S{i+1}",
            "roi": [
                [sx, start_y],
                [sx + seat_width - 5, start_y],
                [sx + seat_width - 5, start_y + height],
                [sx, start_y + height]
            ]
        })
    return table

def generate():
    tables = []
    
    # Left Wing (X: 50 to 300)
    for row in range(4): # 4 rows
        for col in range(2): # 2 blocks per row
            table_id = f"LW-R{row+1}-C{col+1}"
            x = 50 + (col * 130)
            y = 100 + (row * 100)
            tables.append(create_table(table_id, x, y, 120, 80, 4)) # 4 seats per table block
            
    # Right Wing (X: 350 to 600)
    for row in range(4):
        for col in range(2):
            table_id = f"RW-R{row+1}-C{col+1}"
            x = 350 + (col * 130)
            y = 100 + (row * 100)
            tables.append(create_table(table_id, x, y, 120, 80, 4))
            
    config = {
        "camera_id": "cam_canteen_demo",
        "tables": tables
    }
    
    output_path = os.path.join(os.path.dirname(__file__), "..", "services", "cv-engine", "roi_config.json")
    with open(output_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"Generated {len(tables)} tables with {len(tables)*4} seats into {output_path}")

if __name__ == "__main__":
    generate()
