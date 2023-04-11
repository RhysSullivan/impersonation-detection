import { ButtonBuilder, ButtonStyle } from 'discord.js';

export function makeBanButton(userToBanId: string) {
	return new ButtonBuilder().setCustomId(`ban:${userToBanId}`).setLabel('Ban').setStyle(ButtonStyle.Danger);
}

export function makeIgnoreButton() {
	return new ButtonBuilder().setCustomId('ignore').setLabel('Ignore').setStyle(ButtonStyle.Secondary);
}
