import sys
import re
from lxml import etree

# Comprehensive mapping of state and territory codes to names
STATE_CODE_TO_NAME = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming',
    'DC': 'District of Columbia',
    'PR': 'Puerto Rico',
    'GU': 'Guam',
    'VI': 'U.S. Virgin Islands',
    'MP': 'Northern Mariana Islands',
    'AS': 'American Samoa',
    # Add other territories if necessary
}

def add_state_tags(svg_input_path, svg_output_path):
    # Define the SVG namespace
    SVG_NS = "http://www.w3.org/2000/svg"
    NS_MAP = {'svg': SVG_NS}

    # Parse the SVG file
    parser = etree.XMLParser(ns_clean=True, recover=True)
    try:
        tree = etree.parse(svg_input_path, parser)
    except etree.XMLSyntaxError as e:
        print(f"Error parsing SVG file: {e}")
        sys.exit(1)
    root = tree.getroot()

    # Regular expression to match IDs like 'TX01', 'CA12', etc.
    # Allowing for optional suffixes like 'TX01a' or 'TX-01'
    id_pattern = re.compile(r'^([A-Z]{2})\d{1,2}([A-Za-z]*)$')

    # Track mismatches for reporting
    mismatched_ids = []
    unmatched_ids = []
    total_matched = 0

    # Iterate over all elements with an 'id' attribute
    for element in root.xpath('//*[@id]', namespaces=NS_MAP):
        elem_id = element.get('id')
        match = id_pattern.match(elem_id)
        if match:
            state_code = match.group(1)
            suffix = match.group(2)  # Capture any suffix
            state_name = STATE_CODE_TO_NAME.get(state_code)
            if state_name:
                # Add or update the 'data-state' attribute
                element.set('data-state', state_name)
                total_matched += 1
                if suffix:
                    print(f"Element with id='{elem_id}' has suffix='{suffix}'. Added data-state='{state_name}'")
                else:
                    print(f"Added data-state='{state_name}' to element with id='{elem_id}'")
            else:
                unmatched_ids.append(elem_id)
                print(f"Warning: State code '{state_code}' not recognized for id='{elem_id}'")
        else:
            mismatched_ids.append(elem_id)
            print(f"Skipping element with id='{elem_id}' (does not match pattern)")

    # Summary of processing
    print("\n--- Processing Summary ---")
    print(f"Total elements with matching IDs: {total_matched}")
    if mismatched_ids:
        print(f"Elements with non-matching IDs ({len(mismatched_ids)}):")
        for mid in mismatched_ids[:10]:  # Show first 10 for brevity
            print(f"  - {mid}")
        if len(mismatched_ids) > 10:
            print(f"  ... and {len(mismatched_ids) - 10} more")
    if unmatched_ids:
        print(f"Elements with unrecognized state codes ({len(unmatched_ids)}):")
        for uid in unmatched_ids[:10]:
            print(f"  - {uid}")
        if len(unmatched_ids) > 10:
            print(f"  ... and {len(unmatched_ids) - 10} more")

    # Write the modified SVG to the output file
    try:
        tree.write(svg_output_path, pretty_print=True, xml_declaration=True, encoding='UTF-8')
        print(f"\nModified SVG has been saved to '{svg_output_path}'")
    except Exception as e:
        print(f"Error writing modified SVG: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python add_state_tags.py input.svg output.svg")
        sys.exit(1)

    svg_input = sys.argv[1]
    svg_output = sys.argv[2]

    add_state_tags(svg_input, svg_output)
