
const regex = new RegExp('^[\\w\\- ]{1,16}$')

export function FormatName(name: string) : string | null {
	name = name.trim();
	if (!regex.test(name))
		return null;
	return name;
}
