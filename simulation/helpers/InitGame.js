/**
 * Called when the map has been loaded, but before the simulation has started.
 * Only called when a new game is started, not when loading a saved game.
 *
 * Merged from the 10ad mod (gather-tech auto-research, pop cap, explore) with
 * the mod's single-phase behavior: every player is force-advanced to city
 * phase at game start. ResearchTechnology() applies a tech unconditionally
 * (it does not check requirements), so this works regardless of structure
 * counts or the autoResearch flag.
 */
function PreInitGame()
{
	// We need to replace skirmish "default" entities with real ones.
	// This needs to happen before AI initialization (in InitGame).
	// And we need to flush destroyed entities otherwise the AI gets the wrong game state in
	// the beginning and a bunch of "destroy" messages on turn 0, which just shouldn't happen.
	Engine.BroadcastMessage(MT_SkirmishReplace, {});
	Engine.FlushDestroyedEntities();

	const numPlayers = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetNumPlayers();
	for (let i = 1; i < numPlayers; ++i) // ignore gaia
	{
		const cmpTechnologyManager = QueryPlayerIDInterface(i, IID_TechnologyManager);
		if (cmpTechnologyManager)
			cmpTechnologyManager.UpdateAutoResearch();

		const civ = QueryPlayerIDInterface(i, IID_Identity).GetCiv();
		let cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);

		// force-advance to TOWN phase only (city phase is earned by
		// building a barracks, stable, market and defense tower — see the
		// requirements in phase_city_*.json). ResearchTechnology ignores
		// requirements. Prefer the civ-specific tech, fall back to generic.
		if (cmpTechnologyManager)
		{
			let tech = "phase_town_" + civ;
			if (!TechnologyTemplates.Get(tech))
				tech = "phase_town_generic";
			if (TechnologyTemplates.Get(tech))
				cmpTechnologyManager.ResearchTechnology(tech);
		}

		// auto-research every upgrade offered by these buildings —
		// generically, by reading each building's Researcher.Technologies
		// rather than naming the techs (the deathmatch_gamemode / 10ad
		// approach). storehouse/farmstead/house are 10ad's; market,
		// defense tower and temple are mod additions.
		const cmpTemplateManager2 = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
		if (cmpTechnologyManager)
			for (const building of ["storehouse", "farmstead", "house", "market", "defense_tower", "temple"])
			{
				const tmpl = cmpTemplateManager2.GetTemplateWithoutValidation("structures/" + civ + "/" + building);
				if (!tmpl || !tmpl.Researcher || !tmpl.Researcher.Technologies)
					continue;
				for (let tech of tmpl.Researcher.Technologies._string.split(" "))
				{
					// Empires Ignited: leave Murder Holes (removes the tower
					// minimum range) as a player-researched upgrade rather than
					// auto-applying it.
					if (tech == "tower_murderholes")
						continue;
					if (tech.endsWith("{civ}"))
					{
						tech = tech.replace("{civ}", civ);
						if (!TechnologyTemplates.Get(tech))
							tech = tech.replace("_" + civ, "_generic");
					}
					const template = TechnologyTemplates.Get(tech);
					if (!template)
						continue;

					// Skip techs gated to a different civ (some buildings list
					// civ-restricted upgrades). Guarded: techs with no
					// requirements just get researched.
					const tReq = template.requirements && template.requirements.all;
					let tAny = [];
					if (tReq)
					{
						if (tReq.some(r => {
							if (r.any)
								tAny = r.any;
							if (r.civ)
								return r.civ != civ;
							return r.notciv === civ;
						}))
							continue;
						if (tAny.length && tAny.every(r => r.civ != civ))
							continue;
					}

					cmpTechnologyManager.ResearchTechnology(tech);
				}
			}
	}

	// Explore the map inside the players' territory borders
	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	cmpRangeManager.ExploreTerritories();
}

function InitGame(settings)
{
	// No settings when loading a map in Atlas, so do nothing
	if (!settings)
	{
		// Map dependent initialisations of components (i.e. garrisoned units)
		Engine.BroadcastMessage(MT_InitGame, {});
		return;
	}

	if (settings.ExploreMap)
	{
		const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
		for (let i = 1; i < settings.PlayerData.length; ++i)
			cmpRangeManager.ExploreMap(i);
	}

	// structures are NOT capturable unless the "Capturable Buildings"
	// option is selected. When it's off, give every player's structures an
	// overwhelming capture-point regen so they can never be captured.
	const captureEnabled = settings.VictoryConditions &&
		settings.VictoryConditions.indexOf("building_capture") !== -1;
	if (!captureEnabled)
	{
		const cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);
		const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
		const nocap = { "Capturable/RegenRate": [{ "affects": ["Structure"], "multiply": 100000 }] };
		for (let i = 1; i < settings.PlayerData.length; ++i)
			cmpModifiersManager.AddModifiers("ignited/nocapture", nocap, cmpPlayerManager.GetPlayerByID(i));
	}

	// Trading is off unless the "Allow Trading" option is selected. When off,
	// disable the trade units — merchant ships and land traders (caravans) — so
	// there are no trade routes. The market itself stays buildable (it's a City
	// Phase requirement and still allows barter).
	const tradingEnabled = settings.VictoryConditions &&
		settings.VictoryConditions.indexOf("allow_trading") !== -1;
	if (!tradingEnabled)
	{
		for (let i = 1; i < settings.PlayerData.length; ++i)
		{
			const cmpPlayer = QueryPlayerIDInterface(i);
			const cmpIdentity = QueryPlayerIDInterface(i, IID_Identity);
			if (!cmpPlayer || !cmpIdentity)
				continue;
			const civ = cmpIdentity.GetCiv();
			cmpPlayer.AddDisabledTemplate("units/" + civ + "/support_trader");
			cmpPlayer.AddDisabledTemplate("units/" + civ + "/ship_merchant");
		}
	}

	const cmpAIManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_AIManager);
	for (let i = 0; i < settings.PlayerData.length; ++i)
	{
		const cmpPlayer = QueryPlayerIDInterface(i);

		if (settings.PlayerData[i])
		{
			if (settings.PlayerData[i].Removed)
			{
				cmpPlayer.Defeat(undefined);
				continue;
			}
			else if (settings.PlayerData[i].AI)
			{
				cmpAIManager.AddPlayer(settings.PlayerData[i].AI, i, +settings.PlayerData[i].AIDiff, settings.PlayerData[i].AIBehavior || "random");
				cmpPlayer.SetAI(true);
			}
		}

		if (settings.AllyView)
			Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager)?.ResearchTechnology(Engine.QueryInterface(cmpPlayer.entity, IID_Diplomacy).template.SharedLosTech);
	}

	{
		const popCap = settings.PopulationCap || 300;
		const cmpPopulationCapManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PopulationCapManager);
		const nonGaiaPlayers = settings.PlayerData.slice(1);
		if (nonGaiaPlayers.some(player => player.PopulationLimit))
			cmpPopulationCapManager.SetPerPlayerPopulationCaps(nonGaiaPlayers.map(player => player.PopulationLimit || popCap));
		else
		{
			if ([cmpPopulationCapManager.CAPTYPE_PLAYER_POPULATION, cmpPopulationCapManager.CAPTYPE_TEAM_POPULATION,
				cmpPopulationCapManager.CAPTYPE_WORLD_POPULATION].includes(settings.PopulationCapType))
				cmpPopulationCapManager.SetPopulationCapType(settings.PopulationCapType);
			else
				cmpPopulationCapManager.SetPopulationCapType(cmpPopulationCapManager.CAPTYPE_PLAYER_POPULATION);
			cmpPopulationCapManager.SetPopulationCap(popCap);
		}
	}

	// Update the grid with all entities created for the map init.
	Engine.QueryInterface(SYSTEM_ENTITY, IID_Pathfinder).UpdateGrid();

	// Map or player data (handicap...) dependent initialisations of components (i.e. garrisoned units).
	Engine.BroadcastMessage(MT_InitGame, {});

	cmpAIManager.TryLoadSharedComponent();
	cmpAIManager.RunGamestateInit();
}

Engine.RegisterGlobal("PreInitGame", PreInitGame);
Engine.RegisterGlobal("InitGame", InitGame);
