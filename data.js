// Content for the inner pages (services, portfolio, blog)

export const SERVICES = [
  {
    slug: 'architecture', name: 'Architecture', img: 'architecture.jpg',
    title: 'Premium architectural design from Element Design',
    lead: 'We design complete homes and buildings, fully prepared for construction',
    text: 'You receive architectural documentation prepared to a professional standard, so you can set an accurate budget and begin building with confidence. Our level of detailing keeps the design and the finished building aligned.',
    points: [['Turnkey project', 'The full cycle, from the first sketch to the handover of a finished property'],
             ['Predictable outcome', 'Visualizations, detailed drawings, clear stages and construction supervision'],
             ['Detailed documentation', 'Concept drawings and working documentation for smooth implementation'],
             ['Support after completion', 'Our team stays with you after the project is delivered']]
  },
  {
    slug: 'interior', name: 'Interiors', img: 'interiors.jpg',
    title: 'Interior design for homes by Element Design',
    lead: 'Interiors tailored to the way you live, drawn from your own sketches and lifestyle scenarios',
    text: 'From layout planning to materials, lighting and furniture, we shape every room as part of one unified idea, so the finished home feels calm, personal and built to last.',
    points: [['Bespoke concept', 'Every space is drawn around your habits, taste and references'],
             ['Complete package', 'Layouts, 3D visualizations, working drawings and specifications'],
             ['Quality materials', 'Stone, veneer, metal and textiles chosen for detail and durability'],
             ['One responsible team', 'Design, procurement and supervision under one roof']],
    children: ['villas', 'private-houses', 'residences', 'cottages', 'mansions', 'penthouses', 'apartments']
  },
  {
    slug: 'commercial-interior', name: 'For business', img: 'commercial.jpg',
    title: 'Commercial interiors by Element Design',
    lead: 'Spaces that express your brand and work hard for your business',
    text: 'We design hospitality, retail and office interiors that balance atmosphere with operations: guest flow, staff routes, lighting and acoustics are planned together with the look and feel.',
    points: [['Brand-led design', 'The interior carries your identity from the entrance to the last detail'],
             ['Operational thinking', 'Layouts planned around guests, staff and service routes'],
             ['Fast, clear process', 'Milestones and schedules you can track from day one'],
             ['Reliable delivery', 'Coordinated suppliers, contractors and on-site supervision']],
    children: ['hotels', 'restaurants', 'resorts', 'offices', 'spa-wellness', 'common-areas', 'bars']
  },
  {
    slug: 'bim', name: 'Bim engineering', img: 'drawings.jpg',
    title: 'BIM engineering for design and construction',
    lead: 'Digital building models that remove surprises before the site opens',
    text: 'A coordinated 3D information model brings architecture, structure and building services together. Clashes are found on screen, quantities are measured accurately and the budget stays predictable.',
    points: [['Coordinated model', 'Architecture and engineering systems checked against each other'],
             ['Accurate quantities', 'Material take-offs that support precise budgeting'],
             ['Fewer site changes', 'Conflicts are solved at the drawing stage'],
             ['Clear documentation', 'Drawings generated from one source of truth']]
  },
  {
    slug: 'design-supervision', name: 'Design supervision', img: 'construction.jpg',
    title: 'Design supervision on site',
    lead: 'We visit the site and keep the build true to the design',
    text: 'Our designers and architects inspect the work at the key stages, answer questions from the builders and approve materials and details, so the result matches what you approved on paper.',
    points: [['Scheduled site visits', 'Inspections at the stages that matter most'],
             ['Quick decisions', 'Questions from the site answered without delay'],
             ['Material approval', 'Samples and finishes checked before they are installed'],
             ['Photo reports', 'You see progress without being on site']]
  },
  {
    slug: 'construction-management', name: 'Construction management', img: 'construction.jpg',
    title: 'Construction management',
    lead: 'One team coordinating contractors, schedules and quality',
    text: 'We plan the works, coordinate trades, control quality and report to you regularly, so the project stays on schedule and on budget while you carry on with your life.',
    points: [['Detailed schedule', 'Every stage planned and tracked'],
             ['Quality control', 'Work checked against the drawings and specifications'],
             ['Transparent budget', 'Costs reported openly as the project moves'],
             ['Online reporting', 'Follow construction progress from anywhere']]
  },
  {
    slug: 'procurement', name: 'Procurement', img: 'schedule.jpg',
    title: 'Procurement of materials and furniture',
    lead: 'Everything in the design, sourced, checked and delivered on time',
    text: 'We source materials, furniture, lighting and decor from trusted suppliers and manufacturers, compare options, negotiate and schedule deliveries to match the construction timeline.',
    points: [['Trusted suppliers', 'Vendors and manufacturers we know and have worked with'],
             ['Matched to the design', 'Every item checked against the approved specification'],
             ['Delivery planning', 'Orders timed to the build, not left to chance'],
             ['Single point of contact', 'One team handling orders, tracking and issues']]
  }
];

const sub = (slug, name, parent, text) => ({ slug, name, parent, text });
export const SUBSERVICES = [
  sub('villas', 'Villas', 'interior', 'Villa interiors that connect indoor living with terraces, gardens and views.'),
  sub('private-houses', 'Private houses', 'interior', 'Family houses planned room by room around daily routines.'),
  sub('residences', 'Residences', 'interior', 'Large residences designed as one coherent, welcoming whole.'),
  sub('cottages', 'Cottages', 'interior', 'Warm, relaxed cottage interiors that feel at home in their setting.'),
  sub('mansions', 'Mansions', 'interior', 'Grand spaces with generous proportions and carefully chosen materials.'),
  sub('penthouses', 'Penthouses', 'interior', 'Sky-high homes that make the most of light, height and views.'),
  sub('apartments', 'Apartments', 'interior', 'Smart, comfortable apartment layouts with premium finishes.'),
  sub('hotels', 'Hotels', 'commercial-interior', 'Hotel lobbies, rooms and suites designed for atmosphere and smooth service.'),
  sub('restaurants', 'Restaurants', 'commercial-interior', 'Restaurant interiors that set the mood and keep the kitchen and floor working in step.'),
  sub('resorts', 'Resorts', 'commercial-interior', 'Resort architecture and interiors that make guests want to stay longer.'),
  sub('offices', 'Offices', 'commercial-interior', 'Offices that support focus, collaboration and your company identity.'),
  sub('spa-wellness', 'Spa & Wellness', 'commercial-interior', 'Calm, sensory spa and wellness spaces with careful lighting and acoustics.'),
  sub('common-areas', 'Common areas', 'commercial-interior', 'Lobbies and shared spaces that raise the value of a whole building.'),
  sub('bars', 'Bars', 'commercial-interior', 'Bars and lounges with character, built for long evenings.')
];

export const PORTFOLIO_CATS = [
  { slug: 'all', name: 'All projects' },
  { slug: 'architectural-design', name: 'Architectural design' },
  { slug: 'residential-interiors', name: 'Interior design' },
  { slug: 'commercial-interiors', name: 'Commercial interiors' }
];
export const PROJECTS = [
  { cat: 'architectural-design', img: 'architecture.jpg', pos: 'center 35%', title: 'Contemporary residence with terraced gardens', meta: 'Architectural design · India' },
  { cat: 'residential-interiors', img: 'interiors.jpg', pos: 'center 50%', title: 'Marble and walnut kitchen with a feature island', meta: 'Interior design · India' },
  { cat: 'commercial-interiors', img: 'commercial.jpg', pos: 'center 55%', title: 'Executive office in warm neutrals', meta: 'Commercial interiors · India' }
];

export const BLOG = [
  {
    slug: 'india-top-25-interior-designers',
    title: "India's Top 25 Interior Designers: The Language of Elements",
    theme: 'Press', date: '07/06/2026', read: '~ 3 min',
    img: 'img/blog-top25-thumb.jpg', pos: 'center', heroPos: 'center',
    lead: 'The Element Designs is featured among India’s Top 25 Interior Designers in Bombay FilmFame Magazine, with the story “The Language of Elements: Crafting Interiors That Flow, Feel and Endure.”',
    source: 'https://www.instagram.com/p/DZUEi7Ck-Q2/',
    body: [
      ['p', 'Bombay FilmFame Magazine has named The Element Designs among India’s Top 25 Interior Designers. The Mumbai feature profiles the studio’s founders, Yogesh Mewada and Nitish Tiwari, and the thinking behind their work.'],
      ['h2', 'Design that is felt, not just seen'],
      ['p', 'In an era where design is often seen before it is felt, Yogesh Mewada and Nitish Tiwari choose a rarer path: spaces that are not merely created, but deeply understood. Founded in 2017, the studio has emerged as a quiet force in India’s design landscape, treating luxury as something far more intimate than visual indulgence — an experience that unfolds slowly, lingers gently and lives meaningfully.'],
      ['p', 'With more than a decade and a half of individual creative journeys, the two founders bring together a shared sensibility that is both intuitive and exacting. Their work is not driven by trend, but by truth: a careful orchestration of proportion, material and emotion.'],
      ['quote', 'We don’t believe in creating statements, we believe in creating spaces that quietly stay relevant long after trends disappear.', 'Yogesh Mewada and Nitish Tiwari, Founders — The Element Designs'],
      ['h2', 'The Language of Elements'],
      ['p', 'The feature is titled “The Language of Elements: Crafting Interiors That Flow, Feel and Endure”, a line that sums up how the studio approaches every project, from a private home to a commercial reception.'],
      ['img', 'img/blog-top25.jpg', 'The Element Designs feature in Bombay FilmFame Magazine', 'tall'],
      ['p', 'Our thanks to Bombay FilmFame Magazine for the recognition. Every project we take on is shaped by the same belief: a space should serve the people who live and work in it, and look better with every year.']
    ]
  },
  {
    slug: 'times-of-india-home-and-decor-awards-2026',
    title: 'Nominated for the Times of India Home & Decor Awards 2026',
    theme: 'Awards', date: '01/10/2026', read: '~ 2 min',
    img: 'img/blog-toi-nominated.jpg', pos: 'center 30%', heroPos: 'center 30%',
    lead: 'A milestone worth celebrating: Team Element Designs is nominated for the Times of India Home & Decor Awards 2026.',
    source: 'https://www.instagram.com/p/Dd87x2dANfL/',
    body: [
      ['p', 'Being nominated for the Times of India Home & Decor Awards 2026 is a proud moment for Team Element Designs — a recognition of the ideas, details and countless hours that go into every space we create.'],
      ['p', 'It is a reminder that when design is driven by purpose, every space has a story worth telling.'],
      ['img', 'img/blog-toi-nominated.jpg', 'Nominated for Times of India Home & Decor Awards 2026', 'tall'],
      ['h2', 'A glimpse of our journey in Delhi'],
      ['p', 'The team travelled to Delhi for the awards, celebrating the theme “Vision. Passion. Excellence.” alongside designers and creators from across the country.'],
      ['p', 'Thank you to everyone who has trusted us with their homes and workplaces. The nomination belongs to our clients and to the whole team.']
    ]
  }
];
