/**
 * Fixes up a freshly-morphed Militia Champion, one turn after the morph:
 *   1. arms it (passive worker stance -> aggressive), and
 *   2. drops the worker's inherited orders if they include a Gather/Return.
 *
 * The worker->Militia Champion morph goes through Transform.js, which both
 * copies the SOURCE unit's stance (Transform.js: `SwitchToStance(...)`) and its
 * whole order queue (`AddOrders(GetOrders())`) onto the new entity. Workers are
 * `passive` (template_unit_support) and often gathering, and a Militia Champion
 * has no ResourceGatherer — an inherited Gather order then walks it to a
 * resource and crashes UnitAI's FINDINGNEWTARGET, which dereferences the absent
 * ResourceGatherer (UnitAI.js: the GATHERING state is null-guarded, that state
 * is not).
 *
 * Both fixes run from a 0-delay timer (next turn). OnOwnershipChanged from
 * INVALID_PLAYER fires once when the entity is first owned (creation/morph) and
 * NOT on save-load, so it's the trigger. The deferral is required: the order
 * queue is copied AFTER ownership is set, and clearing it must happen in a clean
 * context, not re-entrantly inside the FSM transition the order copy drives.
 *
 * This handles the common case — the champion stops (instead of walking off to a
 * resource it can't gather) and arms up; even a champion that does hit the crash
 * recovers here the next turn. It does NOT fully prevent the crash: a unit
 * morphed while actively gathering can reach FINDINGNEWTARGET synchronously,
 * before this timer runs. That last ~1% is a stock 0 A.D. bug (UnitAI's
 * FINDINGNEWTARGET derefs ResourceGatherer without the null-guard its sibling
 * GATHERING state has) and is non-fatal (a logged error, deterministic, no OOS);
 * a clean fix would be a one-line guard upstream in UnitAI.js.
 */
function IgnitedMorphStance() {}

IgnitedMorphStance.prototype.Schema = "<empty/>";

IgnitedMorphStance.prototype.Init = function() {};

IgnitedMorphStance.prototype.OnOwnershipChanged = function(msg)
{
	if (msg.from != INVALID_PLAYER)
		return;
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	cmpTimer.SetTimeout(this.entity, IID_IgnitedMorphStance, "MorphFixup", 0, null);
};

IgnitedMorphStance.prototype.MorphFixup = function()
{
	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI)
		return;

	// Clear inherited orders if any is a gather/return (this champion can't
	// gather; the order would crash UnitAI's FINDINGNEWTARGET). Stop() empties
	// the queue and idles the unit.
	const orders = cmpUnitAI.GetOrders();
	if (orders.some(order => order.type == "Gather" || order.type == "ReturnResource"))
		cmpUnitAI.Stop(false);

	// Arm it: a trained champion is aggressive, a worker is passive.
	if (cmpUnitAI.GetStanceName() == "passive")
		cmpUnitAI.SwitchToStance("aggressive");
};

Engine.RegisterComponentType(IID_IgnitedMorphStance, "IgnitedMorphStance", IgnitedMorphStance);
