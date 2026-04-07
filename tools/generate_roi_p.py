import json
import cv2
import numpy as np

def generate():
    # We map a top-down view to the perspective view
    w, h = 800, 1000  # Total top-down area
    
    src_pts = np.array([
        [0, 0], [w, 0],
        [w, h], [0, h]
    ], dtype=np.float32)
    
    # 640x640 frame points
    dst_pts = np.array([
        [100, 100], [540, 100],  # Top edge
        [640, 600], [0, 600]     # Bottom edge
    ], dtype=np.float32)
    
    H = cv2.getPerspectiveTransform(src_pts, dst_pts)
    
    def transform(x, y):
        pt = np.array([[[x, y]]], dtype=np.float32)
        t = cv2.perspectiveTransform(pt, H)
        return [int(t[0][0][0]), int(t[0][0][1])]
        
    tables = []
    
    # Let's say 4 columns of tables. 
    # Col 0, 1 -> Left Wing
    # Col 2, 3 -> Right Wing
    # Let's do 8 rows (from top to bottom)
    
    cols = 4
    rows = 8
    
    col_w = w / cols
    row_h = h / rows
    
    # Margin between tables
    mg_x = 20
    mg_y = 30
    
    for r in range(rows):
        for c in range(cols):
            wing = "LW" if c < 2 else "RW"
            table_id = f"{wing}-R{r+1}-C{c+1}"
            
            x1 = c * col_w + mg_x
            x2 = (c + 1) * col_w - mg_x
            y1 = r * row_h + mg_y
            y2 = (r + 1) * row_h - mg_y
            
            # The 4 corners in top-down
            corners = [
                [x1, y1], [x2, y1], [x2, y2], [x1, y2]
            ]
            t_corners = [transform(x, y) for x, y in corners]
            
            table = {
                "table_id": table_id,
                "table_roi": t_corners,
                "seats": []
            }
            
            # 2 seats per table (left and right)
            # Seat 1: left half
            s1_corners = [
                [x1, y1], [x1 + (x2-x1)/2, y1], [x1 + (x2-x1)/2, y2], [x1, y2]
            ]
            s2_corners = [
                [x1 + (x2-x1)/2, y1], [x2, y1], [x2, y2], [x1 + (x2-x1)/2, y2]
            ]
            
            table["seats"].append({
                "seat_id": f"{table_id}-S1",
                "roi": [transform(x, y) for x, y in s1_corners]
            })
            table["seats"].append({
                "seat_id": f"{table_id}-S2",
                "roi": [transform(x, y) for x, y in s2_corners]
            })
            
            tables.append(table)
            
    config = {
        "camera_id": "canteen_demo",
        "tables": tables
    }
    
    with open("/app/roi_config.json", "w") as f:
        json.dump(config, f, indent=2)
        
    print(f"Generated {len(tables)} perspective tables.")

if __name__ == "__main__":
    generate()
