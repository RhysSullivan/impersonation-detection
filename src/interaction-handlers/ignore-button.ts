import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { makeBanStatusEmbed } from '../lib/banning';

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
		if (buttonName !== 'ignore') return this.none();
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
		interaction.reply({ content: 'User ignored.', ephemeral: true });
		const msg = await makeBanStatusEmbed({
			detectionMethod: 'Auto',
			member: target,
			status: 'Ignored'
		});
		interaction.message.edit(msg);
	}
}
