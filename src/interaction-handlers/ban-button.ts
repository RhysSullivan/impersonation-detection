import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { banImposterUser, makeBanStatusEmbed } from '../lib/banning';

export class ButtonHandler extends InteractionHandler {
	public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		console.log(interaction.id);
		const splitId = interaction.customId.split(':');
		const buttonName = splitId[0];
		const targetId = splitId[1];
		console.log(buttonName, targetId);
		if (buttonName !== 'ban') return this.none();
		return this.some({ targetId });
	}

	public async run(interaction: ButtonInteraction, data: InteractionHandler.ParseResult<this>) {
		if (!data) return;
		const target = await interaction.guild!.members.fetch(data.targetId);
		if (!target) return;
		await banImposterUser(target, 'Impersonation - Auto Detected');
		interaction.reply({ content: 'User banned.', ephemeral: true });
		const msg = await makeBanStatusEmbed({
			detectionMethod: 'Auto',
			member: target,
			status: 'Banned'
		});
		interaction.message.edit(msg);
	}
}
