/**
 * LLM Output Parser
 * Converts markdown-like LLM responses into clean, styled HTML
 */

export const LLMParser = {
  /**
   * Main entry point - parses raw LLM text into HTML
   * @param {string} text - Raw LLM response
   * @returns {string} - Formatted HTML
   */
  parse(text) {
    if (!text) return "";
    
    // Process different block types
    return this.parseBlocks(text);
  },

  /**
   * Parse all block-level elements
   */
  parseBlocks(content) {
    const lines = content.split('\n');
    let html = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (trimmed === '') {
        i++;
        continue;
      }

      // Check for table (starts with |)
      if (trimmed.startsWith('|')) {
        const tableResult = this.parseTable(lines, i);
        html += tableResult.html;
        i = tableResult.nextIndex;
        continue;
      }

      // Check for unordered list
      if (trimmed.match(/^[-*•]\s/)) {
        const listResult = this.parseUnorderedList(lines, i);
        html += listResult.html;
        i = listResult.nextIndex;
        continue;
      }

      // Check for ordered list (1. 2. etc)
      if (trimmed.match(/^\d+\.\s/)) {
        const listResult = this.parseOrderedList(lines, i);
        html += listResult.html;
        i = listResult.nextIndex;
        continue;
      }

      // Check for headers
      if (trimmed.startsWith('#')) {
        html += this.parseHeader(trimmed);
        i++;
        continue;
      }

      // Check for blockquote
      if (trimmed.startsWith('>')) {
        const quoteResult = this.parseBlockquote(lines, i);
        html += quoteResult.html;
        i = quoteResult.nextIndex;
        continue;
      }

      // Check for horizontal rule
      if (trimmed.match(/^[-*_]{3,}$/)) {
        html += '<hr class="llm-hr">';
        i++;
        continue;
      }

      // Check for code block
      if (trimmed.startsWith('```')) {
        const codeResult = this.parseCodeBlock(lines, i);
        html += codeResult.html;
        i = codeResult.nextIndex;
        continue;
      }

      // Default: paragraph
      html += `<p class="llm-paragraph">${this.parseInline(line)}</p>`;
      i++;
    }

    return html;
  },

  /**
   * Parse inline elements (bold, italic, code, links)
   */
  parseInline(text) {
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code class="llm-inline-code">$1</code>');
    
    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return text;
  },

  /**
   * Parse markdown table into semantic HTML table
   */
  parseTable(lines, startIndex) {
    let i = startIndex;
    const rows = [];
    let separatorIndex = -1;
    
    // Collect all consecutive table rows
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line.startsWith('|')) break;
      
      rows.push(line);
      
      // Detect separator row (contains only |, -, :, spaces)
      if (separatorIndex === -1 && line.match(/^\|[\s:|=-]+\|$/)) {
        separatorIndex = rows.length - 1;
      }
      
      i++;
    }

    if (rows.length === 0) {
      return { html: '', nextIndex: i };
    }

    // Parse cells from a row string
    const parseCells = (row) => {
      // Split by pipe, remove first and last empty elements
      let cells = row.split('|').slice(1, -1);
      
      // Trim and filter empty cells
      return cells
        .map(cell => cell.trim())
        .filter(cell => cell && !cell.match(/^[-:\s]+$/)); // Exclude separator patterns
    };

    // Build HTML table
    let html = '<table class="llm-table"><thead>';
    
    let headerProcessed = false;
    
    // Process each row
    rows.forEach((row, index) => {
      // Skip separator row completely
      if (row.match(/^\|[\s:|=-]+\|$/)) {
        return;
      }

      const cells = parseCells(row);
      if (cells.length === 0) return;

      // Determine if this is a header row
      let isHeader = false;
      if (separatorIndex > 0) {
        // If separator exists, rows before it are headers
        isHeader = index < separatorIndex && !headerProcessed;
      } else {
        // If no separator, only first row is header
        isHeader = index === 0 && !headerProcessed;
      }

      if (isHeader) {
        html += '<tr>';
        cells.forEach(cell => {
          html += `<th>${this.parseInline(cell)}</th>`;
        });
        html += '</tr>';
        headerProcessed = true;
        
        // Close thead and open tbody after header
        if (separatorIndex >= 0 || index === 0) {
          html += '</thead><tbody>';
        }
      } else {
        // Data row
        if (!headerProcessed && separatorIndex === -1) {
          // Safety: close thead if not already done
          html += '</thead><tbody>';
          headerProcessed = true;
        }
        
        html += '<tr>';
        cells.forEach(cell => {
          html += `<td>${this.parseInline(cell)}</td>`;
        });
        html += '</tr>';
      }
    });

    // Ensure tbody is closed
    if (html.includes('<thead>') && !html.includes('</tbody>')) {
      html += '</tbody>';
    }

    html = `<div class="llm-table-container">${html}</table></div>`;
    
    return { html, nextIndex: i };
  },

  /**
   * Parse unordered list
   */
  parseUnorderedList(lines, startIndex) {
    let i = startIndex;
    let html = '<ul class="llm-list">';

    while (i < lines.length) {
      const trimmed = lines[i].trim();
      
      if (trimmed.match(/^[-*•]\s/)) {
        const content = trimmed.replace(/^[-*•]\s/, '');
        html += `<li>${this.parseInline(content)}</li>`;
        i++;
      } else if (trimmed === '') {
        // Allow one empty line within list
        if (i + 1 < lines.length && lines[i + 1].trim().match(/^[-*•]\s/)) {
          i++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    html += '</ul>';
    return { html, nextIndex: i };
  },

  /**
   * Parse ordered list
   */
  parseOrderedList(lines, startIndex) {
    let i = startIndex;
    let html = '<ol class="llm-list llm-list-ordered">';

    while (i < lines.length) {
      const trimmed = lines[i].trim();
      
      if (trimmed.match(/^\d+\.\s/)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        html += `<li>${this.parseInline(content)}</li>`;
        i++;
      } else if (trimmed === '') {
        if (i + 1 < lines.length && lines[i + 1].trim().match(/^\d+\.\s/)) {
          i++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    html += '</ol>';
    return { html, nextIndex: i };
  },

  /**
   * Parse header (# ## ### etc)
   */
  parseHeader(line) {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      return `<h${level} class="llm-header llm-h${level}">${this.parseInline(text)}</h${level}>`;
    }
    return `<p class="llm-paragraph">${this.parseInline(line)}</p>`;
  },

  /**
   * Parse blockquote
   */
  parseBlockquote(lines, startIndex) {
    let i = startIndex;
    let content = [];

    while (i < lines.length) {
      const trimmed = lines[i].trim();
      
      if (trimmed.startsWith('>')) {
        content.push(trimmed.replace(/^>\s?/, ''));
        i++;
      } else if (trimmed === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
        content.push('');
        i++;
      } else {
        break;
      }
    }

    const html = `<blockquote class="llm-blockquote">${this.parseInline(content.join('<br>'))}</blockquote>`;
    return { html, nextIndex: i };
  },

  /**
   * Parse code block
   */
  parseCodeBlock(lines, startIndex) {
    let i = startIndex;
    const firstLine = lines[i].trim();
    const lang = firstLine.replace('```', '').trim();
    i++;
    
    const codeLines = [];
    while (i < lines.length && !lines[i].trim().startsWith('```')) {
      codeLines.push(lines[i]);
      i++;
    }
    
    // Skip closing ```
    if (i < lines.length) i++;

    const code = codeLines.join('\n');
    const langClass = lang ? ` language-${lang}` : '';
    
    const html = `<pre class="llm-code-block${langClass}"><code>${code}</code></pre>`;
    return { html, nextIndex: i };
  }
};
