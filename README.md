# Empires Ignited

A 0 A.D. (0.28.0) content mod that rebalances **all** civilizations
uniformly, with a focus on cheap units that can raze buildings, an
armed citizenry, and fire-and-energy flavour.

## Combat & units

- **Cheap units raze buildings.** Citizen infantry and cavalry deal **×3**
  damage to structures. Champions and siege are left at stock, so they
  are *not* specially good at razing — massed cheap soldiers are.
- **Razing scales with the forge.** The anti-structure bonus rises to
  **×4** after the first melee/ranged attack upgrade and **×5** after the
  second (tracked separately for the melee and ranged lines).
- **Citizen-soldiers cost +50%** to train (champions and support units
  excluded).

## The citizenry (support units)

- **Workers morph into Militia Champions.** In **City Phase**, any worker
  (female citizen / civilian) can be permanently *armed* — it transforms
  into a **Militia Champion**, a champion-grade infantryman that can no
  longer gather. The change is one-way (no reverting).
- **MegaGlest-style morph discount.** The morph costs ~43 food / 60 wood /
  80 metal — i.e. a champion's cost minus ~75% of the worker's own cost,
  so worker + morph totals about the same as training a champion fresh
  (the discount stops you double-paying; it isn't a saving).

## Buildings

- **Structures build ~10% faster** (offsetting the pricier army).
- **Start in Town Phase** automatically. **City Phase is earned** — it
  requires a barracks, stable, market and defense tower (at stock cost
  and time), not auto-researched.
- **Stables require a forge** (blacksmith).
- **Defense towers can be built twice as close together.**
- **Market, temple and defense-tower upgrades auto-research** at game
  start.
- **Burning buildings.** At 50% HP or below, structures catch fire and
  smoke (intensity scales with how low the HP is) and lose 1 HP per
  second until repaired or destroyed.
- **Not capturable by default** — a "Capturable Buildings" match-setup
  option re-enables capture.

## Visuals & UI

- **Distinct ranged projectiles** — champion ranged units fire cyan
  energy bolts; defensive structures fire a warm energy stream; regular
  units keep their normal arrows and javelins.
- **Healers float** instead of walking, with a soft conical glow above
  them.
- **Attack bonuses are shown** in unit tooltips (e.g. `×3 vs Structure`,
  and even stock counters like `×2 vs Cavalry` that 0 A.D. normally
  hides), and the in-game selection panel reflects your researched
  upgrades.

## AI

Ships a custom AI — **"Empires Ignited AI"** (a fork of Petra),
selectable in the match setup — adapted to the mod's rules: it reaches
the building-gated City Phase, prefers routing *around* bypassable walls
instead of wasting time destroying them, and arms surplus food-gathering
workers into Militia Champions.
