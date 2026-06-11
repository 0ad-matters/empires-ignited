# Empires Ignited

A 0 A.D. (0.28.0) content mod that rebalances **all** civilizations
uniformly, with a focus on cheap units that can raze buildings, an
armed citizenry, and fire-and-energy flavour.

## Combat & units

- **Cheap units raze buildings.** Citizen infantry and cavalry deal **×6**
  damage to structures — buildings carry heavy hack/pierce armour, so this
  bonus is what lets massed cheap soldiers tear them down.
- **Razing scales with the forge.** The anti-structure bonus rises to
  **×7** after the first melee/ranged attack upgrade and **×8** after the
  second (tracked separately for the melee and ranged lines).
- **Rams crush units too.** Battering rams are no longer restricted to
  structures — they'll flatten mobile units in the way, though they still
  prefer buildings.
- **Citizen-soldiers take 20% longer to train** (champions and support
  units excluded).

## The citizenry (support units)

- **Workers morph into Militia Champions.** In **City Phase**, any worker
  (female citizen / civilian) can be permanently *armed* — it transforms
  into a **Militia Champion**, a champion-grade infantryman that can no
  longer gather and arrives battle-ready (aggressive stance). The morph
  takes 16 seconds and is one-way (no reverting).
- **Morphing costs a full champion.** The morph price (80 food / 60 wood /
  80 metal) matches what a champion costs to train — the worker you spend is
  a premium on top, so arming the citizenry is a deliberate investment, not
  a cheap shortcut to champions.

## Buildings

- **Structures build ~10% faster** (offsetting the slower-mustered army).
- **Start in Town Phase** automatically. **City Phase is earned** — it
  requires a barracks, stable, market and defense tower (at stock cost
  and time), not auto-researched.
- **Defense towers can be built twice as close together.**
- **Defensive structures take twice as long to build** — defense towers,
  walls and palisades.
- **Market, temple and defense-tower upgrades auto-research** at game
  start — except **Murder Holes** (which removes a tower's minimum range),
  which you research manually.
- **Burning buildings.** At 50% HP or below, structures catch fire and
  smoke (intensity scales with how low the HP is) and lose 3 HP per
  second until repaired or destroyed.
- **Not capturable by default** — a "Capturable Buildings" match-setup
  option re-enables capture.
- **No trade routes by default** — merchant ships and trade caravans
  can't be built (markets remain, for the City Phase requirement and
  barter). An "Allow Trading" match-setup option re-enables them.

## Resources

- **More to gather.** Metal and stone mines hold ~30% more. Random maps
  (the mainland-style ones) also generate ~30% more trees.

## Visuals & UI

- **Distinct ranged projectiles** — champion ranged units fire cyan
  energy bolts; defensive structures fire a warm energy stream; regular
  units keep their normal arrows and javelins.
- **Healers float** instead of walking, with a soft conical glow above
  them.
- **Attack bonuses are shown** in unit tooltips (e.g. `×6 vs Structure`,
  and even stock counters like `×2 vs Cavalry` that 0 A.D. normally
  hides), and the in-game selection panel reflects your researched
  upgrades.

## AI

Ships a custom AI — **"Empires Ignited AI"** (a fork of Petra),
selectable in the match setup — adapted to the mod's rules: it reaches
the building-gated City Phase, prefers routing *around* bypassable walls
instead of wasting time destroying them, and arms surplus food-gathering
workers into Militia Champions.
