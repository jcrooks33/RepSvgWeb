import os
from lxml import etree

def filter_state_svgs(input_folder, output_folder):
    """
    For each SVG file in `input_folder`, keep only <path> elements whose 'id'
    starts with the state's abbreviation (inferred from the SVG filename).
    Writes filtered SVGs to `output_folder`.
    """
    STATE_ABBREVIATIONS = {
    "alabama": "AL",
    "alaska": "AK",
    "arizona": "AZ",
    "arkansas": "AR",
    "california": "CA",
    "colorado": "CO",
    "connecticut": "CT",
    "delaware": "DE",
    "florida": "FL",
    "georgia": "GA",
    "hawaii": "HI",
    "idaho": "ID",
    "illinois": "IL",
    "indiana": "IN",
    "iowa": "IA",
    "kansas": "KS",
    "kentucky": "KY",
    "louisiana": "LA",
    "maine": "ME",
    "maryland": "MD",
    "massachusetts": "MA",
    "michigan": "MI",
    "minnesota": "MN",
    "mississippi": "MS",
    "missouri": "MO",
    "montana": "MT",
    "nebraska": "NE",
    "nevada": "NV",
    "new-hampshire": "NH",
    "new-jersey": "NJ",
    "new-mexico": "NM",
    "new-york": "NY",
    "north-carolina": "NC",
    "north-dakota": "ND",
    "ohio": "OH",
    "oklahoma": "OK",
    "oregon": "OR",
    "pennsylvania": "PA",
    "rhode-island": "RI",
    "south-carolina": "SC",
    "south-dakota": "SD",
    "tennessee": "TN",
    "texas": "TX",
    "utah": "UT",
    "vermont": "VT",
    "virginia": "VA",
    "washington": "WA",
    "west-virginia": "WV",
    "wisconsin": "WI",
    "wyoming": "WY",
}
    # Ensure the output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Iterate over all files in the input folder
    for filename in os.listdir(input_folder):
        # We only care about .svg files
        if filename.lower().endswith(".svg"):
            # Derive the state abbreviation from the filename
            # e.g., "AL.svg" -> state_abbr = "AL"
            state_abbr = STATE_ABBREVIATIONS[os.path.splitext(filename)[0]]

            # Full path to the input SVG
            input_path = os.path.join(input_folder, filename)

            # Parse the SVG with lxml
            tree = etree.parse(input_path)
            root = tree.getroot()

            # Handle default SVG namespace if present
            # E.g., root.nsmap might look like {None: "http://www.w3.org/2000/svg"}
            # We'll construct the correct XPath for <path> elements
            default_ns = root.nsmap.get(None)
            if default_ns:
                path_tag = f"{{{default_ns}}}path"
            else:
                path_tag = "path"

            # Find all <path> elements
            path_elements = root.findall(f".//{path_tag}")

            for path_el in path_elements:
                path_id = path_el.get("id", "")

                # Here we check whether the id starts with the state's abbreviation
                # If you also want to keep a path called "border", add that condition:
                #   if not (path_id.startswith(state_abbr) or path_id.lower().startswith("border")):
                
                if not path_id.startswith(state_abbr):
                    # Remove the path from its parent
                    parent = path_el.getparent()
                    if parent is not None:
                        parent.remove(path_el)

            # Write the cleaned SVG to output folder
            output_path = os.path.join(output_folder, filename)
            tree.write(output_path, 
                       pretty_print=True,     # make the XML readable
                       xml_declaration=True,  # include the XML declaration
                       encoding="utf-8")

# Example usage:
if __name__ == "__main__":
    input_dir = "states"   # folder containing your 50 state SVGs
    output_dir = "states2" # output folder for the cleaned SVGs
    filter_state_svgs(input_dir, output_dir)
