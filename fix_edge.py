import re

with open('src/components/SimulationFlow.tsx', 'r') as f:
    content = f.read()

# Add targetPosition and sourcePosition to Node 9
node_9_replacement = r"""  {
    id: '9',
    targetPosition: 'bottom',
    sourcePosition: 'top',
    data: {"""

content = re.sub(r"  \{\n    id: '9',\n    data: \{", node_9_replacement, content)

with open('src/components/SimulationFlow.tsx', 'w') as f:
    f.write(content)

