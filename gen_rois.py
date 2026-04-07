import json
import cv2
import numpy as np

def generate():
    """
    Generate ROI config that covers the ENTIRE canteen visible in the 1280x720 frame.
    
    From the debug grid screenshot analysis:
    - The table area spans from roughly y=180 (back rows) to y=680 (front rows)
    - Left wing: x=120 to x=620
    - Right wing: x=660 to x=1200
    - Center aisle: x=620 to x=660
    - Total visible rows: approximately 8
    - Perspective causes back rows to be narrower horizontally
    """
    
    # We define the table grid in a virtual flat space, then warp to camera perspective
    # Virtual grid: 1200 wide x 900 tall
    virtual_w, virtual_h = 1200, 900
    
    # Source corners (flat virtual grid)
    src_pts = np.array([
        [0, 0],             # top-left
        [virtual_w, 0],     # top-right
        [virtual_w, virtual_h],  # bottom-right
        [0, virtual_h]      # bottom-left
    ], dtype=np.float32)
    
    # Destination corners in 1280x720 frame — calibrated from the debug screenshot
    # Back row (top) is compressed horizontally due to perspective
    # Front row (bottom) is wide
    dst_pts = np.array([
        [300, 170],     # top-left: back row far-left visible edge
        [900, 170],     # top-right: back row far-right visible edge
        [1200, 680],    # bottom-right: front row right edge
        [80, 680]       # bottom-left: front row left edge
    ], dtype=np.float32)
    
    H = cv2.getPerspectiveTransform(src_pts, dst_pts)
    
    def transform(x, y):
        pt = np.array([[[x, y]]], dtype=np.float32)
        t = cv2.perspectiveTransform(pt, H)
        return [int(t[0][0][0]), int(t[0][0][1])]
    
    tables = []
    cols = 4
    rows = 8  # 8 rows matches visible table rows
    
    margin_y = 8
    row_h = virtual_h / rows
    
    # Column positions in virtual space
    # Left wing: 2 tables, right wing: 2 tables, big gap in middle (aisle)
    col_defs = [
        (0, 260),       # Col 1 (left outer)
        (280, 540),     # Col 2 (left inner)
        (660, 920),     # Col 3 (right inner)
        (940, 1200),    # Col 4 (right outer)
    ]
    
    for r in range(rows):
        y1 = r * row_h + margin_y
        y2 = (r + 1) * row_h - margin_y
        
        for c in range(cols):
            wing = "LW" if c < 2 else "RW"
            table_id = f"{wing}-R{r+1}-C{c+1}"
            x1, x2 = col_defs[c]
            
            # Table corners in virtual space -> warped to camera space
            corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
            table_roi = [transform(x, y) for x, y in corners]
            
            # Split table into 2 seats (left half, right half)
            mid_x = x1 + (x2 - x1) / 2
            s1_corners = [[x1, y1], [mid_x, y1], [mid_x, y2], [x1, y2]]
            s2_corners = [[mid_x, y1], [x2, y1], [x2, y2], [mid_x, y2]]
            
            table = {
                "table_id": table_id,
                "table_roi": table_roi,
                "seats": [
                    {"seat_id": f"{table_id}-S1", "roi": [transform(x, y) for x, y in s1_corners]},
                    {"seat_id": f"{table_id}-S2", "roi": [transform(x, y) for x, y in s2_corners]},
                ]
            }
            tables.append(table)
    
    config = {"camera_id": "canteen_demo", "tables": tables}
    
    with open("services/cv-engine/roi_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    total_seats = sum(len(t["seats"]) for t in tables)
    print(f"Generated {rows} rows × {cols} cols = {len(tables)} tables, {total_seats} seats")
    print(f"Grid covers y={170} to y={680} in 1280x720 frame")

generate()
