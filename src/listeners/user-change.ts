import { ApplyOptions } from '@sapphire/decorators';
import { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import { autoHandleSusUser } from '../lib/banning';
import { OFFICIAL_USER_ID, WATCHING_GUILD_ID } from '../lib/constants';

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberAdd,
	name: 'Verify on guild member add'
})
export class VerifyOnJoin extends Listener<typeof Events.GuildMemberAdd> {
	public async run(member: GuildMember) {
		console.log('guild member add', member.id);
		await member.fetch();
		if (member.id === OFFICIAL_USER_ID) return;
		await autoHandleSusUser(member);
	}
}

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberUpdate,
	name: 'Verify on guild member update'
})
export class VerifyOnUpdate extends Listener<typeof Events.GuildMemberUpdate> {
	public async run(_: GuildMember, newMember: GuildMember) {
		console.log('guild member update', newMember.id);
		await newMember.fetch();
		if (newMember.id === OFFICIAL_USER_ID) return;
		await autoHandleSusUser(newMember);
	}
}

@ApplyOptions<Listener.Options>({
	event: Events.UserUpdate,
	name: 'Verify on user update'
})
export class VerifyOnUserUpdate extends Listener<typeof Events.UserUpdate> {
	public async run(_: User, newUser: User) {
		console.log('user update', newUser.id);
		const watchingGuild = await this.container.client.guilds.fetch(WATCHING_GUILD_ID);
		const member = await watchingGuild.members.fetch(newUser.id);
		await member.fetch();
		if (member.id === OFFICIAL_USER_ID) return;
		await autoHandleSusUser(member);
	}
}
