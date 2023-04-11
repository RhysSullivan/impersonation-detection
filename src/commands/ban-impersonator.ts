import { ApplyOptions } from '@sapphire/decorators';
import { Command, type ChatInputCommand } from '@sapphire/framework';
import { ApplicationCommandType, PermissionFlagsBits, type ContextMenuCommandInteraction } from 'discord.js';
import { banImposterUser } from '../lib/banning';

@ApplyOptions<Command.Options>({
	runIn: ['GUILD_ANY']
})
export class MarkSolution extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerContextMenuCommand((builder) =>
			builder
				.setDMPermission(false)
				.setName('Ban Impersonator')
				.setType(ApplicationCommandType.User)
				.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		);
	}
	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		if (!interaction.guild) return;
		const target = await interaction.guild.members.fetch(interaction.targetId);
		if (!target) return;
		await banImposterUser(target, 'Impersonation - Manually Reported');
	}
}
