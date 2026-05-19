import tkinter as tk

# --- CONFIGURATION ---
# Target LCD Specs (The display you are considering)
LCD_RES_W = 240    # Width in pixels
LCD_RES_H = 135    # Height in pixels
LCD_DIAGONAL = 1.14 # Diagonal size in inches

# Your Laptop Monitor Specs
# Tip: On Windows, right-click Desktop > Display Settings > Scale & Layout 
# to estimate. Standard is often 96 or 120 DPI.
# If you don't know, start with 96.
MONITOR_DPI = 255 
# ---------------------

def calculate_window_size():
    # Calculate screen aspect ratio for diagonal
    # Diagonal^2 = Width^2 + Height^2
    # This isn't needed for the window size itself, but good to know for context.
    
    # We want the window to physically represent the LCD size in inches.
    # Pixels needed = Physical Size (Inches) * Monitor DPI
    
    # Calculate physical width/height of the LCD using diagonal
    aspect_ratio = LCD_RES_W / LCD_RES_H
    # Width^2 + (Width/AR)^2 = Diag^2
    phys_w = (LCD_DIAGONAL**2 / (1 + (1/aspect_ratio**2)))**0.5
    phys_h = phys_w / aspect_ratio
    
    # Convert to pixels for the monitor
    win_w = int(phys_w * MONITOR_DPI)
    win_h = int(phys_h * MONITOR_DPI)
    return win_w, win_h

root = tk.Tk()
root.title(f"Mockup: {LCD_RES_W}x{LCD_RES_H} @ {LCD_DIAGONAL}\"")

width, height = calculate_window_size()
root.geometry(f"{width}x{height}")

# Visual indicator of resolution
label = tk.Label(root, text=f"{LCD_RES_W}x{LCD_RES_H}\nPixel Density Preview", 
                 bg="black", fg="white", font=("Arial", 12))
label.pack(expand=True, fill="both")

root.mainloop()