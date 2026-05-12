import re

# Fix App.tsx
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("width: '100vw'", "width: '100%'")

with open('src/App.tsx', 'w') as f:
    f.write(content)

# Fix SimulationFlow.css title color
with open('src/components/SimulationFlow.css', 'r') as f:
    css_content = f.read()

css_content = css_content.replace("color: var(--text-h, #0f172a);", "color: #0f172a;")

with open('src/components/SimulationFlow.css', 'w') as f:
    f.write(css_content)

