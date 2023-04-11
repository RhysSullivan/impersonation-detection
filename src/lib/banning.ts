import { ActionRowBuilder, EmbedBuilder, GuildMember, MessageActionRowComponentBuilder } from 'discord.js';
import type { UserImposter } from './detection';
import { makeBanButton, makeIgnoreButton } from './buttons';

export async function makeBanStatusEmbed(input: {
	status: 'Pending' | 'Banned' | 'Ignored';
	detectionMethod: 'Auto' | 'Manual';
	member: GuildMember;
}) {
	const { status, detectionMethod, member } = input;
	const avatarUrl = member.user.displayAvatarURL({
		size: 128,
		extension: 'png',
		forceStatic: true
	});

	const embed = new EmbedBuilder()
		.setTitle('Imposter User Auto Detected')
		.setDescription(`User ${member} is sus`)
		.setImage(avatarUrl)
		.setColor(status === 'Pending' ? 'Red' : status === 'Banned' ? 'Grey' : 'Green')
		.setFields([
			{
				name: 'Status',
				value: status
			},
			{
				name: 'Detection Method',
				value: detectionMethod
			},
			{
				name: 'User ID',
				value: member.id
			},
			{
				name: 'Name',
				value: member.user.username
			},
			{
				name: 'Nickname',
				value: member.nickname ?? 'None'
			}
		]);
	// await member.kick('Same name and avatar as the owner');
	const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(makeBanButton(member.id), makeIgnoreButton());
	return {
		embeds: [embed],
		components: [buttons]
	};
}

export async function toImposterUser(member: GuildMember): Promise<UserImposter> {
	const avatarUrl = member.user.displayAvatarURL({
		size: 32,
		extension: 'png',
		forceStatic: true
	});
	// fetch the users avatar
	const fetched = await fetch(avatarUrl);
	// conver to buffer
	const buffer = await fetched.arrayBuffer();
	// convert to Uint8ClampedArray
	const data = new Uint8ClampedArray(buffer);

	return {
		avatar: {
			data,
			height: 32,
			width: 32
		},
		nickname: member.nickname,
		name: member.nickname ?? member.user.username
	};
}

export async function banImposterUser(member: GuildMember, reason: 'Impersonation - Auto Detected' | 'Impersonation - Manually Reported') {
	await member.ban({ reason }); // TODO: Doesn't need to be run in sync
}
