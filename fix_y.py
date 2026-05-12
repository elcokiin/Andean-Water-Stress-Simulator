import re

with open('src/components/SimulationFlow.tsx', 'r') as f:
    content = f.read()

def replace_pos(node_id, old_y, new_y):
    global content
    pattern = rf"(id: '{node_id}',[\s\S]*?position: {{ x: \d+, )y: {old_y} (}})"
    content = re.sub(pattern, rf"\g<1>y: {new_y} \g<2>", content)

replace_pos('2', 100, 130)
replace_pos('3', 200, 270)
replace_pos('4', 280, 400)
replace_pos('5', 360, 530)
replace_pos('6', 440, 670)
replace_pos('7', 540, 810)
replace_pos('8', 640, 970)
replace_pos('9', 420, 620) 
replace_pos('10', 800, 1170)
replace_pos('11', 900, 1320)

with open('src/components/SimulationFlow.tsx', 'w') as f:
    f.write(content)

