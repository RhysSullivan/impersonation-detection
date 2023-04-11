import { ApplyOptions } from '@sapphire/decorators';
import { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { isUserImposter } from '../lib/detection';
import { makeBanStatusEmbed, toImposterUser } from '../lib/banning';

async function handleSusUser(member: GuildMember) {
	const officialMember = await member.guild.members.fetch('523949187663134754');
	const official = await toImposterUser(officialMember);
	const suspect = await toImposterUser(member);
	const isSus = isUserImposter({
		official,
		suspect
	});
	if (!isSus) {
		return;
	}
	const notificationChannel = member.guild.channels.cache.get('1095147466866823211');
	if (!notificationChannel?.isTextBased()) return;
	const msg = await makeBanStatusEmbed({
		status: 'Pending',
		detectionMethod: 'Auto',
		member
	});
	await notificationChannel.send(msg);
}

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberAdd,
	name: 'Verify on guild member add'
})
export class VerifyOnJoin extends Listener<typeof Events.GuildMemberAdd> {
	public async run(member: GuildMember) {
		await handleSusUser(member);
	}
}

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberUpdate,
	name: 'Verify on guild member update'
})
export class VerifyOnUpdate extends Listener<typeof Events.GuildMemberUpdate> {
	public async run(_: GuildMember, newMember: GuildMember) {
		await handleSusUser(newMember);
	}
}
