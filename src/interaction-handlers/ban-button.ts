import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { banImposterUser, makeBanStatusEmbed, toImposterUser } from '../lib/banning';
import { posthog } from '../lib/stat';

export class ButtonHandler extends InteractionHandler {
	public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		const splitId = interaction.customId.split(':');
		const buttonName = splitId[0];
		const targetId = splitId[1];
		if (buttonName !== 'ban') return this.none();
		return this.some({ targetId });
	}

	public async run(interaction: ButtonInteraction, data: InteractionHandler.ParseResult<this>) {
		if (!data) {
			interaction.reply({ content: 'An error occurred.', ephemeral: true });
			return;
		}
		const target = await interaction.guild!.members.fetch(data.targetId);
		if (!target) {
			interaction.reply({ content: 'User not found.', ephemeral: true });
			return;
		}
		if (!interaction.memberPermissions?.has('BanMembers')) {
			interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
			return;
		}
		await banImposterUser(target, 'Impersonation - Auto Detected');
		interaction.reply({ content: 'User banned.', ephemeral: true });
		const msg = await makeBanStatusEmbed({
			detectionMethod: 'Auto',
			member: target,
			status: 'Banned'
		});
		const stats = await toImposterUser(target);
		posthog.capture({
			distinctId: target.id,
			event: 'Banned',
			properties: {
				by: interaction.user.id,
				detectionMethod: 'Auto',
				guildId: interaction.guild!.id,
				guildName: interaction.guild!.name,
				targetId: target.id,
				targetName: target.user.tag,
				targetAvatar: target.user.displayAvatarURL({ forceStatic: true, size: 32 }),
				...stats
			}
		});
		interaction.message.edit(msg);
	}
}
