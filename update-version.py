import os
import re
from datetime import datetime

version = datetime.now().strftime("%Y%m%d%H%M%S")

html_files = [f for f in os.listdir() if f.endswith(".html")]

patterns = {
    "css": re.compile(r'(href="[^"]+\.css)(\?v=\d+)?(")'),
    "js": re.compile(r'(src="[^"]+\.js)(\?v=\d+)?(")')
}

for filename in html_files:
    with open(filename, "r", encoding="utf-8") as file:
        content = file.read()
    
    for kind, pattern in patterns.items():
        content = pattern.sub(rf'\1?v={version}\3', content)

    with open(filename, "w", encoding="utf-8") as file:
        file.write(content)
    
    print(f" Updated version in {filename} > v={version}")

print("Done updating, push changes to GitHub")