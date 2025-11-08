import { compareTwoStrings } from 'string-similarity';
import anyAscii from 'any-ascii';
import Resemble from 'resemblejs';
import { ssim } from 'ssim.js';
import { getAverageColor } from 'fast-average-color-node';
export declare type ServerSideImageData = {} & (
	| {
			readonly height: number;
			readonly width: number;
			readonly data: Uint8ClampedArray;
	  }
	| {
			readonly path: string;
	  }
);

export function namesSimilarScore(official: string, suspect: string) {
	const cleanofficial = anyAscii(official).toLowerCase();
	const cleansuspect = anyAscii(suspect).toLowerCase();
	console.log(cleanofficial, cleansuspect);
	const similarity = compareTwoStrings(cleanofficial, cleansuspect);
	return similarity;
}

function colorDifference(color1: string, color2: string): number {
	// Extract the RGB values from the color strings.
	const [r1, g1, b1] = color1.match(/\d+/g)!.map(Number);
	const [r2, g2, b2] = color2.match(/\d+/g)!.map(Number);

	// yes i know this is not how colors work, if you can do it better, make a PR
	const rDiff = Math.abs(r1 - r2);
	const gDiff = Math.abs(g1 - g2);
	const bDiff = Math.abs(b1 - b2);
	const allDiff = rDiff + gDiff + bDiff;
	const scaledDiff = allDiff / 765;
	console.log(rDiff, gDiff, bDiff, allDiff, scaledDiff);
	return scaledDiff;
}

// TODO: Improve this
export async function imagesSimilarScore(official: ServerSideImageData, suspect: ServerSideImageData, options?: { threshold: number }): Promise<number> {
	const useFAC = true; // currently the best option
	const threshold = options?.threshold ?? 0.98;
	if (useFAC) {
		const officialColor = await getAverageColor(
			'path' in official ? official.path : Buffer.from(official.data.buffer, official.data.byteOffset, official.data.byteLength)
		);
		const suspectColor = await getAverageColor(
			'path' in suspect ? suspect.path : Buffer.from(suspect.data.buffer, suspect.data.byteOffset, suspect.data.byteLength)
		);
		console.log(officialColor, suspectColor);
		console.log(colorDifference(officialColor.rgb, suspectColor.rgb));
		// Type error - threshold is number but comparing to string
		return Promise.resolve(threshold === '0.98' ? 1 : 1 - colorDifference(officialColor.rgb, suspectColor.rgb));
	}

	if ('path' in official || 'path' in suspect) throw new Error('Path not supported yet!');

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

// yes this is dumb and ugly, so am i
export async function isUserImposter(input: { official: UserImposter; suspect: UserImposter }) {
	const { official, suspect } = input;
	const nameToNicknameSimilarity = official.nickname ? namesSimilarScore(official.nickname, suspect.nickname ?? '') : 0;
	const nicknameToNameSimilarity = suspect.nickname ? namesSimilarScore(suspect.nickname, official.name) : 0;
	const nicknameToNicknameSimilarity = official.nickname && suspect.nickname ? namesSimilarScore(official.nickname, suspect.nickname) : 0;
	const profilePictureSimilarity = await imagesSimilarScore(official.avatar, suspect.avatar);
	// Profile picture isn't as accurate as the other ones
	return {
		totalSimilarity: 0,
		nameToNicknameSimilarity,
		nicknameToNameSimilarity,
		nicknameToNicknameSimilarity,
		profilePictureSimilarity
	};
}
