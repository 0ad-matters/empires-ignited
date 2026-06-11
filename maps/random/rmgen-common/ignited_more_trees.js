/*
 * Empires Ignited: ~1.3x more trees on random maps.
 *
 * Redefines the global getTreeCounts (from rmgen-common/gaia_entities.js).
 * Engine.LoadLibrary("rmgen-common") evaluates every .js in the directory into a
 * shared scope and loads this mod file after the stock one, so this later
 * declaration wins (the same trick the no-gather mod uses). It affects the
 * LoadLibrary-style random maps (mainland and most core maps); rmgen2 maps that
 * `import` getTreeCounts are unaffected. Metal/stone are scaled separately via
 * the gaia mine templates' supply, not here.
 *
 * DRIFT: copies the stock getTreeCounts body (one line) with a 1.3 factor on the
 * tree counts. Re-sync if 0 A.D. changes the original.
 */
function getTreeCounts(minTrees, maxTrees, forestRatio)
{
	return [forestRatio, 1 - forestRatio].map(p => p * scaleByMapSize(minTrees * 1.3, maxTrees * 1.3));
}
