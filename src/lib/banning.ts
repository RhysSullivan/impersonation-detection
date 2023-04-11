import { ActionRowBuilder, EmbedBuilder, GuildMember, MessageActionRowComponentBuilder } from 'discord.js';
import { UserImposter, isUserImposter } from './detection';
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
				value: status,
				inline: true
			},
			{
				name: 'Detection Method',
				value: detectionMethod,
				inline: true
			},
			{
				name: 'User ID',
				value: member.id,
				inline: true
			},
			{
				name: 'Name',
				value: member.user.username,
				inline: true
			},
			{
				name: 'Nickname',
				value: member.nickname ?? 'None',
				inline: true
			}
		]);
	// await member.kick('Same name and avatar as the owner');
	const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
		makeBanButton(member.id).setDisabled(status !== 'Pending'),
		makeIgnoreButton().setDisabled(status !== 'Pending')
	);
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

export async function autoHandleSusUser(member: GuildMember) {
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
