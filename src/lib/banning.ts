import { ActionRowBuilder, EmbedBuilder, GuildMember, MessageActionRowComponentBuilder } from 'discord.js';
import { UserImposter, isUserImposter } from './detection';
import { makeBanButton, makeIgnoreButton } from './buttons';
import { NOTIFICATION_CHANNEL_ID, NOTIFICATION_ROLE_ID, OFFICIAL_USER_ID } from './constants';
import fetch from 'node-fetch';
import { posthog } from './stat';

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
	const text =
		status === 'Pending' ? `Possible Imposter User Detected` + (NOTIFICATION_ROLE_ID ? ` <@&${NOTIFICATION_ROLE_ID}>` : ``) : 'Imposter Handled';
	const embed = new EmbedBuilder()
		.setTitle(`Imposter ${status === 'Pending' ? 'Suspected' : status}`)
		.setDescription(`${member} is kinda sus`)
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
				inline: false
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
		])
		.setTimestamp();
	const banButton = makeBanButton(member.id);
	const ignoreButton = makeIgnoreButton(member.id);
	const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents();
	switch (status) {
		case 'Pending':
			buttons.addComponents(banButton, ignoreButton);
			break;
		case 'Banned':
			buttons.addComponents(banButton.setLabel('Banned').setDisabled(true));
			break;
		case 'Ignored':
			buttons.addComponents(ignoreButton.setLabel('Ignored').setDisabled(true));
			break;
	}

	return {
		embeds: [embed],
		content: text,
		components: [buttons]
	};
}

export async function toImposterUser(member: GuildMember): Promise<UserImposter> {
	const avatarUrl = member.user.displayAvatarURL({
		size: 16,
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
			height: 16,
			width: 16
		},
		nickname: member.nickname,
		name: member.user.username
	};
}

export async function banImposterUser(member: GuildMember, reason: 'Impersonation - Auto Detected' | 'Impersonation - Manually Reported') {
	await member.ban({ reason });
}

export async function autoHandleSusUser(member: GuildMember) {
	const officialMember = await member.guild.members.fetch(OFFICIAL_USER_ID);
	const official = await toImposterUser(officialMember);
	const suspect = await toImposterUser(member);
	const susStats = await isUserImposter({
		official,
		suspect
	});
	console.log('sus stats', susStats);
	if (susStats.totalSimilarity < 1) {
		return;
	}
	const notificationChannel = member.guild.channels.cache.get(NOTIFICATION_CHANNEL_ID);
	if (!notificationChannel?.isTextBased()) return;
	const msg = await makeBanStatusEmbed({
		status: 'Pending',
		detectionMethod: 'Auto',
		member
	});
	posthog.capture({
		distinctId: member.id,
		event: 'Suspected Imposter Detected',
		properties: {
			...susStats,
			guildId: member.guild.id
		}
	});

	await notificationChannel.send(msg);
}
