import re

with open('src/components/SimulationFlow.tsx', 'r') as f:
    content = f.read()

# Replace Node 2 style
content = re.sub(
    r"    style: \{\n      transform: 'skew\(-10deg\)',\n      background: 'linear-gradient\(135deg, #fff7ed 0%, #ffedd5 100%\)',\n      border: '2px solid #fb923c',\n      color: '#9a3412',\n    \},",
    r"    style: {\n      background: 'transparent',\n      border: 'none',\n      boxShadow: 'none',\n      padding: 0,\n      width: 250,\n    },",
    content
)

# Replace Node 8 style
content = re.sub(
    r"    style: \{\n      transform: 'rotate\(45deg\)',\n      width: 100,\n      height: 100,\n      display: 'flex',\n      justifyContent: 'center',\n      alignItems: 'center',\n      background: 'linear-gradient\(145deg, #fffbeb 0%, #fef3c7 100%\)',\n      border: '2px solid #fbbf24',\n      color: '#78350f',\n      fontWeight: 600,\n    \},",
    r"    style: {\n      width: 120,\n      height: 120,\n      background: 'transparent',\n      border: 'none',\n      boxShadow: 'none',\n      padding: 0,\n    },",
    content
)

# Replace Node 10 style
content = re.sub(
    r"    style: \{\n      transform: 'skew\(-10deg\)',\n      background: 'linear-gradient\(135deg, #fefce8 0%, #fef9c3 100%\)',\n      border: '2px solid #eab308',\n      color: '#713f12',\n    \},",
    r"    style: {\n      background: 'transparent',\n      border: 'none',\n      boxShadow: 'none',\n      padding: 0,\n      width: 250,\n    },",
    content
)

# Update displayNodes for Node 8
node_8_display = r"""    if (node.id === '8') {
      return {
        ...node,
        data: {
          label: (
            <div style={{
              transform: 'rotate(45deg)',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
              border: '2px solid #fbbf24',
              color: '#78350f',
              fontWeight: 600,
              borderRadius: 8
            }}>
              <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>{nodeLabel(node)}</div>
            </div>
          ),
        },
      };
    }"""
content = re.sub(
    r"    if \(node\.id === '8'\) \{\n      return \{\n        \.\.\.node,\n        data: \{\n          label: \(\n            <div style={{ transform: 'rotate\(-45deg\)', textAlign: 'center' }}>\{nodeLabel\(node\)\}</div>\n          \),\n        \},\n      \};\n    \}",
    node_8_display,
    content
)

# Update displayNodes for Node 2 and 10
node_2_10_display = r"""    if (node.id === '2') {
      return {
        ...node,
        data: {
          label: (
            <div style={{
              transform: 'skew(-10deg)',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: '2px solid #fb923c',
              color: '#9a3412',
              padding: '10px',
              borderRadius: 8
            }}>
              <div style={{ transform: 'skew(10deg)' }}>{nodeLabel(node)}</div>
            </div>
          ),
        },
      };
    }
    if (node.id === '10') {
      return {
        ...node,
        data: {
          label: (
            <div style={{
              transform: 'skew(-10deg)',
              background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
              border: '2px solid #eab308',
              color: '#713f12',
              padding: '10px',
              borderRadius: 8
            }}>
              <div style={{ transform: 'skew(10deg)' }}>{nodeLabel(node)}</div>
            </div>
          ),
        },
      };
    }"""

content = re.sub(
    r"    if \(node\.id === '2' \|\| node\.id === '10'\) \{\n      return \{\n        \.\.\.node,\n        data: \{\n          label: <div style={{ transform: 'skew\(10deg\)' }}>\{nodeLabel\(node\)\}</div>,\n        \},\n      \};\n    \}",
    node_2_10_display,
    content
)

with open('src/components/SimulationFlow.tsx', 'w') as f:
    f.write(content)

