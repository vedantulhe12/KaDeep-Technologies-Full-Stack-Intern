# E-Commerce Marketplace Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Amazon-inspired)

**Justification:** E-commerce platforms thrive on familiarity and trust. Amazon's interface patterns are universally recognized, reducing cognitive load and building immediate user confidence. This approach prioritizes:
- Dense information presentation for efficient product discovery
- Proven conversion-optimized layouts
- Strong navigational hierarchy for large product catalogs
- Trust-building through reviews, ratings, and clear product information

**Key Design Principles:**
1. Information density over minimalism - users want options visible
2. Functional clarity beats aesthetic experimentation
3. Consistent patterns across product browsing experiences
4. Speed and scannability in product presentation

## Typography System

**Font Selection:** 
- Primary: "Amazon Ember" alternative → Use "Inter" or "Open Sans" from Google Fonts
- Fallback: System sans-serif stack

**Hierarchy:**
- H1: text-3xl font-bold (Homepage categories, main headers)
- H2: text-2xl font-semibold (Section titles, product names on detail pages)
- H3: text-lg font-semibold (Category labels, subsection headers)
- Product titles in grids: text-sm font-normal (truncate to 2 lines)
- Body text: text-sm (product descriptions, reviews)
- Price display: text-xl font-bold (detail pages), text-lg font-semibold (grid cards)
- Small text: text-xs (shipping info, fine print, metadata)

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, and 8** consistently
- Micro spacing: p-2, gap-2 (tight element grouping)
- Standard spacing: p-4, gap-4, mb-4 (card padding, list gaps)
- Section spacing: py-6, px-6 (content areas)
- Major sections: py-8, px-8 (page-level containers)

**Container Strategy:**
- Max width: max-w-7xl mx-auto for main content
- Full-width header/footer
- Sidebar + content: 1/4 + 3/4 split (grid-cols-4, sidebar spans 1, content spans 3)

**Grid Patterns:**
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
- Featured products: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Category tiles: grid-cols-2 md:grid-cols-4

## Component Library

### Navigation System

**Top Navigation Bar:**
- Fixed header with search bar occupying 60% center width
- Left: Logo + category dropdown menu
- Right: Account, cart with badge count
- Height: h-16
- Search bar with rounded corners (rounded-md), includes category dropdown + search button

**Category Navigation:**
- Horizontal scrollable category bar below main header (h-12)
- Individual category items with hover states
- "All Departments" mega-menu dropdown overlay

**Breadcrumbs:** 
- text-xs with chevron separators
- mb-4 below header

### Product Display Components

**Product Card (Grid View):**
- Aspect ratio 3:4 image container
- Image with object-cover, rounded-t-lg
- p-4 content area below image
- Title (2-line truncate)
- Star rating + review count (inline-flex items-center gap-2)
- Price (bold, prominent)
- Prime/shipping badge (if applicable)
- Hover: subtle shadow elevation (shadow-md)

**Product Detail Layout:**
- Two-column: Images (60%) | Product info (40%)
- Image gallery: Main image + thumbnail strip below
- Info panel: Title, rating, price, brief description, quantity selector, Add to Cart CTA, secondary actions

**Search Results:**
- Filters sidebar (w-1/4)
- Results grid (w-3/4)
- Results count + sorting dropdown at top
- Pagination at bottom

### Shopping Experience

**Cart Sidebar/Page:**
- List layout (not grid)
- Each item: thumbnail (w-24) + details + quantity controls + remove button
- Subtotal calculation sticky at bottom
- "Proceed to Checkout" CTA (w-full)

**Checkout Flow:**
- Single-page with sections: Shipping → Payment → Review
- Accordion-style collapsible sections
- Order summary sticky sidebar on desktop

### Trust & Social Proof

**Review Component:**
- Star rating with numerical average (text-2xl)
- Rating distribution bar chart
- Individual reviews: Avatar + name + verified badge + star rating + date + helpful votes

**Trust Badges:**
- Secure checkout icons
- Return policy highlights
- Customer service availability

### Forms & Inputs

**Input Fields:**
- h-12 standard height
- rounded-md borders
- Prominent labels (text-sm font-medium mb-2)
- Error states with text-red-600 text-xs messages

**Buttons:**
- Primary CTA: h-12 rounded-lg font-semibold (Add to Cart, Buy Now)
- Secondary: h-10 rounded-md (Add to Wishlist, Share)
- Text buttons for tertiary actions

## Page Layouts

**Homepage:**
1. Hero carousel (h-96) with 3-5 rotating promotional banners
2. Category shortcuts grid (4-6 cards with images)
3. "Deals of the Day" horizontal scroll
4. Featured products grid
5. "Shop by Department" section
6. Customer reviews/testimonials
7. Footer with multiple columns (About, Customer Service, Categories, Social)

**Product Listing Page:**
- Filters sidebar (fixed/sticky on desktop)
- Active filters as removable chips
- Product grid with pagination
- "Sponsored" products mixed in

**Product Detail Page:**
- Image gallery (60% width)
- Product information panel (40% width)
- Below fold: Detailed description, specifications table, Q&A, reviews section
- "Frequently bought together" + "Customers also viewed" carousels

## Images

**Hero Section:** Full-width carousel (h-96) featuring:
- Promotional banners with product photography
- Sale announcements with lifestyle imagery
- New arrivals with clean product shots
- Each slide includes promotional text overlay with CTA button (blurred background for text/buttons)

**Product Images:**
- High-quality product photography on white/neutral backgrounds
- Multiple angles available in gallery
- Zoom functionality on hover/click
- Thumbnails should be 80x80px

**Category Cards:**
- Representative product or lifestyle images
- 4:3 aspect ratio recommended

**Lifestyle/Context Images:**
- Use throughout for "how it works" sections
- Customer review photos where applicable
- "Shop by Room/Style" sections with curated imagery

**Trust Elements:**
- Customer photo reviews
- Brand logos (if multi-vendor)
- Security/payment provider badges (use official logos)