import os
import re

# Specify the directory containing SVG files
directory = 'states/'  # Replace with your actual path

# Regular expression pattern to match the <text>...</text> block
pattern = re.compile(
    r'<text\s+id="credit-text-svg"[^>]*>.*?</text>',
    re.DOTALL | re.IGNORECASE
)

# Iterate through each file in the directory
for filename in os.listdir(directory):
    if filename.lower().endswith('.svg'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove the <text>...</text> block
        new_content = pattern.sub('', content)
        
        # Optionally, clean up any extra whitespace before </svg>
        new_content = re.sub(r'\s+</svg>', '</svg>', new_content)
        
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f'Processed {filename}')
