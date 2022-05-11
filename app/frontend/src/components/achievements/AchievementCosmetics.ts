import json from "./achievements.json"

export class TrophyCosmetic 
{
	public readonly name:string;
	public readonly description?:string;

	public readonly category:string;
	public readonly level:number;
	public readonly visualLevel:number;
	public readonly progressMax:number = 0;
	public readonly hidden:boolean = false;
};

const all = json as any;
const allCosmetics:Record<string, TrophyCosmetic[]> = {};

for (let category in all){
	let cat = all[category];
	allCosmetics[category] = [];
	for (let lvl in all[category]){
		let level = parseInt(lvl);
		const ach = {
			...all[category][lvl],
			category,
			level,
			visualLevel: level + 3 - cat.length,
		}
		allCosmetics[category][level] = ach;
	}
}

function GetTrophyCosmetics(id:string, level:number):TrophyCosmetic {
	return allCosmetics[id]?.[level] ?? {
		name: `${id}_${level}`,
		description: "Unknown Achievement",
		category: id,
		level: level,
	};
}

export {
	allCosmetics,
	GetTrophyCosmetics,
};
