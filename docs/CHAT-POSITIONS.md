# Chat Window Positioning Guide

The AI chat window supports **6 different positions** to match your site's design and user experience needs.

## Position Types

### 1. Popup Positions
Floating chat windows that appear above your content, similar to common chat widgets.

### 2. Docked Positions
Chat windows that are fixed to the edges of the screen, like sidebars or bottom bars.

---

## Available Positions

### Popup: `bottom-right` (Default)

**Best for:** Traditional chat widget experience

```yaml
chat:
  window:
    position: "bottom-right"
    width: 400
    height: 600
```

- Appears in bottom-right corner
- 80px from bottom (above chat button)
- 20px from right edge
- Most common position for chat widgets
- Doesn't obstruct main content

---

### Popup: `bottom-center`

**Best for:** Maximum visibility, centered engagement

```yaml
chat:
  window:
    position: "bottom-center"
    width: 400
    height: 600
```

- Centered horizontally at bottom
- 80px from bottom
- Great for announcements or important chats
- High visibility

---

### Popup: `bottom-left`

**Best for:** Alternative to bottom-right, RTL languages

```yaml
chat:
  window:
    position: "bottom-left"
    width: 400
    height: 600
```

- Appears in bottom-left corner
- 80px from bottom
- 20px from left edge
- Good for sites with right-side content

---

### Docked: `right-docked`

**Best for:** Documentation sites, persistent chat sidebar

```yaml
chat:
  window:
    position: "right-docked"
    width: 400  # Sidebar width
    height: 600 # Not used (full height)
```

- Full-height sidebar on right
- Takes up `width` pixels from right edge
- Always visible (not floating)
- Great for:
  - Documentation sites
  - Knowledge bases
  - Dashboard interfaces
  - Sites with left-side nav

**Note:** Main content will need to account for sidebar width.

---

### Docked: `left-docked`

**Best for:** Alternative sidebar position

```yaml
chat:
  window:
    position: "left-docked"
    width: 400  # Sidebar width
    height: 600 # Not used (full height)
```

- Full-height sidebar on left
- Takes up `width` pixels from left edge
- Always visible
- Good for:
  - Sites with right-side navigation
  - RTL language sites
  - Alternative sidebar layouts

---

### Docked: `bottom-docked`

**Best for:** Mobile-friendly, horizontal layouts

```yaml
chat:
  window:
    position: "bottom-docked"
    width: 400  # Not used (full width)
    height: 400 # Bar height
```

- Full-width bar at bottom
- Takes up `height` pixels from bottom
- Always visible
- Excellent for:
  - Mobile-first designs
  - Wide screens
  - Horizontal chat layouts
  - Sites with top navigation

---

## Choosing the Right Position

### For Traditional Sites
**Recommendation:** `bottom-right` (default)
- Familiar to users
- Doesn't interfere with content
- Works on all screen sizes

### For Documentation/Knowledge Base
**Recommendation:** `right-docked` or `left-docked`
- Always accessible
- Persistent presence
- Natural for Q&A flow
- Works well with table of contents on opposite side

### For Mobile-First Sites
**Recommendation:** `bottom-docked` or `bottom-center`
- `bottom-docked`: Full-width, minimal height
- `bottom-center`: Centered popup
- Both work well on narrow screens

### For Maximum Engagement
**Recommendation:** `bottom-center`
- Highly visible
- Hard to miss
- Great for important announcements
- Can be distracting if overused

---

## Responsive Behavior

### Mobile Screens (< 768px)

**Popup Positions:**
- Automatically center at bottom
- Max width: 400px or viewport - 40px
- Maintains aspect ratio

**Docked Positions:**
- `right-docked` & `left-docked`: Full width on mobile
- `bottom-docked`: Remains full width
- All maintain configured height

---

## Combining Button & Window Positions

The chat **button** and **window** positions are independent. Here are some combinations:

### Example 1: Bottom-Center Button → Right Popup
```yaml
chat:
  button:
    position: "bottom-center"
  window:
    position: "bottom-right"
```
Button centered, window appears on right.

### Example 2: Bottom-Right Button → Right Sidebar
```yaml
chat:
  button:
    position: "bottom-right"
  window:
    position: "right-docked"
```
Button in corner, expands to full sidebar.

### Example 3: Bottom-Center Button → Bottom Bar
```yaml
chat:
  button:
    position: "bottom-center"
  window:
    position: "bottom-docked"
```
Button centers, expands to full-width bar.

---

## Width & Height Guidelines

### Popup Positions
- **Width:** 350-450px (400px recommended)
- **Height:** 500-700px (600px recommended)
- Too narrow: Hard to read messages
- Too wide: Obstructs content
- Too tall: Difficult to see top on smaller screens

### Docked Positions

**Sidebars (right-docked, left-docked):**
- **Width:** 300-500px (400px recommended)
- **Height:** Ignored (uses 100vh)
- Narrower for more content space
- Wider for comfortable reading

**Bottom Bar (bottom-docked):**
- **Width:** Ignored (uses 100vw)
- **Height:** 300-500px (400px recommended)
- Taller for more chat history
- Shorter to preserve content space

---

## Testing Different Positions

To test different positions, simply change the config:

```yaml
# Test 1: Default popup
chat:
  window:
    position: "bottom-right"

# Test 2: Sidebar
chat:
  window:
    position: "right-docked"

# Test 3: Bottom bar
chat:
  window:
    position: "bottom-docked"
```

Restart dev server and reload page to see changes.

---

## Best Practices

1. **Match your site layout:**
   - Left nav? → Use `right-docked`
   - Right sidebar? → Use `left-docked`
   - Clean design? → Use `bottom-right` popup

2. **Consider your audience:**
   - Power users? → Docked (always available)
   - Casual visitors? → Popup (less intrusive)

3. **Test on mobile:**
   - All positions work on mobile
   - Docked positions take more screen space
   - Popups are generally safer for mobile

4. **Content first:**
   - Don't let chat obscure important content
   - Docked positions reduce content area
   - Popups can be minimized/closed

---

## Troubleshooting

**Chat appears in wrong position:**
- Check `window.position` in config
- Restart dev server after config changes
- Clear browser cache

**Chat too wide/narrow:**
- Adjust `width` for popup and sidebar positions
- Adjust `height` for bottom-docked position

**Chat blocks content:**
- Try a different position
- Reduce width/height
- Use popup instead of docked

**Not mobile-friendly:**
- Test on actual mobile device
- Consider `bottom-docked` for mobile
- Use smaller dimensions
