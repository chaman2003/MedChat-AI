import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { getGraphData } from '../api';

// Node colors by type
const NODE_COLORS = {
  Patient: '#4a9eff',
  Disease: '#ff6b6b',
  Drug: '#51cf66',
  Symptom: '#ffd43b',
  Allergen: '#ff922b',
  LabResult: '#845ef7',
  Doctor: '#20c997'
};

// Relationship colors
const EDGE_COLORS = {
  HAS_DISEASE: '#ff6b6b',
  CURRENTLY_TAKING: '#51cf66',
  TREATS: '#69db7c',
  PRESENTS_WITH: '#ffd43b',
  ALLERGIC_TO: '#ff922b',
  HAS_LAB_RESULT: '#845ef7',
  PRESCRIBED_BY: '#20c997',
  CAUSES: '#f783ac',
  INTERACTS_WITH: '#ff8787',
  default: '#868e96'
};

export default function GraphVisualization() {
  const navigate = useNavigate();
  const fgRef = useRef();
  const containerRef = useRef();
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    Patient: true,
    Disease: true,
    Drug: true,
    Symptom: true,
    Allergen: true,
    LabResult: true
  });

  // Stats
  const [stats, setStats] = useState({ nodes: 0, edges: 0, types: {} });

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Handle window resize and initial dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = rect.width || containerRef.current.clientWidth || window.innerWidth - 280;
        const newHeight = rect.height || containerRef.current.clientHeight || window.innerHeight - 60;
        
        if (newWidth > 0 && newHeight > 0) {
          setDimensions({ width: newWidth, height: newHeight });
          setIsReady(true);
        }
      }
    };

    // Initial call with delay to ensure DOM is ready
    const timeoutId = setTimeout(updateDimensions, 100);
    
    // Also update on window resize
    window.addEventListener('resize', updateDimensions);
    
    // Use ResizeObserver for more accurate dimension tracking
    let resizeObserver;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [loading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        handleCenter();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Fetch graph data using API module
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const data = await getGraphData();

        if (data.success) {
          setGraphData(data.graph);
          setStats({
            nodes: data.graph.nodes.length,
            edges: data.graph.links.length,
            types: data.nodeTypes || {}
          });
        } else {
          setError(data.error || 'Failed to load graph');
        }
      } catch (err) {
        setError(`Connection error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, []);

  // Center the graph after data loads and dimensions are ready
  useEffect(() => {
    if (isReady && graphData.nodes.length > 0 && fgRef.current) {
      // Give the force simulation time to settle
      const timerId = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 80);
        }
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [isReady, graphData.nodes.length]);

  // Filter graph data based on selected types
  const filteredData = React.useMemo(() => {
    const activeTypes = Object.entries(filters)
      .filter(([_, active]) => active)
      .map(([type]) => type);

    const filteredNodes = graphData.nodes.filter(node => 
      activeTypes.includes(node.type)
    );

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => 
      nodeIds.has(link.source?.id || link.source) && 
      nodeIds.has(link.target?.id || link.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, filters]);

  // Toggle dark mode
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode');
  };

  // Node click handler
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    // Center on node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 500);
      fgRef.current.zoom(2, 500);
    }
  }, []);

  // Node hover handlers
  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node);
    document.body.style.cursor = node ? 'pointer' : 'default';
  }, []);

  // Custom node rendering
  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.label || node.name || node.id;
    const fontSize = 12 / globalScale;
    const nodeSize = node.type === 'Patient' ? 10 : 7;
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize + (isSelected || isHovered ? 3 : 0), 0, 2 * Math.PI);
    ctx.fillStyle = NODE_COLORS[node.type] || '#999';
    ctx.fill();

    // Border for selected/hovered
    if (isSelected || isHovered) {
      ctx.strokeStyle = darkMode ? '#fff' : '#000';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Label
    ctx.font = `${isSelected || isHovered ? 'bold ' : ''}${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = darkMode ? '#e6edf3' : '#1a202c';
    ctx.fillText(label, node.x, node.y + nodeSize + 2);
  }, [selectedNode, hoveredNode, darkMode]);

  // Custom link rendering
  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;
    
    if (!start.x || !end.x) return;

    const relType = link.relationship || link.type || 'default';
    ctx.strokeStyle = EDGE_COLORS[relType] || EDGE_COLORS.default;
    ctx.lineWidth = 1.5 / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrow
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 8 / globalScale;
    const nodeRadius = 8;
    const arrowX = end.x - Math.cos(angle) * nodeRadius;
    const arrowY = end.y - Math.sin(angle) * nodeRadius;

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = EDGE_COLORS[relType] || EDGE_COLORS.default;
    ctx.fill();
  }, []);

  // Control handlers
  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 300);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 300);
  const handleCenter = () => fgRef.current?.zoomToFit(400);
  const handleRefresh = () => window.location.reload();

  if (loading) {
    return (
      <div className="graph-page">
        <div className="graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading Neo4j Graph Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="graph-page">
        <div className="graph-error">
          <h2>⚠️ Error Loading Graph</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>← Back to Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-page">
      {/* Header */}
      <header className="graph-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Chat
          </button>
          <h1>🕸️ Neo4j Graph Visualization</h1>
        </div>
        <div className="header-right">
          <div className="graph-stats">
            <span>📊 {filteredData.nodes.length} nodes</span>
            <span>🔗 {filteredData.links.length} edges</span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="graph-layout">
        {/* Sidebar - Filters & Legend */}
        <aside className="graph-sidebar">
          <div className="sidebar-section">
            <h3>🎛️ Node Filters</h3>
            <div className="filter-list">
              {Object.entries(filters).map(([type, active]) => (
                <label key={type} className="filter-item">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => setFilters(f => ({ ...f, [type]: !f[type] }))}
                  />
                  <span 
                    className="filter-color" 
                    style={{ backgroundColor: NODE_COLORS[type] }}
                  ></span>
                  <span className="filter-label">{type}</span>
                  <span className="filter-count">
                    ({graphData.nodes.filter(n => n.type === type).length})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>🔗 Relationship Legend</h3>
            <div className="legend-list">
              {Object.entries(EDGE_COLORS).filter(([k]) => k !== 'default').map(([rel, color]) => (
                <div key={rel} className="legend-item">
                  <span className="legend-line" style={{ backgroundColor: color }}></span>
                  <span className="legend-label">{rel.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>🎮 Controls</h3>
            <div className="control-buttons">
              <button onClick={handleZoomIn}>🔍+ Zoom In</button>
              <button onClick={handleZoomOut}>🔍- Zoom Out</button>
              <button onClick={handleCenter}>🎯 Fit View</button>
              <button onClick={handleRefresh}>🔄 Refresh</button>
            </div>
          </div>

          <div className="sidebar-section tips">
            <h3>💡 Tips</h3>
            <ul>
              <li>🖱️ <strong>Drag</strong> nodes to reposition</li>
              <li>🔍 <strong>Scroll</strong> to zoom in/out</li>
              <li>✋ <strong>Drag canvas</strong> to pan</li>
              <li>👆 <strong>Click</strong> node for details</li>
              <li>🎯 Press <strong>F</strong> to fit view</li>
              <li>➕ Press <strong>+/-</strong> to zoom</li>
            </ul>
          </div>
        </aside>

        {/* Main Graph Canvas */}
        <div className="graph-container" ref={containerRef}>
          {isReady && dimensions.width > 0 && dimensions.height > 0 ? (
            <ForceGraph2D
              ref={fgRef}
              graphData={filteredData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor={darkMode ? '#0d1117' : '#f5f7fa'}
              nodeCanvasObject={paintNode}
              linkCanvasObject={paintLink}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              nodeRelSize={8}
              linkDirectionalArrowLength={8}
              linkDirectionalArrowRelPos={1}
              d3Force="charge"
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              cooldownTicks={100}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              minZoom={0.3}
              maxZoom={10}
              centerAt={[0, 0]}
              onEngineStop={() => {
                if (fgRef.current) {
                  fgRef.current.zoomToFit(300, 50);
                }
              }}
            />
          ) : (
            <div className="graph-initializing">
              <div className="loading-spinner"></div>
              <p>Initializing graph canvas...</p>
            </div>
          )}
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="node-details">
            <div className="details-header">
              <h3>
                <span 
                  className="node-type-badge" 
                  style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                >
                  {selectedNode.type}
                </span>
              </h3>
              <button onClick={() => setSelectedNode(null)}>✕</button>
            </div>
            <div className="details-content">
              <h4>{selectedNode.label || selectedNode.name || selectedNode.id}</h4>
              <div className="details-properties">
                {Object.entries(selectedNode)
                  .filter(([key]) => !['x', 'y', 'vx', 'vy', 'fx', 'fy', 'index', '__indexColor'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="property-row">
                      <span className="property-key">{key}:</span>
                      <span className="property-value">{String(value)}</span>
                    </div>
                  ))}
              </div>
              <div className="details-connections">
                <h5>Connections</h5>
                <p>
                  {filteredData.links.filter(l => 
                    (l.source?.id || l.source) === selectedNode.id || 
                    (l.target?.id || l.target) === selectedNode.id
                  ).length} relationships
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
