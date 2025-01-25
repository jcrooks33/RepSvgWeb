import os
import xml.etree.ElementTree as ET

def update_svg_stroke(svg_folder):
    # If your SVGs contain a default namespace like 'http://www.w3.org/2000/svg'
    # you may need to register it so ElementTree handles it cleanly.
    # This helps preserve the namespace in the output.
    ET.register_namespace('', "http://www.w3.org/2000/svg")

    for filename in os.listdir(svg_folder):
        if filename.lower().endswith(".svg"):
            file_path = os.path.join(svg_folder, filename)

            # Parse the SVG file
            tree = ET.parse(file_path)
            root = tree.getroot()

            # Option A: Update every element that already has a stroke attribute
            for elem in root.findall(".//*[@stroke]"):
                elem.set("stroke", "rgb(209, 219, 221)")
                elem.set("stroke-width", "0.3")

            # ------------------------------------------------------------------
            # Option B (commented out): Force *all* <path> elements to have stroke
            # ns = {"svg": "http://www.w3.org/2000/svg"}
            # for path in root.findall(".//svg:path", ns):
            #     path.set("stroke", "rgb(209, 219, 221)")
            #     path.set("stroke-width", "0.3")
            # ------------------------------------------------------------------

            # Write the modified SVG back to disk
            tree.write(file_path, encoding="utf-8", xml_declaration=True)

if __name__ == "__main__":
    svg_folder = "states"  # <-- Update this!
    update_svg_stroke(svg_folder)
