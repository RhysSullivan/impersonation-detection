import { ApplyOptions } from '@sapphire/decorators';
import { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { autoHandleSusUser } from '../lib/banning';

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberAdd,
	name: 'Verify on guild member add'
})
export class VerifyOnJoin extends Listener<typeof Events.GuildMemberAdd> {
	public async run(member: GuildMember) {
		await autoHandleSusUser(member);
	}
}

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberUpdate,
	name: 'Verify on guild member update'
})
export class VerifyOnUpdate extends Listener<typeof Events.GuildMemberUpdate> {
	public async run(_: GuildMember, newMember: GuildMember) {
		await autoHandleSusUser(newMember);
	}
}
