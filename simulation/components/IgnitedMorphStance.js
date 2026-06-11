/**
 * Fixes up a freshly-morphed Militia Pikeman, one turn after the morph:
 *   1. arms it (passive worker stance -> aggressive), and
 *   2. drops any gather/return order inherited from the worker, so it stops
 *      gathering and is ready to fight instead of carrying on as a labourer.
 *
 * The morph (Transform.js) copies the SOURCE worker's stance and whole order
 * queue (`AddOrders(GetOrders())`) onto the new unit. Workers are `passive` and
 * often gathering, so without this the armed pikeman would come out passive and
 * just keep gathering. The Militia Pikeman is a citizen-soldier (it CAN gather),
 * so an inherited gather order is harmless — this is purely behavioural. (The old
 * champion-grade morph had no ResourceGatherer, which is what used to crash
 * UnitAI's unguarded FINDINGNEWTARGET deref; the pikeman doesn't, so that's moot.)
 *
 * Runs from a 0-delay timer (next turn): the order queue is copied AFTER
 * ownership is set, so clearing it must happen in a clean context, not
 * re-entrantly inside the FSM transition the order copy drives. OnOwnershipChanged
 * from INVALID_PLAYER fires once at creation/morph and NOT on save-load.
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

	// Drop any inherited gather/return order so the armed pikeman stops
	// labouring and idles ready to fight. Stop() empties the queue and idles
	// the unit. (Harmless either way now that it's a citizen-soldier.)
	const orders = cmpUnitAI.GetOrders();
	if (orders.some(order => order.type == "Gather" || order.type == "ReturnResource"))
		cmpUnitAI.Stop(false);

	// Arm it: a trained champion is aggressive, a worker is passive.
	if (cmpUnitAI.GetStanceName() == "passive")
		cmpUnitAI.SwitchToStance("aggressive");
};

Engine.RegisterComponentType(IID_IgnitedMorphStance, "IgnitedMorphStance", IgnitedMorphStance);
