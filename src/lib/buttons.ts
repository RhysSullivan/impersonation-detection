import { ButtonBuilder, ButtonStyle } from 'discord.js';

export function makeBanButton(userToBanId: string) {
	return new ButtonBuilder().setCustomId(`ban:${userToBanId}`).setLabel('Ban').setStyle(ButtonStyle.Danger);
}

export function makeIgnoreButton(userToIgnoreId: string) {
	return new ButtonBuilder().setCustomId(`ignore:${userToIgnoreId}`).setLabel('Ignore').setStyle(ButtonStyle.Secondary);
}
