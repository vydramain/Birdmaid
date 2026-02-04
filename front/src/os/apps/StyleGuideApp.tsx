/**
 * Style Guide App
 * 
 * Displays a gallery of Win95 UI primitives for visual reference and testing.
 * 
 * Components shown:
 * - Window (active/inactive)
 * - Button states (default, active, disabled, hover)
 * - MenuBar (if implemented)
 * - StatusBar
 * - List selection (focused/unfocused)
 * - Scrollbars sample
 * - Input fields (default, focused, disabled)
 * - Desktop icons sample
 */

import React, { useState } from 'react';
import '../../styles/style-guide.scss';
import { Icon } from '../../ui/icons';
import { CaptionButtons } from '../../ui/primitives';
import { ExplorerWindow } from '../../components/ExplorerWindow';

export function StyleGuideApp() {
  const [activeWindow, setActiveWindow] = useState<'left' | 'right'>('left');
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(0);

  return (
    <div className="style-guide-container">
      <div className="style-guide-header">
        <h1>Windows 95 UI Style Guide</h1>
        <p>Visual reference for Win95 UI primitives and components</p>
      </div>

      {/* Window States */}
      <section className="style-guide-section">
        <h2>Window States</h2>
        <div className="style-guide-windows">
          <div
            className={`style-guide-window ${activeWindow === 'left' ? 'active' : 'inactive'}`}
            onClick={() => setActiveWindow('left')}
          >
            <div className="win-titlebar">
              <span className="title">Active Window</span>
              <CaptionButtons onMinimize={() => {}} onMaximize={() => {}} onClose={() => {}} />
            </div>
            <div className="win-content">
              <p>This window is active (focused). Title bar has blue gradient.</p>
            </div>
          </div>

          <div
            className={`style-guide-window ${activeWindow === 'right' ? 'active' : 'inactive'}`}
            onClick={() => setActiveWindow('right')}
          >
            <div className="win-titlebar">
              <span className="title">Inactive Window</span>
              <CaptionButtons onMinimize={() => {}} onMaximize={() => {}} onClose={() => {}} />
            </div>
            <div className="win-content">
              <p>This window is inactive (unfocused). Title bar is gray.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Button States */}
      <section className="style-guide-section">
        <h2>Button States</h2>
        <div className="style-guide-buttons">
          <button className="win-btn">
            Normal
          </button>
          <button className="win-btn">
            Pressed (hold to see :active)
          </button>
          <button className="win-btn" disabled>
            Disabled
          </button>
          <button className="win-btn" data-testid="style-guide-focus-button">
            Focus (tab to me)
          </button>
          <button className="win-btn win-btn-default">
            Default (dialog)
          </button>
          <button
            type="button"
            className={`win-btn win-btn-toggle ${buttonPressed === 'toggle' ? 'is-pressed' : ''}`}
            aria-pressed={buttonPressed === 'toggle'}
            onClick={() => setButtonPressed((p) => (p === 'toggle' ? null : 'toggle'))}
          >
            Toggle
          </button>
        </div>
      </section>

      {/* Input Fields */}
      <section className="style-guide-section">
        <h2>Input Fields</h2>
        <div className="style-guide-inputs">
          <input
            type="text"
            className="win-input"
            placeholder="Default input field"
            defaultValue="Sample text"
          />
          <input
            type="text"
            className="win-input"
            placeholder="Focused input field"
            autoFocus
            defaultValue="Focused"
          />
          <input
            type="text"
            className="win-input"
            placeholder="Disabled input field"
            disabled
            defaultValue="Disabled"
          />
        </div>
      </section>

      {/* List Selection */}
      <section className="style-guide-section">
        <h2>List Selection</h2>
        <div className="style-guide-list">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`style-guide-list-item ${selectedItem === i ? 'selected' : ''}`}
              onClick={() => setSelectedItem(i)}
            >
              List Item {i + 1}
            </div>
          ))}
        </div>
      </section>

      {/* Status Bar */}
      <section className="style-guide-section">
        <h2>Status Bar</h2>
        <div className="style-guide-statusbar">
          <div className="explorer-status">
            Ready | 5 items selected
          </div>
        </div>
      </section>

      {/* Scrollbar Sample */}
      <section className="style-guide-section">
        <h2>Scrollbar Sample</h2>
        <div className="style-guide-scrollbar-container">
          <div className="style-guide-scrollbar-content">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="style-guide-scrollbar-item">
                Scrollable Item {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Icons Sample */}
      <section className="style-guide-section">
        <h2>Desktop Icons Sample</h2>
        <div className="style-guide-icons">
          {['My Computer', 'Recycle Bin', 'Network', 'Documents'].map((name, i) => (
            <div key={i} className="desktop-icon-container">
              <div className="desktop-icon-box">
                <Icon type="dir" size="48x48" />
              </div>
              <div className="desktop-icon-label">{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Explorer Baseline (for visual regression) */}
      <section
        className="style-guide-section"
        data-section="explorer-baseline"
      >
        <h2>Explorer Baseline</h2>
        <div className="style-guide-explorer-viewport">
          <ExplorerWindow />
        </div>
      </section>
    </div>
  );
}
