// Word bank: common natural words heavy on each key
// Used to generate targeted drill passages
const WORD_BANK = {
  a: ['canal','alarm','atlas','avada','attach','salad','adapt','array','apart','apply','attach','alarm','radar','shall'],
  b: ['bubble','lobby','cobble','rubble','rabbit','babble','bobble','abbey','blurb','bomb','absorb','batch','blame','bulb'],
  c: ['clock','black','click','crack','check','cycle','catch','cubic','comic','occur','stock','scenic','cosmic','crisp'],
  d: ['added','dodged','dread','dried','coded','aided','edged','order','guard','blend','stood','fraud','crude','sword'],
  e: ['eleven','eldest','every','event','level','speed','steel','meter','breed','greed','freed','creek','three','fleet'],
  f: ['fluff','staff','stiff','effect','offer','effort','cliff','bluff','gruff','shelf','thief','proof','scoff','draft'],
  g: ['giggle','toggle','google','gargle','giggly','foggy','grimy','groan','grasp','globe','gauge','gorge','going','aging'],
  h: ['health','harsh','hearth','highly','hedge','hatch','ahead','behind','hustle','shrink','through','share','which','fresh'],
  i: ['initial','itself','inside','insist','imply','exist','visit','limit','rigid','vivid','trial','civil','brisk','mimic'],
  j: ['joyful','jumpy','jabber','jiggle','jilted','jungle','joints','jester','jargon','jockey','jacket','jabbed','jarred','jewel'],
  k: ['knack','kneel','knick','kayak','knack','thick','tricky','bicker','crackle','struck','wreck','knock','speak','break'],
  l: ['lolly','valley','jolly','alley','fully','spell','small','skill','still','shell','loyal','local','lilly','belly'],
  m: ['mammoth','hammer','shimmer','mammary','murmur','immune','emblem','ammed','ammo','comma','drama','cream','flame','climb'],
  n: ['nanny','inning','unwind','pennant','anthem','sunken','mining','evening','cannon','tennis','runner','inner','funny','linen'],
  o: ['oolong','voodoo','outdoor','outdoor','outlook','output','onload','oldest','only','body','control','follow','color','floor'],
  p: ['pepper','paper','happy','zipper','pepper','supply','simply','puppet','poppy','apply','epoch','reply','upper','empty'],
  q: ['queen','quick','quilt','quack','quiet','qualm','quota','quip','query','quest','quite','squat','quartz','squeak'],
  r: ['error','rural','retro','runner','rather','repair','river','rider','razor','order','truer','great','trust','break'],
  s: ['stress','sparse','assess','assist','hiss','bliss','chess','class','dress','grass','press','cross','toss','moss'],
  t: ['twitter','butter','bitter','litter','attest','tattoo','otter','tight','start','trust','treat','treat','street','threat'],
  u: ['unique','usual','unused','usurp','undue','abuse','bugle','clue','queue','issue','value','venue','cure','due'],
  v: ['vivid','revive','valve','curve','verve','nerve','grave','solve','drive','stove','serve','valve','above','evolve'],
  w: ['window','widow','willow','wallow','swamp','swept','twice','twist','sweet','swear','witch','watch','witch','width'],
  x: ['exact','extra','exam','exist','index','axle','proxy','annex','sixth','toxic','oxide','pixel','excel','vex'],
  y: ['yearly','youthful','yummy','yonder','yardage','yawning','yelling','easily','badly','daily','family','lucky','early','truly'],
  z: ['pizza','puzzle','fizzy','fuzzy','buzzed','snooze','frozen','breeze','bronze','gauze','bronze','razor','dozen','amaze'],
  // Digraph-specific (used when slowDigraphs are detected)
  th: ['the','that','this','then','with','think','those','three','truth','teeth','north','faith','there','cloth'],
  he: ['he','ahead','wheel','sheer','cheek','sheep','theme','shelf','these','there','chest','where','helped','hence'],
  in: ['in','into','think','ring','bring','drink','swing','print','blind','win','thin','inch','index','link'],
  er: ['her','ever','other','over','under','never','after','water','tiger','super','enter','refer','offer','power'],
  an: ['and','can','plan','hand','land','brand','stand','scan','span','than','plant','panel','range','blank'],
  re: ['are','real','read','rest','reach','great','three','there','tree','breed','fresh','press','dried','trend'],
  on: ['on','one','once','bone','gone','tone','stone','front','among','along','condo','prone','grown','clone'],
  en: ['ten','when','open','even','then','bend','send','rent','spent','trend','event','enter','blend','fence'],
  ng: ['ring','sing','long','song','thing','bring','going','being','doing','along','young','wrong','among','swing'],
  st: ['stop','step','still','start','stand','staff','store','stage','sting','steal','storm','style','steel','steam'],
  // Number-row keys
  '1': ['1','10','11','1st','item 1','100','1,000','$1','1.5'],
  '2': ['2','20','2nd','2024','200','2.0','top 2','2:30'],
  '3': ['3','30','3rd','300','3.14','3x','#3','$3'],
  '4': ['4','40','4th','400','4GB','4K','$4.00'],
  '5': ['5','50','5th','500','50%','5pm','$5','5x'],
}

// Curated fallback drills for common weak spots
export const PRESET_DRILLS = [
  {
    id: 'left-pinky',
    label: '🤙 Left Pinky',
    desc: 'Keys: q a z 1 ` ~',
    text: 'Zach asked Qara a zealous question: "Are azure quarries always quite scarce?" Zara gazed at a quartz square and said: "Aqua zones relax all zealous souls." Quiz away, Zach.',
  },
  {
    id: 'right-pinky',
    label: '🤙 Right Pinky',
    desc: 'Keys: p ; / \' [ ]',
    text: "Philip's polished proposal passed; perhaps proper pricing pays people's patience. Please print: pro/con plus points, people's poll results, top picks; apply paper politely.",
  },
  {
    id: 'number-row',
    label: '🔢 Number Row',
    desc: 'Keys: 1 2 3 4 5 6 7 8 9 0',
    text: 'Order #4521 — 30 units at $8.99 each = $269.70 total. Ref: INV-2024-10. Discount: 15% off orders over $200. Deliver by 07/08. Call 0300-1234567 before 6pm.',
  },
  {
    id: 'common-digraphs',
    label: '🔗 Common Digraphs',
    desc: 'th he in er an re on',
    text: 'The other answer in her open window then reached an even greater strength. There, under an ancient tree, three others entered another realm on the northern path.',
  },
  {
    id: 'symbols',
    label: '#@ Symbols',
    desc: '& @ # $ % ^ * ( ) - _',
    text: 'Email: user@domain.com | Price: $49.99 (25% off!) | Code: if (x > 0 && y != 100) { return x * 2; } | Tag: #urgent @team | Rate: ~85% | Ref: INV_2024-07',
  },
]

/**
 * Generates a targeted drill passage from analysis data.
 * @param {Array} weakKeys  - [{ char, ms }] from analysis
 * @param {Array} slowDigraphs - [{ digraph, ms }] from analysis
 * @param {Array} fingerAvg - [ms|null] finger averages (index 0-7)
 * @returns {string} A 180-220 char natural-sounding drill passage
 */
export function generateDrill({ weakKeys = [], slowDigraphs = [], fingerAvg = [] }) {
  // Collect target chars/digraphs in priority order
  const targets = []

  // Top 3 weak single keys
  weakKeys.slice(0, 3).forEach(({ char }) => {
    const c = char.toLowerCase()
    if (WORD_BANK[c]) targets.push(c)
  })

  // Top 2 slow digraphs
  slowDigraphs.slice(0, 2).forEach(({ digraph }) => {
    if (WORD_BANK[digraph]) targets.push(digraph)
  })

  // If still no targets, pick the slowest finger's representative key
  if (targets.length === 0) {
    const FINGER_REPRESENTATIVE = ['a', 'w', 'e', 'r', 'u', 'i', 'o', 'p']
    const slowestFinger = fingerAvg
      .map((ms, i) => ({ ms, i }))
      .filter(x => x.ms !== null)
      .sort((a, b) => b.ms - a.ms)[0]
    if (slowestFinger && WORD_BANK[FINGER_REPRESENTATIVE[slowestFinger.i]]) {
      targets.push(FINGER_REPRESENTATIVE[slowestFinger.i])
    }
  }

  if (targets.length === 0) return PRESET_DRILLS[3].text  // fallback to digraphs drill

  // Build word pool from all target banks, interleaved
  const wordPool = []
  const maxWords = 16
  for (let round = 0; wordPool.length < maxWords; round++) {
    for (const t of targets) {
      const bank = WORD_BANK[t]
      if (bank && round < bank.length) {
        wordPool.push(bank[round])
      }
    }
    if (round > 20) break  // safety
  }

  // Shuffle and deduplicate
  const seen = new Set()
  const unique = wordPool.filter(w => { if (seen.has(w)) return false; seen.add(w); return true })
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]]
  }

  // Assemble into a sentence-like passage of 180-220 chars
  let passage = ''
  let idx = 0
  while (passage.length < 180 && idx < unique.length * 3) {
    const word = unique[idx % unique.length]
    if (passage.length + word.length + 1 <= 230) {
      passage += (passage ? ' ' : '') + word
    }
    idx++
  }

  // Capitalise first letter
  return passage.charAt(0).toUpperCase() + passage.slice(1) + '.'
}

/**
 * Returns a human-readable summary of weak areas.
 * e.g. "right pinky · th/ng combos"
 */
export function getWeakSummary({ weakKeys, slowDigraphs, fingerAvg }) {
  const FINGER_NAMES = ['left pinky','left ring','left middle','left index','right index','right middle','right ring','right pinky']
  const parts = []

  // Slowest finger (if notably slow)
  const slowFingers = (fingerAvg || [])
    .map((ms, i) => ({ ms, i }))
    .filter(x => x.ms !== null)
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 2)

  if (slowFingers.length > 0 && slowFingers[0].ms) {
    parts.push(FINGER_NAMES[slowFingers[0].i])
  }

  // Slow digraphs
  if (slowDigraphs && slowDigraphs.length > 0) {
    const combo = slowDigraphs.slice(0, 2).map(d => d.digraph).join('/')
    parts.push(`${combo} combos`)
  } else if (weakKeys && weakKeys.length > 0) {
    const keys = weakKeys.slice(0, 3).map(k => k.char === ' ' ? 'space' : k.char).join(', ')
    parts.push(`keys: ${keys}`)
  }

  return parts.join(' · ')
}

// Which keys belong to each finger (for display)
export const FINGER_KEYS = [
  'q a z 1',       // left pinky
  'w s x 2',       // left ring
  'e d c 3',       // left middle
  'r f v t g b 4 5', // left index
  'y h n u j m 6 7', // right index
  'i k , 8',       // right middle
  'o l . 9',       // right ring
  'p ; / \' [ ] 0', // right pinky
]
