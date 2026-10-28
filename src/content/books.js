// ALL portfolio copy lives here. Never invent facts: leave TODO: until Aarush supplies them.
// Source: Aarush's CS and Business résumés (Oct 2026), copied to public/resume-*.pdf.
// shelf: 0 = bottom shelf, counting up. slot: spine position from the left of that shelf.
// Each page is a short HTML string; keep one idea per page so it fits without scrolling.

const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

const project = ({ name, stack, points, href, label }) =>
  `<h3>${name}</h3>
  <p class="stack">${stack}</p>
  <ul>${points.map((p) => `<li>${p}</li>`).join('')}</ul>
  ${href ? `<p>${link(href, label ?? 'View it')}</p>` : ''}`;

export const OWNER = {
  name: 'Aarush Singh',
  whoami:
    'CS at Waterloo + Business at Laurier (double degree). I build data pipelines, ML tools and full-stack apps, and research FICC markets.',
};

export const BOOKS = [
  {
    slug: 'resume',
    title: 'Résumé',
    call: 'HF5383 .S56 2026',
    shelf: 2,
    slot: 4,
    aliases: ['cv', 'resume.pdf'],
    pages: [
      `<h3>Education</h3>
      <p><b>University of Waterloo</b><br>BMath, Computer Science (Honours)<br>Presidential Scholarship<br>2025 – 2030</p>
      <p><b>Wilfrid Laurier University</b><br>BBA (Honours), double degree<br>2025 – 2030</p>`,

      `<h3>Research Analyst, FICC</h3>
      <p class="stack">Whitestone Capital · Waterloo · Oct 2026 – now</p>
      <ul>
        <li>Fundamental research on rates, currencies and commodities for a cross-university equity research firm.</li>
        <li>Thesis-driven research through industry analysis and financial modelling.</li>
      </ul>`,

      `<h3>Software Engineering Intern</h3>
      <p class="stack">Ministry of Statistics and Programme Implementation · New Delhi · May – Aug 2026</p>
      <ul>
        <li>Built databases in SQL, Python and Excel now holding 10.8M+ records.</li>
        <li>Python ETL pipelines loading 80+ survey workbooks into the Unified Data Platform (100,000+ datasets).</li>
        <li>Benchmarked AI data tools on NSS, NAS and AISHE.</li>
      </ul>`,

      `<h3>Leadership</h3>
      <p><b>President, Movie Club</b> · UW · Jan – Apr 2026<br>Ran screenings and the budget; grew attendance 30–40% per screening.</p>
      <p><b>Director of First Year Affairs</b> · MathSoc · Sep – Dec 2025<br>Led 4 reps; comms to 5,000+ Math students.</p>
      <p><b>BDO Future Leaders Challenge</b> · Semi-finalist, top 17% · Mar 2026</p>`,

      `<h3>Skills</h3>
      <p><b>Languages:</b> C++, C, Python, SQL, JavaScript, TypeScript</p>
      <p><b>Frameworks:</b> Next.js, React, Tailwind, Flask, pandas, NumPy, PyTorch, scikit-learn</p>
      <p><b>Cloud &amp; tools:</b> AWS (Lambda, EventBridge, S3, Aurora, Bedrock), PostgreSQL, Supabase, Docker, Git, Linux</p>
      <p><b>Certifications:</b> Bloomberg Market Concepts, Bloomberg Finance Fundamentals</p>`,

      `<h3>Take a copy</h3>
      <p>Two editions on file:</p>
      <p>${link('/resume-cs.pdf', 'Computer Science résumé (PDF)')}</p>
      <p>${link('/resume-business.pdf', 'Business résumé (PDF)')}</p>`,
    ],
  },
  {
    slug: 'projects',
    title: 'Projects',
    call: 'QA76.76 .S56 2026',
    shelf: 4,
    slot: 11,
    aliases: ['work', 'portfolio'],
    pages: [
      project({
        name: 'Campus Marketplace',
        stack: 'Next.js 15 · Supabase · Tailwind',
        points: [
          'Marketplace for @uwaterloo.ca accounts: listings, wanted posts, filters, search.',
          '11 Postgres tables, 53 row-level security policies, 27 indexes.',
          'Admin moderation dashboard; 50+ early-adopter students.',
        ],
        href: 'https://waterloot.ca',
        label: 'waterloot.ca',
      }),
      project({
        name: 'Brokeberg',
        stack: 'Python · AWS · pgvector · Bedrock · Next.js',
        points: [
          'Political intelligence terminal: event-driven ETL on AWS ingesting 7 public sources.',
          '6-pass LLM extraction on Bedrock tying every claim to source text, with an eval harness.',
          'Links economic data to Senate races in a Bloomberg-style UI.',
        ],
        href: 'https://github.com/Aarush2801/brokeberg',
        label: 'Code on GitHub',
      }),
      project({
        name: 'Indian Job Market Visualiser',
        stack: 'Python · pandas · JavaScript',
        points: [
          "Karpathy's U.S. occupation treemap, rebuilt for India from 1.15M survey records.",
          'Scaled to 617M workers using official projections.',
          'Dependency-free canvas treemap; AI-exposure scores for 126 occupations.',
        ],
      }),
      project({
        name: 'Forest Analyzer',
        stack: 'Python · Flask · Earth Engine · Leaflet',
        points: [
          'Measures forest loss anywhere using 10m Sentinel-2 imagery.',
          'NDVI change year over year, shown on a live colour-coded map.',
        ],
        href: 'https://github.com/Aarush2801/forest-analyzer',
        label: 'Code on GitHub',
      }),
      project({
        name: 'APEX',
        stack: 'Python · NumPy · FastAPI · Next.js',
        points: [
          'Multi-agent motorsport safety stress tester: 22 driver agents at 20 Hz.',
          '10,000+ scenarios per batch, scored with TTC, PET and SSAM-style conflicts.',
        ],
        href: 'https://github.com/Aarush2801/Formula-Tech-Hax',
        label: 'Code on GitHub',
      }),
      project({
        name: 'Volatility Forecasting',
        stack: 'Python · PyTorch · scikit-learn',
        points: [
          'Next-week S&amp;P 500 volatility with EWMA, HAR and LSTM on 16+ years of data.',
          'LSTM cut RMSE 12% vs EWMA and 6% vs HAR out of sample.',
          'Leakage-free pipeline and a CLI that retrains weekly.',
        ],
      }),
    ],
  },
  {
    slug: 'github',
    title: 'GitHub',
    call: 'QA76.9 .S56 2026',
    shelf: 1,
    slot: 16,
    aliases: ['gh', 'git', 'code'],
    pages: [
      `<h3>@Aarush2801</h3>
      <p>Most of my code lives here.</p>
      <p>${link('https://github.com/Aarush2801', 'github.com/Aarush2801')}</p>`,
      `<h3>Start with</h3>
      <ul>
        <li>${link('https://github.com/Aarush2801/brokeberg', 'brokeberg')}</li>
        <li>${link('https://github.com/Aarush2801/forest-analyzer', 'forest-analyzer')}</li>
        <li>${link('https://github.com/Aarush2801/Formula-Tech-Hax', 'Formula-Tech-Hax')} (APEX)</li>
        <li>${link('https://github.com/Aarush2801/Library', 'Library')}: this site</li>
      </ul>`,
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    call: 'HE6183 .S56 2026',
    shelf: 0,
    slot: 7,
    aliases: ['email', 'mail', 'hire', 'linkedin'],
    pages: [
      `<h3>Say hello</h3>
      <p><b>Email</b><br><a href="mailto:a882sing@uwaterloo.ca">a882sing@uwaterloo.ca</a></p>
      <p><b>LinkedIn</b><br>${link('https://linkedin.com/in/aarushsingh28', 'linkedin.com/in/aarushsingh28')}</p>
      <p><b>GitHub</b><br>${link('https://github.com/Aarush2801', 'github.com/Aarush2801')}</p>`,
    ],
  },
  {
    slug: 'nes',
    title: 'NES Manual',
    call: 'GV1469.32 .N47',
    shelf: 3,
    slot: 2,
    aliases: ['nintendo', 'manual'],
    pages: ['Some doors still open for an old adventurer’s word. Type it at the desk.'],
  },
  {
    slug: 'rs',
    title: 'R.S.',
    call: 'Z1041 .R7',
    shelf: 5,
    slot: 13,
    aliases: [],
    hidden: true,
    pages: ['TODO: what the hidden R.S. book contains.'],
  },
];
