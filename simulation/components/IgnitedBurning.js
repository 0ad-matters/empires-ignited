/**
 * Attaches a rising fire+smoke effect to a structure when its health drops
 * from above 50% to 50% or below, and removes it when repaired back above
 * 50% (or when the structure dies / leaves the world).
 *
 * Listens to the entity-local MT_HealthChanged message (auto-delivered to
 * any component on the same entity that defines OnHealthChanged). The
 * effect is a separate local (visual-only) entity placed at the structure's
 * position — the same approach Health.js uses for SpawnEntityOnDeath, so no
 * per-building actor edits are needed.
 */
function IgnitedBurning() {}

IgnitedBurning.prototype.Schema = "<empty/>";

IgnitedBurning.prototype.THRESHOLD = 0.5;
IgnitedBurning.prototype.MAX_INTENSITY = 3;

IgnitedBurning.prototype.DECAY_PER_SECOND = 3;

IgnitedBurning.prototype.Init = function()
{
	this.effectEntities = [];
	this.intensity = 0; // current number of stacked fire+smoke sets
	this.decayTimer = undefined;
};

IgnitedBurning.prototype.StartDecay = function()
{
	if (this.decayTimer)
		return;
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	// First tick after 1s, then every 1s.
	this.decayTimer = cmpTimer.SetInterval(this.entity, IID_IgnitedBurning, "DecayTick", 1000, 1000, null);
};

IgnitedBurning.prototype.StopDecay = function()
{
	if (!this.decayTimer)
		return;
	Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).CancelTimer(this.decayTimer);
	this.decayTimer = undefined;
};

// A burning structure (HP <= 50%) loses DECAY_PER_SECOND HP each second.
IgnitedBurning.prototype.DecayTick = function()
{
	const cmpHealth = Engine.QueryInterface(this.entity, IID_Health);
	if (cmpHealth)
		cmpHealth.Reduce(this.DECAY_PER_SECOND);
};

/**
 * Intensity grows as HP falls below the 50% threshold: ~1 set at 50%,
 * up to MAX_INTENSITY sets approaching 0%. Each set is one fire + one
 * smoke emitter, so more sets = denser, more dramatic fire/smoke.
 */
IgnitedBurning.prototype.GetIntensity = function(ratio)
{
	if (ratio <= 0 || ratio > this.THRESHOLD)
		return 0;
	const t = (this.THRESHOLD - ratio) / this.THRESHOLD; // 0 at 50%, 1 at 0%
	return Math.min(this.MAX_INTENSITY, Math.max(1, Math.ceil(t * this.MAX_INTENSITY)));
};

/**
 * Pick the tier (small/med/large) by the structure's ROOF HEIGHT (the
 * footprint Height), not its width — flame height should track how tall
 * the building is, not how wide. A defense tower is narrow but 15 tall,
 * so it must get tall flames, not small ones.
 *
 * Heights seen in 0.28: house 5, CC/fortress 8, barracks/wonder 12,
 * outpost 13, tower 15. Tiers: <7 small, 7..11 med, >=11 large.
 *
 * NB: a 0ad particle actor renders only ONE emitter, so fire and smoke
 * must be spawned as two separate entities.
 */
IgnitedBurning.prototype.GetTier = function()
{
	let height = 8; // default → medium if no footprint
	const cmpFootprint = Engine.QueryInterface(this.entity, IID_Footprint);
	if (cmpFootprint)
	{
		const shape = cmpFootprint.GetShape();
		if (shape && shape.height)
			height = shape.height;
	}

	if (height < 7)
		return "small";
	if (height >= 11)
		return "large";
	return "med";
};

IgnitedBurning.prototype.IsBurning = function()
{
	return this.effectEntities.length > 0;
};

/**
 * (Re)build the effect to `intensity` stacked fire+smoke sets at the
 * structure's position. intensity 0 clears it.
 */
IgnitedBurning.prototype.SetIntensity = function(intensity)
{
	if (intensity == this.intensity)
		return;

	for (const ent of this.effectEntities)
		Engine.DestroyEntity(ent);
	this.effectEntities = [];
	this.intensity = intensity;

	if (intensity <= 0)
	{
		this.StopDecay();
		return;
	}

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
	{
		this.intensity = 0;
		this.StopDecay();
		return;
	}
	this.StartDecay();
	const pos = cmpPosition.GetPosition();
	const tier = this.GetTier();

	for (let i = 0; i < intensity; ++i)
		for (const kind of ["fire", "smoke"])
		{
			const ent = Engine.AddLocalEntity("special/ignited_burn_" + kind + "_" + tier);
			if (ent == INVALID_ENTITY)
				continue;
			Engine.QueryInterface(ent, IID_Position).JumpTo(pos.x, pos.z);
			this.effectEntities.push(ent);
		}
};

IgnitedBurning.prototype.OnHealthChanged = function(msg)
{
	const cmpHealth = Engine.QueryInterface(this.entity, IID_Health);
	if (!cmpHealth)
		return;

	const max = cmpHealth.GetMaxHitpoints();
	if (max <= 0)
		return;

	this.SetIntensity(this.GetIntensity(msg.to / max));
};

IgnitedBurning.prototype.OnOwnershipChanged = function(msg)
{
	// Entity removed from the world (captured-to-gaia destruction, death).
	if (msg.to == INVALID_PLAYER)
		this.SetIntensity(0);
};

IgnitedBurning.prototype.OnDestroy = function()
{
	this.SetIntensity(0);
};

Engine.RegisterComponentType(IID_IgnitedBurning, "IgnitedBurning", IgnitedBurning);
