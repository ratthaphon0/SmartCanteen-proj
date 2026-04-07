import json
import cv2
import numpy as np

def generate():
    # Target frame is 1280 x 720
    # Wide layout mapping
    src_pts = np.array([[0, 0], [1200, 0], [1200, 1000], [0, 1000]], dtype=np.float32)
    # The back row needs to be extremely squeezed to simulate the perspective curve.
    dst_pts = np.array([
        [280, 100], [1000, 100],  # Top edge (far back of canteen) is heavily squeezed horizontally and pushed up
        [1280, 720], [0, 720]     # Bottom edge (camera front) is wide
    ], dtype=np.float32)
    
    H = cv2.getPerspectiveTransform(src_pts, dst_pts)
    
    def transform(x, y):
        pt = np.array([[[x, y]]], dtype=np.float32)
        t = cv2.perspectiveTransform(pt, H)
        return [int(t[0][0][0]), int(t[0][0][1])]
        
    tables = []
    cols = 4 
    rows = 14 # Extended to 14 rows to reach the far back!
    
    mg_y = 10
    row_h = 1000.0 / rows
    
    for r in range(rows):
        y1 = r * row_h + mg_y
        y2 = (r + 1) * row_h - mg_y
        for c in range(cols):
            wing = "LW" if c < 2 else "RW"
            table_id = f"{wing}-R{r+1}-C{c+1}"
            
            # 4 Columns with a massive aisle in the middle (between Col 1 and Col 2)
            if c == 0: x1, x2 = 0, 250
            elif c == 1: x1, x2 = 300, 550
            elif c == 2: x1, x2 = 650, 900
            elif c == 3: x1, x2 = 950, 1200
                
            corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
            table = {"table_id": table_id, "table_roi": [transform(x, y) for x, y in corners], "seats": []}
            
            # Seat splitting
            s1_c = [[x1, y1], [x1+(x2-x1)/2, y1], [x1+(x2-x1)/2, y2], [x1, y2]]
            s2_c = [[x1+(x2-x1)/2, y1], [x2, y1], [x2, y2], [x1+(x2-x1)/2, y2]]
            table["seats"].extend([
                {"seat_id": f"{table_id}-S1", "roi": [transform(x, y) for x, y in s1_c]},
                {"seat_id": f"{table_id}-S2", "roi": [transform(x, y) for x, y in s2_c]}
            ])
            tables.append(table)
            
    with open("services/cv-engine/roi_config.json", "w") as f:
        json.dump({"camera_id": "canteen_demo", "tables": tables}, f, indent=4)
        
    print(f"Generated 14 rows, total 112 seats. Extends deep into the perspective horizon.")

generate()
