/**
 * Visual Regression Tests for Style Guide
 * 
 * These tests verify that the Style Guide app renders correctly and displays
 * all Win95 UI primitives as expected.
 * 
 * Note: For full visual regression testing with screenshots, use Playwright or
 * similar tools. These tests are basic smoke tests to ensure components render.
 */

import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderShell } from '@/test/utils/render';
import { StyleGuideApp } from '../../src/os/apps/StyleGuideApp';

describe('Style Guide Visual Tests', () => {
  it('renders style guide container', () => {
    renderShell(<StyleGuideApp />);
    const header = screen.getByText('Windows 95 UI Style Guide');
    expect(header).toBeInTheDocument();
  });

  it('renders window states section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('Window States');
    expect(section).toBeInTheDocument();
    
    const activeWindow = screen.getByText('Active Window');
    const inactiveWindow = screen.getByText('Inactive Window');
    expect(activeWindow).toBeInTheDocument();
    expect(inactiveWindow).toBeInTheDocument();
  });

  it('renders button states section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('Button States');
    expect(section).toBeInTheDocument();
    
    const defaultButton = screen.getByText('Default (dialog)');
    const disabledButton = screen.getByText('Disabled');
    expect(defaultButton).toBeInTheDocument();
    expect(disabledButton).toBeInTheDocument();
  });

  it('renders input fields section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('Input Fields');
    expect(section).toBeInTheDocument();
    
    const defaultInput = screen.getByPlaceholderText('Default input field');
    expect(defaultInput).toBeInTheDocument();
  });

  it('renders list selection section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('List Selection');
    expect(section).toBeInTheDocument();
    
    const listItem = screen.getByText('List Item 1');
    expect(listItem).toBeInTheDocument();
  });

  it('renders status bar section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('Status Bar');
    expect(section).toBeInTheDocument();
    
    const statusText = screen.getByText(/Ready/);
    expect(statusText).toBeInTheDocument();
  });

  it('renders scrollbar sample section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('Scrollbar Sample');
    expect(section).toBeInTheDocument();
    
    const scrollItem = screen.getByText('Scrollable Item 1');
    expect(scrollItem).toBeInTheDocument();
  });

  it('renders desktop icons sample section', () => {
    renderShell(<StyleGuideApp />);
    const section = screen.getByText('Desktop Icons Sample');
    expect(section).toBeInTheDocument();
    // Scope to desktop icons section (Explorer also has "My Computer" in tree)
    const iconsSection = section.closest('.style-guide-section');
    expect(iconsSection).toBeInTheDocument();
    const myComputer = within(iconsSection!).getByText('My Computer');
    expect(myComputer).toBeInTheDocument();
  });
});
