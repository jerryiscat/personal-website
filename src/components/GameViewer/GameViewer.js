import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameViewer.css';
import { FaArrowLeft, FaGithub } from 'react-icons/fa';
import cellularAutomataGameGif from '../../images/project/cellular-automata-game.gif';

function GameViewer() {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const gameContainerRef = useRef(null);

  const gameInfo = {
    'cellular-automata': {
      title: 'Cellular Automata Game',
      description: 'A puzzle game where you guide water and other elements through obstacles to fill containers. Built with C and raylib.',
      github: 'https://github.com/jerryiscat/Cellular-Automata-Game',
      gameJs: `${process.env.PUBLIC_URL || ''}/cellular-automata/game.js`,
      gameWasm: `${process.env.PUBLIC_URL || ''}/cellular-automata/game.wasm`,
      gif: cellularAutomataGameGif,
      features: [
        '4 Levels with increasing difficulty and unique mechanics',
        'Multiple Elements: Walls, Sand, Fire, Water (blue and red)',
        'Plant System: Blue water grows plants, red water destroys them (creates ash)',
        'Physics Simulation: Real-time particle interactions and gravity',
        'Save/Load: Binary serialization to save your progress',
      ],
      controls: [
        'Mouse Left Click: Draw/place elements',
        '1 Key: Wall',
        '2 Key: Sand (Level 2+)',
        '3 Key: Fire (Level 3+)',
        'R Key: Restart current level',
        'F5: Save game',
        'F9: Load game',
        'Click ON/OFF Button: Start/stop water flow'
      ]
    }
  };

  const info = gameInfo[gameName];

  useEffect(() => {
    if (!info || !gameContainerRef.current) return;

    // Clear any existing content
    gameContainerRef.current.innerHTML = '';

    // Create the game container structure
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvas-container';
    canvasContainer.style.cssText = 'text-align: center;';

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.textContent = 'Loading game...';
    loadingDiv.style.cssText = 'color: #fff; font-size: 18px; margin: 20px;';

    const errorDiv = document.createElement('div');
    errorDiv.id = 'error';
    errorDiv.style.cssText = 'color: #f44; font-size: 14px; margin: 10px; display: none;';

    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.cssText = 'border: 2px solid #333; display: block; margin: 0 auto;';

    canvasContainer.appendChild(loadingDiv);
    canvasContainer.appendChild(errorDiv);
    canvasContainer.appendChild(canvas);
    gameContainerRef.current.appendChild(canvasContainer);

    // Set up Emscripten Module - must be global BEFORE script loads
    window.Module = {
      canvas: canvas,
      locateFile: function(path) {
        if (path.endsWith('.wasm')) {
          return info.gameWasm;
        }
        return path;
      },
      onRuntimeInitialized: function() {
        const loading = document.getElementById('loading');
        if (loading) {
          loading.style.display = 'none';
        }
        console.log('Game initialized successfully!');
      },
      printErr: function(text) {
        console.error(text);
        const error = document.getElementById('error');
        if (error && (text.toLowerCase().indexOf('error') !== -1 || text.toLowerCase().indexOf('fail') !== -1)) {
          error.style.display = 'block';
          error.textContent = 'Error: ' + text;
          const loading = document.getElementById('loading');
          if (loading) {
            loading.textContent = 'Failed to load game';
          }
        }
      },
      setStatus: function(text) {
        const loading = document.getElementById('loading');
        if (loading) {
          loading.textContent = text;
        }
        console.log('Status: ' + text);
      },
      totalDependencies: 0,
      monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        if (left > 0) {
          window.Module.setStatus('Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')');
        } else {
          window.Module.setStatus('All downloads complete.');
        }
      }
    };

    // Load the game script - Module must be available before this loads
    // Use absolute URL to ensure correct path and avoid routing issues
    const scriptUrl = window.location.origin + info.gameJs;
    console.log('Loading game script from:', scriptUrl);
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onerror = (e) => {
      console.error('Failed to load game script from:', scriptUrl, e);
      const error = document.getElementById('error');
      if (error) {
        error.style.display = 'block';
        error.textContent = `Failed to load game script. Check console for details.`;
      }
    };
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (window.Module) {
        delete window.Module;
      }
    };
  }, [info]);

  if (!info) {
    return (
      <div className="game-viewer-container">
        <div className="game-error">
          <h2>Game not found</h2>
          <button onClick={() => navigate('/project')} className="back-button">
            <FaArrowLeft /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-viewer-container">
      <div className="game-viewer-header">
        <button onClick={() => navigate('/project')} className="back-button">
          <FaArrowLeft /> Back to Projects
        </button>
        <div className="game-header-info">
          <h1>{info.title}</h1>
          <p>{info.description}</p>
          <div className="game-header-actions">
            <a 
              href={info.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
            >
              <FaGithub /> View on GitHub
            </a>
            <button 
              onClick={() => {
                const gameSection = document.querySelector('.game-play-section');
                if (gameSection) {
                  gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="try-it-button"
            >
              Try it!!
            </button>
          </div>
        </div>
      </div>
      
      {/* Introduction Section with GIF, Features, and Controls */}
      <div className="game-intro-section">
        {info.gif && (
          <div className="game-gif-container">
            <img src={info.gif} alt={`${info.title} demo`} className="game-gif" />
          </div>
        )}
        
        {/* Features Section */}
        {info.features && info.features.length > 0 && (
          <div className="game-info-section">
            <h2 className="game-section-title">Features</h2>
            <ul className="game-features-list">
              {info.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Controls Section */}
        {info.controls && info.controls.length > 0 && (
          <div className="game-info-section">
            <h2 className="game-section-title">Controls</h2>
            <ul className="game-controls-list">
              {info.controls.map((control, index) => (
                <li key={index}>{control}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Game Container */}
      <div className="game-play-section" id="game-section">
        <h2 className="game-play-title">Try it!!</h2>
        <p className="game-instruction">Click on the canvas to draw elements and use the controls above to interact with the game.</p>
        <div className="game-iframe-container" ref={gameContainerRef} style={{ background: '#FFF3F3', minHeight: '600px', display: 'flex', justifyContent: 'start', alignItems: 'center', padding: '20px' }}>
          {/* Game will be rendered here */}
        </div>
      </div>
    </div>
  );
}

export default GameViewer;

