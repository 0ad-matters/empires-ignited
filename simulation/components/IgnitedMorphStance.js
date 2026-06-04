/**
 * Puts a freshly-morphed unit into a combat stance.
 *
 * The worker→Militia Champion morph goes through Transform.js, which copies
 * the SOURCE unit's stance onto the new entity right after ownership is set
 * (Transform.js: `SwitchToStance(cmpUnitAI.GetStanceName())`). Workers are
 * `passive` (template_unit_support), so without this the armed champion comes
 * out passive and won't engage nearby enemies.
 *
 * OnOwnershipChanged from INVALID_PLAYER fires once when the entity is first
 * owned (creation/morph) — and NOT on save-load — so we use it as the trigger
 * and defer one turn (past the transform's stance copy). If the unit is still
 * passive we switch it to `aggressive`, matching a trained champion.
 */
function IgnitedMorphStance() {}

IgnitedMorphStance.prototype.Schema = "<empty/>";

IgnitedMorphStance.prototype.Init = function() {};

IgnitedMorphStance.prototype.OnOwnershipChanged = function(msg)
{
	if (msg.from != INVALID_PLAYER)
		return;
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	cmpTimer.SetTimeout(this.entity, IID_IgnitedMorphStance, "SetCombatStance", 0, null);
};

IgnitedMorphStance.prototype.SetCombatStance = function()
{
	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI && cmpUnitAI.GetStanceName() == "passive")
		cmpUnitAI.SwitchToStance("aggressive");
};

Engine.RegisterComponentType(IID_IgnitedMorphStance, "IgnitedMorphStance", IgnitedMorphStance);
