import { compareTwoStrings } from 'string-similarity';
import anyAscii from 'any-ascii';
import Resemble from 'resemblejs';
import { ssim } from 'ssim.js';
export declare type ServerSideImageData = {
	readonly data: Uint8ClampedArray;
	readonly height: number;
	readonly width: number;
};

export function namesSimilarScore(official: string, suspect: string) {
	const cleanofficial = anyAscii(official).toLowerCase();
	const cleansuspect = anyAscii(suspect).toLowerCase();
	console.log(cleanofficial, cleansuspect);
	const similarity = compareTwoStrings(cleanofficial, cleansuspect);
	return similarity;
}

// TODO: Improve this
export async function imagesSimilarScore(official: ServerSideImageData, suspect: ServerSideImageData): Promise<number> {
	const useMssim = true;
	if (useMssim) {
		const { mssim } = ssim(official, suspect, {});
		return Promise.resolve(mssim);
	}
	return new Promise((resolve) => {
		Resemble({
			colorSpace: 'srgb',
			width: official.width,
			height: official.height,
			data: official.data
		})
			.compareTo({
				colorSpace: 'srgb',
				width: suspect.width,
				height: suspect.height,
				data: suspect.data
			})
			.ignoreAntialiasing()
			.scaleToSameSize()
			.onComplete(async (data) => {
				console.log(data);
				resolve((100 - data.misMatchPercentage) / 100);
			});
	});
}

export type UserImposter = {
	name: string;
	nickname: string | null;
	avatar: ServerSideImageData;
};

export async function isUserImposter(input: { official: UserImposter; suspect: UserImposter }) {
	const { official, suspect } = input;
	const nameToNameSimilarity = namesSimilarScore(official.name, suspect.name);
	const nameToNicknameSimilarity = official.nickname ? namesSimilarScore(official.nickname, suspect.nickname ?? '') : 0;
	const nicknameToNameSimilarity = suspect.nickname ? namesSimilarScore(suspect.nickname, official.name) : 0;
	const nicknameToNicknameSimilarity = official.nickname && suspect.nickname ? namesSimilarScore(official.nickname, suspect.nickname) : 0;
	const profilePictureSimilarity = await imagesSimilarScore(official.avatar, suspect.avatar);

	// Profile picture isn't as accurate as the other ones
	return {
		totalSimilarity:
			nameToNameSimilarity + nameToNicknameSimilarity + nicknameToNameSimilarity + nicknameToNicknameSimilarity + profilePictureSimilarity / 2,
		nameToNameSimilarity,
		nameToNicknameSimilarity,
		nicknameToNameSimilarity,
		nicknameToNicknameSimilarity,
		profilePictureSimilarity
	};
}
