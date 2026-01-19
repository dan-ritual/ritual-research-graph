import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { ChevronDown, ChevronUp, Copy, Download, ExternalLink, Bot, Plus, Minus, FileText, X } from 'lucide-react';
import { PROJECTS, EXECUTIVE_SUMMARY, DEEP_DIVES, SOURCE_ARTIFACTS, ACCENT_COLOR } from './config.js';

// ─────────────────────────────────────────────────────────────────────────────
// FONT SIZE CONTEXT (Global text scaling)
// ─────────────────────────────────────────────────────────────────────────────

const FontSizeContext = createContext({ scale: 1, setScale: () => {} });
const useFontSize = () => useContext(FontSizeContext);

// ═══════════════════════════════════════════════════════════════════════════
// RITUAL INTELLIGENCE - Making Software Aesthetic
// Institutional-Grade Research Dossier
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (Making Software Aesthetic)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// FONT CONSTANTS (God-tier rendering with JetBrains Mono + Crimson Text)
// ─────────────────────────────────────────────────────────────────────────────

const FONTS = {
  mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace',
  serif: '"Crimson Text", Georgia, "Times New Roman", serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FBFBFB',
    color: '#171717',
    fontFamily: FONTS.serif,
    fontSize: '17px',
    lineHeight: '1.7',
    letterSpacing: '0.01em',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility'
  },
  container: {
    maxWidth: '880px',
    margin: '0 auto',
    padding: '80px 48px 120px'
  },
  mono: {
    fontFamily: FONTS.mono
  },
  // Header
  header: {
    marginBottom: '64px',
    textAlign: 'center'
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: '56px',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    margin: '0 0 16px 0',
    lineHeight: '1.1',
    color: '#3B5FE6'
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: '12px',
    fontWeight: '400',
    letterSpacing: '0.2em',
    color: 'rgba(0,0,0,0.45)',
    textTransform: 'uppercase',
    margin: 0
  },
  // Sections
  section: {
    marginBottom: '64px'
  },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#3B5FE6',
    marginBottom: '28px',
    paddingBottom: '16px',
    borderBottom: '1px dotted rgba(59,95,230,0.3)'
  },
  // Finding/Recommendation Cards
  card: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  cardTitle: {
    fontFamily: FONTS.mono,
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.01em',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cardBullet: {
    color: '#3B5FE6',
    fontSize: '13px',
    fontWeight: '400'
  },
  cardContent: {
    fontFamily: FONTS.serif,
    fontSize: '17px',
    lineHeight: '1.72',
    color: 'rgba(0,0,0,0.82)',
    paddingLeft: '25px',
    letterSpacing: '0.008em'
  },
  // Deep Dive Card
  deepDiveCard: {
    border: '1px solid rgba(0,0,0,0.08)',
    marginBottom: '16px',
    backgroundColor: '#fff'
  },
  deepDiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  deepDiveTitle: {
    fontFamily: FONTS.mono,
    fontSize: '16px',
    margin: '0 0 8px 0',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    color: '#3B5FE6'
  },
  deepDiveSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '0.12em',
    color: 'rgba(0,0,0,0.4)',
    margin: 0,
    textTransform: 'uppercase'
  },
  deepDiveContent: {
    padding: '0 28px 28px',
    borderTop: '1px dotted rgba(0,0,0,0.08)'
  },
  // Content area
  contentArea: {
    padding: '16px 0 0 0',
    fontSize: '17px',
    lineHeight: '1.72',
    fontFamily: FONTS.serif
  },
  // Thesis
  thesis: {
    fontFamily: FONTS.serif,
    fontSize: '22px',
    lineHeight: '1.6',
    textAlign: 'center',
    padding: '48px 40px',
    margin: '0 0 64px 0',
    borderTop: '1px dotted rgba(0,0,0,0.15)',
    borderBottom: '1px dotted rgba(0,0,0,0.15)',
    fontStyle: 'italic',
    color: 'rgba(0,0,0,0.75)',
    letterSpacing: '0.01em'
  },
  // Transcript controls
  transcriptControls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px'
  },
  controlButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    fontSize: '10px',
    fontFamily: FONTS.mono,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: '1px solid rgba(0,0,0,0.15)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'rgba(0,0,0,0.6)',
    transition: 'all 0.15s ease'
  },
  // Project link
  projectLink: {
    color: '#3B5FE6',
    textDecoration: 'none',
    borderBottom: '1px dotted rgba(59, 95, 230, 0.5)',
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-block',
    transition: 'border-color 0.15s ease'
  },
  twitterSup: {
    fontFamily: FONTS.mono,
    fontSize: '9px',
    fontWeight: '400',
    color: 'rgba(0,0,0,0.35)',
    marginLeft: '2px',
    textDecoration: 'none'
  },
  // Chart popup
  chartPopup: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1000,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    marginTop: '8px'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN HOVER COMPONENT (TradingView Embed)
// ─────────────────────────────────────────────────────────────────────────────

const TokenHover = ({ symbol, children }) => {
  const [show, setShow] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const timeoutRef = useRef(null);

  // No token = no hover effect
  if (!symbol) return children;

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShow(false);
    setWidgetReady(false);
  };

  useEffect(() => {
    if (show && containerRef.current && window.TradingView && !widgetRef.current) {
      try {
        widgetRef.current = new window.TradingView.widget({
          symbol: symbol,
          width: 320,
          height: 220,
          interval: 'D',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_legend: true,
          save_image: false,
          container_id: containerRef.current.id,
          autosize: false
        });
        setWidgetReady(true);
      } catch (e) {
        console.log('TradingView widget error:', e);
      }
    }

    return () => {
      if (!show) {
        widgetRef.current = null;
      }
    };
  }, [show, symbol]);

  const uniqueId = `chart-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline' }}
    >
      {children}
      {show && (
        <div style={styles.chartPopup}>
          <div
            ref={containerRef}
            id={uniqueId}
            style={{ width: 320, height: 220 }}
          />
        </div>
      )}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT LINK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ProjectLink = ({ name }) => {
  const project = PROJECTS[name];
  if (!project) return <span>{name}</span>;

  const content = (
    <a
      href={project.website}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.projectLink}
    >
      {name}
    </a>
  );

  return (
    <>
      <TokenHover symbol={project.tvSymbol}>
        {content}
      </TokenHover>
      {project.twitter && (
        <a
          href={`https://twitter.com/${project.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.twitterSup}
        >
          <sup>@</sup>
        </a>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────────────────────────────────────

const MarkdownContent = ({ content, isTranscript = false }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];
  let isFirstHeading = true;

  const baseStyle = isTranscript ? {
    fontFamily: FONTS.mono,
    fontSize: '13px'
  } : {};

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headers = tableRows[0].split('|').filter(c => c.trim()).map(c => c.trim());
      const dataRows = tableRows.slice(2);
      elements.push(
        <div key={key} style={{ overflowX: 'auto', margin: '24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: FONTS.mono }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                {headers.map((h, j) => <th key={j} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: '500' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => {
                const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
                return (
                  <tr key={ri} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    {cells.map((cell, ci) => <td key={ci} style={{ padding: '10px 14px' }}>{formatInline(cell)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inTable) flushTable(`table-${i}`);
      if (inCodeBlock) {
        elements.push(
          <pre key={i} style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0', padding: '20px', margin: '24px 0', fontSize: '13px', overflow: 'auto', fontFamily: FONTS.mono, borderRadius: '2px' }}>
            {codeLines.join('\n')}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // Tables
    if (line.trim().startsWith('|') && line.includes('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Headers
    if (line.startsWith('# ')) {
      const topMargin = isFirstHeading ? '24px' : '56px';
      isFirstHeading = false;
      elements.push(<h1 key={i} style={{ fontFamily: FONTS.mono, fontSize: '22px', marginTop: topMargin, marginBottom: '20px', fontWeight: '600', letterSpacing: '-0.5px', ...baseStyle }}>{line.slice(2)}</h1>);
      continue;
    }
    if (line.startsWith('## ')) {
      const topMargin = isFirstHeading ? '0' : '36px';
      isFirstHeading = false;
      elements.push(<h2 key={i} style={{ fontFamily: FONTS.mono, fontSize: '19px', marginTop: topMargin, marginBottom: '14px', fontWeight: '500', ...baseStyle }}>{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      const topMargin = isFirstHeading ? '0' : '28px';
      isFirstHeading = false;
      elements.push(<h3 key={i} style={{ fontFamily: FONTS.mono, fontSize: '15px', marginTop: topMargin, marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', ...baseStyle }}>{line.slice(4)}</h3>);
      continue;
    }

    // HR
    if (line.match(/^[-─═]{3,}$/)) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px dotted rgba(0,0,0,0.2)', margin: '40px 0' }} />);
      continue;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #3B5FE6', paddingLeft: '20px', margin: '24px 0', fontStyle: 'italic', color: 'rgba(0,0,0,0.75)', ...baseStyle }}>{line.slice(1).trim()}</blockquote>);
      continue;
    }

    // Lists
    if (line.match(/^[-*•]\s/)) {
      elements.push(<li key={i} style={{ marginLeft: '24px', marginBottom: '10px', ...baseStyle }}>{formatInline(line.slice(2))}</li>);
      continue;
    }

    // Empty
    if (!line.trim()) continue;

    // Paragraphs
    elements.push(<p key={i} style={{ marginBottom: '18px', ...baseStyle }}>{formatInline(line)}</p>);
  }

  if (inTable) flushTable('table-end');

  return <div>{elements}</div>;
};

// HTML-only formatting (no React components)
const formatInlineHtml = (text) => {
  // First, handle complete bold markers
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Then strip any orphaned ** markers that remain
  text = text.replace(/\*\*/g, '');
  // Handle italics
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Handle code
  text = text.replace(/`(.+?)`/g, '<code style="font-family: JetBrains Mono, SF Mono, Consolas, monospace; font-size: 0.9em; background: rgba(0,0,0,0.04); padding: 2px 6px; border-radius: 2px;">$1</code>');
  return text;
};

// Format text with ProjectLink components for protocols
const formatContentWithLinks = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Build regex pattern from all project names (sorted by length desc to match longer first)
  const projectNames = Object.keys(PROJECTS);
  const sortedNames = projectNames.sort((a, b) => b.length - a.length);
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match protocol names, optionally preceded/followed by ** (bold markers)
  // Don't consume surrounding spaces - they stay in beforeText/afterText
  const pattern = new RegExp(`(\\*\\*)?(${sortedNames.map(escapeRegex).join('|')})(\\*\\*)?`, 'g');

  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, leadingStars, protocolName, trailingStars] = match;
    const matchStart = match.index;

    // Add text before this match
    if (matchStart > lastIndex) {
      const beforeText = text.slice(lastIndex, matchStart);
      const formatted = formatInlineHtml(beforeText);
      result.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatted }} />);
    }

    // Determine if protocol should be bold (wrapped in **)
    const isBold = leadingStars && trailingStars;

    // Add the ProjectLink, optionally wrapped in strong
    if (isBold) {
      result.push(
        <strong key={`link-${matchStart}`}>
          <ProjectLink name={protocolName} />
        </strong>
      );
    } else {
      // Handle partial bold markers (orphaned ** before or after)
      if (leadingStars && !trailingStars) {
        result.push(<span key={`stars-${matchStart}`} dangerouslySetInnerHTML={{ __html: '<strong>' }} />);
      }
      result.push(<ProjectLink key={`link-${matchStart}`} name={protocolName} />);
      if (!leadingStars && trailingStars) {
        result.push(<span key={`stars-end-${matchStart}`} dangerouslySetInnerHTML={{ __html: '</strong>' }} />);
      }
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const formatted = formatInlineHtml(remainingText);
    result.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatted }} />);
  }

  return result.length > 0 ? result : text;
};

// Legacy formatInline for backward compatibility
const formatInline = (text) => {
  return formatContentWithLinks(text);
};

// ─────────────────────────────────────────────────────────────────────────────
// DEEP DIVE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const DeepDive = ({ dive }) => {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isTranscript = dive.id === 'transcript';

  const handleExpand = async () => {
    if (!expanded && !content && !dive.isContent) {
      setLoading(true);
      try {
        const res = await fetch(`/${dive.file}`);
        let text = await res.text();

        // Clean transcript if needed
        if (isTranscript) {
          // Remove Emperor from participants
          text = text.replace(/Emperor,?\s*/g, '');
          // Fix Jun Yi name
          text = text.replace(/Junyi/g, 'Jun Yi');
          // Fix attribution
          text = text.replace(/\*\*Niraj:\*\*\s*\n\s*\nPersonally, I thought it was good/g, '**Daniel:**\n\nPersonally, I thought it was good');
        }

        setContent(text);
      } catch (e) {
        setContent('Error loading document');
      }
      setLoading(false);
    }
    setExpanded(!expanded);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dive.isContent ? dive.content : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([dive.isContent ? dive.content : content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dive.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.deepDiveCard}>
      <div style={styles.deepDiveHeader} onClick={handleExpand}>
        <div>
          <h3 style={styles.deepDiveTitle}>{dive.title}</h3>
          <p style={styles.deepDiveSubtitle}>{dive.subtitle}</p>
        </div>
        {expanded ? <ChevronUp size={18} strokeWidth={1.5} /> : <ChevronDown size={18} strokeWidth={1.5} />}
      </div>

      {expanded && (
        <div style={styles.deepDiveContent}>
          {dive.summary && (
            <p style={{ marginBottom: '20px', color: 'rgba(0,0,0,0.65)', fontSize: '16px', lineHeight: '1.65', fontFamily: FONTS.serif }}>{dive.summary}</p>
          )}

          {(dive.file || dive.isContent) && (
            <div style={styles.transcriptControls}>
              <button
                style={styles.controlButton}
                onClick={handleCopy}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Copy size={12} />
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                style={styles.controlButton}
                onClick={handleDownload}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Download size={12} />
                Download .md
              </button>
            </div>
          )}

          <div style={styles.contentArea}>
            {loading ? (
              <p style={{ fontFamily: FONTS.mono, fontSize: '12px', color: 'rgba(0,0,0,0.5)', letterSpacing: '1px' }}>LOADING...</p>
            ) : dive.isContent ? (
              <MarkdownContent content={dive.content} />
            ) : (
              <MarkdownContent content={content} isTranscript={isTranscript} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT VIEWER MODAL (Full-screen with Liquid Glass Blur)
// ─────────────────────────────────────────────────────────────────────────────

const DocumentViewerModal = ({ artifact, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch(`/${artifact.file}`);
        const text = await res.text();
        setContent(text);
      } catch (e) {
        setContent('Error loading document');
      }
      setLoading(false);
    };
    loadContent();

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [artifact.file]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.file;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Liquid Glass Blur Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(251, 251, 251, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)'
        }}
        onClick={onClose}
      />

      {/* Modal Content - Full Screen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1000px',
          height: '92vh',
          margin: '0 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '28px 32px 20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: '#FAFAFA'
          }}
        >
          <div>
            <h2 style={{
              fontFamily: FONTS.mono,
              fontSize: '18px',
              fontWeight: '600',
              color: '#3B5FE6',
              margin: '0 0 6px 0',
              letterSpacing: '-0.01em'
            }}>
              {artifact.title}
            </h2>
            <p style={{
              fontFamily: FONTS.mono,
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgba(0, 0, 0, 0.45)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {artifact.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleCopy}
              style={{
                ...styles.controlButton,
                padding: '8px 14px',
                fontSize: '10px'
              }}
            >
              <Copy size={12} />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              style={{
                ...styles.controlButton,
                padding: '8px 14px',
                fontSize: '10px'
              }}
            >
              <Download size={12} />
              .md
            </button>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: 'rgba(0, 0, 0, 0.5)',
                transition: 'all 0.15s ease',
                marginLeft: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '32px 40px 48px',
            backgroundColor: '#FFFFFF'
          }}
        >
          {loading ? (
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: '12px',
              color: 'rgba(0, 0, 0, 0.5)',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Loading document...
            </div>
          ) : (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <MarkdownContent content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE ARTIFACTS PANEL (Compact list above Key Findings)
// ─────────────────────────────────────────────────────────────────────────────

const SourceArtifactsPanel = () => {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <section style={{
        marginBottom: '56px',
        padding: '24px',
        backgroundColor: 'rgba(59, 95, 230, 0.03)',
        border: '1px solid rgba(59, 95, 230, 0.12)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <FileText size={16} strokeWidth={1.5} style={{ color: '#3B5FE6' }} />
          <h3 style={{
            fontFamily: FONTS.mono,
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#3B5FE6',
            margin: 0
          }}>
            Source Artifacts
          </h3>
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: '10px',
            color: 'rgba(0, 0, 0, 0.4)',
            marginLeft: 'auto'
          }}>
            Generated by Claude Cowork
          </span>
        </div>

        <p style={{
          fontFamily: FONTS.serif,
          fontSize: '15px',
          lineHeight: '1.6',
          color: 'rgba(0, 0, 0, 0.65)',
          margin: '0 0 20px 0'
        }}>
          The following documents were generated during the Claude Cowork session and serve as the primary source material for this microsite.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {SOURCE_ARTIFACTS.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => setSelectedArtifact(artifact)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 95, 230, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(59, 95, 230, 0.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <FileText size={18} strokeWidth={1.5} style={{ color: '#3B5FE6', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#171717',
                  marginBottom: '4px'
                }}>
                  {artifact.title}
                </div>
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: '10px',
                  color: 'rgba(0, 0, 0, 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {artifact.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedArtifact && (
        <DocumentViewerModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT/LLM JSON EXPORT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const generateAgentJSON = () => {
  return {
    meta: {
      title: "Ritual Intelligence: RWA × DeFi × AI",
      version: "2026.01.15",
      type: "strategic_research_dossier",
      generated: new Date().toISOString(),
      instructions: "This document is structured for agent/LLM consumption. Follow the meta_prompts sequentially to establish a research workspace."
    },

    meta_prompts: [
      {
        id: "workspace_setup",
        priority: 1,
        instruction: "Create a dedicated workspace for RWA/DeFi research. Structure directories as: /research/rwa, /research/defi, /research/protocols, /analysis/ritual_integration, /tracking/opportunities."
      },
      {
        id: "data_ingestion",
        priority: 2,
        instruction: "Parse the protocols array below. For each S-tier and A-tier protocol, create a tracking file with: name, tvl, category, ritual_integration_potential (high/medium/low), and last_updated timestamp."
      },
      {
        id: "monitoring_setup",
        priority: 3,
        instruction: "Set up monitoring for the following data sources: DefiLlama API for TVL tracking, Twitter/X lists for @maplefinance @OndoFinance @ZivoeProtocol @CredixFinance, Dune Analytics dashboards for on-chain metrics."
      },
      {
        id: "analysis_framework",
        priority: 4,
        instruction: "Apply the following analysis framework to each protocol: (1) Technical fit for Ritual primitives, (2) BD opportunity vs integration opportunity, (3) Timeline to integration, (4) Competitive moat assessment."
      },
      {
        id: "ritual_primitive_mapping",
        priority: 5,
        instruction: "For each protocol in the S-tier, identify which Ritual primitives apply: ONNX Inference (credit scoring, risk pricing), TEE Executors (private computation), HTTP Calls (off-chain verification), Scheduled Tx (automation), Secret Encryption (compliance)."
      },
      {
        id: "opportunity_scoring",
        priority: 6,
        instruction: "Score each integration opportunity on: pain_intensity (1-10), technical_fit (1-10), team_accessibility (1-10), tvl_range, competition_level. Rank by composite score."
      },
      {
        id: "continuous_research",
        priority: 7,
        instruction: "Establish weekly research cadence: Monitor governance forums for protocol roadmaps, Track new protocol launches in RWA category, Update TVL and utilization metrics, Identify emerging self-repaying/streaming patterns."
      }
    ],

    thesis: {
      core: "Intelligence scales infinitely. Trust doesn't. Verification is how they meet.",
      market_position: "RWA TVL crossed $35B in January 2026, representing 7x growth. Asset composition shifted to diversified mix: private credit (28%), real estate (12%), insurance (8%).",
      structural_shift: "Industry pivoted from under-collateralized to asset-backed structures after 2022-23 defaults. Pattern: catastrophe → isolation → maturation.",
      opportunity: "Only Bid.io attempts on-chain AI. Maple, Credix, Zivoe, Goldfinch run credit decisions off-chain. Gap: verifiable inference is infrastructurally necessary."
    },

    tier_list: {
      S: { narratives: ["AI", "RWAs", "Prediction Markets"], thesis: "Structural shift, institutional demand, verifiability premium" },
      A: { narratives: ["Privacy", "Robotics", "Payments/Neobanks"], thesis: "Infrastructure plays, emerging moats, regulatory tailwinds" },
      B: { narratives: ["Perp DEXes", "L1/L2", "DeFi"], thesis: "Maturing markets, selectivity increasing, usage > design" },
      C: { narratives: ["InfoFi", "DePIN", "Interoperability"], thesis: "Real demand, weak token value capture" },
      D: { narratives: ["Gaming", "Memes", "NFTs"], thesis: "Speculative, retail-driven, risk-reward deteriorated" }
    },

    protocols: {
      rwa_core: [
        { name: "Ondo Finance", tvl: "$600M+", category: "Tokenized Treasuries", ritual_fit: "high", primitives: ["ONNX"], notes: "BlackRock BUIDL distribution partner" },
        { name: "Maple Finance", tvl: "~$100M", category: "Institutional Credit", ritual_fit: "high", primitives: ["ONNX", "HTTP"], notes: "0% post-pivot default rate" },
        { name: "Zivoe", tvl: "~$6M", category: "Private Credit", ritual_fit: "very_high", primitives: ["ONNX", "Scheduled Tx"], notes: "95% utilization, spigot mechanism, clearest integration target" },
        { name: "Credix", tvl: "$100M+", category: "Private Credit", ritual_fit: "high", primitives: ["ONNX", "HTTP"], notes: "Future cash flow collateralization, 20%+ historical yields" },
        { name: "Centrifuge", tvl: "varies", category: "RWA Platform", ritual_fit: "medium", primitives: ["ONNX"], notes: "Tranched structures, asset manager focus" }
      ],
      rwa_infrastructure: [
        { name: "Provenance", tvl: "$20B claimed", category: "Financial Services L1", ritual_fit: "high", primitives: ["HTTP", "TEE"], notes: "Insurance vertical 6x growth, event verification use case" },
        { name: "Plume", tvl: "varies", category: "RWA L2", ritual_fit: "medium", primitives: ["TEE", "Secret Encryption"], notes: "Compliance-first, embedded KYC/AML" }
      ],
      adjacent: [
        { name: "Hyperliquid", category: "PerpDEX", ritual_fit: "medium", primitives: ["ONNX", "Scheduled Tx"], notes: "Self-repaying perpetuals concept origin" },
        { name: "EtherFi", category: "Neobank", ritual_fit: "medium", primitives: ["Scheduled Tx"], notes: "Restaking to neobank pivot, cash card" },
        { name: "Aave", category: "DeFi Lending", ritual_fit: "high", primitives: ["ONNX"], notes: "Existing Ritual relationship, RWA expansion surface" }
      ]
    },

    ritual_primitives: {
      ONNX_Inference: { use_cases: ["Credit scoring", "Risk pricing", "Fraud detection"], target_protocols: ["Zivoe", "Maple", "Credix"] },
      TEE_Executors: { use_cases: ["Private computation", "Compliant AI operations"], target_protocols: ["Provenance", "Plume", "Canton Network"] },
      HTTP_Calls: { use_cases: ["Off-chain event verification", "Insurance payouts", "External data"], target_protocols: ["Provenance", "Credix"] },
      Scheduled_Tx: { use_cases: ["Automated loan lifecycle", "Streaming repayment", "Agent operations"], target_protocols: ["Zivoe", "Hyperliquid"] },
      Secret_Encryption: { use_cases: ["Agent identity", "Confidential RWA operations"], target_protocols: ["Plume", "Canton Network"] }
    },

    novel_concepts: {
      self_repaying_perpetuals: {
        description: "Perpetual positions where positive-carry RWA collateral (tokenized treasuries at 4-5%) offsets funding rates",
        origin: "Emerged from analyzing PerpDEX pain points: traders don't want to pay/predict funding or face volatile funding decay",
        mechanism: "PerpDEX + Alchemix mechanics = self-financing positions",
        ritual_angle: "ONNX for collateral optimization, Scheduled Tx for automated rebalancing"
      },
      streaming_repayment: {
        description: "Loan repayment tied to revenue streams rather than time-based obligations",
        example: "Zivoe's spigot mechanism: business pays portion of each sale toward loan",
        ritual_angle: "HTTP calls to verify revenue events, ONNX for cash flow prediction"
      }
    },

    recommendations: [
      { priority: 1, action: "Reference Implementation", detail: "Build verifiable credit scoring for Zivoe or similar ($5-50M TVL). ONNX model for merchant cash advance risk." },
      { priority: 2, action: "Target Segment", detail: "Mid-tier RWA protocols ($5M-$100M TVL) with >70% utilization, discussing scaling constraints, no existing AI partnerships." },
      { priority: 3, action: "Vertical Sequence", detail: "Private credit first (highest pain intensity, best technical fit), insurance second." },
      { priority: 4, action: "DeFi Bridge", detail: "Leverage existing DeFi relationships (Aave, Morpho, Euler) as RWA introduction surfaces." },
      { priority: 5, action: "Positioning", detail: "Hybrid infrastructure + category enabler. Mental model: Chainlink for price feeds, Ritual for intelligence feeds." }
    ],

    key_findings: EXECUTIVE_SUMMARY.keyFindings.map(f => ({ title: f.title, content: f.content.replace(/\*\*/g, '') })),

    deep_dives: DEEP_DIVES.map(d => ({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
      type: d.isContent ? 'embedded' : 'file_reference',
      file: d.file || null,
      content_preview: d.isContent ? d.content.slice(0, 500) + '...' : d.summary
    }))
  };
};

const AgentExportButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopy = () => {
    const json = JSON.stringify(generateAgentJSON(), null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const json = JSON.stringify(generateAgentJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ritual-intelligence-agent-context.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          top: isMobile ? 'auto' : '24px',
          bottom: isMobile ? '20px' : 'auto',
          right: isMobile ? '20px' : '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '0' : '8px',
          padding: isMobile ? '10px' : '10px 16px',
          fontSize: '11px',
          fontFamily: FONTS.mono,
          fontWeight: '500',
          letterSpacing: '0.05em',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: isMobile ? '50%' : '0',
          backgroundColor: 'rgba(251,251,251,0.9)',
          cursor: 'pointer',
          color: 'rgba(0,0,0,0.35)',
          transition: 'all 0.15s ease',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          opacity: isMobile ? 0.6 : 1
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59,95,230,0.08)';
          e.currentTarget.style.borderColor = 'rgba(59,95,230,0.3)';
          e.currentTarget.style.color = '#3B5FE6';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251,251,251,0.9)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
          e.currentTarget.style.color = 'rgba(0,0,0,0.35)';
          e.currentTarget.style.opacity = isMobile ? '0.6' : '1';
        }}
      >
        <Bot size={isMobile ? 16 : 14} strokeWidth={1.5} />
        {!isMobile && 'Agent/LLM?'}
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FBFBFB',
              padding: '40px',
              maxWidth: '520px',
              width: '90%',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Bot size={20} strokeWidth={1.5} style={{ color: '#3B5FE6' }} />
              <h3 style={{ fontFamily: FONTS.mono, fontSize: '16px', fontWeight: '600', margin: 0, color: '#3B5FE6' }}>
                Agent Context Export
              </h3>
            </div>

            <p style={{ fontFamily: FONTS.serif, fontSize: '16px', lineHeight: '1.65', marginBottom: '24px', color: 'rgba(0,0,0,0.75)' }}>
              Export this dossier as structured JSON with embedded meta-prompts to help your agent establish a research workspace and continue investigating this domain.
            </p>

            <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Includes:</div>
              <div>• 7 sequential meta-prompts for workspace setup</div>
              <div>• Protocol data with Ritual primitive mappings</div>
              <div>• Tier list with investment theses</div>
              <div>• Novel concepts (self-repaying perpetuals)</div>
              <div>• Prioritized recommendations</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCopy}
                style={{
                  ...styles.controlButton,
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px 20px',
                  fontSize: '11px'
                }}
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  ...styles.controlButton,
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px 20px',
                  fontSize: '11px',
                  backgroundColor: '#3B5FE6',
                  borderColor: '#3B5FE6',
                  color: '#fff'
                }}
              >
                <Download size={14} />
                Download .json
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: FONTS.mono,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.4)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT SIZE CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

const TextSizeControls = () => {
  const { scale, setScale } = useFontSize();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide on mobile - touch gestures work better for zooming
  if (isMobile) return null;

  const decrease = () => setScale(Math.max(0.8, scale - 0.1));
  const increase = () => setScale(Math.min(1.4, scale + 0.1));

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: '1px solid rgba(0,0,0,0.12)',
    backgroundColor: 'rgba(251,251,251,0.95)',
    cursor: 'pointer',
    color: 'rgba(0,0,0,0.5)',
    transition: 'all 0.15s ease',
    backdropFilter: 'blur(8px)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '24px',
      display: 'flex',
      gap: '1px',
      zIndex: 1000
    }}>
      <button
        onClick={decrease}
        style={{ ...buttonStyle, borderRadius: '4px 0 0 4px' }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59,95,230,0.08)';
          e.currentTarget.style.color = '#3B5FE6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251,251,251,0.95)';
          e.currentTarget.style.color = 'rgba(0,0,0,0.5)';
        }}
        aria-label="Decrease text size"
      >
        <Minus size={14} strokeWidth={2} />
      </button>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
        fontSize: '10px',
        fontFamily: FONTS.mono,
        fontWeight: '500',
        letterSpacing: '0.05em',
        border: '1px solid rgba(0,0,0,0.12)',
        borderLeft: 'none',
        borderRight: 'none',
        backgroundColor: 'rgba(251,251,251,0.95)',
        color: 'rgba(0,0,0,0.5)',
        minWidth: '42px'
      }}>
        {Math.round(scale * 100)}%
      </div>
      <button
        onClick={increase}
        style={{ ...buttonStyle, borderRadius: '0 4px 4px 0' }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59,95,230,0.08)';
          e.currentTarget.style.color = '#3B5FE6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251,251,251,0.95)';
          e.currentTarget.style.color = 'rgba(0,0,0,0.5)';
        }}
        aria-label="Increase text size"
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE STYLES (CSS-in-JS with media query handling)
// ─────────────────────────────────────────────────────────────────────────────

const useResponsiveStyles = (scale) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    page: {
      ...styles.page,
      fontSize: `${17 * scale}px`,
    },
    container: {
      ...styles.container,
      padding: isMobile ? '40px 20px 80px' : '80px 48px 120px',
      maxWidth: isMobile ? '100%' : '880px'
    },
    title: {
      ...styles.title,
      fontSize: isMobile ? `${32 * scale}px` : `${56 * scale}px`,
    },
    subtitle: {
      ...styles.subtitle,
      fontSize: isMobile ? `${10 * scale}px` : `${12 * scale}px`,
    },
    thesis: {
      ...styles.thesis,
      fontSize: isMobile ? `${18 * scale}px` : `${22 * scale}px`,
      padding: isMobile ? '32px 16px' : '48px 40px',
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: isMobile ? `${12 * scale}px` : `${14 * scale}px`,
    },
    cardTitle: {
      ...styles.cardTitle,
      fontSize: isMobile ? `${13 * scale}px` : `${14 * scale}px`,
    },
    cardContent: {
      ...styles.cardContent,
      fontSize: `${17 * scale}px`,
      paddingLeft: isMobile ? '16px' : '25px',
    },
    deepDiveTitle: {
      ...styles.deepDiveTitle,
      fontSize: isMobile ? `${14 * scale}px` : `${16 * scale}px`,
    },
    deepDiveHeader: {
      ...styles.deepDiveHeader,
      padding: isMobile ? '16px 20px' : '24px 28px',
    },
    deepDiveContent: {
      ...styles.deepDiveContent,
      padding: isMobile ? '0 20px 20px' : '0 28px 28px',
    },
    contentArea: {
      ...styles.contentArea,
      fontSize: `${17 * scale}px`,
    },
    isMobile
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [scale, setScale] = useState(1);
  const responsiveStyles = useResponsiveStyles(scale);

  return (
    <FontSizeContext.Provider value={{ scale, setScale }}>
      <div style={responsiveStyles.page}>
        <TextSizeControls />
        <AgentExportButton />
        <div style={responsiveStyles.container}>
          {/* Header */}
          <header style={styles.header}>
            <h1 style={responsiveStyles.title}>{EXECUTIVE_SUMMARY.title}</h1>
            <p style={responsiveStyles.subtitle}>{EXECUTIVE_SUMMARY.subtitle}</p>
          </header>

          {/* Thesis */}
          <p style={responsiveStyles.thesis}>{EXECUTIVE_SUMMARY.thesis}</p>

          {/* Source Artifacts Panel */}
          <SourceArtifactsPanel />

          {/* Key Findings */}
          <section style={styles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Key Findings</h2>
            {EXECUTIVE_SUMMARY.keyFindings.map((finding, i) => (
              <div key={i} style={styles.card}>
                <div style={responsiveStyles.cardTitle}>
                  <span style={styles.cardBullet}>→</span>
                  {finding.title}
                </div>
                <p style={responsiveStyles.cardContent}>{formatInline(finding.content)}</p>
              </div>
            ))}
          </section>

          {/* Recommendations */}
          <section style={styles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Recommendations</h2>
            {EXECUTIVE_SUMMARY.recommendations.map((rec, i) => (
              <div key={i} style={styles.card}>
                <div style={responsiveStyles.cardTitle}>
                  <span style={styles.cardBullet}>◆</span>
                  {rec.title}
                </div>
                <p style={responsiveStyles.cardContent}>{formatInline(rec.content)}</p>
              </div>
            ))}
          </section>

          {/* Deep Dives */}
          <section style={styles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Deep Dives</h2>
            {DEEP_DIVES.map(dive => (
              <DeepDive key={dive.id} dive={dive} />
            ))}
          </section>

          {/* Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px dotted rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: FONTS.mono,
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'rgba(0,0,0,0.4)',
              textTransform: 'uppercase'
            }}>
              Internal Strategy Document · January 2026
            </p>
          </footer>
        </div>
      </div>
    </FontSizeContext.Provider>
  );
}
